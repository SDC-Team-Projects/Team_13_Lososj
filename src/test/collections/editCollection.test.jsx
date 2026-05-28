import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { test, expect, vi } from "vitest";

import EditCollectionForm from "../../components/EditCollectionForm";

/* =========================
   MOCKS
========================= */

const updateCollectionMock = vi.fn(() =>
  Promise.resolve()
);

vi.mock("../../api/collections", () => ({
  getCollectionById: vi.fn(() =>
    Promise.resolve({
      id: 1,
      name: "Old Collection",
      description: "Old description",
      category: "books",
      image: "https://old-image.jpg",
    })
  ),

  updateCollection: (...args) =>
    updateCollectionMock(...args),
}));

vi.mock("../../ui/Input", () => ({
  default: (props) => <input {...props} />,
}));

vi.mock("../../ui/Button", () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../../ui/Select", () => ({
  default: ({ options, ...props }) => (
    <select {...props}>
      {options.map((o) => (
        <option
          key={o.value}
          value={o.value}
        >
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

/* =========================
   TEST
========================= */

test("user can edit collection successfully", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter
      initialEntries={["/collections/edit/1"]}
    >
      <Routes>
        <Route
          path="/collections/edit/:id"
          element={<EditCollectionForm />}
        />

        <Route
          path="/collections"
          element={<h1>Collections Page</h1>}
        />
      </Routes>
    </MemoryRouter>
  );

  /* current data loaded */
  expect(
    await screen.findByDisplayValue(
      "Old Collection"
    )
  ).toBeInTheDocument();

  /* edit fields */
  const nameInput =
    screen.getByDisplayValue("Old Collection");

  await user.clear(nameInput);

  await user.type(
    nameInput,
    "Updated Collection"
  );

  const descInput =
    screen.getByDisplayValue("Old description");

  await user.clear(descInput);

  await user.type(
    descInput,
    "Updated description"
  );

  await user.selectOptions(
    screen.getByRole("combobox"),
    "games"
  );

  /* submit */
  await user.click(
    screen.getByRole("button", {
      name: /save changes/i,
    })
  );

  /* api called */
  expect(updateCollectionMock).toHaveBeenCalledWith(
    "1",
    {
      name: "Updated Collection",
      description: "Updated description",
      category: "games",
      image: "https://old-image.jpg",
      is_public: true,
    }
  );

  /* redirect happened */
  expect(
    await screen.findByText(/collections page/i)
  ).toBeInTheDocument();
});