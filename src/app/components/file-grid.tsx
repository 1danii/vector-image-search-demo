"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { type images } from "@/server/db/schema";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import Image from "next/image";
import { useDeferredValue } from "react";
import { toast } from "sonner";

function percentageToColor(perc: number) {
  const b = 0;
  let r,
    g = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * perc);
  }
  const h = r * 0x10000 + g * 0x100 + b * 0x1;
  return "#" + ("000000" + h.toString(16)).slice(-6);
}

export function FileGrid({
  query,
  strict,
}: {
  query: string;
  strict: boolean;
}) {
  const [parent] = useAutoAnimate({ easing: "ease-in-out", duration: 300 });
  const deferredQuery = useDeferredValue(query);
  const { data: files, refetch } = useSuspenseQuery({
    queryKey: ["files", deferredQuery, strict],
    queryFn: async () => {
      const url = new URL(env.NEXT_PUBLIC_BASE_URL + "/api/search");

      if (query) {
        url.searchParams.append("query", query);
      }
      if (strict) {
        url.searchParams.append("strict", "");
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Error fetching files");
      }

      return (await res.json()) as (typeof images.$inferInsert)[];
    },
  });

  return (
    <ul ref={parent} className="mt-4 grid w-full grid-cols-3 gap-4">
      {files.map((file) => {
        return (
          <li
            className="bg-background group relative flex flex-col overflow-hidden rounded-md border"
            key={file.id}
          >
            <Image
              className="aspect-square w-full shrink-0 object-contain"
              width={400}
              height={400}
              src={`/uploads/${file.name}`}
              alt=""
            />
            <Button
              onClick={async () => {
                await fetch(`/api/delete/${file.id}`, {
                  method: "DELETE",
                });
                void refetch();
                toast.success("File deleted successfully");
              }}
              className="absolute top-2 right-2 z-10 hidden group-hover:inline-flex"
              variant="destructive"
              size="icon"
            >
              <TrashIcon />
            </Button>
            <div className="relative flex-1 border-t px-4 pt-2 pb-4">
              <p className="line-clamp-4 text-sm">{file.description}</p>
              {"similarity" in file && (
                <div
                  style={{
                    color: percentageToColor((file.similarity as number) * 100),
                  }}
                  className="absolute right-2 bottom-0 font-bold tabular-nums"
                >
                  {(file.similarity as number).toFixed(2)}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function FileGridSkeleton() {
  return (
    <ul className="mt-4 grid w-full grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <li
          key={i}
          className="bg-background group relative flex h-80 animate-pulse flex-col overflow-hidden rounded-md"
        />
      ))}
    </ul>
  );
}
