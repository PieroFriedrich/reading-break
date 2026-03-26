"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { UserBook } from "@/lib/types";

type Period = "7d" | "30d" | "12m" | "all";

const PERIOD_TABS: { label: string; value: Period }[] = [
  { label: "Last Week", value: "7d" },
  { label: "Last Month", value: "30d" },
  { label: "Last Year", value: "12m" },
  { label: "All time", value: "all" },
];

function getCutoff(period: Period): Date {
  const now = new Date();
  if (period === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "12m") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 11);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return new Date(0);
}

function buildChartData(books: UserBook[], period: Period) {
  const now = new Date();

  if (period === "7d") {
    const days: { label: string; date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: key,
        count: 0,
      });
    }
    for (const b of books) {
      if (!b.finishedAt) continue;
      const key = b.finishedAt.slice(0, 10);
      const slot = days.find((d) => d.date === key);
      if (slot) slot.count++;
    }
    return days.map(({ label, count }) => ({ label, count }));
  }

  if (period === "30d") {
    // Group into 5 weekly buckets (W1…W5 from oldest to newest)
    const weeks: { label: string; start: Date; count: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i * 7 - 6);
      start.setHours(0, 0, 0, 0);
      weeks.push({ label: `Week ${5 - i}`, start, count: 0 });
    }
    const cutoff = getCutoff("30d");
    for (const b of books) {
      if (!b.finishedAt) continue;
      const d = new Date(b.finishedAt);
      if (d < cutoff) continue;
      for (let i = weeks.length - 1; i >= 0; i--) {
        if (d >= weeks[i].start) {
          weeks[i].count++;
          break;
        }
      }
    }
    return weeks.map(({ label, count }) => ({ label, count }));
  }

  if (period === "12m") {
    const months: { label: string; key: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        label: d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        key,
        count: 0,
      });
    }
    for (const b of books) {
      if (!b.finishedAt) continue;
      const key = b.finishedAt.slice(0, 7);
      const slot = months.find((m) => m.key === key);
      if (slot) slot.count++;
    }
    return months.map(({ label, count }) => ({ label, count }));
  }

  // All time — group by year
  const yearMap = new Map<string, number>();
  for (const b of books) {
    if (!b.finishedAt) continue;
    const y = b.finishedAt.slice(0, 4);
    yearMap.set(y, (yearMap.get(y) ?? 0) + 1);
  }
  if (yearMap.size === 0) return [];
  const years = [...yearMap.keys()].sort();
  // If span ≤ 2 years, switch to monthly breakdown
  if (years.length <= 2) {
    const monthMap = new Map<string, number>();
    for (const b of books) {
      if (!b.finishedAt) continue;
      const key = b.finishedAt.slice(0, 7);
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }
    const keys = [...monthMap.keys()].sort();
    return keys.map((key) => ({
      label: new Date(key + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      count: monthMap.get(key) ?? 0,
    }));
  }
  return years.map((y) => ({ label: y, count: yearMap.get(y) ?? 0 }));
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const count = payload[0].value;
  return (
    <div className="bg-white dark:bg-[#251a14] border border-[#ddd0c4] dark:border-[#3a2820] rounded-lg px-3 py-2 text-sm shadow">
      <p className="text-[#4d352a] dark:text-[#e8ddd8] font-medium">{label}</p>
      <p className="text-[#8d6548] dark:text-[#c5ae9b]">
        {count} {count === 1 ? "book" : "books"}
      </p>
    </div>
  );
}

export default function ReadingProgress({
  userBooks,
}: {
  userBooks: UserBook[];
}) {
  const [period, setPeriod] = useState<Period>("12m");

  const finishedBooks = useMemo(
    () => userBooks.filter((b) => b.status === "FINISHED" && b.finishedAt),
    [userBooks],
  );

  const booksInPeriod = useMemo(() => {
    const cutoff = getCutoff(period);
    return finishedBooks.filter((b) => new Date(b.finishedAt!) >= cutoff);
  }, [finishedBooks, period]);

  const chartData = useMemo(
    () => buildChartData(booksInPeriod, period),
    [booksInPeriod, period],
  );

  if (finishedBooks.length === 0) return null;

  const hasData = booksInPeriod.length > 0;
  const total = booksInPeriod.length;

  return (
    <div className="bg-[#faf7f4] dark:bg-[#1e1410] border border-[#ddd0c4] dark:border-[#3a2820] rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#4d352a] dark:text-[#e8ddd8]">
            Reading Progress
          </h2>
          <p className="text-sm text-[#8d6548] dark:text-[#c5ae9b] mt-0.5">
            {hasData
              ? `${total} ${total === 1 ? "book" : "books"} finished`
              : "No books finished in this period"}
          </p>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPeriod(tab.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                period === tab.value
                  ? "bg-[#8d6548] dark:bg-[#5a3d2c] text-[#f0eae5]"
                  : "bg-[#f0eae5] dark:bg-[#251a14] border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] hover:border-[#9a7559]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={chartData}
            barSize={period === "7d" ? 28 : period === "30d" ? 36 : 20}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9a7d6e" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#9a7d6e" }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(141,101,72,0.08)" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.count > 0 ? "#8d6548" : "#ddd0c4"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-[#c5ae9b] dark:text-[#5a4035]">
            No data to display
          </p>
        </div>
      )}
    </div>
  );
}
