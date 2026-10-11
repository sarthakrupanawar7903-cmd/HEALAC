"use client";

import {
  Phone,
  Shield,
  BookOpen,
  ExternalLink,
  Heart,
  AlertCircle,
  Award,
  Users,
} from "lucide-react";

const EMERGENCY = [
  {
    name: "National Emergency Helpline",
    number: "112",
    desc: "Single number for police, fire, ambulance",
  },
  {
    name: "Ambulance",
    number: "108",
    desc: "Free emergency ambulance service in most states",
  },
  {
    name: "Medical Helpline",
    number: "104",
    desc: "Non-emergency medical advice",
  },
  {
    name: "Mental Health Helpline (Tele-MANAS)",
    number: "14416",
    desc: "24×7 free mental health support, multiple languages",
  },
  {
    name: "COVID / Health Info",
    number: "1075",
    desc: "Government health information line",
  },
  {
    name: "Women's Helpline",
    number: "181",
    desc: "For women in distress",
  },
  {
    name: "Child Helpline",
    number: "1098",
    desc: "For children in need of care",
  },
];

const SCHEMES = [
  {
    name: "Ayushman Bharat (PM-JAY)",
    desc: "Free health cover up to ₹5 lakh/year for eligible families",
    link: "https://pmjay.gov.in",
  },
  {
    name: "ABHA Health ID",
    desc: "Create your national digital health ID — link all records",
    link: "https://abha.abdm.gov.in",
  },
  {
    name: "eSanjeevani",
    desc: "Free teleconsultation with government doctors",
    link: "https://esanjeevani.mohfw.gov.in",
  },
  {
    name: "PM National Dialysis Programme",
    desc: "Free dialysis for BPL patients at govt. district hospitals",
    link: "https://nhm.gov.in",
  },
  {
    name: "Janani Suraksha Yojana",
    desc: "Financial assistance for institutional deliveries",
    link: "https://nhm.gov.in",
  },
  {
    name: "Ni-kshay Poshan Yojana",
    desc: "Nutrition support for TB patients",
    link: "https://nikshay.in",
  },
];

const GUIDES = [
  {
    title: "Understanding Diabetes",
    desc: "What HbA1c, fasting glucose, and post-meal readings really mean",
    category: "Chronic conditions",
  },
  {
    title: "Managing Blood Pressure",
    desc: "Systolic vs diastolic, sodium limits, when to worry",
    category: "Chronic conditions",
  },
  {
    title: "Reading a Blood Test Report",
    desc: "CBC, lipid profile, liver function — what each number says",
    category: "Basics",
  },
  {
    title: "Medication Safety",
    desc: "Timing, storage, missed doses, and drug interactions",
    category: "Basics",
  },
  {
    title: "Post-Surgery Care at Home",
    desc: "Wound care, red flags, and when to see the doctor",
    category: "Recovery",
  },
  {
    title: "Nutrition for Diabetes",
    desc: "Glycemic index, portion control, Indian meal examples",
    category: "Nutrition",
  },
  {
    title: "Mental Health Basics",
    desc: "Stress, anxiety, when to seek help, and how",
    category: "Wellness",
  },
  {
    title: "Preventive Health Checkups",
    desc: "What to test at every age — 20s to 70s",
    category: "Prevention",
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Health Resources</h1>
      <p className="text-gray-500 mb-8">
        Emergency contacts, government schemes, and health guides — curated for
        India.
      </p>

      {/* Emergency numbers */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <Phone size={18} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Emergency Helplines
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EMERGENCY.map((e) => (
            <a
              key={e.number}
              href={`tel:${e.number}`}
              className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-red-200 hover:shadow-sm transition flex items-center gap-4"
            >
              <div className="text-center shrink-0 w-16">
                <div className="text-2xl font-bold text-red-600">
                  {e.number}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">
                  {e.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{e.desc}</div>
              </div>
              <Phone size={16} className="text-red-500 shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Government schemes */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
            <Award size={18} className="text-teal-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Government Health Schemes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SCHEMES.map((s) => (
            <a
              key={s.name}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-teal-200 hover:shadow-sm transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-gray-900 text-sm flex-1 pr-3">
                  {s.name}
                </div>
                <ExternalLink
                  size={14}
                  className="text-gray-400 group-hover:text-teal-700 mt-0.5 shrink-0"
                />
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                {s.desc}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Health guides */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <BookOpen size={18} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Health Guides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIDES.map((g) => (
            <div
              key={g.title}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-teal-200 hover:shadow-sm transition cursor-pointer"
            >
              <div className="text-xs text-teal-700 font-semibold mb-2">
                {g.category}
              </div>
              <div className="font-semibold text-gray-900 mb-1 text-sm">
                {g.title}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                {g.desc}
              </div>
              <div className="text-xs text-teal-700 mt-3">Read guide →</div>
            </div>
          ))}
        </div>
      </div>

      {/* About + privacy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          icon={Shield}
          title="Your data is safe"
          body="Records are stored locally. Nothing is shared with third parties. In production, all data would be end-to-end encrypted."
        />
        <InfoCard
          icon={Heart}
          title="ABDM-ready"
          body="Our data model follows FHIR R4 standards. Connect your ABHA ID to sync records across hospitals."
        />
        <InfoCard
          icon={Users}
          title="Family profiles"
          body="Manage records for parents, children, or dependents from a single account — coming soon."
        />
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-900">
          <strong>Important:</strong> HEALAC is an informational tool, not a
          substitute for professional medical advice. Always consult a
          qualified doctor for diagnosis and treatment decisions.
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: any;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
        <Icon size={18} className="text-teal-700" />
      </div>
      <div className="font-semibold text-gray-900 mb-2 text-sm">{title}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{body}</div>
    </div>
  );
}