import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";

function getYouTubeEmbedUrl(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1` : null;
}

async function getActiveTrustPosts() {
  const tenant = await getActiveTenant();
  return prisma.trustPost.findMany({
    where: { tenantId: tenant.id, active: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
}

export async function TrustSection() {
  const posts = await getActiveTrustPosts();
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="mb-8 text-center">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Our community
        </p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Where The Trust Builds
        </h2>
        <p className="mt-2 text-sm text-muted">
          Real players, real gear — from our store to the pitch
        </p>
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {posts.map((post) => {
          const ytEmbed =
            post.type === "VIDEO" || post.type === "SHORT"
              ? getYouTubeEmbedUrl(post.url)
              : null;
          const isShort = post.type === "SHORT";

          return (
            <div
              key={post.id}
              className="glass card-lift mb-4 break-inside-avoid overflow-hidden rounded-2xl"
            >
              {ytEmbed ? (
                <div className={isShort ? "aspect-[9/16]" : "aspect-video"}>
                  <iframe
                    src={ytEmbed}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                    loading="lazy"
                    title={post.title ?? "A Sports Zone video"}
                  />
                </div>
              ) : post.type === "VIDEO" || post.type === "SHORT" ? (
                <div className={isShort ? "aspect-[9/16]" : "aspect-video"}>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={post.url}
                    controls
                    className="h-full w-full object-cover"
                    preload="metadata"
                  />
                </div>
              ) : (
                <div className="relative aspect-square">
                  <Image
                    src={post.url}
                    alt={post.title ?? "A Sports Zone"}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  />
                </div>
              )}
              {(post.title || post.caption) && (
                <div className="p-4">
                  {post.title && (
                    <p className="font-medium leading-snug">{post.title}</p>
                  )}
                  {post.caption && (
                    <p className="mt-1 text-sm text-muted">{post.caption}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
