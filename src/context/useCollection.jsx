import { useContext } from "react";
import { CollectionsContext } from "./CollectionsContext";

export function useCollections() {
  return useContext(CollectionsContext);
}