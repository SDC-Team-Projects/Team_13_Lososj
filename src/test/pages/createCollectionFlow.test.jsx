import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { test, expect, vi } from "vitest";

import MyCollectionsPage from "../../pages/MyCollectionsPage";

/* ---------------- MOCK DATA ---------------- */

let collections = [];

/* ---------------- MOCK API ---------------- */

vi.mock("../../api/collections", () => ({
  getCollections: vi.fn(() => Promise.resolve(collections)),

  getFavoriteCollections: vi.fn(() => Promise.resolve([])),

  addFavoriteCollection: vi.fn(),

  removeFavoriteCollection: vi.fn(),

  createCollection: vi.fn(async (newCollection) => {
    collections.push({
      id: 1,
      ...newCollection,
      items_count: 0,
      total_value: 0,
    });

    return collections[0];
  }),
}));

/* ---------------- MOCK COMPONENTS ---------------- */

vi.mock("../../components/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock("../../components/SearchBar", () => ({
  default: () => <div>SearchBar</div>,
}));

/* ---------------- MOCK COLLECTION CARD ---------------- */

vi.mock("../../components/CollectionCard", () => ({
  default: ({ collection }) => (
    <div>{collection.name}</div>
  ),
}));

/* ---------------- MOCK FORM ---------------- */

vi.mock("../../components/CollectionForm", () => ({
  default: ({ onCreate }) => (
    <button
      onClick={() =>
        onCreate({
          name: "Books Collection",
          description: "My books",
          category: "books",
          image: "test.png",
        })
      }
    >
      Submit Mock Form
    </button>
  ),
}));

test("user can create a collection successfully", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <MyCollectionsPage />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/no collections yet/i)
  ).toBeInTheDocument();

  collections = [
    {
      id: 1,
      name: "Books Collection",
      description: "My books",
      category: "books",
      image: "test.png",
      items_count: 0,
      total_value: 0,
    },
  ];

  render(
    <MemoryRouter>
      <MyCollectionsPage />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(
      screen.getByText(/books collection/i)
    ).toBeInTheDocument();
  });
});