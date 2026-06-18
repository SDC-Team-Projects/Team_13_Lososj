// import { render, screen } from "@testing-library/react"
// import { MemoryRouter } from "react-router-dom"
// import { vi } from "vitest"

// import FavoritesPage from "../../pages/FavoritesPage"

// /* =========================================
//  MOCKS
// ========================================= */

// vi.mock("../../api/collections", () => ({
//   getFavoriteCollections: vi.fn(() =>
//     Promise.resolve([
//       {
//         id: 1,
//         user_id: 1,
//         name: "Books Collection",
//         description: "Rare books",
//         category: "books",
//         image: "books.jpg",
//         items_count: 5,
//         total_value: 100,
//         owner_name: "John",
//       },

//       {
//         id: 2,
//         user_id: 2,
//         name: "Games Collection",
//         description: "Retro games",
//         category: "games",
//         image: "games.jpg",
//         items_count: 3,
//         total_value: 250,
//         owner_name: "Mike",
//       },
//     ])
//   ),
// }))

// vi.mock("../../context/AuthContext", () => ({
//   useAuth: () => ({
//     user: {
//       id: 1,
//     },
//   }),
// }))

// /* =========================================
//  TEST
// ========================================= */

// test("favorites page renders favorite collections", async () => {
//   render(
//     <MemoryRouter>
//       <FavoritesPage />
//     </MemoryRouter>
//   )

//   expect(
//     await screen.findByText("Favorite collections")
//   ).toBeInTheDocument()

//   expect(
//     await screen.findByText("Books Collection")
//   ).toBeInTheDocument()

//   expect(
//     await screen.findByText("Games Collection")
//   ).toBeInTheDocument()

//   expect(
//     screen.getByText("Your saved collections")
//   ).toBeInTheDocument()
// })




import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import FavoritesPage from "../../pages/FavoritesPage";
import { AuthContext } from "../../context/AuthContext";

// ---------- mocks ----------
vi.mock("../../api/collections", () => ({
  getFavoriteCollections: vi.fn(() => Promise.resolve([])),
  removeFavoriteCollection: vi.fn(),
}));

vi.mock("../../hook/usePageLoader", () => ({
  usePageLoader: () => {},
}));

describe("FavoritesPage", () => {
  test("renders empty favorites state", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: { id: 1, username: "test" },
            token: "token",
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
            setUser: vi.fn(),
            isAuthenticated: true,
            isAdmin: false,
          }}
        >
          <MemoryRouter>
            <FavoritesPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText(/no favorites yet/i)
    ).toBeInTheDocument();
  });
});