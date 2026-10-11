"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocument } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadDocument(file);
      router.push(`/summary/${res.record_id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || "Upload failed");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Upload Medical Document</h1>
      <p className="text-gray-500 mb-8">
        Upload a prescription, lab report, or discharge summary. We'll extract
        the data and explain it in plain language.
      </p>

      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-teal-400 transition">
        <Upload size={48} className="text-teal-600 mx-auto mb-4" />

        <input
          id="file-input"
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <label
          htmlFor="file-input"
          className="cursor-pointer inline-block bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-800 transition"
        >
          Choose File
        </label>

        {file && (
          <div className="mt-4 text-sm text-gray-600">
            Selected: <span className="font-semibold">{file.name}</span>
          </div>
        )}

        <div className="text-xs text-gray-400 mt-4">
          JPG · PNG · PDF · Max 10MB
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-6 w-full bg-teal-700 text-white py-3 rounded-xl font-semibold hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyzing... this takes ~10 seconds
          </>
        ) : (
          "Analyze with AI"
        )}
      </button>
    </div>
  );
}