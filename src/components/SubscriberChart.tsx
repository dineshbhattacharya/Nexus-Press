"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import styles from "@/app/dashboard/page.module.css";

const data = [
  { name: "Jan", subscribers: 110, revenue: 150 },
  { name: "Feb", subscribers: 180, revenue: 220 },
  { name: "Mar", subscribers: 290, revenue: 380 },
  { name: "Apr", subscribers: 420, revenue: 610 },
  { name: "May", subscribers: 590, revenue: 840 },
  { name: "Jun", subscribers: 780, revenue: 1120 },
];

export default function SubscriberChart() {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            stroke="var(--text-muted)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              background: "var(--bg-card)", 
              borderColor: "var(--border-color)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)"
            }} 
          />
          <Area
            type="monotone"
            dataKey="subscribers"
            stroke="var(--accent-orange)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorSub)"
            name="Subscribers"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
