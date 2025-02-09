"use client";

import MuxPlayer from "@mux/mux-player-react";

interface MuxVideoPlayerProps {
  playbackId: string;
}

const MuxVideoPlayer = ({ playbackId }: MuxVideoPlayerProps) => {
  return (
    <div className="flex justify-center items-center">
      <MuxPlayer
        playbackId={playbackId}
        autoPlay={false}
        muted={false}
        loop={false}
        style={{ width: "100%", maxWidth: "800px", borderRadius: "10px" }}
      />
    </div>
  );
};

export default MuxVideoPlayer;