"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  FlaskConical,
  Building2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { getRecords, RecordListItem } from "@/lib/api";

export default function TimelinePage() {
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function iconFor(type: string) {
    if (type.includes("Lab")) return FlaskConical;
    if (type.includes("Discharge")) return Building2;
    return FileText;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Health Timeline</h1>
      <p className="text-gray-500 mb-8">
        All your medical records in chronological order.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={18} /> Loading records...
        </div>
      )}

      {!loading && records.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <div className="text-gray-600 mb-2">No records yet</div>
          <Link
            href="/upload"
            className="text-teal-700 font-semibold hover:underline"
          >
            Upload your first document →
          </Link>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="relative border-l-2 border-teal-200 ml-4">
          {records.map((r) => {
            const Icon = iconFor(r.document_type);
            const date = new Date(r.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <Link key={r.id} href={`/summary/${r.id}`}>
                <div className="ml-8 mb-6 relative cursor-pointer group">
                  <div className="absolute -left-11 w-6 h-6 rounded-full bg-teal-600 border-4 border-white shadow-sm" />
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition group-hover:border-teal-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={18} className="text-teal-700" />
                      <span className="text-xs text-gray-500">{date}</span>
                      <span className="ml-auto bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-md font-medium">
                        {r.document_type}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {r.file_name || "Medical Document"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      View details <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}