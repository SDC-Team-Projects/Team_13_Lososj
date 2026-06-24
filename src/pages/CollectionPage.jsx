import { useEffect, useState } from "react";

import { useParams, Link, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import CollectionCard from "../components/CollectionCard";
import Button from "../ui/Button";
import "../css/CollectionPage.css";
import "../css/CollectionCard.css";



import {
  getCollectionById,
  deleteCollection,
  getFavoriteCollections,
  addFavoriteCollection,
  removeFavoriteCollection,
} from "../api/collections";

import { getItemsByCollection } from "../api/items";

import { useAuth } from "../context/AuthContext";
import { isOwner } from "../utils/permissions";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { usePageLoader } from "../hook/usePageLoader";

export default function CollectionPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();


  const {
  data: collection,
  isLoading: collectionLoading,
} = useQuery({
  queryKey: ["collection", id],
  queryFn: () => getCollectionById(id),
});


  const {
  data: items = [],
  isLoading: itemsLoading,
} = useQuery({
  queryKey: ["collectionItems", id],
  queryFn: () => getItemsByCollection(id),
});

usePageLoader(collectionLoading || itemsLoading);



  const { data: favorites = [] } = useQuery({
  queryKey: ["favoriteCollections"],
  queryFn: getFavoriteCollections,
});

const favoriteIds = favorites.map((c) => c.id);


  const { user } = useAuth();


  const deleteMutation = useMutation({
  mutationFn: deleteCollection,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["collections"],
    });

    navigate("/collections");
  },
});



const favoriteMutation = useMutation({
  mutationFn: async ({ collectionId, isFav }) => {
    if (isFav) {
      return removeFavoriteCollection(collectionId);
    }

    return addFavoriteCollection(collectionId);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["favoriteCollections"],
    });
  },
});


function toggleFavorite(collectionId) {
  favoriteMutation.mutate({
    collectionId,
    isFav: favoriteIds.includes(collectionId),
  });
}



  const owner =
    user && collection
      ? isOwner(user, collection.user_id)
      : false;

  if (collectionLoading || itemsLoading) {
  return <h2>Loading collection...</h2>;
}

  if (!collection) {
    return <h2>Collection not found</h2>;
  }


  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <h1>{collection.name}</h1>

        <div className="itemsList">

          <CollectionCard
            collection={collection}
            variant="horizontal"
            isFavorite={
              favoriteIds.includes(collection.id)
            }
            onToggleFavorite={toggleFavorite}
            onDelete={deleteMutation.mutate}
          />

        </div>

        {owner && (
          <div className="button">

            <Link
              to={`/collections/${id}/items/new`}
            >
              <Button variant="primary">
                + Add Item
              </Button>
            </Link>

          </div>
        )}

        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >

          {items.length > 0 ? (

            items.map((item) => (

              <div  key={item.id} className="itemsCards">

              <ItemCard
                variant="horizontal"
                item={{
                  ...item,

                  image:
                    item.custom_fields?.image ||
                    "https://placehold.co/600x400",

                  price: item.estimated_value,

                  category: item.condition,
                }}
              />
              </div>

            ))

          ) : (

            <p>No items yet</p>

          )}

        </div>

      </div>
    </div>
  );
}