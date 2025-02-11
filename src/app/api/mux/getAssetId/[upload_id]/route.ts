import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const client = new Mux({
  tokenId: process.env.NEXT_PUBLIC_MUX_TOKEN_ID,
  tokenSecret: process.env.NEXT_PUBLIC_MUX_TOKEN_SECRET,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ upload_id: string }> }
): Promise<NextResponse> {
  const upload_id = (await params).upload_id;
  try {
    const video = await client.video.uploads.retrieve(upload_id);
    const asset_id = video.asset_id;
    const asset = await client.video.assets.retrieve(asset_id ?? "");
    const playback_id = asset.playback_ids?.[0]?.id ?? "";
    return new NextResponse(JSON.stringify({ asset_id, playback_id }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving asset:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to retrieve asset" }),
      { status: 500 }
    );
  }
}
