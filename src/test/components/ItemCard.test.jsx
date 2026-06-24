import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import ItemCard from "../../components/ItemCard";

import { deleteItem } from "../../api/items";
import { useAuth } from "../../context/AuthContext";
import { isOwner } from "../../utils/permissions";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../utils/permissions", () => ({
  isOwner: vi.fn(),
}));

const item = {
  id: 15,
  name: "Test Item",
  description: "Test item description",
  category: "books",
  price: 120,
  image: "item-image.jpg",
  user_id: 1,
};

function renderCard(props = {}) {
  return renderWithProviders(
    <ItemCard
      item={item}
      {...props}
    />,
    {
      route: "/collections/1",
    }
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();

  useAuth.mockReturnValue({
    user: {
      id: 1,
      role: "USER",
    },
  });

  isOwner.mockReturnValue(true);

  deleteItem.mockResolvedValue({});

  window.confirm = vi.fn(() => true);
  window.alert = vi.fn();
  console.error = vi.fn();
});

describe("ItemCard", () => {
  test("renders grid preview item card", () => {
    renderCard();

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("Test item description")).toBeInTheDocument();
    expect(screen.getByText("books")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();

    const image = screen.getByAltText("Test Item");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "item-image.jpg");
  });

  test("grid preview card is a link to item page", () => {
    const { container } = renderCard();

    const link = container.querySelector(".cardLink");

    expect(link).toHaveAttribute("href", "/items/15");
  });

  test("uses custom_fields image when item image is missing", () => {
    const itemWithCustomImage = {
      ...item,
      image: "",
      custom_fields: {
        image: "custom-image.jpg",
      },
    };

    renderCard({
      item: itemWithCustomImage,
    });

    expect(screen.getByAltText("Test Item")).toHaveAttribute(
      "src",
      "custom-image.jpg"
    );
  });

  test("uses placeholder image when no image exists", () => {
    const itemWithoutImage = {
      ...item,
      image: "",
      custom_fields: {},
    };

    renderCard({
      item: itemWithoutImage,
    });

    expect(screen.getByAltText("Test Item")).toHaveAttribute(
      "src",
      "https://placehold.co/600x400"
    );
  });

  test("renders horizontal preview layout", () => {
    const { container } = renderCard({
      layout: "horizontal",
    });

    expect(container.querySelector(".itemCard")).toHaveClass("horizontal");
    expect(container.querySelector(".horizontalCard")).toBeInTheDocument();
    expect(container.querySelector(".horizontalImage")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /view/i,
      })
    ).toBeInTheDocument();
  });

  test("renders details mode without link", () => {
    const { container } = renderCard({
      mode: "details",
    });

    expect(container.querySelector(".cardLink")).not.toBeInTheDocument();
    expect(container.querySelector(".itemCard")).toHaveClass("details");
  });

  test("does not show price stats in details mode", () => {
    renderCard({
      mode: "details",
    });

    expect(screen.queryByText("$120")).not.toBeInTheDocument();
  });

  test("shows edit and delete buttons for owner in details mode", () => {
    renderCard({
      mode: "details",
    });

    expect(
      screen.getByRole("button", {
        name: /edit/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /delete/i,
      })
    ).toBeInTheDocument();
  });

  test("does not show edit and delete buttons for non-owner", () => {
    isOwner.mockReturnValue(false);

    renderCard({
      mode: "details",
    });

    expect(
      screen.queryByRole("button", {
        name: /edit/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /delete/i,
      })
    ).not.toBeInTheDocument();
  });

  test("navigates to edit page when edit button is clicked", async () => {
    const user = userEvent.setup();

    renderCard({
      mode: "details",
    });

    await user.click(
      screen.getByRole("button", {
        name: /edit/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/items/15/edit");
  });

  test("deletes item when delete is confirmed", async () => {
    const user = userEvent.setup();

    renderCard({
      mode: "details",
    });

    await user.click(
      screen.getByRole("button", {
        name: /delete/i,
      })
    );

    expect(window.confirm).toHaveBeenCalledWith("Delete this item?");

    await waitFor(() => {
      expect(deleteItem).toHaveBeenCalledWith(15);
    });

    expect(window.alert).toHaveBeenCalledWith("Item deleted");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("does not delete item when confirmation is cancelled", async () => {
    window.confirm = vi.fn(() => false);

    const user = userEvent.setup();

    renderCard({
      mode: "details",
    });

    await user.click(
      screen.getByRole("button", {
        name: /delete/i,
      })
    );

    expect(deleteItem).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows error alert when delete fails", async () => {
    deleteItem.mockRejectedValueOnce(
      new Error("Delete failed")
    );

    const user = userEvent.setup();

    renderCard({
      mode: "details",
    });

    await user.click(
      screen.getByRole("button", {
        name: /delete/i,
      })
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(window.alert).toHaveBeenCalledWith("Failed to delete item");
    expect(mockNavigate).not.toHaveBeenCalledWith(-1);
  });

  test("horizontal details mode shows owner actions", () => {
    const { container } = renderCard({
      layout: "horizontal",
      mode: "details",
    });

    expect(container.querySelector(".itemCard")).toHaveClass("horizontal");
    expect(container.querySelector(".itemCard")).toHaveClass("details");

    expect(
      screen.getByRole("button", {
        name: /edit/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /delete/i,
      })
    ).toBeInTheDocument();
  });
});