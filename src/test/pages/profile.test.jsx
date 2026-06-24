import { renderWithProviders } from "../utils/renderWithProviders";
import { screen } from "@testing-library/react";
import ProfilePage from "../../pages/ProfilePage";
import { vi } from "vitest";

//mock API
vi.mock("../../api/collections", () => ({
  getUserAnalytics: vi.fn().mockResolvedValue({
    items_count: 5,
    collections_count: 3,
    total_value: 1000,
  }),
}));

describe("ProfilePage", () => {
  it("profile page renders user info and analytics", async () => {
    renderWithProviders(<ProfilePage />, {
      user: {
        id: 1,
        name: "Test User",
        email: "test@test.com",
      },
    });

    // проверяем что профиль отрендерился
    expect(await screen.findByText("Items")).toBeTruthy();
    expect(await screen.findByText("Collections")).toBeTruthy();
    expect(await screen.findByText("Total value")).toBeTruthy();

    // можно дополнительно проверить числа
    expect(await screen.findByText("5")).toBeTruthy();
    expect(await screen.findByText("3")).toBeTruthy();
    expect(await screen.findByText("1000")).toBeTruthy();
  });
});