


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";

import "../css/CostChart.css";

function getLast4MonthsData() {
  const now = new Date();
  const data = [];

  for (let i = 3; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    const month = date.toLocaleString("ru-RU", { month: "short" });

    data.push({
      month,
      value: Math.floor(300000 + Math.random() * 150000),
    });
  }

  return data;
}

export default function CostChart() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const data = getLast4MonthsData();

  return (
    <div className="chartCard">
      <h3 className="title">Cost of collections</h3>

      <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={0}
          />

          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12 }}
            width={isMobile ? 40 : 60}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#000"
            strokeWidth={2}
            dot={!isMobile}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}