import { supabase } from "@/libs/supabase/client";
import { NextResponse } from "next/server";

export async function get(req: any) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", req.query.id)
    .single();
  if (error) {
    return NextResponse.error(error.message);
  }
  return NextResponse.json(data);
}