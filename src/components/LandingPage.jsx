

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import UniversalGrid from "../components/UniversalGrid";
import CollectionCard from "../components/CollectionCard";

import { getPublicCollections } from "../api/collections";

import styles from "../css/LandingPage.module.css";

export default function LandingPage() {
const navigate = useNavigate();
const { token } = useAuth();

const [collections, setCollections] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
loadCollections();
}, []);

async function loadCollections() {
try {
const data = await getPublicCollections();
setCollections(data.slice(0, 6));
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
}

return ( <div className={styles.page}> <header className={styles.header}> <div className={styles.logo}>
📦 Collection Hub </div>

    <div className={styles.actions}>
      {!token ? (
        <>
          <button
            className={styles.secondaryBtn}
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </>
      ) : (
        <button
          className={styles.primaryBtn}
          onClick={() => navigate("/home")}
        >
          Dashboard
        </button>
      )}
    </div>
  </header>

  <section className={styles.hero}>
    <div className={styles.heroContent}>
      <h1>
        Build, manage and explore collections
      </h1>

      <p>
        Organize your items, track value,
        discover collections from other users
        and manage everything in one place.
      </p>

      <div className={styles.heroButtons}>
        {!token && (
          <>
            <button
              className={styles.bigPrimaryBtn}
              onClick={() =>
                navigate("/register")
              }
            >
            Explore Collections
            </button>
          </>
        )}
      </div>
    </div>
  </section>

  <section className={styles.features}>
    <div className={styles.featureCard}>
      <h3>📊 Analytics</h3>

      <p>
        Track collection value growth and
        monitor activity.
      </p>
    </div>

    <div className={styles.featureCard}>
<h3>📁 Collections</h3>

      <p>
        Create and organize unlimited
        collections.
      </p>
    </div>

    <div className={styles.featureCard}>
      <h3>⭐ Favorites</h3>

      <p>
        Save interesting collections and
        access them anytime.
      </p>
    </div>
  </section>

  <section className={styles.previewSection}>
    <div className={styles.sectionHeader}>
      <h2>Featured Collections</h2>

      <button
        className={styles.viewAllBtn}
        onClick={() => navigate("/overview")}
      >
        View All →
      </button>
    </div>

    {loading ? (
      <h3>Loading collections...</h3>
    ) : (
      <UniversalGrid columns={3}>
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            showActions={false}
            disableAnalytics={true}
          />
        ))}
      </UniversalGrid>
    )}
  </section>
</div>
);
}
