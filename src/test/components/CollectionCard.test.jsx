import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import CollectionCard from "../../components/CollectionCard";

import { useAuth } from "../../context/AuthContext";
import { isOwner } from "../../utils/permissions";
import { downloadCollectionPdf } from "../../api/collections";

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

const collection = {
  id: 10,
  name: "Books Collection",
  description: "A collection of fantasy books",
  category: "books",
  image: "collection-image.jpg",
  user_id: 1,
  owner_avatar: "owner-avatar.jpg",
  items_count: 4,
  total_value: 250,
};

function renderCard(props = {}) {
  return renderWithProviders(
    <CollectionCard
      collection={collection}
      isFavorite={false}
      onToggleFavorite={vi.fn()}
      onDelete={vi.fn()}
      {...props}
    />,
    {
      route: "/collections",
    }
  );
}

beforeEach(() => {
  mockNavigate.mockClear();

  useAuth.mockReturnValue({
    user: {
      id: 1,
      role: "USER",
    },
  });

  isOwner.mockReturnValue(true);

  downloadCollectionPdf.mockResolvedValue(
    new Blob(["fake pdf"], {
      type: "application/pdf",
    })
  );
});

describe("CollectionCard", () => {
  test("renders collection information", () => {
    renderCard();

    expect(screen.getByText("Books Collection")).toBeInTheDocument();
    expect(
      screen.getByText(/A collection of fantasy boo/i)
    ).toBeInTheDocument();

    expect(screen.getByText("books")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    expect(
      screen.getByText((content) =>
        content.replace(/\s/g, "") === "$250.00"
      )
    ).toBeInTheDocument();
  });

  test("renders collection image", () => {
    renderCard();

    const image = screen.getByAltText("Books Collection");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "collection-image.jpg");
  });

  test("card link points to collection page", () => {
    const { container } = renderCard();

    const link = container.querySelector(".cardLink");

    expect(link).toHaveAttribute("href", "/collections/10");
  });

  test("calls onToggleFavorite when favorite icon is clicked in square variant", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();

    const { container } = renderCard({
      variant: "square",
      onToggleFavorite,
    });

    const favoriteButton = container.querySelector(".favoriteIcon");

    await user.click(favoriteButton);

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith(10);
  });

  test("shows active favorite icon when collection is favorite", () => {
    const { container } = renderCard({
      variant: "square",
      isFavorite: true,
    });

    const favoriteButton = container.querySelector(".favoriteIcon");

    expect(favoriteButton).toHaveClass("active");
  });

  test("renders horizontal actions for owner", () => {
    const { container } = renderCard({
      variant: "horizontal",
    });

    const actionButtons = container.querySelectorAll(".actions button");

    expect(actionButtons).toHaveLength(5);
  });

  test("does not render edit and delete actions for non-owner", () => {
    isOwner.mockReturnValue(false);

    const { container } = renderCard({
      variant: "horizontal",
    });

    const actionButtons = container.querySelectorAll(".actions button");

    expect(actionButtons).toHaveLength(3);
  });

  test("navigates to edit page when edit button is clicked", async () => {
    const user = userEvent.setup();

    const { container } = renderCard({
      variant: "horizontal",
    });

    const actionButtons = container.querySelectorAll(".actions button");
    const editButton = actionButtons[3];

    await user.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith("/collections/edit/10");
  });

  test("navigates to owner profile when owner avatar is clicked", async () => {
    const user = userEvent.setup();

    const { container } = renderCard();

    const ownerAvatarWrapper = container.querySelector(".ownerAvatarWrapper");

    await user.click(ownerAvatarWrapper);

    expect(mockNavigate).toHaveBeenCalledWith("/users/1");
  });

  test("downloads collection PDF when download button is clicked", async () => {
    const user = userEvent.setup();

    const { container } = renderCard({
      variant: "horizontal",
    });

    const actionButtons = container.querySelectorAll(".actions button");
    const downloadButton = actionButtons[1];

    await user.click(downloadButton);

    await waitFor(() => {
      expect(downloadCollectionPdf).toHaveBeenCalledWith(10);
    });

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });

  test("shares public collection link", async () => {
    const user = userEvent.setup();

    const { container } = renderCard({
      variant: "horizontal",
    });

    const actionButtons = container.querySelectorAll(".actions button");
    const shareButton = actionButtons[2];

    await user.click(shareButton);

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: "Books Collection",
        text: "A collection of fantasy books",
        url: `${window.location.origin}/public/collections/10`,
      });
    });
  });

  test("opens delete confirmation modal when delete button is clicked", async () => {
    const user = userEvent.setup();

    const { container } = renderCard({
      variant: "horizontal",
    });

    const actionButtons = container.querySelectorAll(".actions button");
    const deleteButton = actionButtons[4];

    await user.click(deleteButton);

    expect(
      screen.getByText("Delete collection?")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Are you sure you want to delete "Books Collection"/i
      )
    ).toBeInTheDocument();
  });

  test("does not delete collection when modal is cancelled", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    const { container } = renderCard({
      variant: "horizontal",
      onDelete,
    });

    const actionButtons = container.querySelectorAll(".actions button");
    const deleteButton = actionButtons[4];

    await user.click(deleteButton);

    await user.click(
      screen.getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Delete collection?")
    ).not.toBeInTheDocument();
  });

  test("calls onDelete when delete is confirmed", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    const { container } = renderCard({
      variant: "horizontal",
      onDelete,
    });

    const actionButtons = container.querySelectorAll(".actions button");
    const deleteButton = actionButtons[4];

    await user.click(deleteButton);

    await user.click(
      screen.getByRole("button", {
        name: /^delete$/i,
      })
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(10);

    expect(
      screen.queryByText("Delete collection?")
    ).not.toBeInTheDocument();
  });
});