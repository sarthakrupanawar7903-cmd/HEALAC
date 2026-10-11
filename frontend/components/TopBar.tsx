"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface Profile {
  name: string;
}

export default function TopBar() {
  const [name, setName] = useState("User");

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem("healac_profile");
        if (raw) {
          const p: Profile = JSON.parse(raw);
          if (p.name) setName(p.name);
        }
      } catch {}
    }
    load();
    window.addEventListener("healac:profile-updated", load);
    return () => window.removeEventListener("healac:profile-updated", load);
  }, []);

  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-end gap-4">
      <button className="text-gray-500 hover:text-gray-700">
        <Bell size={20} />
      </button>
      <Link href="/settings">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl px-2 py-1 transition">
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
            {initials || "SK"}
          </div>
          <div className="text-sm text-gray-700">{name}</div>
        </div>
      </Link>
    </header>
  );
}