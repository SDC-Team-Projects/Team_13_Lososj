import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";

import SearchBar from "../../components/SearchBar";

const initialFilters = {
  search: "",
  category: "",
  minValue: "",
  maxValue: "",
  sort: "",
};

let setFiltersSpy;

function SearchBarWrapper() {
  const [filters, setFilters] = useState(initialFilters);

  function handleSetFilters(update) {
    setFiltersSpy(update);
    setFilters(update);
  }

  return (
    <SearchBar
      filters={filters}
      setFilters={handleSetFilters}
    />
  );
}

function setup() {
  setFiltersSpy = vi.fn();

  render(<SearchBarWrapper />);

  return {
    user: userEvent.setup(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SearchBar", () => {
  test("renders search input", () => {
    setup();

    expect(
      screen.getByPlaceholderText("Search collections...")
    ).toBeInTheDocument();
  });

  test("updates search input", async () => {
    const { user } = setup();

    const input = screen.getByPlaceholderText(
      "Search collections..."
    );

    await user.type(input, "books");

    expect(input).toHaveValue("books");
    expect(setFiltersSpy).toHaveBeenCalled();
  });

  test("opens filters panel", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /filters/i,
      })
    );

    expect(
      screen.getByPlaceholderText("Min value")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Max value")
    ).toBeInTheDocument();
  });

  test("changes category filter", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /filters/i,
      })
    );

    const categorySelect =
      screen.getByDisplayValue("All Categories");

    await user.selectOptions(categorySelect, "books");

    expect(categorySelect).toHaveValue("books");
    expect(setFiltersSpy).toHaveBeenCalled();
  });

  test("changes min and max value filters", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /filters/i,
      })
    );

    const minInput = screen.getByPlaceholderText("Min value");
    const maxInput = screen.getByPlaceholderText("Max value");

    await user.type(minInput, "10");
    await user.type(maxInput, "100");

    expect(minInput).toHaveValue(10);
    expect(maxInput).toHaveValue(100);
    expect(setFiltersSpy).toHaveBeenCalled();
  });

  test("changes sort option", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /filters/i,
      })
    );

    const sortSelect = screen.getByDisplayValue("Newest");

    await user.selectOptions(sortSelect, "price_asc");

    expect(sortSelect).toHaveValue("price_asc");
    expect(setFiltersSpy).toHaveBeenCalled();
  });
});