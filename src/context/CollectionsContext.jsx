import { createContext, useContext, useState } from "react";

const CollectionsContext = createContext();

export function CollectionsProvider({ children }) {
  const [collections, setCollections] = useState([]);

  const addCollection = (collection) => {
    setCollections((prev) => [...prev, collection]);
  };

  return (
    <CollectionsContext.Provider value={{ collections, addCollection }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  return useContext(CollectionsContext);
}