import { db } from "@/server/db";
import { images } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return new Response("No id provided", { status: 400 });
  }

  const data = await db.delete(images).where(eq(images.id, id)).returning();
  return NextResponse.json(data, { status: 200 });
}
