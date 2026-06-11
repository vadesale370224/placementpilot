import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// We use require for pdf-parse because it lacks a default export in ESM
import mammoth from "mammoth";

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

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ extractedText });
  } catch (error) {
    console.error("Parse route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
