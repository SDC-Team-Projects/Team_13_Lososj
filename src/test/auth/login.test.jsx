// import { render, screen } from "@testing-library/react"
// import userEvent from "@testing-library/user-event"
// import { MemoryRouter } from "react-router-dom"
// import { test, expect, vi } from "vitest"

// import LoginPage from "../../pages/LoginPage"
// import { AuthContext } from "../../context/AuthContext"

// // MOCK navigate
// const mockedNavigate = vi.fn()

// vi.mock("react-router-dom", async () => {
//   const actual = await vi.importActual("react-router-dom")

//   return {
//     ...actual,
//     useNavigate: () => mockedNavigate,
//   }
// })

// // MOCK fetch
// global.fetch = vi.fn()

// test("existing user can login successfully", async () => {
//   const user = userEvent

//   const mockUser = {
//     id: 1,
//     email: "test@mail.com",
//     username: "John Doe",
//   }

//   fetch.mockResolvedValueOnce({
//     ok: true,
//     json: async () => ({
//       token: "fake-login-token",
//       user: mockUser,
//     }),
//   })

//   const mockLogin = vi.fn()

//   render(
//     <AuthContext.Provider value={{ login: mockLogin }}>
//       <MemoryRouter>
//         <LoginPage />
//       </MemoryRouter>
//     </AuthContext.Provider>
//   )

//   // EMAIL
//   await user.type(
//     screen.getByPlaceholderText("email@example.com"),
//     "test@mail.com"
//   )

//   // PASSWORD
//   await user.type(
//     screen.getByPlaceholderText("Password"),
//     "123456"
//   )

//   // SUBMIT
//   await user.click(
//     screen.getByRole("button", {
//       name: /sign in/i,
//     })
//   )

//   // FETCH CALLED
//   expect(fetch).toHaveBeenCalled()

//   // API REQUEST CHECK
//   expect(fetch).toHaveBeenCalledWith(
//     "https://team-13-lososj.onrender.com/api/auth/login",
//     expect.objectContaining({
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: "test@mail.com",
//         password: "123456",
//       }),
//     })
//   )

//   // LOGIN CALLED
//   expect(mockLogin).toHaveBeenCalledWith(
//     "fake-login-token",
//     mockUser
//   )

//   // REDIRECT CHECK
//   expect(mockedNavigate).toHaveBeenCalledWith("/home")
// })


import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { test, expect, vi, afterEach, beforeEach } from "vitest"

import LoginPage from "../../pages/LoginPage"
import { AuthContext } from "../../context/AuthContext"

const mockedNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")

  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

global.fetch = vi.fn()

// ✅ IMPORTANT RESET BETWEEN TESTS
beforeEach(() => {
  fetch.mockReset()
  mockedNavigate.mockReset()
})

afterEach(() => {
  cleanup()
})

// =========================
// 1. SUCCESS LOGIN
// =========================
test("existing user can login successfully", async () => {
  const user = userEvent.setup()

  const mockUser = {
    id: 1,
    email: "test@mail.com",
    username: "John Doe",
  }

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      token: "fake-login-token",
      user: mockUser,
    }),
  })

  const mockLogin = vi.fn()

  render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )

  await user.type(screen.getByPlaceholderText("email@example.com"), "test@mail.com")
  await user.type(screen.getByPlaceholderText("Password"), "123456")

  await user.click(screen.getByRole("button", { name: /sign in/i }))

  expect(fetch).toHaveBeenCalledTimes(1)

  expect(mockLogin).toHaveBeenCalledWith(
    "fake-login-token",
    mockUser
  )

  expect(mockedNavigate).toHaveBeenCalledWith("/home")
})

// =========================
// 2. FAIL LOGIN
// =========================
test("login fails with incorrect password", async () => {
  const user = userEvent.setup()

  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({
      error: "Invalid credentials",
    }),
  })

  const mockLogin = vi.fn()

  render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )

  await user.type(screen.getByPlaceholderText("email@example.com"), "test@mail.com")
  await user.type(screen.getByPlaceholderText("Password"), "wrong-password")

  await user.click(screen.getByRole("button", { name: /sign in/i }))

  expect(fetch).toHaveBeenCalledTimes(1)

  expect(mockLogin).not.toHaveBeenCalled()
  expect(mockedNavigate).not.toHaveBeenCalled()
})