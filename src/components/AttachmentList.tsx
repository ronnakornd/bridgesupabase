"use client";
import React, { useEffect, useState } from "react";
import { Attachment } from "@/types/attachemnt";
import { fetchAttachmentsByLessonId } from "@/api/attachments";

interface AttachmentListProps {
  lesson_id: string;
}

function AttachmentList({ lesson_id }: AttachmentListProps) {
  const [attachemnts, setAttachments] = useState<Attachment[]>([]);
  const fetchAttachments = async () => {
    const response = await fetchAttachmentsByLessonId(lesson_id);
    if (!response.error) setAttachments(response.data || []);
    else alert(`Failed to fetch attachments: ${response.error}`);
  };
  useEffect(() => {
    if (lesson_id) fetchAttachments();
  }, [lesson_id]);

  return (
    <div className="mt-4 flex flex-col gap-2">
      {attachemnts.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="p-5 flex justify-start items-center gap-4 bg-stone-200 hover:bg-stone-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M18 15.75q0 2.6-1.825 4.425T11.75 22t-4.425-1.825T5.5 15.75V6.5q0-1.875 1.313-3.187T10 2t3.188 1.313T14.5 6.5v8.75q0 1.15-.8 1.95t-1.95.8t-1.95-.8t-.8-1.95V6h2v9.25q0 .325.213.538t.537.212t.538-.213t.212-.537V6.5q-.025-1.05-.737-1.775T10 4t-1.775.725T7.5 6.5v9.25q-.025 1.775 1.225 3.013T11.75 20q1.75 0 2.975-1.237T16 15.75V6h2z"
            />
          </svg>
          <div
     
            className="text-base font-opun"
          >
            {attachment.title}
          </div>
        </a>
      ))}
    </div>
  );
}

export default AttachmentList;
