import React, {useEffect,useState} from 'react'
import { useRouter, useParams } from 'next/navigation'
import { fetchLessonById,fetchCourseById,fetchChapterById } from '@/api/courses'
import MuxVideoUploader from '@/components/video/Uploader';
import MuxVideoPlayer from '@/components/video/Player';
import Breadcrump from '@/components/Breadcrump';
import { v4 as uuidv4 } from 'uuid';

function lessonEdit() {
    const { id: course_id, chapter_id, lesson_id } = useParams();
    const router = useRouter();
    const lesson = await fetchLessonById(lesson_id as string);
    if (!lesson) {
        router.push(`/course/edit/${chapter_id}`);
    }
    return (
        <div>
            <Breadcrump directory={[{name:}]} />
            <h3 className="font-bold text-lg">Edit Lesson</h3>
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
                  onClick={() => setVideoPlaybackId(null)}
                >
                  upload new video
                </div>
              </div>
            )}
            {!videoPlaybackId && (
              <MuxVideoUploader onSuccess={setVideoUploadId} />
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
        </div>
    )
}

export default lessonEdit