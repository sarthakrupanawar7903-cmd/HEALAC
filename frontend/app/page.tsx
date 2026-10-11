"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  FlaskConical,
  Building2,
  Camera,
  Sparkles,
  Shield,
  Heart,
  ArrowRight,
  AlertCircle,
  Pill,
} from "lucide-react";
import { getRecords, RecordListItem } from "@/lib/api";

export default function Home() {
  const [records, setRecords] = useState<RecordListItem[]>([]);

  useEffect(() => {
    getRecords().then(setRecords).catch(() => {});
  }, []);

  const cards = [
    {
      icon: FileText,
      title: "Upload Prescription",
      desc: "Get clear explanations of your medicines and dosages.",
      href: "/upload",
    },
    {
      icon: FlaskConical,
      title: "Upload Lab Report",
      desc: "Understand your results and what they mean.",
      href: "/upload",
    },
    {
      icon: Building2,
      title: "Upload Discharge Summary",
      desc: "Get a simple breakdown of your hospital visit.",
      href: "/upload",
    },
    {
      icon: Camera,
      title: "Upload from Gallery",
      desc: "Choose a file from your device or cloud storage.",
      href: "/upload",
    },
  ];

  return (
    <div className="max-w-6xl">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-10 mb-8">
        <div className="text-xs font-semibold text-teal-700 tracking-wider mb-2">
          WELCOME TO HEALAC
        </div>
        <h1 className="text-5xl font-bold text-gray-900">
          Your health,{" "}
          <span className="text-teal-700 italic">explained.</span>
        </h1>
        <p className="text-gray-600 mt-3 max-w-xl">
          Upload your medical reports, prescriptions or discharge summaries —
          and let our AI transform complex medical information into clear,
          simple answers.
        </p>

        <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Sparkles size={16} className="text-teal-700" /> AI-Powered Analysis
          </span>
          <span className="flex items-center gap-2">
            <Shield size={16} className="text-teal-700" /> Trusted & Secure
          </span>
          <span className="flex items-center gap-2">
            <Heart size={16} className="text-teal-700" /> Plain Language
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Get Started</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload a document to get started or explore your health history.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-teal-700" />
                </div>
                <div className="font-semibold mb-1 text-gray-900">
                  {card.title}
                </div>
                <div className="text-xs text-gray-500 mb-4">{card.desc}</div>
                <ArrowRight size={16} className="text-teal-700" />
              </div>
            </Link>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Health at a Glance</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <FileText size={20} className="text-teal-700" />
          </div>
          <div className="text-2xl font-bold">{records.length}</div>
          <div className="text-sm text-gray-500">Documents Analyzed</div>
          <Link
            href="/timeline"
            className="text-xs text-teal-700 mt-2 inline-block"
          >
            View all →
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <Pill size={20} className="text-teal-700" />
          </div>
          <div className="text-2xl font-bold">
            {records.filter((r) => r.document_type === "Prescription").length}
          </div>
          <div className="text-sm text-gray-500">Prescriptions Stored</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold">
            {
              records.filter(
                (r) => r.document_type === "Diagnostic Lab Report"
              ).length
            }
          </div>
          <div className="text-sm text-gray-500">Lab Reports Analyzed</div>
        </div>
      </div>
    </div>
  );
}