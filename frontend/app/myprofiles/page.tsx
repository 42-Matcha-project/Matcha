import Sidebar  from "../components/Sidebar";

export default function Myprofile() {
    return (
      <div className="flex items-center justify-center h-screen">
        <Sidebar />
        <a href="/myprofile" rel="noopener noreferrer">
          my profile page
        </a>
      </div>
    );
  }
  