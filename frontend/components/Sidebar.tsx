"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Clock,
  MessageCircle,
  Watch,
  Utensils,
  Settings,
  Book,
} from "lucide-react";

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/upload", icon: FileText, label: "Documents" },
  { href: "/timeline", icon: Clock, label: "Health Timeline" },
  { href: "/chat", icon: MessageCircle, label: "AI Chat" },
  { href: "/watch", icon: Watch, label: "Smartwatch" },
  { href: "/nutrition", icon: Utensils, label: "Nutrition" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/resources", icon: Book, label: "Resources" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen p-4 flex flex-col shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-600 to-emerald-400 flex items-center justify-center text-white font-bold">
          H
        </div>
        <div>
          <div className="font-bold text-teal-700 text-lg leading-tight">
            HEALAC
          </div>
          <div className="text-xs text-gray-500">Your AI health copilot</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const active = path === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                  active
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-sm font-semibold text-teal-700">
          Better health with AI
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Understand your reports, track your health.
        </div>
      </div>
    </aside>
  );
}