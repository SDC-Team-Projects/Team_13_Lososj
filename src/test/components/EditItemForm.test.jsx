import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import EditItemForm from "../../components/EditItemForm";

import {
  getItemById,
  updateItem,
} from "../../api/items";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({
      id: "20",
    }),
  };
});

const loadedItem = {
  id: 20,
  name: "Old Item",
  description: "Old description",
  notes: "Old notes",
  condition: "good",
  estimated_value: 100,
  image: "old-item-image.jpg",
  collection_id: 5,
};

function setup() {
  const result = renderWithProviders(<EditItemForm />, {
    route: "/items/20/edit",
  });

  return {
    user: userEvent.setup(),
    ...result,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();

  getItemById.mockResolvedValue(loadedItem);

  updateItem.mockResolvedValue({
    id: 20,
  });

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          secure_url: "https://example.com/new-item-image.jpg",
        }),
    })
  );

  console.error = vi.fn();
});

describe("EditItemForm", () => {
  test("renders edit item form", () => {
    setup();

    expect(
      screen.getByText("Edit Item")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Update item information")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Item name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Description...")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Notes...")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("100")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    ).toBeInTheDocument();
  });

  test("loads item data on render", async () => {
    setup();

    await waitFor(() => {
      expect(getItemById).toHaveBeenCalledWith("20");
    });

    expect(
      await screen.findByDisplayValue("Old Item")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Old description")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Old notes")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("100")
    ).toBeInTheDocument();

    const conditionSelect = screen.getByDisplayValue("Good");

    expect(conditionSelect).toBeInTheDocument();
    expect(conditionSelect).toHaveValue("good");

    const preview = screen.getByAltText("preview");

    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute("src", "old-item-image.jpg");
  });

  test("updates name, description, notes and price inputs", async () => {
    const { user } = setup();

    const nameInput = await screen.findByDisplayValue("Old Item");
    const descriptionInput = screen.getByDisplayValue("Old description");
    const notesInput = screen.getByDisplayValue("Old notes");
    const priceInput = screen.getByDisplayValue("100");

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Item");

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    await user.clear(notesInput);
    await user.type(notesInput, "Updated notes");

    await user.clear(priceInput);
    await user.type(priceInput, "250");

    expect(nameInput).toHaveValue("Updated Item");
    expect(descriptionInput).toHaveValue("Updated description");
    expect(notesInput).toHaveValue("Updated notes");
    expect(priceInput).toHaveValue(250);
  });

  test("updates condition select", async () => {
    const { user } = setup();

    const conditionSelect = await screen.findByDisplayValue("Good");

    await user.selectOptions(conditionSelect, "excellent");

    expect(conditionSelect).toHaveValue("excellent");
  });

  test("uploads new image and shows preview", async () => {
    const { user, container } = setup();

    await screen.findByDisplayValue("Old Item");

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "new-item.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.cloudinary.com/v1_1/ddtujezze/image/upload",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
    });

    const preview = await screen.findByAltText("preview");

    expect(preview).toHaveAttribute(
      "src",
      "https://example.com/new-item-image.jpg"
    );
  });

  test("submits updated item data", async () => {
    const { user } = setup();

    const nameInput = await screen.findByDisplayValue("Old Item");
    const descriptionInput = screen.getByDisplayValue("Old description");
    const notesInput = screen.getByDisplayValue("Old notes");
    const conditionSelect = screen.getByDisplayValue("Good");
    const priceInput = screen.getByDisplayValue("100");

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Item");

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    await user.clear(notesInput);
    await user.type(notesInput, "Updated notes");

    await user.selectOptions(conditionSelect, "excellent");

    await user.clear(priceInput);
    await user.type(priceInput, "250");

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await waitFor(() => {
      expect(updateItem).toHaveBeenCalledWith("20", {
        name: "Updated Item",
        description: "Updated description",
        notes: "Updated notes",
        condition: "excellent",
        estimated_value: 250,
        image: "old-item-image.jpg",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/collections/5");
  });

  test("submits updated image after upload", async () => {
    const { user, container } = setup();

    await screen.findByDisplayValue("Old Item");

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "new-item.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await screen.findByAltText("preview");

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await waitFor(() => {
      expect(updateItem).toHaveBeenCalledWith("20", {
        name: "Old Item",
        description: "Old description",
        notes: "Old notes",
        condition: "good",
        estimated_value: 100,
        image: "https://example.com/new-item-image.jpg",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/collections/5");
  });

  test("cancel button navigates back", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("handles loading error without crashing", async () => {
    getItemById.mockRejectedValueOnce(
      new Error("Failed to load item")
    );

    setup();

    expect(
      screen.getByText("Edit Item")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test("handles update error without navigating", async () => {
    updateItem.mockRejectedValueOnce(
      new Error("Failed to update item")
    );

    const { user } = setup();

    await screen.findByDisplayValue("Old Item");

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalledWith("/collections/5");
  });

  test("does not change image when Cloudinary returns no secure_url", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            error: "Upload failed",
          }),
      })
    );

    const { user, container } = setup();

    await screen.findByDisplayValue("Old Item");

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "broken-image.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const preview = screen.getByAltText("preview");

    expect(preview).toHaveAttribute("src", "old-item-image.jpg");
  });
});