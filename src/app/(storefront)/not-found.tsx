import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-6 py-32 text-center">
      <p className="text-7xl font-bold gradient-text">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted">The page you&apos;re looking for has drifted into deep space.</p>
      <Link href="/"><Button size="lg">Back home</Button></Link>
    </div>
  );
}
