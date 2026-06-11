import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;

    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      fileUrl: urlData.publicUrl,
      fileName: file.name
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
