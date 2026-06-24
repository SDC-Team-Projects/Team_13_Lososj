import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi, beforeEach } from "vitest";
import SearchBar from "../../components/SearchBar";

let setFilters;

const initialFilters = {
  search: "",
  category: "",
  minValue: "",
  maxValue: "",
  sort: "",
};

function setup() {
  setFilters = vi.fn();

  render(
    <SearchBar filters={initialFilters} setFilters={setFilters} />
  );

  return { setFilters };
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("updates search input", async () => {
  const user = userEvent.setup();
  setup();

  const input = screen.getByPlaceholderText("Search collections...");

  await user.type(input, "books");

  expect(setFilters).toHaveBeenCalled();
});

test("opens filters panel", async () => {
  const user = userEvent.setup();
  setup();

  await user.click(screen.getByRole("button", { name: /filters/i }));

  expect(screen.getByPlaceholderText("Min value")).toBeInTheDocument();
});

test("changes category filter", async () => {
  const user = userEvent.setup();
  setup();

  await user.click(screen.getByRole("button", { name: /filters/i }));

  const select = screen.getByDisplayValue("All Categories");

  await user.selectOptions(select, "books");

  expect(setFilters).toHaveBeenCalled();
});

test("changes min and max value filters", async () => {
  const user = userEvent.setup();
  setup();

  await user.click(screen.getByRole("button", { name: /filters/i }));

  const minInput = screen.getByPlaceholderText("Min value");
  const maxInput = screen.getByPlaceholderText("Max value");

  await user.type(minInput, "10");
  await user.type(maxInput, "100");

  expect(setFilters).toHaveBeenCalled();
});

test("changes sort option", async () => {
  const user = userEvent.setup();
  setup();

  await user.click(screen.getByRole("button", { name: /filters/i }));

  const sortSelect = screen.getByDisplayValue("Newest");

  await user.selectOptions(sortSelect, "price_asc");

  expect(setFilters).toHaveBeenCalled();
});