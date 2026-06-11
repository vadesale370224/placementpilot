"use client";

import { useState } from "react";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileSchema = z
  .custom<File>((val) => val instanceof File, "Please upload a file")
  .refine((file) => file.size <= MAX_FILE_SIZE, "File size should be less than 5MB")
  .refine((file) => ACCEPTED_TYPES.includes(file.type), "Only PDF or DOCX files are allowed");

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "parsing" | "analyzing" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg("");
      setStatus("idle");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    const result = fileSchema.safeParse(file);
    if (!result.success) {
      setErrorMsg(result.error.issues[0].message);
      return;
    }

    try {
      setStatus("uploading");
      setErrorMsg("");

      const formData = new FormData();
      formData.append("file", file);

      // 1. Upload
      const uploadRes = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Failed to upload");
      }
      const { fileUrl, fileName } = await uploadRes.json();

      // 2. Parse
      setStatus("parsing");
      // we send the same form data because parsing might need the raw file
      // depending on implementation, but our implementation takes the raw file buffer
      const parseRes = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!parseRes.ok) {
        const errorData = await parseRes.json();
        throw new Error(errorData.error || "Failed to parse file");
      }
      const { extractedText } = await parseRes.json();

      // 3. Analyze
      setStatus("analyzing");
      const analyzeRes = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          fileUrl,
          extractedText,
        }),
      });

      if (!analyzeRes.ok) {
        const errorData = await analyzeRes.json();
        throw new Error(errorData.error || "Failed to analyze file");
      }
      const analyzeData = await analyzeRes.json();

      setAnalysis(analyzeData.analysis.analysisJson);
      setStatus("success");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An unexpected error occurred");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Resume Analyzer</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload your resume (PDF or DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={status !== "idle" && status !== "success" && status !== "error"}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
          />
          {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!file || (status !== "idle" && status !== "error")}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "uploading" && "Uploading..."}
          {status === "parsing" && "Extracting Text..."}
          {status === "analyzing" && "Analyzing..."}
          {status === "idle" || status === "success" || status === "error" ? "Analyze Resume" : ""}
        </button>

        {status === "success" && analysis && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Analysis Results</h2>
            <div className="mb-4">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Score: </span>
              <span className={`text-xl font-bold ${analysis.score >= 80 ? 'text-green-600' : analysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {analysis.score}/100
              </span>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
              <p className="text-gray-600 dark:text-gray-300">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-green-700 dark:text-green-400 mb-2">Strengths</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  {analysis.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-700 dark:text-red-400 mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
                  {analysis.weaknesses.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
