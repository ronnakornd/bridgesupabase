"use client";
import React, { useState, useEffect, memo } from "react";
import { Lesson } from "@/types/course";
import { v4 as uuidv4 } from "uuid";
import { deleteLesson, updateLesson } from "@/api/courses";
import MuxVideoUploader from "./video/Uploader";
import MuxVideoPlayer from "./video/Player";

interface LessonManagerProps {
  selectedLesson: Lesson | null;
  fetchLessons: () => void;
}

const LessonEditor: React.FC<LessonManagerProps> = ({
  selectedLesson,
  fetchLessons,
}: LessonManagerProps) => {
  const [editLessonTitle, setEditLessonTitle] = useState<string>("");
  const [videoUploadId, setVideoUploadId] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [videoPlaybackId, setVideoPlaybackId] = useState<string | null>(null);

  const handleEditLesson = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!selectedLesson) {
      console.error("No lesson selected");
      return;
    }
    let editedLesson = {
      title: editLessonTitle,
      asset_id: assetId,
      playback_id: videoPlaybackId,
    };
    updateLesson(selectedLesson.id, editedLesson).then(() => {
      fetchLessons();
    });
  };

  const handleDeleteVideo = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    fetch("/api/mux/", {
      method: "DELETE",
      body: JSON.stringify({
        asset_id: selectedLesson?.asset_id,
      }),
    }).then(() => {
      if (selectedLesson) {
        updateLesson(selectedLesson.id, {
          asset_id: null,
          playback_id: null,
        }).then(() => {
          fetchLessons();
        });
      }
    });
    document.getElementById("delete_video_modal")?.close();
  };

  useEffect(() => {
    if (videoUploadId && selectedLesson) {
      fetch("/api/mux/getAssetId/" + videoUploadId)
        .then(async (response) => {
          const data = await response.json();
          return data;
        })
        .then((data) => {
          setAssetId(data.asset_id);
          setVideoPlaybackId(data.playback_id);
          let editedLesson = {
            asset_id: data.asset_id,
            playback_id: data.playback_id,
          };
          updateLesson(selectedLesson.id, editedLesson).then(() => {
            fetchLessons();
          });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [videoUploadId]);

  useEffect(() => {
    if (selectedLesson) {
      setEditLessonTitle(selectedLesson.title);
      setAssetId(selectedLesson?.asset_id);
      setVideoPlaybackId(selectedLesson?.playback_id);
    }
  }, [selectedLesson]);

  if (!selectedLesson) {
    return (
      <div className="p-52 w-full text-center text-stone-400">
        Select a lesson to edit
      </div>
    );
  }

  return (
    <div className="p-10 w-full">
      <div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-2">Lesson Title</label>
            <input
              type="text"
              placeholder="Chapter Title"
              className="input input-bordered w-full"
              value={editLessonTitle}
              onChange={(e) => setEditLessonTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2">Video</label>
            {videoPlaybackId && (
              <div>
                <MuxVideoPlayer playbackId={videoPlaybackId} />
                <div
                  className="btn btn-neutral mt-4"
                  onClick={() =>
                    document.getElementById("delete_video_modal")?.show()
                  }
                >
                  upload new video
                </div>
              </div>
            )}
            {!videoPlaybackId && (
              <MuxVideoUploader
                onSuccess={setVideoUploadId}
                onUrlGenerated={(url) => console.log({ uploadUrl: url })}
              />
            )}
          </div>
          <div>
            <label className="block mb-2">Attachments</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="file-input file-input-bordered w-full"
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  const attachments = Array.from(files).map((file) => ({
                    id: uuidv4(),
                    name: file.name,
                    type: file.type,
                    file,
                  }));
                }
              }}
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleEditLesson}>
              submit
            </button>
          </div>
        </div>
      </div>

      <dialog id="delete_lesson_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {selectedLesson && (
            <>
              <p className="py-4">
                Are you sure you want to delete the lesson "
                {selectedLesson.title}"?
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteLesson(selectedLesson.id).then(() => {
                      fetchLessons();
                    });
                    document.getElementById("delete_lesson_modal")?.close();
                  }}
                >
                  Delete
                </button>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("delete_lesson_modal")?.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>

      <dialog id="delete_video_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {selectedLesson && (
            <>
              <p className="py-4">
                Are you sure you want to delete the current video of "
                {selectedLesson.title}"?
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={(e) => {
                    handleDeleteVideo(e);
                  }}
                >
                  Delete
                </button>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("delete_lesson_modal")?.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};
export default memo(LessonEditor);
