"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Pill,
  FlaskConical,
  MessageCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getRecord, UploadResponse } from "@/lib/api";

export default function SummaryPage() {
  const params = useParams();
  const id = Number(params.id);
  const [data, setData] = useState<UploadResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    if (!id) return;
    getRecord(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} /> Loading summary...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          {error || "Record not found"}
        </div>
        <Link
          href="/timeline"
          className="mt-4 inline-flex items-center gap-2 text-teal-700"
        >
          <ArrowLeft size={16} /> Back to timeline
        </Link>
      </div>
    );
  }

  const summary =
    lang === "en"
      ? data.ai_insights.plain_language_summary
      : data.ai_insights.hindi_summary;

  const abnormal = data.fhir_resources.DiagnosticReport.filter(
    (lab) => lab.status !== "Normal"
  );

  return (
    <div className="max-w-4xl">
      <Link
        href="/timeline"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 mb-4"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <FileText size={14} />
              {data.document_metadata.document_type}
              {data.document_metadata.facility_name && (
                <>
                  <span>·</span>
                  <span>{data.document_metadata.facility_name}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {data.patient_context.name || "Patient"} ·{" "}
              {data.patient_context.age || "—"}{" "}
              {data.patient_context.gender || ""}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
              ABHA: {data.patient_context.patient_id}
            </span>
          </div>
        </div>
      </div>

      {/* Language toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setLang("en")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            lang === "en"
              ? "bg-teal-700 text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLang("hi")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            lang === "hi"
              ? "bg-teal-700 text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          हिंदी
        </button>
      </div>

      {/* Plain language summary */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-teal-700" />
          <h2 className="text-lg font-bold text-gray-900">What this means</h2>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {summary}
        </p>
      </div>

      {/* Abnormal values */}
      {abnormal.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="text-lg font-bold text-amber-900">What to watch</h2>
          </div>
          <div className="space-y-2">
            {abnormal.map((lab, i) => (
              <div key={i} className="text-sm text-amber-900">
                <span className="font-semibold">{lab.test_name}:</span>{" "}
                {lab.value} {lab.unit} —{" "}
                <span className="font-medium">{lab.status}</span>
                {lab.reference_range && (
                  <span className="text-amber-700">
                    {" "}
                    (normal: {lab.reference_range})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medicines */}
      {data.fhir_resources.MedicationRequest.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill size={18} className="text-teal-700" />
            <h2 className="text-lg font-bold text-gray-900">Medicines</h2>
          </div>
          <div className="space-y-4">
            {data.fhir_resources.MedicationRequest.map((med, i) => (
              <div
                key={i}
                className="border-l-2 border-teal-200 pl-4 pb-3"
              >
                <div className="font-semibold text-gray-900">
                  {med.medicine_name}
                </div>
                <div className="text-sm text-gray-600">
                  {med.dosage} · {med.frequency}
                  {med.timing && ` · ${med.timing}`}
                </div>
                {med.prescribed_by && (
                  <div className="text-xs text-gray-400 mt-1">
                    Prescribed by {med.prescribed_by}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab values (all, not just abnormal) */}
      {data.fhir_resources.DiagnosticReport.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical size={18} className="text-teal-700" />
            <h2 className="text-lg font-bold text-gray-900">Lab Values</h2>
          </div>
          <div className="space-y-2">
            {data.fhir_resources.DiagnosticReport.map((lab, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm text-gray-700">{lab.test_name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {lab.value} {lab.unit}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      lab.status === "Normal"
                        ? "bg-emerald-50 text-emerald-700"
                        : lab.status === "Critical"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {lab.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions to ask doctor */}
      {data.ai_insights.questions_to_ask_doctor.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-teal-700" />
            <h2 className="text-lg font-bold text-gray-900">
              Questions to ask your doctor
            </h2>
          </div>
          <div className="space-y-4">
            {data.ai_insights.questions_to_ask_doctor.map((q, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {lang === "en" ? q.question_en : q.question_hi}
                </div>
                <div className="text-xs text-gray-500">{q.rationale}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-gray-400 text-center mt-8 mb-4">
        This is an AI-generated summary for informational purposes only. It is
        not medical advice. Please consult your doctor.
      </div>
    </div>
  );
}