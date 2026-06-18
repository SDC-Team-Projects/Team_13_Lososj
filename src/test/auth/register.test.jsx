import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { test, expect, vi, beforeEach } from "vitest"
import RegisterForm from "../../components/RegisterForm"

/* MOCK NAVIGATION */
const navigateMock = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")

  return {
    ...actual,
    useNavigate: () => navigateMock,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  }
})

/* MOCK AUTH CONTEXT */
const loginMock = vi.fn()

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}))

/* MOCK TOAST */
vi.mock("react-hot-toast", () => ({
  Toaster: () => null,
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

/* MOCK UI COMPONENTS */
vi.mock("../../components/ui/Input", () => ({
  default: (props) => <input {...props} />,
}))

vi.mock("../../components/ui/Button", () => ({
  default: (props) => <button {...props} />,
}))

vi.mock("../../components/ui/Select", () => ({
  default: (props) => (
    <select
      name={props.name}
      value={props.value}
      onChange={(e) =>
        props.onChange({
          target: {
            name: props.name,
            value: e.target.value,
          },
        })
      }
    >
      <option value="">Select country</option>
      <option value="LT">Lithuania</option>
    </select>
  ),
}))

/* MOCK FETCH */
beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn()
})

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  )
}

/* TEST 1 */
test("renders register form correctly", () => {
  renderForm()

  expect(
    screen.getByRole("heading", { name: /create account/i })
  ).toBeInTheDocument()

  expect(
    screen.getByPlaceholderText(/email@example.com/i)
  ).toBeInTheDocument()

  expect(
    screen.getByRole("button", { name: /create account/i })
  ).toBeInTheDocument()
})

/* TEST 2 */
test("shows error when passwords do not match", async () => {
  renderForm()

  fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), {
    target: { name: "email", value: "test@mail.com" },
  })

  fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], {
    target: { name: "password", value: "123" },
  })

  fireEvent.change(screen.getAllByPlaceholderText(/confirm password/i)[0], {
    target: { name: "confirmPassword", value: "999" },
  })

  fireEvent.click(screen.getByRole("button", { name: /create account/i }))

  await waitFor(() => {
    expect(navigateMock).not.toHaveBeenCalled()
  })
})

/* TEST 3 */
test("successful registration calls API and navigates", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      token: "fake-token",
      user: { id: 1 },
    }),
  })

  renderForm()

  fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), {
    target: { name: "email", value: "test@mail.com" },
  })

  fireEvent.change(screen.getByPlaceholderText(/name surname/i), {
    target: { name: "username", value: "John Doe" },
  })

  fireEvent.change(screen.getByPlaceholderText(/enter city/i), {
    target: { name: "city", value: "Vilnius" },
  })

  fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], {
    target: { name: "password", value: "123456" },
  })

  fireEvent.change(screen.getAllByPlaceholderText(/confirm password/i)[0], {
    target: { name: "confirmPassword", value: "123456" },
  })

  fireEvent.change(screen.getByRole("combobox"), {
    target: { name: "country", value: "LT" },
  })

  fireEvent.click(screen.getByRole("button", { name: /create account/i }))

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled()
    expect(loginMock).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith("/home")
  })
})