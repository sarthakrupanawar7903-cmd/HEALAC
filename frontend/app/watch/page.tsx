"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Footprints,
  Droplets,
  Moon,
  Activity,
  Wind,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Watch,
  Plus,
  X,
  Bluetooth,
  BatteryFull,
} from "lucide-react";
import { api } from "@/lib/api";

interface DayData {
  date: string;
  day_offset: number;
  heart_rate_hourly: number[];
  heart_rate_avg: number;
  heart_rate_min: number;
  heart_rate_max: number;
  resting_hr: number;
  steps: number;
  steps_goal: number;
  hydration_ml: number;
  hydration_goal: number;
  stress_level: number;
  sleep_hours: number;
  sleep_quality: string;
  spo2: number;
  calories_burned: number;
  active_minutes: number;
}

interface Insight {
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  action: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  signal: number;
  battery: number;
  paired: boolean;
}

type MetricKey =
  | "heart_rate"
  | "steps"
  | "hydration"
  | "sleep"
  | "calories";

export default function WatchPage() {
  const [today, setToday] = useState<DayData | null>(null);
  const [history, setHistory] = useState<DayData[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openMetric, setOpenMetric] = useState<MetricKey | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  useEffect(() => {
    api
      .get("/api/watch/data")
      .then((res) => {
        setToday(res.data.data);
        setHistory(res.data.history);
        setInsights(res.data.insights);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} /> Syncing with your
        smartwatch...
      </div>
    );
  }

  if (error || !today) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          Couldn't load watch data. Make sure the backend is running.
        </div>
      </div>
    );
  }

  const stepPct = Math.min(
    100,
    Math.round((today.steps / today.steps_goal) * 100)
  );
  const hydPct = Math.min(
    100,
    Math.round((today.hydration_ml / today.hydration_goal) * 100)
  );

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Smartwatch Dashboard</h1>
          <p className="text-gray-500">
            Real-time health metrics for {today.date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-emerald-700">
              Connected
            </span>
            <Watch size={16} className="text-emerald-700" />
          </div>
          <button
            onClick={() => setShowDeviceModal(true)}
            className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-teal-800 transition"
          >
            <Plus size={16} /> Add Device
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Heart}
          label="Avg Heart Rate"
          value={`${today.heart_rate_avg}`}
          unit="bpm"
          accent="red"
          subtitle={`${today.heart_rate_min}–${today.heart_rate_max} bpm`}
          onClick={() => setOpenMetric("heart_rate")}
        />
        <MetricCard
          icon={Footprints}
          label="Steps Today"
          value={today.steps.toLocaleString()}
          unit={`/ ${today.steps_goal.toLocaleString()}`}
          accent="teal"
          subtitle={`${stepPct}% of goal · tap for history`}
          progress={stepPct}
          onClick={() => setOpenMetric("steps")}
        />
        <MetricCard
          icon={Droplets}
          label="Hydration"
          value={`${today.hydration_ml}`}
          unit={`/ ${today.hydration_goal} ml`}
          accent="blue"
          subtitle={`${hydPct}% of goal · tap for history`}
          progress={hydPct}
          onClick={() => setOpenMetric("hydration")}
        />
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={`${today.sleep_hours}`}
          unit="hrs"
          accent="purple"
          subtitle={`${today.sleep_quality} · tap for history`}
          onClick={() => setOpenMetric("sleep")}
        />
      </div>

      {/* Today HR chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">
              Heart Rate Today
            </h2>
          </div>
          <div className="text-xs text-gray-500">Hourly</div>
        </div>
        <HRBarChart hourly={today.heart_rate_hourly} />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SecondaryCard
          icon={Wind}
          label="Blood Oxygen (SpO2)"
          value={`${today.spo2}%`}
          status={today.spo2 >= 96 ? "normal" : "warning"}
          note="Normal: 95–100%"
        />
        <SecondaryCard
          icon={Activity}
          label="Stress Level"
          value={`${today.stress_level} / 10`}
          status={today.stress_level <= 5 ? "normal" : "warning"}
          note="Lower is better"
        />
        <SecondaryCard
          icon={Flame}
          label="Calories Burned"
          value={`${today.calories_burned.toLocaleString()} kcal`}
          status="normal"
          note={`${today.active_minutes} active minutes`}
          onClick={() => setOpenMetric("calories")}
        />
      </div>

      {/* 5-day trends */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Last 5 Days
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MiniTrend
            label="Steps"
            color="teal"
            values={history.map((d) => d.steps)}
            unit="steps"
            format="number"
          />
          <MiniTrend
            label="Sleep"
            color="purple"
            values={history.map((d) => d.sleep_hours)}
            unit="hrs"
            format="decimal"
          />
          <MiniTrend
            label="Avg Heart Rate"
            color="red"
            values={history.map((d) => d.heart_rate_avg)}
            unit="bpm"
            format="number"
          />
          <MiniTrend
            label="Calories"
            color="orange"
            values={history.map((d) => d.calories_burned)}
            unit="kcal"
            format="number"
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-400 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            AI Health Insights
          </h2>
        </div>
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <InsightCard key={i} insight={ins} />
          ))}
        </div>
      </div>

      {openMetric && (
        <MetricDetailModal
          metric={openMetric}
          history={history}
          onClose={() => setOpenMetric(null)}
        />
      )}

      {showDeviceModal && (
        <DevicePairModal onClose={() => setShowDeviceModal(false)} />
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  accent,
  subtitle,
  progress,
  onClick,
}: {
  icon: any;
  label: string;
  value: string;
  unit: string;
  accent: "red" | "teal" | "blue" | "purple";
  subtitle?: string;
  progress?: number;
  onClick?: () => void;
}) {
  const accentMap = {
    red: "bg-red-50 text-red-600",
    teal: "bg-emerald-50 text-teal-700",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  const barMap = {
    red: "bg-red-500",
    teal: "bg-teal-600",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-100 rounded-2xl p-5 ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-teal-200 hover:-translate-y-0.5 transition-all"
          : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accentMap[accent]}`}
      >
        <Icon size={20} />
      </div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
      {subtitle && <div className="text-xs text-gray-500 mb-2">{subtitle}</div>}
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barMap[accent]} rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function SecondaryCard({
  icon: Icon,
  label,
  value,
  status,
  note,
  onClick,
}: {
  icon: any;
  label: string;
  value: string;
  status: "normal" | "warning";
  note: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-teal-200 transition"
          : ""
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          status === "normal"
            ? "bg-emerald-50 text-teal-700"
            : "bg-amber-50 text-amber-600"
        }`}
      >
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-400">{note}</div>
      </div>
    </div>
  );
}

function HRBarChart({ hourly }: { hourly: number[] }) {
  const max = Math.max(...hourly);
  const min = Math.min(...hourly);
  const range = max - min || 1;

  return (
    <>
      <div className="flex items-end gap-1" style={{ height: "180px" }}>
        {hourly.map((hr, i) => {
          const heightPx = 30 + ((hr - min) / range) * 140;
          return (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-red-400 to-red-500 rounded-t-sm hover:opacity-80 transition relative group"
              style={{ height: `${heightPx}px` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                {hr} bpm
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-3 px-1">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </>
  );
}

function MiniTrend({
  label,
  values,
  unit,
  color,
  format,
}: {
  label: string;
  values: number[];
  unit: string;
  color: "teal" | "purple" | "red" | "orange";
  format: "number" | "decimal";
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const colorMap = {
    teal: "bg-teal-500",
    purple: "bg-purple-400",
    red: "bg-red-400",
    orange: "bg-orange-400",
  };
  const days = ["-4d", "-3d", "-2d", "-1d", "Today"];

  function fmt(v: number) {
    return format === "decimal"
      ? v.toFixed(1)
      : Math.round(v).toLocaleString();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">
          avg {fmt(avg)} {unit}
        </span>
      </div>

      <div className="flex items-end gap-2" style={{ height: "120px" }}>
        {values.map((v, i) => {
          const heightPx = 24 + ((v - min) / range) * 80;
          const isToday = i === values.length - 1;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end gap-1.5"
              style={{ height: "120px" }}
            >
              <div className="text-[10px] font-semibold text-gray-600">
                {fmt(v)}
              </div>
              <div
                className={`w-full ${colorMap[color]} rounded-t-md transition hover:opacity-80 ${
                  isToday ? "ring-2 ring-teal-600 ring-offset-1" : ""
                }`}
                style={{ height: `${heightPx}px` }}
                title={`${fmt(v)} ${unit}`}
              />
              <span
                className={`text-[10px] ${
                  isToday ? "font-semibold text-teal-700" : "text-gray-400"
                }`}
              >
                {days[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const Icon =
    insight.type === "success"
      ? CheckCircle2
      : insight.type === "warning"
      ? AlertTriangle
      : Info;
  const color =
    insight.type === "success"
      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
      : insight.type === "warning"
      ? "text-amber-600 bg-amber-50 border-amber-100"
      : "text-blue-600 bg-blue-50 border-blue-100";

  return (
    <div className={`border rounded-xl p-4 ${color}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm">
            {insight.title}
          </div>
          <div className="text-sm text-gray-700 mt-1">
            {insight.description}
          </div>
          <div className="text-xs mt-2 font-medium opacity-80">
            💡 {insight.action}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Metric Detail Modal ---------- */

function MetricDetailModal({
  metric,
  history,
  onClose,
}: {
  metric: MetricKey;
  history: DayData[];
  onClose: () => void;
}) {
  const config = {
    heart_rate: {
      title: "Heart Rate — Last 5 Days",
      unit: "bpm",
      color: "red" as const,
      getValue: (d: DayData) => d.heart_rate_avg,
      getSubLabel: (d: DayData) =>
        `Range ${d.heart_rate_min}–${d.heart_rate_max} · Resting ${d.resting_hr}`,
    },
    steps: {
      title: "Steps — Last 5 Days",
      unit: "steps",
      color: "teal" as const,
      getValue: (d: DayData) => d.steps,
      getSubLabel: (d: DayData) => `Goal: ${d.steps_goal.toLocaleString()}`,
    },
    hydration: {
      title: "Hydration — Last 5 Days",
      unit: "ml",
      color: "blue" as const,
      getValue: (d: DayData) => d.hydration_ml,
      getSubLabel: (d: DayData) => `Goal: ${d.hydration_goal} ml`,
    },
    sleep: {
      title: "Sleep — Last 5 Days",
      unit: "hrs",
      color: "purple" as const,
      getValue: (d: DayData) => d.sleep_hours,
      getSubLabel: (d: DayData) => `Quality: ${d.sleep_quality}`,
    },
    calories: {
      title: "Calories Burned — Last 5 Days",
      unit: "kcal",
      color: "orange" as const,
      getValue: (d: DayData) => d.calories_burned,
      getSubLabel: (d: DayData) => `${d.active_minutes} active min`,
    },
  }[metric];

  const values = history.map(config.getValue);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const latest = values[values.length - 1];
  const first = values[0];
  const trendPct = ((latest - first) / (first || 1)) * 100;

  const barColorMap = {
    red: "bg-gradient-to-t from-red-400 to-red-500",
    teal: "bg-gradient-to-t from-teal-500 to-teal-600",
    blue: "bg-gradient-to-t from-blue-400 to-blue-500",
    purple: "bg-gradient-to-t from-purple-400 to-purple-500",
    orange: "bg-gradient-to-t from-orange-400 to-orange-500",
  };

  function fmt(v: number) {
    return metric === "sleep"
      ? v.toFixed(1)
      : Math.round(v).toLocaleString();
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {config.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Average: {fmt(avg)} {config.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Latest</div>
            <div className="text-lg font-bold text-gray-900">
              {fmt(latest)}
            </div>
            <div className="text-xs text-gray-400">{config.unit}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">5-day average</div>
            <div className="text-lg font-bold text-gray-900">{fmt(avg)}</div>
            <div className="text-xs text-gray-400">{config.unit}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Change</div>
            <div
              className={`text-lg font-bold ${
                trendPct >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trendPct >= 0 ? "+" : ""}
              {trendPct.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">vs oldest</div>
          </div>
        </div>

        {/* BAR CHART — fixed with pixel heights */}
        <div
          className="flex items-end gap-3 mb-8 px-2"
          style={{ height: "240px" }}
        >
          {history.map((d, i) => {
            const v = config.getValue(d);
            const heightPx = 40 + ((v - min) / range) * 140;
            const isToday = i === history.length - 1;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end"
                style={{ height: "240px" }}
              >
                <div className="text-sm font-bold text-gray-900 mb-2">
                  {fmt(v)}
                </div>
                <div
                  className={`w-full rounded-t-lg ${barColorMap[config.color]} transition-all hover:opacity-85 ${
                    isToday ? "ring-2 ring-teal-700 ring-offset-2" : ""
                  }`}
                  style={{ height: `${heightPx}px` }}
                  title={`${fmt(v)} ${config.unit}`}
                />
                <div className="text-xs text-gray-500 mt-3 text-center leading-tight">
                  <div>{d.date.slice(5)}</div>
                  {isToday && (
                    <div className="font-semibold text-teal-700 mt-0.5">
                      TODAY
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Per-day list */}
        <div className="space-y-2">
          {history
            .slice()
            .reverse()
            .map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {d.date}
                    {d.day_offset === 0 && (
                      <span className="ml-2 text-xs text-teal-700 font-semibold">
                        TODAY
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {config.getSubLabel(d)}
                  </div>
                </div>
                <div className="font-bold text-gray-900">
                  {fmt(config.getValue(d))}{" "}
                  <span className="text-xs font-normal text-gray-400">
                    {config.unit}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Device Pairing Modal ---------- */

function DevicePairModal({ onClose }: { onClose: () => void }) {
  const [scanning, setScanning] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [pairingId, setPairingId] = useState<string | null>(null);
  const [pairedId, setPairedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      api
        .get("/api/watch/devices")
        .then((res) => {
          setDevices(res.data.devices);
          setScanning(false);
        })
        .catch(() => setScanning(false));
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  async function pair(device: Device) {
    setPairingId(device.id);
    await new Promise((r) => setTimeout(r, 1200));
    try {
      await api.post("/api/watch/pair", {
        patient_id: "mock_abha_12345",
        device_id: device.id,
      });
      setPairedId(device.id);
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, paired: true } : d))
      );
    } catch {}
    setPairingId(null);
  }

  function signalBars(signal: number) {
    if (signal > -50) return 4;
    if (signal > -65) return 3;
    if (signal > -75) return 2;
    return 1;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bluetooth size={20} className="text-teal-700" />
              Pair a Device
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {scanning
                ? "Scanning for nearby Bluetooth devices..."
                : `${devices.length} devices found`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {scanning && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
              <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
              <Bluetooth
                size={32}
                className="absolute inset-0 m-auto text-teal-700"
              />
            </div>
            <p className="text-sm text-gray-500">
              Looking for devices near you...
            </p>
          </div>
        )}

        {!scanning && (
          <div className="space-y-2">
            {devices.map((d) => {
              const bars = signalBars(d.signal);
              const isPairing = pairingId === d.id;
              const isPaired = d.paired;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <Watch size={18} className="text-teal-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {d.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{d.type}</span>
                      <span className="flex items-center gap-1">
                        <BatteryFull size={11} /> {d.battery}%
                      </span>
                      <span className="flex gap-0.5 items-end h-3">
                        {[1, 2, 3, 4].map((b) => (
                          <span
                            key={b}
                            className={`w-0.5 rounded-sm ${
                              b <= bars ? "bg-teal-600" : "bg-gray-200"
                            }`}
                            style={{ height: `${b * 3}px` }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                  {isPaired ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 size={12} /> Paired
                    </div>
                  ) : (
                    <button
                      onClick={() => pair(d)}
                      disabled={isPairing || pairingId !== null}
                      className="bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-teal-800 disabled:opacity-50 transition flex items-center gap-1"
                    >
                      {isPairing ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Pairing
                        </>
                      ) : (
                        "Pair"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pairedId && (
          <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} /> Device paired successfully. Data will
            sync automatically.
          </div>
        )}

        {!scanning && (
          <button
            onClick={() => {
              setScanning(true);
              setDevices([]);
              setPairedId(null);
              setTimeout(() => {
                api
                  .get("/api/watch/devices")
                  .then((res) => {
                    setDevices(res.data.devices);
                    setScanning(false);
                  })
                  .catch(() => setScanning(false));
              }, 2000);
            }}
            className="mt-4 w-full text-sm text-teal-700 font-semibold py-2 hover:bg-gray-50 rounded-lg transition"
          >
            Scan again
          </button>
        )}
      </div>
    </div>
  );
}