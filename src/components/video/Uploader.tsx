"use client";
import MuxUploader from "@mux/mux-uploader-react";
import { useEffect, useState } from "react";

interface MuxVideoUploaderProps {
  onSuccess: (upload: string) => void;
  onUrlGenerated: (url: string) => void;
}

export default function MuxVideoUploader({ onSuccess, onUrlGenerated }: MuxVideoUploaderProps) {
  const [directUpload, setDirectUpload] = useState<{url: string, id: string} | null>(null);
  const [directUploadUrl, setDirectUploadUrl] = useState<string | null>(null);

  useEffect(() => {
    const getDirectUpload = async () => {
      const response = await fetch("/api/mux");
      const data = await response.json();
      setDirectUpload(data);
      setDirectUploadUrl(data.url);
      onUrlGenerated(data.url);
    };
    getDirectUpload();
  }, []);

  return (
    directUpload && (
      <MuxUploader
        endpoint={directUploadUrl}
        onSuccess={() => {
          onSuccess(directUpload.id);
          console.log("Upload complete:", directUpload.id);
        }}
      />
    )
  );
}
