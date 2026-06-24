

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

import { getCostChart } from "../api/collections";

import "../css/CostChart.css";

export default function CostChart() {
  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth <= 480);

    check();

    window.addEventListener("resize", check);

    return () =>
      window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const chartData = await getCostChart();

        const formatted = chartData.map((item) => ({
          date: new Date(item.date).toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "short",
            }
          ),
          value: Number(item.value),
        }));

        setData(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    loadChart();
  }, []);

  return (
    <div className="chartCard">
      <h3 className="title">
        Total Collection Value Over Time
      </h3>

      <ResponsiveContainer
        width="100%"
        height={isMobile ? 200 : 260}
      >
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-GB", {
            day: "numeric",
      month: "short",
    })
  }
/>

          <YAxis
            tick={{
              fontSize: isMobile ? 10 : 12,
            }}
            width={isMobile ? 40 : 60}
          />

          <Tooltip
  labelFormatter={(value) =>
    new Date(value).toLocaleDateString()
  }
/>

          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={3}
            dot={!isMobile}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


