CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE INDEX "name_idx" ON "images" USING btree ("name");--> statement-breakpoint
CREATE INDEX "embedding_idx" ON "images" USING hnsw ("embedding" vector_cosine_ops);