// import { render, screen } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import MyCollectionsPage from "../../pages/MyCollectionsPage";
// import { AuthContext } from "../../context/AuthContext";

// import { vi } from "vitest";

// // мок API (минимальный)
// vi.mock("../../api/collections", () => ({
//   getCollections: vi.fn(() => Promise.resolve([])),
//   getFavoriteCollections: vi.fn(() => Promise.resolve([])),
//   addFavoriteCollection: vi.fn(),
//   removeFavoriteCollection: vi.fn(),
//   deleteCollection: vi.fn(),
// }));

// vi.mock("../../hook/usePageLoader", () => ({
//   usePageLoader: () => {},
// }));

// describe("create collection flow", () => {
//   test("user can create a collection successfully", async () => {
//     const queryClient = new QueryClient({
//       defaultOptions: {
//         queries: { retry: false },
//       },
//     });

//     const mockAuth = {
//       user: { id: 1, username: "test", role: "USER" },
//       token: "token",
//       loading: false,
//       login: vi.fn(),
//       logout: vi.fn(),
//       setUser: vi.fn(),
//       isAuthenticated: true,
//       isAdmin: false,
//     };

//     render(
//       <QueryClientProvider client={queryClient}>
//         <AuthContext.Provider value={mockAuth}>
//           <MemoryRouter>
//             <MyCollectionsPage />
//           </MemoryRouter>
//         </AuthContext.Provider>
//       </QueryClientProvider>
//     );

//     expect(await screen.findByText(/my collections/i)).toBeInTheDocument();
//   });
// });




import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MyCollectionsPage from "../../pages/MyCollectionsPage";
import { AuthContext } from "../../context/AuthContext";

import { vi } from "vitest";

// ❌ УДАЛЕНО vi.mock("../../api/collections")
// ❌ УДАЛЕНО vi.mock("../../hook/usePageLoader")

vi.mock("../../hook/usePageLoader", () => ({
  usePageLoader: () => {},
}));

describe("create collection flow", () => {
  test("user can create a collection successfully", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const mockAuth = {
      user: { id: 1, username: "test", role: "USER" },
      token: "token",
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      isAuthenticated: true,
      isAdmin: false,
    };

    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter>
            <MyCollectionsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/my collections/i)).toBeInTheDocument();
  });
});