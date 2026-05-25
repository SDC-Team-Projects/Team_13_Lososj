import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { test, expect, vi } from "vitest";

import MyCollectionsPage from "../../pages/MyCollectionsPage";

/* MOCK API */
vi.mock("../../api/collections", () => ({
  getCollections: vi.fn(() => Promise.resolve([])),
  getFavoriteCollections: vi.fn(() => Promise.resolve([])),
  addFavoriteCollection: vi.fn(),
  removeFavoriteCollection: vi.fn(),
}));

/* MOCK SIDEBAR */
vi.mock("../../components/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

/* MOCK SEARCHBAR */
vi.mock("../../components/SearchBar", () => ({
  default: () => <div>SearchBar</div>,
}));

test("user sees empty state when no collections exist", async () => {
  render(
    <MemoryRouter>
      <MyCollectionsPage />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/no collections yet/i)
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", {
  name: /create new collection/i,
})
  ).toBeInTheDocument();
});