import { useState } from "react";
import styles from "../css/SearchBar.module.css";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  return (
    <div className={styles.wrapper}>

      {/* SEARCH (70%) */}
      <input
        type="text"
        placeholder="Search collections..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.search}
      />

      {/* CATEGORY */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={styles.select}
      >
        <option value="all">All</option>
        <option value="art">Art</option>
        <option value="music">Music</option>
        <option value="gaming">Gaming</option>
      </select>

      {/* SORT */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className={styles.select}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Popular</option>
      </select>

    </div>
  );
}