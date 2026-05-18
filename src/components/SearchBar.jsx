
import { useState } from "react";
import styles from "../css/SearchBar.module.css";

const categories = [
  { value: "books", label: "Books" },
  { value: "movies", label: "Movies" },
  { value: "music", label: "Music" },
  { value: "games", label: "Games" },
  { value: "art", label: "Art" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
  { value: "other", label: "Other" },
];

export default function SearchBar({ filters, setFilters }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>

      {/* 🔎 SEARCH + BUTTON */}
      <div className={styles.topRow}>
        <input
          type="text"
          placeholder="Search collections..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              search: e.target.value,
            }))
          }
          className={styles.search}
        />

        <button
          className={styles.filterBtn}
          onClick={() => setOpen((prev) => !prev)}
        >
          ⚙️ Filters
        </button>
      </div>

      {/* 📦 DROPDOWN PANEL */}
      {open && (
        <div className={styles.panel}>

          {/* 🔽 CATEGORY (UPDATED) */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            className={styles.select}
          >
            <option value="">All Categories</option>

            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min value"
            value={filters.minValue}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minValue: e.target.value,
              }))
            }
            className={styles.input}
          />

          <input
            type="number"
            placeholder="Max value"
            value={filters.maxValue}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxValue: e.target.value,
              }))
            }
            className={styles.input}
          />

          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value,
              }))
            }
            className={styles.select}
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

        </div>
      )}

    </div>
  );
}