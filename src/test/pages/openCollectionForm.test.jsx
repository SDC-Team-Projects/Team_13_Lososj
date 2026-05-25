import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

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

test("user can open add collection form", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={["/collections"]}>
      <Routes>
        <Route
          path="/collections"
          element={<MyCollectionsPage />}
        />

        <Route
          path="/collectionForm"
          element={<h1>Collection Form Page</h1>}
        />
      </Routes>
    </MemoryRouter>
  );

  const button = await screen.findByRole("button", {
    name: /create new collection/i,
  });

  await user.click(button);

  expect(
    await screen.findByText(/collection form page/i)
  ).toBeInTheDocument();
});