import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { vi } from "vitest"

import CollectionCard from "../../components/CollectionCard"

/* =========================================
 MOCKS
========================================= */

const navigateMock = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
    },
  }),
}))

vi.mock("../../api/collections", () => ({
  deleteCollection: vi.fn(() => Promise.resolve()),
  downloadCollectionPdf: vi.fn(),
}))

/* =========================================
 TEST
========================================= */

test("user can delete collection successfully", async () => {
  const user = userEvent.setup()

  window.confirm = vi.fn(() => true)

  render(
    <MemoryRouter>
      <CollectionCard
        variant="horizontal"
        collection={{
          id: 55,
          user_id: 1,
          name: "Books",
          description: "My books",
          category: "books",
          image: "test.jpg",
          items_count: 0,
          total_value: 0,
          owner_name: "John",
        }}
      />
    </MemoryRouter>
  )

  const buttons = screen.getAllByRole("button")

  const deleteButton = buttons[3]

  await user.click(deleteButton)

  expect(window.confirm).toHaveBeenCalled()

  expect(navigateMock).toHaveBeenCalledWith(
    "/collections"
  )
})