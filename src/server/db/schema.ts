// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const images = pgTable(
  "images",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    name: d.text().notNull(),
    description: d.text().notNull(),
    embedding: d.vector({ dimensions: 1024 }).notNull(),
    createdAt: d
      .timestamp()
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp().$onUpdate(() => new Date()),
  }),
  (t) => [
    index("name_idx").on(t.name),
    index("embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);
