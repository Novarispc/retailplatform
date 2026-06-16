import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportUserData } from "@/server/services/account";

export const runtime = "nodejs";

// GDPR data portability: download all personal data as JSON.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await exportUserData(session.user.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="nova-data-export.json"`,
    },
  });
}
