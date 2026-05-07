import Sidebar from "../components/Sidebar";
import ProfileCard from "../components/ProfileCard";
import InfoCard from "../components/InfoCard";
import "../css/ProfilePage.css";

export default function ProfilePage() {
  return (
    <>
   <div className="layout">
      <Sidebar />
      
      <div className="content">
        <ProfileCard />

        <div className="infoRow">
        <InfoCard title="Items" count={24} />
        <InfoCard title="Collections" count={5} />
        <InfoCard title="Total value" count={"$1200"} />
      </div>
      </div>
    </div>
    </>
  );
}