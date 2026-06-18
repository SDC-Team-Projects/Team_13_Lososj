import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, test, expect } from "vitest";

import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { logoutUser } from "../../api/auth";

vi.mock("../../api/auth", () => ({
  logoutUser: vi.fn(() => Promise.resolve()),
}));

describe("Sidebar logout", () => {
  test("user can logout successfully", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const mockAuth = {
      user: {
        id: 1,
        role: "USER",
      },
      logout: vi.fn(),
    };

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter>
            <Sidebar />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    // открыть dropdown Settings
    fireEvent.mouseEnter(screen.getByText("Settings"));

    // нажать Log Out в dropdown
    fireEvent.click(await screen.findByText("Log Out"));

    // дождаться открытия модалки
    await screen.findByText("Are you sure you want to leave your account?");

    // кнопок Log Out теперь две:
    // первая в dropdown, вторая в модалке
    const logoutButtons = screen.getAllByText("Log Out");
    fireEvent.click(logoutButtons[1]);

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalledTimes(1);
      expect(mockAuth.logout).toHaveBeenCalledTimes(1);
    });
  });
});