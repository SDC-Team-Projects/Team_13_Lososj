import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import EditCollectionForm from "../../components/EditCollectionForm";

import {
  getCollectionById,
  updateCollection,
} from "../../api/collections";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({
      id: "10",
    }),
  };
});

const loadedCollection = {
  id: 10,
  name: "Old Collection",
  description: "Old description",
  category: "Books",
  image: "old-image.jpg",
};

function setup() {
  const result = renderWithProviders(<EditCollectionForm />, {
    route: "/collections/edit/10",
  });

  return {
    user: userEvent.setup(),
    ...result,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();

  getCollectionById.mockResolvedValue(loadedCollection);

  updateCollection.mockResolvedValue({
    id: 10,
  });

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          secure_url: "https://example.com/new-image.jpg",
        }),
    })
  );

  console.error = vi.fn();
});

describe("EditCollectionForm", () => {
  test("renders edit collection form", async () => {
    setup();

    expect(
      screen.getByText("Edit Collection")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Update your collection information")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Collection name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Description...")
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

  test("loads collection data on render", async () => {
    setup();

    await waitFor(() => {
      expect(getCollectionById).toHaveBeenCalledWith("10");
    });

    expect(
      await screen.findByDisplayValue("Old Collection")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Old description")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Books")
    ).toBeInTheDocument();

    const preview = screen.getByAltText("preview");

    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute("src", "old-image.jpg");
  });

  test("updates name and description inputs", async () => {
    const { user } = setup();

    const nameInput = await screen.findByDisplayValue("Old Collection");
    const descriptionInput = screen.getByDisplayValue("Old description");

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Collection");

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    expect(nameInput).toHaveValue("Updated Collection");
    expect(descriptionInput).toHaveValue("Updated description");
  });

  test("updates category select", async () => {
    const { user } = setup();

    const categorySelect = await screen.findByDisplayValue("Books");

    await user.selectOptions(categorySelect, "movies");

    expect(categorySelect).toHaveValue("movies");
  });

  test("uploads new image and shows preview", async () => {
    const { user, container } = setup();

    await screen.findByDisplayValue("Old Collection");

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "new-image.png", {
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
      "https://example.com/new-image.jpg"
    );
  });

  test("submits updated collection data", async () => {
    const { user } = setup();

    const nameInput = await screen.findByDisplayValue("Old Collection");
    const descriptionInput = screen.getByDisplayValue("Old description");
    const categorySelect = screen.getByDisplayValue("Books");

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Collection");

    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Updated description");

    await user.selectOptions(categorySelect, "movies");

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await waitFor(() => {
      expect(updateCollection).toHaveBeenCalledWith("10", {
        name: "Updated Collection",
        description: "Updated description",
        category: "movies",
        image: "old-image.jpg",
        is_public: true,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/collections");
  });

  test("submits updated image after upload", async () => {
    const { user, container } = setup();

    await screen.findByDisplayValue("Old Collection");

    const fileInput = container.querySelector('input[type="file"]');

    const file = new File(["image content"], "new-image.png", {
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
      expect(updateCollection).toHaveBeenCalledWith("10", {
        name: "Old Collection",
        description: "Old description",
        category: "Books",
        image: "https://example.com/new-image.jpg",
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

  test("handles loading error without crashing", async () => {
    getCollectionById.mockRejectedValueOnce(
      new Error("Failed to load collection")
    );

    setup();

    expect(
      screen.getByText("Edit Collection")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test("handles update error without navigating", async () => {
    updateCollection.mockRejectedValueOnce(
      new Error("Failed to update collection")
    );

    const { user } = setup();

    await screen.findByDisplayValue("Old Collection");

    await user.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalledWith("/collections");
  });
});