

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { test, expect, vi, beforeEach } from "vitest"

import RegisterPage from "../../pages/RegisterPage"
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

beforeEach(() => {
  vi.clearAllMocks()
})

// ✅ 1. SUCCESS TEST
test("full registration flow works correctly", async () => {
  const user = userEvent.setup()

  const mockUser = {
    id: 1,
    email: "test@mail.com",
    username: "John Doe",
    city: "Vilnius",
    country: "LT",
  }

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      token: "fake-token",
      user: mockUser,
    }),
  })

  const mockLogin = vi.fn()

  render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )

  await user.type(screen.getByPlaceholderText("Name Surname"), "John Doe")
  await user.type(screen.getByPlaceholderText("email@example.com"), "test@mail.com")

  await user.selectOptions(screen.getByRole("combobox"), "LT")

  await user.type(screen.getByPlaceholderText("Enter city"), "Vilnius")
  await user.type(screen.getByPlaceholderText("Password"), "123456")
  await user.type(screen.getByPlaceholderText("Confirm Password"), "123456")

  await user.click(screen.getByRole("button", { name: /create account/i }))

  await waitFor(() => {
    expect(fetch).toHaveBeenCalled()
    expect(mockLogin).toHaveBeenCalledWith("fake-token", mockUser)
    expect(mockedNavigate).toHaveBeenCalledWith("/home")
  })
})


// ❌ 2. FAILURE TEST (PASSWORD MISMATCH)
test("register fails when passwords do not match", async () => {
  const user = userEvent.setup()

  const mockLogin = vi.fn()
  fetch.mockClear()
  mockedNavigate.mockClear()

  render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </AuthContext.Provider>
  )

  await user.type(screen.getByPlaceholderText("Name Surname"), "John Doe")
  await user.type(screen.getByPlaceholderText("email@example.com"), "test@mail.com")
  await user.type(screen.getByPlaceholderText("Enter city"), "Vilnius")

  await user.type(screen.getByPlaceholderText("Password"), "123456")
  await user.type(screen.getByPlaceholderText("Confirm Password"), "999999")

  await user.click(screen.getByRole("button", { name: /create account/i }))

  // 🔥 даём React завершить state + submit
  await waitFor(() => {
    expect(fetch).not.toHaveBeenCalled()
    expect(mockLogin).not.toHaveBeenCalled()
    expect(mockedNavigate).not.toHaveBeenCalled()
  })
})



// import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { MemoryRouter } from "react-router-dom";
// import { test, expect, vi, beforeEach } from "vitest";

// import RegisterPage from "../../pages/RegisterPage";
// import { AuthContext } from "../../context/AuthContext";

// const mockedNavigate = vi.fn();

// vi.mock("react-router-dom", async () => {
//   const actual = await vi.importActual("react-router-dom");
//   return {
//     ...actual,
//     useNavigate: () => mockedNavigate,
//   };
// });

// global.fetch = vi.fn();

// beforeEach(() => {
//   vi.clearAllMocks();
// });

// test("full registration flow works correctly", async () => {
//   const user = userEvent.setup();

//   const mockUser = {
//     id: 1,
//     email: "test@mail.com",
//     username: "John Doe",
//     city: "Vilnius",
//     country: "LT",
//   };

//   // стабильный fetch mock
//   fetch.mockImplementation(() =>
//     Promise.resolve({
//       ok: true,
//       json: async () => ({
//         token: "fake-token",
//         user: mockUser,
//       }),
//     })
//   );

//   const mockLogin = vi.fn();

//   render(
//     <AuthContext.Provider value={{ login: mockLogin }}>
//       <MemoryRouter>
//         <RegisterPage />
//       </MemoryRouter>
//     </AuthContext.Provider>
//   );

//   await user.type(screen.getByPlaceholderText("Name Surname"), "John Doe");
//   await user.type(screen.getByPlaceholderText("email@example.com"), "test@mail.com");

//   await user.selectOptions(screen.getByRole("combobox"), "LT");

//   await user.type(screen.getByPlaceholderText("Enter city"), "Vilnius");
//   await user.type(screen.getByPlaceholderText("Password"), "123456");
//   await user.type(screen.getByPlaceholderText("Confirm Password"), "123456");

//   await user.click(screen.getByRole("button", { name: /create account/i }));

//   // даём React завершить async state updates
//   await new Promise((r) => setTimeout(r, 0));

//   expect(fetch).toHaveBeenCalled();
//   expect(mockLogin).toHaveBeenCalledWith("fake-token", mockUser);
//   expect(mockedNavigate).toHaveBeenCalledWith("/home");
// });

// test("register fails when passwords do not match", async () => {
//   const user = userEvent.setup();

//   const mockLogin = vi.fn();
//   fetch.mockClear();
//   mockedNavigate.mockClear();

//   render(
//     <AuthContext.Provider value={{ login: mockLogin }}>
//       <MemoryRouter>
//         <RegisterPage />
//       </MemoryRouter>
//     </AuthContext.Provider>
//   );

//   await user.type(screen.getByPlaceholderText("Name Surname"), "John Doe");
//   await user.type(screen.getByPlaceholderText("email@example.com"), "test@mail.com");
//   await user.type(screen.getByPlaceholderText("Enter city"), "Vilnius");

//   await user.type(screen.getByPlaceholderText("Password"), "123456");
//   await user.type(screen.getByPlaceholderText("Confirm Password"), "999999");

//   await user.click(screen.getByRole("button", { name: /create account/i }));

//   await new Promise((r) => setTimeout(r, 0));

//   expect(fetch).not.toHaveBeenCalled();
//   expect(mockLogin).not.toHaveBeenCalled();
//   expect(mockedNavigate).not.toHaveBeenCalled();
// });