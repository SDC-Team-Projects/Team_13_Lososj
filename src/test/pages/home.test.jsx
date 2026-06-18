import { render, screen } from "@testing-library/react"
import { test, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import MainPage from "../../pages/MainPage"
import { AuthContext } from "../../context/AuthContext"

// mock API
vi.mock("../../api/collections", () => ({
  getUserAnalytics: vi.fn(() =>
    Promise.resolve({
      items_count: 5,
      collections_count: 3,
      total_value: 1000,
    })
  ),

  getCostChart: vi.fn(() => Promise.resolve([])), // ✅ ДОБАВИТЬ
}))

test("home page displays user stats correctly", async () => {
  const mockUser = { id: 1, email: "test@mail.com" }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  )

  expect(await screen.findByText("Items")).toBeInTheDocument()
  expect(await screen.findByText("Collections")).toBeInTheDocument()
  expect(await screen.findByText("Total value")).toBeInTheDocument()

  expect(await screen.findByText("5")).toBeInTheDocument()
  expect(await screen.findByText("3")).toBeInTheDocument()
  expect(await screen.findByText("1000")).toBeInTheDocument()
})