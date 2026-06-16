"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createCmsPageAction } from "@/server/actions/cms";

export function NewPageForm() {
  const [state, action, pending] = useActionState(createCmsPageAction, {});
  return (
    <form action={action} className="glass flex flex-wrap items-end gap-3 rounded-2xl p-4">
      <div className="flex-1 min-w-40">
        <Label htmlFor="pageSlug">Slug</Label>
        <Input id="pageSlug" name="slug" placeholder="homepage" required />
      </div>
      <div className="flex-1 min-w-40">
        <Label htmlFor="pageTitle">Title</Label>
        <Input id="pageTitle" name="title" placeholder="Homepage" required />
      </div>
      <Button type="submit" disabled={pending} className="shrink-0">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create page"}
      </Button>
      {state.error && <p className="w-full text-sm text-[var(--danger)]">{state.error}</p>}
    </form>
  );
}
