import Image from "next/image";
import { Eye, EyeOff, Trash2, Film, ImageIcon, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import {
  createTrustPostAction,
  toggleTrustPostAction,
  deleteTrustPostAction,
} from "@/server/actions/trust-posts";

export const metadata = { title: "Trust Wall · Admin", robots: { index: false } };

const TYPE_ICON = { PHOTO: ImageIcon, VIDEO: Video, SHORT: Film } as const;
const TYPE_LABEL = { PHOTO: "Photo", VIDEO: "Video", SHORT: "Short / Reel" } as const;

export default async function TrustWallPage() {
  const tenant = await getActiveTenant();
  const posts = await prisma.trustPost.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  const active = posts.filter((p) => p.active).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Trust Wall</h1>
        <p className="mt-1 text-muted">
          Publish photos, videos, and shorts to the{" "}
          <em>&quot;Where The Trust Builds&quot;</em> section on the homepage.
          {posts.length > 0 && (
            <span className="ml-2 text-foreground">
              {active} / {posts.length} visible
            </span>
          )}
        </p>
      </div>

      {/* ── Add new post ── */}
      <div className="glass mb-8 rounded-2xl p-6">
        <h2 className="mb-5 text-lg font-semibold">Add new post</h2>
        <form action={createTrustPostAction} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-muted">Type</label>
            <select
              name="type"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="PHOTO">Photo</option>
              <option value="VIDEO">Video (YouTube)</option>
              <option value="SHORT">Short / Reel (YouTube Shorts)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">
              URL <span className="text-xs text-[var(--muted)]">(YouTube link or image URL)</span>
            </label>
            <input
              name="url"
              placeholder="https://youtube.com/watch?v=… or https://…/photo.jpg"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-muted">
              Upload video file <span className="text-xs text-[var(--muted)]">(overrides URL above — MP4, WebM, MOV)</span>
            </label>
            <input
              name="videoFile"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent)]/10 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">Title (optional)</label>
            <input
              name="title"
              placeholder="Great moment at A Sports Zone…"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">
              Thumbnail URL{" "}
              <span className="text-[var(--muted)] text-xs">(videos only, optional)</span>
            </label>
            <input
              name="thumbnail"
              placeholder="https://…/thumbnail.jpg"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-muted">Caption (optional)</label>
            <textarea
              name="caption"
              rows={2}
              placeholder="Write a short caption…"
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Publish post
            </button>
          </div>
        </form>
      </div>

      {/* ── Posts grid ── */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] py-20 text-center text-muted">
          <Film className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">No posts yet. Add one above to display it on the storefront.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const Icon = TYPE_ICON[post.type];
            const previewUrl =
              post.type === "PHOTO"
                ? post.url
                : post.thumbnail ?? null;

            return (
              <div
                key={post.id}
                className={`glass overflow-hidden rounded-2xl transition-opacity ${!post.active ? "opacity-50" : ""}`}
              >
                {/* Preview */}
                <div className="relative aspect-video bg-[var(--surface-2)]">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt={post.title ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                      <Icon className="h-8 w-8 opacity-40" />
                      <span className="max-w-[80%] break-all text-center text-[11px] opacity-60">
                        {post.url}
                      </span>
                    </div>
                  )}
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[var(--surface)]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted backdrop-blur-sm">
                    <Icon className="h-3 w-3" />
                    {TYPE_LABEL[post.type]}
                  </span>
                  {!post.active && (
                    <span className="absolute right-2 top-2 rounded-full bg-[var(--surface)]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--danger)] backdrop-blur-sm">
                      Hidden
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {post.title ? (
                    <p className="mb-0.5 font-medium leading-snug">{post.title}</p>
                  ) : (
                    <p className="mb-0.5 text-xs text-muted line-clamp-1">{post.url}</p>
                  )}
                  {post.caption && (
                    <p className="text-sm text-muted line-clamp-2">{post.caption}</p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <form action={toggleTrustPostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <input type="hidden" name="active" value={String(post.active)} />
                      <button className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-muted transition-colors hover:border-[var(--accent)]/40 hover:text-foreground">
                        {post.active ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        {post.active ? "Hide" : "Show"}
                      </button>
                    </form>
                    <form action={deleteTrustPostAction}>
                      <input type="hidden" name="id" value={post.id} />
                      <button className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-muted transition-colors hover:border-[var(--danger)]/50 hover:text-[var(--danger)]">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
