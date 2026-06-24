import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import MainPage from "../../pages/MainPage";
import { AuthContext } from "../../context/AuthContext";

import { getUserAnalytics } from "../../api/collections";
import { apiFetch } from "../../api/apiClient";
import { usePageLoader } from "../../hook/usePageLoader";

vi.mock("../../api/collections", () => ({
  getUserAnalytics: vi.fn(),
}));

vi.mock("../../api/apiClient", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("../../hook/usePageLoader", () => ({
  usePageLoader: vi.fn(),
}));

vi.mock("../../components/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock("../../components/CostChart", () => ({
  default: () => <div data-testid="cost-chart">Chart</div>,
}));

vi.mock("../../components/CollectionCard", () => ({
  default: ({ collection }) => (
    <div data-testid="collection-card">
      {collection.name}
    </div>
  ),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: {
            id: 1,
            email: "test@mail.com",
          },
        }}
      >
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  getUserAnalytics.mockResolvedValue({
    items_count: 5,
    collections_count: 3,
    total_value: 1000,
  });

  apiFetch.mockResolvedValue({
    ok: true,
    json: async () => [
      {
        collection_id: 1,
        collection_name: "Coins",
        collection_image: "coin.jpg",
        category: "Money",
        viewed_at: "2024-01-01",
      },
    ],
  });
});

describe("MainPage", () => {
  test("renders analytics", async () => {
    renderPage();

    expect(await screen.findByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText("Total value")).toBeInTheDocument();

    expect(await screen.findByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  test("renders chart", async () => {
    renderPage();

    expect(await screen.findByTestId("cost-chart")).toBeInTheDocument();
  });

  test("renders recent collections", async () => {
    renderPage();

    expect(
      await screen.findByText("Recently viewed collections")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("collection-card")
    ).toBeInTheDocument();

    expect(screen.getByText("Coins")).toBeInTheDocument();
  });

  test("hides recent collections when empty", async () => {
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderPage();

    expect(
      screen.queryByText("Recently viewed collections")
    ).not.toBeInTheDocument();
  });

  test("calls usePageLoader", async () => {
    renderPage();

    await screen.findByText("Items");

    expect(usePageLoader).toHaveBeenCalled();
  });
});