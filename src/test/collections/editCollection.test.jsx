import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EditCollectionForm from "../../components/EditCollectionForm";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: "1" }),
  };
});

vi.mock("../../api/collections", () => ({
  getCollectionById: vi.fn(() =>
    Promise.resolve({
      id: 1,
      name: "Old name",
      description: "Old description",
      category: "books",
      image: "img.png",
    })
  ),
  updateCollection: vi.fn(() => Promise.resolve()),
}));

test("user can edit collection successfully", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <EditCollectionForm />
    </MemoryRouter>
  );

  // 🔥 ЖДЁМ загрузку useEffect
  await screen.findByDisplayValue("Old name");

  await user.clear(screen.getByPlaceholderText(/collection name/i));
  await user.type(screen.getByPlaceholderText(/collection name/i), "Updated name");

  await user.clear(screen.getByPlaceholderText(/description/i));
  await user.type(screen.getByPlaceholderText(/description/i), "Updated description");

  await user.selectOptions(screen.getByRole("combobox"), "books");

  await user.click(
    screen.getByRole("button", { name: /save changes/i })
  );

  const { updateCollection } = await import("../../api/collections");

  expect(updateCollection).toHaveBeenCalled();
});


// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { test, expect, vi } from "vitest";
// import { MemoryRouter } from "react-router-dom";

// import EditCollectionForm from "../../components/EditCollectionForm";

// /* ❌ УБРАЛИ ЭТО:
// vi.mock("../../api/collections", () => ({
//   updateCollection: vi.fn(() => Promise.resolve({ id: 1 })),
// }));
// */

// vi.mock("react-router-dom", async () => {
//   const actual = await vi.importActual("react-router-dom");
//   return {
//     ...actual,
//     useNavigate: () => vi.fn(),
//     useParams: () => ({ id: "1" }),
//   };
// });

// test("user can edit collection successfully", async () => {
//   const user = userEvent.setup();

//   render(
//     <MemoryRouter>
//       <EditCollectionForm />
//     </MemoryRouter>
//   );

//   await user.type(
//     screen.getByPlaceholderText(/collection name/i),
//     "Updated name"
//   );

//   await user.type(
//     screen.getByPlaceholderText(/description/i),
//     "Updated description"
//   );

//   await user.selectOptions(screen.getByRole("combobox"), "books");

//   const file = new File(["img"], "test.png", {
//     type: "image/png",
//   });

//   const input = document.querySelector('input[type="file"]');
//   await user.upload(input, file);

//   await user.click(
//     screen.getByRole("button", {
//       name: /save|update|edit/i,
//     })
//   );

//   // лучше проверка результата, а не кнопки
//   await waitFor(() => {
//     expect(screen.getByText(/success|updated|saved/i)).toBeInTheDocument();
//   });
// });