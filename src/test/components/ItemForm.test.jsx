import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import ItemForm from "../../components/ItemForm";

import { createItem } from "../../api/items";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({
      id: "5",
    }),
  };
});

function setup() {
  const result = renderWithProviders(<ItemForm />, {
    route: "/collections/5/items/new",
  });

  return {
    user: userEvent.setup(),
    ...result,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();

  createItem.mockResolvedValue({
    id: 100,
  });

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          secure_url: "https://example.com/item-image.jpg",
        }),
    })
  );

  console.error = vi.fn();
});

describe("ItemForm", () => {
  test("renders add item form", () => {
    setup();

    expect(
      screen.getByText("Add New Item")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Fill in the details below to add a new item")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("e.g. Harry Potter Book")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Describe item...")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("100")
    ).toBeInTheDocument();

    expect(screen.getByText("$")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /add item/i,
      })
    ).toBeInTheDocument();
  });

  test("add item button is disabled before required fields are filled", () => {
    setup();

    expect(
      screen.getByRole("button", {
        name: /add item/i,
      })
    ).toBeDisabled();
  });

  test("updates name, description, condition and price fields", async () => {
    const { user } = setup();

    const nameInput = screen.getByPlaceholderText(
      "e.g. Harry Potter Book"
    );
    const descriptionInput = screen.getByPlaceholderText(
      "Describe item..."
    );
    const priceInput = screen.getByPlaceholderText("100");
    const conditionSelect = screen.getByRole("combobox");

    await user.type(nameInput, "Harry Potter Book");
    await user.type(descriptionInput, "Fantasy book");
    await user.selectOptions(conditionSelect, "good");
    await user.type(priceInput, "120");

    expect(nameInput).toHaveValue("Harry Potter Book");
    expect(descriptionInput).toHaveValue("Fantasy book");
    expect(conditionSelect).toHaveValue("good");
    expect(priceInput).toHaveValue(120);
  });

  test("uploads image and shows preview", async () => {
    const { user, container } = setup();

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "item.png", {
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

    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute(
      "src",
      "https://example.com/item-image.jpg"
    );
  });

  test("enables submit button when required fields and image are provided", async () => {
    const { user, container } = setup();

    await user.type(
      screen.getByPlaceholderText("e.g. Harry Potter Book"),
      "Harry Potter Book"
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "good"
    );

    await user.type(
      screen.getByPlaceholderText("100"),
      "120"
    );

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "item.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await screen.findByAltText("preview");

    expect(
      screen.getByRole("button", {
        name: /add item/i,
      })
    ).not.toBeDisabled();
  });

  test("submits item with correct data", async () => {
    const { user, container } = setup();

    await user.type(
      screen.getByPlaceholderText("e.g. Harry Potter Book"),
      "Harry Potter Book"
    );

    await user.type(
      screen.getByPlaceholderText("Describe item..."),
      "Fantasy book"
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "good"
    );

    await user.type(
      screen.getByPlaceholderText("100"),
      "120"
    );

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "item.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await screen.findByAltText("preview");

    await user.click(
      screen.getByRole("button", {
        name: /add item/i,
      })
    );

    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith({
        collection_id: "5",
        name: "Harry Potter Book",
        description: "Fantasy book",
        notes: "",
        condition: "good",
        estimated_value: 120,
        image: "https://example.com/item-image.jpg",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/collections/5");
    });
  });

  test("cancel button navigates back to collection page", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/collections/5");
  });

  test("does not set preview when Cloudinary returns no secure_url", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            error: "Upload failed",
          }),
      })
    );

    const { user, container } = setup();

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "broken.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.queryByAltText("preview")).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /add item/i,
      })
    ).toBeDisabled();
  });

  test("handles upload error without crashing", async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Upload failed"))
    );

    const { user, container } = setup();

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "broken.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(screen.queryByAltText("preview")).not.toBeInTheDocument();
  });

  test("handles create item error without navigating", async () => {
    createItem.mockRejectedValueOnce(
      new Error("Failed to create item")
    );

    const { user, container } = setup();

    await user.type(
      screen.getByPlaceholderText("e.g. Harry Potter Book"),
      "Harry Potter Book"
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "good"
    );

    await user.type(
      screen.getByPlaceholderText("100"),
      "120"
    );

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "item.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await screen.findByAltText("preview");

    await user.click(
      screen.getByRole("button", {
        name: /add item/i,
      })
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalledWith("/collections/5");
  });
});