import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import CollectionCard from "../../components/CollectionCard";

// ---------- mocks ----------
vi.mock("../../api/collections", () => ({
  downloadCollectionPdf: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1 },
  }),
}));

vi.mock("../../utils/permissions", () => ({
  isOwner: () => true,
}));

const mockCollection = {
  id: 1,
  name: "Test Collection",
  description: "Test description",
  category: "Art",
  image: "test.jpg",
  items_count: 5,
  total_value: 100,
  user_id: 1,
};

describe("CollectionCard delete", () => {
  test("user can delete collection successfully", async () => {
    const onDelete = vi.fn();

    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <CollectionCard
          collection={mockCollection}
          variant="horizontal"
          onDelete={onDelete}
        />
      </MemoryRouter>
    );

    // находим все кнопки
    const buttons = screen.getAllByRole("button");

    // ищем delete кнопку по иконке trash
    const deleteBtn = buttons.find((btn) =>
      btn.innerHTML.includes("lucide-trash-2")
    );

    expect(deleteBtn).toBeTruthy();

    // кликаем delete
    fireEvent.click(deleteBtn);

    // confirm должен вызваться
    expect(window.confirm).toHaveBeenCalled();

    // если confirm true → вызывается onDelete
    expect(onDelete).toHaveBeenCalledWith(mockCollection.id);
  });
});