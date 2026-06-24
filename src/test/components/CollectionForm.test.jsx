import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import CollectionForm from "../../components/CollectionForm";

import { createCollection } from "../../api/collections";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function setup() {
  const result = renderWithProviders(<CollectionForm />, {
    route: "/collections/new",
  });

  return {
    user: userEvent.setup(),
    ...result,
  };
}

beforeEach(() => {
  mockNavigate.mockClear();

  createCollection.mockResolvedValue({
    id: 1,
  });

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          secure_url: "https://example.com/uploaded-image.jpg",
        }),
    })
  );

  console.error = vi.fn();
});

describe("CollectionForm", () => {
  test("renders collection form", () => {
    setup();

    expect(
      screen.getByText("Add New Collection")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Fill in the details below to add a new collection")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("e.g. Books collection")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Collection Name")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Category")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Describe your collection in detail...")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /add collection/i,
      })
    ).toBeInTheDocument();
  });

  test("add collection button is disabled before image upload", () => {
    setup();

    expect(
      screen.getByRole("button", {
        name: /add collection/i,
      })
    ).toBeDisabled();
  });

  test("updates collection name input", async () => {
    const { user } = setup();

    const nameInput = screen.getByPlaceholderText("e.g. Books collection");

    await user.type(nameInput, "My Books");

    expect(nameInput).toHaveValue("My Books");
  });

  test("updates description input", async () => {
    const { user } = setup();

    const descriptionInput = screen.getByPlaceholderText(
      "Describe your collection in detail..."
    );

    await user.type(descriptionInput, "This is my book collection");

    expect(descriptionInput).toHaveValue("This is my book collection");
  });

  test("updates category select", async () => {
    const { user } = setup();

    const categorySelect = screen.getByDisplayValue("Select category");

    await user.selectOptions(categorySelect, "books");

    expect(categorySelect).toHaveValue("books");
  });

  test("uploads image and shows preview", async () => {
    const { user, container } = setup();

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "collection.png", {
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
      "https://example.com/uploaded-image.jpg"
    );

    expect(
      screen.getByRole("button", {
        name: /add collection/i,
      })
    ).not.toBeDisabled();
  });

  test("submits form with correct data after image upload", async () => {
    const { user, container } = setup();

    const nameInput = screen.getByPlaceholderText("e.g. Books collection");
    const categorySelect = screen.getByDisplayValue("Select category");
    const descriptionInput = screen.getByPlaceholderText(
      "Describe your collection in detail..."
    );

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "collection.png", {
      type: "image/png",
    });

    await user.type(nameInput, "My Books");
    await user.selectOptions(categorySelect, "books");
    await user.type(descriptionInput, "This is my collection");

    await user.upload(fileInput, file);

    await screen.findByAltText("preview");

    await user.click(
      screen.getByRole("button", {
        name: /add collection/i,
      })
    );

    await waitFor(() => {
      expect(createCollection).toHaveBeenCalledWith({
        name: "My Books",
        description: "This is my collection",
        category: "books",
        image: "https://example.com/uploaded-image.jpg",
        is_public: true,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/collections");
  });

  test("cancel button navigates to collections page", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/collections");
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

    const file = new File(["image content"], "collection.png", {
      type: "image/png",
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.queryByAltText("preview")).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /add collection/i,
      })
    ).toBeDisabled();
  });
});