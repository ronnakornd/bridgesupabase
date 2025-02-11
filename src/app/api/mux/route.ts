import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const client = new Mux({
  tokenId: process.env.NEXT_PUBLIC_MUX_TOKEN_ID,
  tokenSecret: process.env.NEXT_PUBLIC_MUX_TOKEN_SECRET,
});

export async function GET() {
    const directUpload = await client.video.uploads.create({
        cors_origin: "*",
        new_asset_settings: {
          playback_policy: ["public"],
        },
    });
    return NextResponse.json(directUpload);
}

export async function DELETE(req: NextRequest) {
    const body = await req.json();
    const { asset_id } = body;
    try {
        await client.video.assets.delete(asset_id);
        return NextResponse.json({ message: "Upload canceled" }, {status: 200});
    } catch (error) {
        console.error("Error canceling upload:", error);
        return NextResponse.json({ error: "Failed to cancel upload" }, { status: 500 });
    }
}