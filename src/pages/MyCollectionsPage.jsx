import { useEffect, useState } from "react";
import Button from "../ui/Button";
import styles from "../css/Button.module.css";
import { Link } from "react-router-dom";
import "../css/MyCollectionsPage.css";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import { getCollections } from "../api/collections";


export default function MyCollectionsPage() {

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const addCollection = (newCollection) => {
  setCollections([...collections, newCollection]);
};

const loadCollections = async () => {
  try {
    const data = await getCollections();

    setCollections(data);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadCollections();
}, []);

if (loading) {
  return <h2>Loading collections...</h2>;
}

  return (
    <>
     <div className="layout">
        <Sidebar />
        <div className="content">
    <div className="title">
        <h1>My Collections</h1>
      <p>Here you can manage your collections</p>
       <Link to="/collectionForm">
  <Button type="button">
    + Create New Collection
  </Button>
</Link>
</div>
<div className="search"><SearchBar /></div>
 <div className="itemsGrid">
  {collections.map((item) => (
  <ItemCard key={item.id} item={item} />
))}
</div>
</div>

</div>
    </>
  );
}


