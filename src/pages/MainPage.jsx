import Sidebar from "../components/Sidebar";
import "../css/MainPage.css";
import ProfileCard from "../components/ProfileCard";
import InfoCard from "../components/InfoCard";
import CostChart from "../components/CostChart";



const mockItems = [
  {
    id: 1,
    name: "Ancient Coin",
    description: "Rare Roman coin from 1st century",
    image: "https://images.unsplash.com/photo-1602524815150-9c6b1f8e2c5a",
    purchaseDate: "2025-06-12",
    owner: "Alex",
    price: 120,
    category: "Coins",
  },
  {
    id: 2,
    name: "Vintage Watch",
    description: "Luxury Swiss watch in perfect condition",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    purchaseDate: "2024-11-03",
    owner: "Alex",
    price: 850,
    category: "Watches",
  },
  {
    id: 3,
    name: "Old Book",
    description: "First edition classic literature book",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
    purchaseDate: "2023-02-18",
    owner: "Alex",
    price: 45,
    category: "Books",
  },
  {
    id: 4,
    name: "Painting",
    description: "Oil painting from local artist",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642",
    purchaseDate: "2025-01-20",
    owner: "Alex",
    price: 300,
    category: "Art",
  },
];

export default function MainPage() {
  return (
    <>
   <div className="layout">
         <Sidebar />
          <div className="content">

           <div className="infoRow">
           <InfoCard title="Items" count={24} />
           <InfoCard title="Collections" count={5} />
           <InfoCard title="Total value" count={"$1200"} />
         </div>

         <div className="costChart">
                <CostChart />
            </div>
        </div>
         </div>
    </>
  );
}