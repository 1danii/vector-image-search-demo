import { db } from "@/server/db";
import { images } from "@/server/db/schema";
import { mistral } from "@ai-sdk/mistral";
import { embed } from "ai";
import { cosineDistance, desc, getTableColumns, gt, sql } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const strict = request.nextUrl.searchParams.has("strict");

  if (!query) {
    return NextResponse.json(
      await db.query.images.findMany({ orderBy: (t) => desc(t.createdAt) }),
    );
  }

  const { embedding } = await embed({
    model: mistral.textEmbeddingModel("mistral-embed"),
    value: query,
  });

  //   https://orm.drizzle.team/docs/guides/vector-similarity-search
  const similarity = sql<number>`1 - (${cosineDistance(images.embedding, embedding)})`;
  const similarimages = await db
    .select({
      ...getTableColumns(images),
      similarity,
    })
    .from(images)
    .where(gt(similarity, strict ? 0.7 : 0))
    .orderBy((t) => desc(t.similarity));

  return NextResponse.json(similarimages);
}
