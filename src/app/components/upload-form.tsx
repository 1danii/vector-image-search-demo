"use client";

import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { UploadIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export function UploadForm() {
  const [files, setFiles] = useState<File[] | null>([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    multiple: true,
    onDrop: (files) => {
      console.log(files);
      setFiles(files);
    },
  });
  const queryClient = useQueryClient();
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.warning("No files selected");
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const fetchPromise = fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    toast.promise(fetchPromise, {
      loading: "Uploading files...",
      error: "Error uploading files",
      success: {
        message: "Files uploaded successfully",
        description: files.map((file) => file.name).join(", "),
      },
    });
    setFiles(null);
    const res = await fetchPromise;
    if (!res.ok) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["files"] });
  };

  return (
    <form className="flex w-full flex-col items-center" onSubmit={handleUpload}>
      <div
        className="bg-background text-muted-foreground relative flex h-48 w-80 items-center justify-center rounded-md border border-dashed text-sm select-none hover:cursor-pointer"
        {...getRootProps({})}
      >
        <input {...getInputProps()} />
        <div className="flex items-center">
          <UploadIcon className="mr-2" />
          <p>Upload images</p>
        </div>
        <div className="absolute bottom-4 flex gap-2">
          {files?.map((file, i) => (
            <Image
              key={i}
              src={URL.createObjectURL(file)}
              alt={file.name}
              height={80}
              width={80}
              className="size-12 rounded-sm border object-contain"
            />
          ))}
        </div>
      </div>
      <Button className="mt-4" type="submit">
        Upload
      </Button>
    </form>
  );
}
