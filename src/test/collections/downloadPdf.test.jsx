import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { test, expect, vi, beforeEach } from "vitest";

import CollectionCard from "../../components/CollectionCard";

/* =========================
   MOCKS
========================= */

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
    },
  }),
}));

vi.mock("../../utils/permissions", () => ({
  isOwner: () => true,
}));

const downloadMock = vi.fn(() =>
  Promise.resolve(new Blob(["pdf"]))
);

vi.mock("../../api/collections", () => ({
  downloadCollectionPdf: (...args) =>
    downloadMock(...args),

  deleteCollection: vi.fn(),
}));

/* =========================
   TEST
========================= */

beforeEach(() => {
  vi.clearAllMocks();

  window.URL.createObjectURL = vi.fn(
    () => "blob:test"
  );

  window.URL.revokeObjectURL = vi.fn();

  HTMLAnchorElement.prototype.click = vi.fn();
});

test("user can download collection as PDF", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <CollectionCard
        variant="horizontal"
        collection={{
          id: 1,
          user_id: 1,
          name: "Pokemon Collection",
          description: "Rare cards",
          image: "https://image.jpg",
          category: "Cards",
          items_count: 5,
          total_value: 500,
          owner_name: "John",
        }}
      />
    </MemoryRouter>
  );

  const buttons = screen.getAllByRole("button");

  const downloadButton = buttons[1];

  await user.click(downloadButton);

  expect(downloadMock).toHaveBeenCalledWith(1);

  expect(
    window.URL.createObjectURL
  ).toHaveBeenCalled();

  expect(
    HTMLAnchorElement.prototype.click
  ).toHaveBeenCalled();

  expect(
    window.URL.revokeObjectURL
  ).toHaveBeenCalled();
});