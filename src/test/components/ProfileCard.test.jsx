import { describe, test, expect } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../test-utils";
import ProfileCard from "../../components/ProfileCard";

const user = {
  id: 1,
  username: "John Smith",
  email: "john@example.com",
  role: "USER",
  bio: "Collector of books and movies",
  avatar_url: "avatar.jpg",
  city: "London",
  country: "GB",
  created_at: "2024-01-01T00:00:00.000Z",
};

function setup(props = {}) {
  return renderWithProviders(
    <ProfileCard
      user={user}
      isMe={false}
      {...props}
    />,
    {
      route: "/profile",
    }
  );
}

describe("ProfileCard", () => {
  test("renders no user data message when user is missing", () => {
    setup({
      user: null,
    });

    expect(
      screen.getByText("No user data")
    ).toBeInTheDocument();
  });

  test("renders user profile information", () => {
    setup();

    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();

    expect(
      screen.getByText("Collector of books and movies")
    ).toBeInTheDocument();

    expect(screen.getByText("London, GB")).toBeInTheDocument();

    expect(
      screen.getByText(/Joined on/i)
    ).toBeInTheDocument();
  });

  test("renders avatar image when avatar_url exists", () => {
    setup();

    const avatar = screen.getByAltText("owner");

    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "avatar.jpg");
    expect(avatar).toHaveClass("avatar");
  });

  test("renders fallback user icon when avatar_url is missing", () => {
    const userWithoutAvatar = {
      ...user,
      avatar_url: "",
    };

    const { container } = setup({
      user: userWithoutAvatar,
    });

    expect(screen.queryByAltText("owner")).not.toBeInTheDocument();
    expect(container.querySelector(".avatarWrapper svg")).toBeInTheDocument();
  });

  test("renders member role badge for regular user", () => {
    setup();

    const badge = screen.getByText("Member");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("roleBadge");
    expect(badge).toHaveClass("user");
  });

  test("renders administrator role badge for admin user", () => {
    const adminUser = {
      ...user,
      role: "ADMIN",
    };

    setup({
      user: adminUser,
    });

    const badge = screen.getByText("Administrator");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("roleBadge");
    expect(badge).toHaveClass("admin");
  });

  test("renders edit profile button when profile belongs to current user", () => {
    setup({
      isMe: true,
    });

    const editLink = screen
      .getByRole("link", {
        name: /edit profile/i,
      });

    expect(editLink).toHaveAttribute("href", "/profile/edit");

    expect(
      screen.getByRole("button", {
        name: /edit profile/i,
      })
    ).toBeInTheDocument();
  });

  test("does not render edit profile button for another user", () => {
    setup({
      isMe: false,
    });

    expect(
      screen.queryByRole("link", {
        name: /edit profile/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /edit profile/i,
      })
    ).not.toBeInTheDocument();
  });

  test("shows fallback description when bio is missing", () => {
    const userWithoutBio = {
      ...user,
      bio: "",
    };

    setup({
      user: userWithoutBio,
    });

    expect(
      screen.getByText("No description")
    ).toBeInTheDocument();
  });

  test("shows unknown joined date when created_at is missing", () => {
    const userWithoutDate = {
      ...user,
      created_at: "",
    };

    setup({
      user: userWithoutDate,
    });

    expect(
      screen.getByText(/Joined on Unknown/i)
    ).toBeInTheDocument();
  });

  test("renders location even when city and country are empty", () => {
    const userWithoutLocation = {
      ...user,
      city: "",
      country: "",
    };

    setup({
      user: userWithoutLocation,
    });

    expect(screen.getByText(",")).toBeInTheDocument();
  });
});