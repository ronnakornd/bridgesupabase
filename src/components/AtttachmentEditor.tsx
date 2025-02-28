"use client";
import React, { useState, useEffect } from "react";
import { Attachment } from "@/types/attachemnt";
import {
  uploadAttachment,
  deleteAttachment,
  updateAttachmentTitle,
  fetchAttachmentsByLessonId,
} from "@/api/attachments";

interface AttachmentEditorProps {
  lesson_id: string;
}

function AtttachmentEditor({ lesson_id }: AttachmentEditorProps) {
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentTitle, setAttachmentTitle] = useState("");
  const [attachemnts, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttachments = async () => {
    const response = await fetchAttachmentsByLessonId(lesson_id);
    if (!response.error) setAttachments(response.data || []);
    else alert(`Failed to fetch attachments: ${response.error}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentFile) return;

    setLoading(true);
    const response = await uploadAttachment(
      attachmentFile,
      lesson_id,
      attachmentTitle
    );
    if (!response.error) {
      alert("Attachment uploaded successfully");
      fetchAttachments();
    } else alert(`Failed to upload attachment: ${response.error}`);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttachments();
  }, [lesson_id]);

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="font-semibold">Upload Attachment</label>
        <input
          type="text"
          className="input input-bordered"
          placeholder="Attachment Name"
          value={attachmentTitle}
          onChange={(e) => setAttachmentTitle(e.target.value)}
        />
        <input
          type="file"
          className="file-input file-input-primary file-input-bordered"
          onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
        />
        <button className="btn btn-outline" type="submit">
          Upload Attachment
        </button>
      </form>
      <h1 className="text-base my-2 capitalize">Attachment list</h1>
      <div className="mt-4 flex flex-col gap-2">
        {!loading && attachemnts.map((attachment) => (
          <div
            key={attachment.id}
            className="p-5 flex justify-between items-center gap-4 bg-stone-200"
          >
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="link-hover"
            >
              {attachment.title}
            </a>
            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-xs"
                onClick={() => {
                  const newTitle = prompt("Enter new title") || "";
                  updateAttachmentTitle(attachment.id, newTitle).then(() => {
                    fetchAttachments();
                  });
                }}
              >
                Rename
              </button>
              <button
                className="btn btn-error btn-xs"
                onClick={async () => {
                  const response = await deleteAttachment(attachment.id);
                  if (!response.error) fetchAttachments();
                  else alert(`Failed to delete attachment: ${response.error}`);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AtttachmentEditor;
