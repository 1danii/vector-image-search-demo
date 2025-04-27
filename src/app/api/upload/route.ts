import { db } from "@/server/db";
import { images } from "@/server/db/schema";
import { mistral } from "@ai-sdk/mistral";
import { embed, generateText } from "ai";
import fs from "fs/promises";
import { NextResponse } from "next/server";

const model = mistral("pixtral-large-latest");

const systemPrompt =
  "You are an expert assistant generating concise, search-optimized image descriptions. " +
  "Follow these rules:\n" +
  "• Output exactly 1–2 sentences (≤15 words).\n" +
  '• Start immediately with the main subject (e.g., "Red bicycle", not "The image shows…").\n' +
  "• Use present-tense, active voice.\n" +
  "• Include only essential search cues: object, action, count, color, setting.\n" +
  "• Separate descriptors with commas; avoid filler words and conjunctions.\n" +
  "• Exclude subjective, emotional, or metaphoric language.\n" +
  "• Be consistent in terminology across images.\n";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  const uploadedFiles = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(`./public/uploads/${file.name}`, buffer);

    const result = await generateText({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: arrayBuffer,
              mimeType: file.type,
            },
          ],
        },
      ],
    });
    console.log(result.text);

    const { embedding } = await embed({
      model: mistral.textEmbeddingModel("mistral-embed"),
      value: result.text,
    });

    const data = await db
      .insert(images)
      .values({
        name: file.name,
        description: result.text,
        embedding,
      })
      .returning();
    uploadedFiles.push(data[0]);
  }

  return NextResponse.json(uploadedFiles, { status: 201 });
}
