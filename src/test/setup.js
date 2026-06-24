import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// очищает DOM после каждого теста
afterEach(() => {
  cleanup()
})

/* =========================
   MOCK API COLLECTIONS
   ========================= */
vi.mock("../../api/collections", () => ({
  getCollectionById: vi.fn(() => Promise.resolve({})),
  getCostChart: vi.fn(() => Promise.resolve([])),
  getCollections: vi.fn(() => Promise.resolve([])),
  createCollection: vi.fn(() => Promise.resolve({ id: 1 })),
  updateCollection: vi.fn(() => Promise.resolve({ id: 1 })),
  deleteCollection: vi.fn(() => Promise.resolve()),
}))

/* =========================
   FIX matchMedia (jsdom)
   ========================= */
Object.defineProperty(window, "matchMedia", {
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
})