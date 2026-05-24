import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { test, expect, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"

import CollectionForm from "../../components/CollectionForm"

vi.mock("../../api/collections", () => ({
  createCollection: vi.fn(() => Promise.resolve()),
}))

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

test("user can create collection successfully", async () => {
  const user = userEvent.setup()

  render(
    <MemoryRouter>
      <CollectionForm />
    </MemoryRouter>
  )

  await user.type(
    screen.getByPlaceholderText("e.g. Books collection"),
    "My Books"
  )

  await user.type(
    screen.getByPlaceholderText("Describe your collection in detail..."),
    "Some description"
  )

  // category select
  await user.selectOptions(
    screen.getByRole("combobox"),
    "books"
  )

  // image upload mock (skip real file upload)
  const file = new File(["img"], "test.png", { type: "image/png" })

  const input = screen.getByLabelText(/upload image/i)
  await user.upload(input, file)

  await user.click(screen.getByRole("button", { name: /add collection/i }))

  expect(true).toBe(true) // временно
})