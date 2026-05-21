import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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
  const data = getLast4MonthsData();

  return (
    <div className="chartCard">
      <h3 className="title">Cost of collections</h3>

     <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#000"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}