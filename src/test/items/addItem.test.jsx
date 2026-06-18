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
        <Route path="/collections/:id/items/new" element={<ItemForm />} />
        <Route path="/collections/:id" element={<h1>Collection Page</h1>} />
      </Routes>
    </MemoryRouter>
  );

  const nameInput = screen.getByPlaceholderText(/harry potter book/i);
  const select = screen.getByRole("combobox");
  const descInput = screen.getByPlaceholderText(/describe item/i);
  const notesInput = screen.getByPlaceholderText(/additional notes/i);
  const priceInput = screen.getByPlaceholderText("100");

  await user.type(nameInput, "Pokemon Card");
  await user.selectOptions(select, "new");
  await user.type(descInput, "Rare collectible");
  await user.type(notesInput, "Mint condition");
  await user.type(priceInput, "500");

  // file upload (SAFE FIX)
  const file = new File(["image"], "photo.png", {
    type: "image/png",
  });

  const fileInput = screen.getByLabelText(/file|image|upload/i) || 
                    document.querySelector('input[type="file"]');

  await user.upload(fileInput, file);

  // wait upload call
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  const button = await screen.findByRole("button", {
    name: /add item/i,
  });

  await user.click(button);

  await waitFor(() => {
    expect(
      screen.getByText(/collection page/i)
    ).toBeInTheDocument();
  });
});