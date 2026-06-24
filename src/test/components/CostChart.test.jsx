import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";

import CostChart from "../../components/CostChart";
import { getCostChart } from "../../api/collections";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children, width, height }) => (
    <div
      data-testid="responsive-container"
      data-width={width}
      data-height={height}
    >
      {children}
    </div>
  ),

  LineChart: ({ children, data }) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">
        {JSON.stringify(data)}
      </div>
      {children}
    </div>
  ),

  Line: ({ dataKey, stroke, strokeWidth, dot }) => (
    <div
      data-testid="line"
      data-key={dataKey}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-dot={String(dot)}
    />
  ),

  XAxis: ({ dataKey }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),

  YAxis: ({ width, tick }) => (
    <div
      data-testid="y-axis"
      data-width={width}
      data-font-size={tick?.fontSize}
    />
  ),

  Tooltip: () => <div data-testid="tooltip" />,

  CartesianGrid: ({ strokeDasharray }) => (
    <div
      data-testid="cartesian-grid"
      data-stroke-dasharray={strokeDasharray}
    />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();

  getCostChart.mockResolvedValue([
    {
      date: "2024-01-01",
      value: "100",
    },
    {
      date: "2024-01-02",
      value: "250",
    },
  ]);

  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1024,
  });

  console.error = vi.fn();
});

describe("CostChart", () => {
  test("renders chart title", () => {
    render(<CostChart />);

    expect(
      screen.getByText("Total Collection Value Over Time")
    ).toBeInTheDocument();
  });

  test("calls getCostChart on render", async () => {
    render(<CostChart />);

    await waitFor(() => {
      expect(getCostChart).toHaveBeenCalledTimes(1);
    });
  });

  test("formats and renders chart data", async () => {
    render(<CostChart />);

    await waitFor(() => {
      expect(screen.getByTestId("chart-data")).toHaveTextContent("100");
      expect(screen.getByTestId("chart-data")).toHaveTextContent("250");
    });

    expect(screen.getByTestId("chart-data")).toHaveTextContent("Jan");
  });

  test("renders chart parts", async () => {
    render(<CostChart />);

    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("line")).toBeInTheDocument();
  });

  test("uses desktop chart height by default", () => {
    render(<CostChart />);

    expect(
      screen.getByTestId("responsive-container")
    ).toHaveAttribute("data-height", "260");

    expect(
      screen.getByTestId("y-axis")
    ).toHaveAttribute("data-width", "60");

    expect(
      screen.getByTestId("y-axis")
    ).toHaveAttribute("data-font-size", "12");
  });

  test("uses mobile chart settings when screen width is small", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 400,
    });

    render(<CostChart />);

    fireEvent.resize(window);

    expect(
      screen.getByTestId("responsive-container")
    ).toHaveAttribute("data-height", "200");

    expect(
      screen.getByTestId("y-axis")
    ).toHaveAttribute("data-width", "40");

    expect(
      screen.getByTestId("y-axis")
    ).toHaveAttribute("data-font-size", "10");
  });

  test("renders line with correct settings", () => {
    render(<CostChart />);

    const line = screen.getByTestId("line");

    expect(line).toHaveAttribute("data-key", "value");
    expect(line).toHaveAttribute("data-stroke", "#2563eb");
    expect(line).toHaveAttribute("data-stroke-width", "3");
    expect(line).toHaveAttribute("data-dot", "true");
  });

  test("handles API error without crashing", async () => {
    getCostChart.mockRejectedValueOnce(
      new Error("Chart loading failed")
    );

    render(<CostChart />);

    expect(
      screen.getByText("Total Collection Value Over Time")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});