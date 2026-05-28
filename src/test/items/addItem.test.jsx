import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { test, expect, vi, beforeEach } from "vitest";

import ItemForm from "../../components/ItemForm";

/* =========================
   MOCK API
========================= */

vi.mock("../../api/items", () => ({
  createItem: vi.fn(() =>
    Promise.resolve({
      id: 1,
    })
  ),
}));

/* =========================
   MOCK UI COMPONENTS
========================= */

vi.mock("../../ui/Button", () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../../ui/Input", () => ({
  default: (props) => <input {...props} />,
}));

vi.mock("../../ui/Select", () => ({
  default: ({ options, ...props }) => (
    <select {...props}>
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

/* =========================
   MOCK FILE UPLOAD + FETCH
========================= */

beforeEach(() => {
  vi.clearAllMocks();

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          secure_url: "https://image.jpg",
        }),
    })
  );
});

/* =========================
   TEST
========================= */

test("user can add item to collection", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={["/collections/1/items/new"]}>
      <Routes>
        <Route
          path="/collections/:id/items/new"
          element={<ItemForm />}
        />
        <Route
          path="/collections/:id"
          element={<h1>Collection Page</h1>}
        />
      </Routes>
    </MemoryRouter>
  );

  // text fields
  await user.type(
    screen.getByPlaceholderText(/harry potter book/i),
    "Pokemon Card"
  );

  await user.selectOptions(screen.getByRole("combobox"), "new");

  await user.type(
    screen.getByPlaceholderText(/describe item/i),
    "Rare collectible"
  );

  await user.type(
    screen.getByPlaceholderText(/additional notes/i),
    "Mint condition"
  );

  await user.type(screen.getByPlaceholderText("100"), "500");

  // file upload (IMPORTANT FIX)
  const file = new File(["image"], "photo.png", {
    type: "image/png",
  });

  const fileInput = document.querySelector('input[type="file"]');

  await user.upload(fileInput, file);

  // wait image state to be set
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });

  const button = screen.getByRole("button", {
    name: /add item/i,
  });

  // IMPORTANT: wait until enabled
  await waitFor(() => {
    expect(button).not.toBeDisabled();
  });

  await user.click(button);

  expect(
    await screen.findByText(/collection page/i)
  ).toBeInTheDocument();
});