import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { test, expect, vi } from "vitest"

import CollectionPage from "../../pages/CollectionPage"

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")

  return {
    ...actual,
    useParams: () => ({
      id: "1",
    }),
  }
})

/* MOCK AUTH */
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
    },
  }),
}))

/* MOCK API */
vi.mock("../../api/collections", () => ({
  getCollectionById: vi.fn(() =>
    Promise.resolve({
      id: 1,
      name: "Books",
      user_id: 1,
    })
  ),

  getFavoriteCollections: vi.fn(() =>
    Promise.resolve([])
  ),

  addFavoriteCollection: vi.fn(),
  removeFavoriteCollection: vi.fn(),
}))

vi.mock("../../api/items", () => ({
  getItemsByCollection: vi.fn(() =>
    Promise.resolve([])
  ),
}))

/* MOCK COMPONENTS */
vi.mock("../../components/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}))

vi.mock("../../components/CollectionCard", () => ({
  default: () => <div>CollectionCard</div>,
}))

vi.mock("../../components/ItemCard", () => ({
  default: () => <div>ItemCard</div>,
}))

test("collection page shows empty state when no items exist", async () => {
  render(
    <MemoryRouter>
      <CollectionPage />
    </MemoryRouter>
  )

  expect(
    await screen.findByText(/no items yet/i)
  ).toBeInTheDocument()

  expect(
    screen.getByRole("button", {
      name: /\+ add item/i,
    })
  ).toBeInTheDocument()
})