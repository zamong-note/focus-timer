import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#e8602c", "#f2a07a", "#7fb069", "#d4b483", "#c97b5a", "#9b8f7a"];

function StatCard({ label, value, unit }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div>
        <h1 className="page-title">대시보드</h1>
        <div className="loading">통계를 계산하는 중...</div>
      </div>
    );
  }

  const weekdayData = Object.entries(stats.by_weekday).map(([day, minutes]) => ({
    day,
    minutes,
  }));
  const subjectData = stats.by_subject;

  return (
    <div>
      <h1 className="page-title">대시보드</h1>
      <p className="page-sub">당신의 집중 패턴을 한눈에 살펴보세요.</p>

      <div className="stat-grid">
        <StatCard label="연속 기록" value={stats.streak} unit="일" />
        <StatCard label="총 집중 시간" value={stats.total_hours} unit="시간" />
        <StatCard label="이번 주 세션" value={stats.sessions_this_week} unit="회" />
      </div>

      <div className="charts">
        <div className="chart-card">
          <div className="chart-title">요일별 집중 시간 (분)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekdayData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#34302a" vertical={false} />
              <XAxis dataKey="day" stroke="#a79b87" fontSize={12} tickLine={false} />
              <YAxis stroke="#a79b87" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#1f1d1a",
                  border: "1px solid #34302a",
                  borderRadius: 10,
                  color: "#f3ead9",
                }}
                cursor={{ fill: "rgba(232,96,44,.08)" }}
              />
              <Bar dataKey="minutes" fill="#e8602c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">과목별 비중</div>
          {subjectData.length === 0 ? (
            <div className="empty">데이터가 없습니다.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={subjectData}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {subjectData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#1f1d1a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1f1d1a",
                    border: "1px solid #34302a",
                    borderRadius: 10,
                    color: "#f3ead9",
                  }}
                  formatter={(v) => [`${v}분`, ""]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 13, color: "#a79b87" }}
                  formatter={(value) => <span style={{ color: "#a79b87" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
