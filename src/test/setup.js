import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/* =========================
   CLEANUP AFTER EACH TEST
   ========================= */
afterEach(() => {
  cleanup();

  vi.clearAllMocks();

  localStorage.clear();
  sessionStorage.clear();

  document.body.innerHTML = "";
});

/* =========================
   RESET BROWSER MOCKS BEFORE EACH TEST
   ========================= */
beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    writable: true,
    value: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  });

  Object.defineProperty(navigator, "share", {
    configurable: true,
    writable: true,
    value: vi.fn(() => Promise.resolve()),
  });

  Object.defineProperty(window.URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "mock-url"),
  });

  Object.defineProperty(window.URL, "revokeObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });

  window.alert = vi.fn();

  if (window.HTMLAnchorElement) {
    window.HTMLAnchorElement.prototype.click = vi.fn();
  }
});

/* =========================
   MOCK API COLLECTIONS
   ========================= */
vi.mock("../api/collections", () => ({
  getCollectionById: vi.fn(() =>
    Promise.resolve({
      id: 1,
      name: "Test Collection",
      description: "Test description",
      category: "books",
      image: "test-image.jpg",
      user_id: 1,
      owner_name: "Test User",
      owner_avatar: "avatar.jpg",
      items_count: 0,
      total_value: 0,
    })
  ),

  getCollections: vi.fn(() => Promise.resolve([])),

  getPublicCollections: vi.fn(() => Promise.resolve([])),

  getFavoriteCollections: vi.fn(() => Promise.resolve([])),

  addFavoriteCollection: vi.fn(() => Promise.resolve({})),

  removeFavoriteCollection: vi.fn(() => Promise.resolve({})),

  createCollection: vi.fn(() =>
    Promise.resolve({
      id: 1,
    })
  ),

  updateCollection: vi.fn(() =>
    Promise.resolve({
      id: 1,
    })
  ),

  deleteCollection: vi.fn(() => Promise.resolve()),

  downloadCollectionPdf: vi.fn(() =>
    Promise.resolve(
      new Blob(["test pdf"], {
        type: "application/pdf",
      })
    )
  ),

  getCostChart: vi.fn(() => Promise.resolve([])),
}));

/* =========================
   MOCK API ITEMS
   ========================= */
vi.mock("../api/items", () => ({
  getItemsByCollection: vi.fn(() => Promise.resolve([])),

  getItemById: vi.fn(() =>
    Promise.resolve({
      id: 1,
      name: "Test Item",
      description: "Test item description",
      condition: "good",
      estimated_value: 100,
      user_id: 1,
      collection_id: 1,
      created_at: new Date().toISOString(),
      image: "item-image.jpg",
      custom_fields: {
        image: "item-image.jpg",
      },
    })
  ),

  createItem: vi.fn(() =>
    Promise.resolve({
      id: 1,
    })
  ),

  updateItem: vi.fn(() =>
    Promise.resolve({
      id: 1,
    })
  ),

  deleteItem: vi.fn(() => Promise.resolve()),
}));

/* =========================
   FIX matchMedia JSDOM
   ========================= */
Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

/* =========================
   FIX scrollTo JSDOM
   ========================= */
window.scrollTo = vi.fn();