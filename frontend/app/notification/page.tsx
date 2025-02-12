import Sidebar from "../components/Sidebar";

export default function Notification() {
    return (
      <div className="flex items-center justify-center h-screen">
        <Sidebar />
        <a href="/notification" rel="noopener noreferrer">
          notification page
        </a>
      </div>
    );
  }
  