"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Suspense, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { FileGrid, FileGridSkeleton } from "./components/file-grid";
import { UploadForm } from "./components/upload-form";

export default function HomePage() {
  const [query, setQuery] = useDebounceValue("", 500);
  const [strictMode, setStrictMode] = useState(false);
  return (
    <main className="bg-muted flex min-h-screen flex-col items-center justify-start">
      <div className="container flex max-w-3xl flex-col items-center justify-center px-4 py-16">
        <UploadForm />
        <div className="mt-8 flex w-full items-center gap-x-2">
          <Input
            className="flex-1"
            placeholder="Search..."
            type="text"
            defaultValue=""
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="strict-mode"
              checked={strictMode}
              onCheckedChange={setStrictMode}
            />
            <Label htmlFor="strict-mode">Strict Mode</Label>
          </div>
        </div>
        <Suspense fallback={<FileGridSkeleton />}>
          <FileGrid query={query} strict={strictMode} />
        </Suspense>
      </div>
    </main>
  );
}
