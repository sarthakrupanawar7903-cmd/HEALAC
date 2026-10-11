"use client";

import { useEffect, useState } from "react";
import { Save, User, RotateCcw, Check } from "lucide-react";

interface Profile {
  name: string;
  age: string;
  gender: string;
  language: string;
  patientId: string;
}

const DEFAULT_PROFILE: Profile = {
  name: "Sarthak K.",
  age: "22",
  gender: "Male",
  language: "English",
  patientId: "mock_abha_12345",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("healac_profile");
    if (stored) {
      try {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) });
      } catch {}
    }
  }, []);

  function save() {
    localStorage.setItem("healac_profile", JSON.stringify(profile));
    setSaved(true);
    window.dispatchEvent(new Event("healac:profile-updated"));
    setTimeout(() => setSaved(false), 2000);
  }

  function reset() {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem("healac_profile");
    window.dispatchEvent(new Event("healac:profile-updated"));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
      <p className="text-gray-500 mb-8">
        Manage your personal information. This data is stored locally.
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <User size={18} className="text-teal-700" />
          <h2 className="text-lg font-bold text-gray-900">Personal Info</h2>
        </div>

        <div className="space-y-4">
          <Field
            label="Full Name"
            value={profile.name}
            onChange={(v) => setProfile({ ...profile, name: v })}
            placeholder="Enter your name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Age"
              value={profile.age}
              onChange={(v) => setProfile({ ...profile, age: v })}
              placeholder="e.g. 45"
              type="number"
            />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Preferred Language
            </label>
            <select
              value={profile.language}
              onChange={(e) =>
                setProfile({ ...profile, language: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            >
              <option>English</option>
              <option>हिंदी (Hindi)</option>
              <option>मराठी (Marathi)</option>
              <option>ગુજરાતી (Gujarati)</option>
              <option>தமிழ் (Tamil)</option>
              <option>తెలుగు (Telugu)</option>
            </select>
          </div>

          <Field
            label="ABHA / Patient ID"
            value={profile.patientId}
            onChange={(v) => setProfile({ ...profile, patientId: v })}
            placeholder="mock_abha_12345"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-800 transition"
        >
          {saved ? (
            <>
              <Check size={18} /> Saved
            </>
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
        >
          <RotateCcw size={18} /> Reset
        </button>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
        <strong>Note:</strong> Profile data is stored locally in your browser.
        In production, it would sync with your ABHA account.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
      />
    </div>
  );
}