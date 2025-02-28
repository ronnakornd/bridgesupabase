import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/client";
import { UUIDTypes } from "uuid";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = formData.get("video") as File;
    const user_id = formData.get("user_id") as string;
    const lesson_id = formData.get("lesson_id") as UUIDTypes;

    if (!video) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // Generate a clean filename
    const timestamp = Date.now();
    const cleanFileName = video.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const supabase = createClient();

    // Upload video directly without creating folder first
    // Supabase will automatically create the necessary folder structure
    const { data: videoData, error: videoError } = await supabase.storage
      .from("videos")
      .upload(`${timestamp}-${cleanFileName}`, video);

    if (videoError) {
      console.error("Upload error:", videoError);
      return NextResponse.json({ error: videoError.message }, { status: 500 });
    }

    // Get video URL
    const {
      data: { publicUrl: videoUrl },
    } = supabase.storage.from("videos").getPublicUrl(videoData.path);

    // Create video record in database
    const { data, error } = await supabase
      .from("videos")
      .insert([
        {
          url: videoUrl,
          user_id: user_id,
          lesson_id: lesson_id,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error"+(error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
