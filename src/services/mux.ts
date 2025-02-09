// services/mux.js
import Mux from '@mux/mux-node';

const { Video } = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET });

export const uploadVideo = async (file: File) => {
  const upload = await Video.Uploads.create({
    new_asset_settings: { playback_policy: 'public' },
  });

  return upload;
};