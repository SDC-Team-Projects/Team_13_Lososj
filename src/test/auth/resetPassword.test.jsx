import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { test, expect, vi, beforeEach } from "vitest"

import ForgotPassword from "../../components/ForgotPassword"
import ResetPassword from "../../components/ResetPassword"

const mockedNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")

  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({
      token: "fake-reset-token",
    }),
  }
})

global.fetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

/* =========================================
   1. REQUEST PASSWORD RESET
========================================= */

test("user can request password reset", async () => {
  const user = userEvent.setup()

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      token: "fake-reset-token",
    }),
  })

  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  )

  await user.type(
    screen.getByPlaceholderText("email@example.com"),
    "test@mail.com"
  )

  await user.click(
    screen.getByRole("button", {
      name: /reset password/i,
    })
  )

  await waitFor(() => {
    expect(fetch).toHaveBeenCalled()

    expect(mockedNavigate).toHaveBeenCalledWith(
      "/reset-password/fake-reset-token"
    )
  })
})

/* =========================================
   2. USER CAN RESET PASSWORD
========================================= */
test("user can reset password successfully", async () => {
  const user = userEvent.setup()

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      success: true,
    }),
  })

  render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  )

  await user.type(
    screen.getByPlaceholderText("New password"),
    "newpassword123"
  )

  await user.type(
    screen.getByPlaceholderText("Confirm password"),
    "newpassword123"
  )

  await user.click(
    screen.getByRole("button", {
      name: /reset password/i,
    })
  )

  await waitFor(() => {
    expect(fetch).toHaveBeenCalled()
  })

  expect(
    screen.getByText(/password updated successfully/i)
  ).toBeInTheDocument()
}, 10000)