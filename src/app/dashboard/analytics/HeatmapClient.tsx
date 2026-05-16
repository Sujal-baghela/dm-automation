"use client";

import { useState } from "react";

interface HeatmapData {
    grid: number[][];
    maxCount: number;
    topSlots: { day: number; hour: number; count: number }[];
    totalActivity: number;
}

interface Props {
    data: HeatmapData;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const HOURS = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "12am";
    if (i < 12) return `${i}am`;
    if (i === 12) return "12pm";
    return `${i - 12}pm`;
});

// Show every 3rd hour label to avoid crowding
const HOUR_LABELS = HOURS.map((h, i) => (i % 3 === 0 ? h : ""));

function getColor(count: number, maxCount: number): string {
    if (count === 0) return "var(--surface)";
    const intensity = maxCount === 0 ? 0 : count / maxCount;
    if (intensity < 0.2) return "rgba(139,92,246,0.15)";
    if (intensity < 0.4) return "rgba(139,92,246,0.30)";
    if (intensity < 0.6) return "rgba(139,92,246,0.50)";
    if (intensity < 0.8) return "rgba(139,92,246,0.70)";
    return "rgba(139,92,246,0.95)";
}

function getTextColor(count: number, maxCount: number): string {
    if (count === 0) return "transparent";
    const intensity = maxCount === 0 ? 0 : count / maxCount;
    return intensity >= 0.6 ? "#fff" : "var(--purple)";
}

export default function HeatmapClient({ data }: Props) {
    const { grid, maxCount, topSlots, totalActivity } = data;
    const [tooltip, setTooltip] = useState<{ day: number; hour: number; count: number } | null>(null);

    const isEmpty = totalActivity === 0;

    return (
        <div className="card">
            <div className="card-head">
                <div className="card-title">🕐 Best Time to Post</div>
                <span style={{ fontSize: 12, color: "var(--silver-blue)" }}>
                    Based on {totalActivity} activities (posts + replies)
                </span>
            </div>

            {isEmpty ? (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--near-black)", marginBottom: 6 }}>
                        No activity data yet
                    </div>
                    <div style={{ fontSize: 13, color: "var(--silver-blue)" }}>
                        Publish posts or reply to messages to see your best posting times.
                    </div>
                </div>
            ) : (
                <div style={{ padding: "0 20px 20px" }}>

                    {/* Top 3 best slots */}
                    {topSlots.length > 0 && (
                        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                            {topSlots.map((slot, index) => (
                                <div
                                    key={`${slot.day}-${slot.hour}`}
                                    style={{
                                        flex: 1,
                                        minWidth: 140,
                                        padding: "12px 14px",
                                        borderRadius: "var(--r-sm)",
                                        background: index === 0 ? "var(--purple-subtle)" : "var(--surface)",
                                        border: index === 0 ? "1px solid var(--purple)" : "1px solid var(--border-gray)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 4,
                                    }}
                                >
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--silver-blue)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        {index === 0 ? "🏆 Best time" : index === 1 ? "🥈 2nd best" : "🥉 3rd best"}
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: index === 0 ? "var(--purple)" : "var(--near-black)" }}>
                                        {DAYS_FULL[slot.day]} {HOURS[slot.hour]}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--silver-blue)" }}>
                                        {slot.count} {slot.count === 1 ? "activity" : "activities"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Heatmap grid */}
                    <div style={{ overflowX: "auto" }}>
                        <div style={{ minWidth: 600 }}>

                            {/* Hour labels */}
                            <div style={{ display: "flex", marginLeft: 36, marginBottom: 4 }}>
                                {HOUR_LABELS.map((label, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            fontSize: 9,
                                            color: "var(--silver-blue)",
                                            textAlign: "left",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {/* Grid rows */}
                            {DAYS.map((day, dayIndex) => (
                                <div key={day} style={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
                                    {/* Day label */}
                                    <div
                                        style={{
                                            width: 32,
                                            fontSize: 11,
                                            color: "var(--silver-blue)",
                                            fontWeight: 500,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {day}
                                    </div>

                                    {/* Hour cells */}
                                    {grid[dayIndex].map((count, hourIndex) => (
                                        <div
                                            key={hourIndex}
                                            style={{
                                                flex: 1,
                                                height: 22,
                                                marginRight: 2,
                                                borderRadius: 3,
                                                background: getColor(count, maxCount),
                                                border: "1px solid var(--border-gray)",
                                                cursor: count > 0 ? "pointer" : "default",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 8,
                                                fontWeight: 700,
                                                color: getTextColor(count, maxCount),
                                                position: "relative",
                                                transition: "transform 0.1s, opacity 0.1s",
                                            }}
                                            onMouseEnter={() => count > 0 && setTooltip({ day: dayIndex, hour: hourIndex, count })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            {count > 0 && count}
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Tooltip */}
                            {tooltip && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        padding: "8px 12px",
                                        background: "var(--near-black)",
                                        color: "#fff",
                                        borderRadius: "var(--r-sm)",
                                        fontSize: 12,
                                        display: "inline-block",
                                    }}
                                >
                                    <strong>{DAYS_FULL[tooltip.day]}</strong> at <strong>{HOURS[tooltip.hour]}</strong> — {tooltip.count} {tooltip.count === 1 ? "activity" : "activities"}
                                </div>
                            )}

                            {/* Legend */}
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}>
                                <span style={{ fontSize: 11, color: "var(--silver-blue)" }}>Less</span>
                                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: 3,
                                            background: intensity === 0
                                                ? "var(--surface)"
                                                : `rgba(139,92,246,${intensity * 0.95})`,
                                            border: "1px solid var(--border-gray)",
                                        }}
                                    />
                                ))}
                                <span style={{ fontSize: 11, color: "var(--silver-blue)" }}>More</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}