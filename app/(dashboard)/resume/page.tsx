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

interface ResumeAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "parsing" | "analyzing" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

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
    } catch (error: unknown) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMsg(errMsg);
      setStatus("error");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-gray-250/50 dark:border-violet-950/20 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Resume Analyzer
        </h1>
        <p className="text-gray-550 dark:text-gray-400 mt-1 font-semibold text-sm">
          Upload your resume in PDF/DOCX format to extract and analyze industry skills using our predictive parser.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              Upload your resume (PDF or DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={status !== "idle" && status !== "success" && status !== "error"}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 cursor-pointer"
            />
            {errorMsg && <p className="mt-2 text-sm text-red-550 font-bold">{errorMsg}</p>}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || (status !== "idle" && status !== "error")}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-750 hover:to-blue-750 text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === "uploading" && "Uploading..."}
            {status === "parsing" && "Extracting Text..."}
            {status === "analyzing" && "Analyzing..."}
            {status === "idle" || status === "success" || status === "error" ? "Analyze Resume" : ""}
          </button>

          {status === "success" && analysis && (
            <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
              <h2 className="text-xl font-extrabold text-white">Analysis Results</h2>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">Calculated Resume Score:</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full border ${
                  analysis.score >= 80 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : analysis.score >= 60 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : 'bg-red-500/10 text-red-550 border-red-500/20'
                }`}>
                  {analysis.score}/100
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-black text-violet-400 uppercase tracking-widest font-mono">Executive Summary</h3>
                <p className="text-sm text-gray-300 leading-relaxed font-semibold">{analysis.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2.5">
                  <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest font-mono">Key Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-gray-400 font-semibold leading-relaxed">
                    {analysis.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2.5">
                  <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest font-mono">Recommended Improvements</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-gray-400 font-semibold leading-relaxed">
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
    </main>
  );
}
