import Sidebar from "../components/Sidebar";

export default function Notification() {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-screen">
        <Sidebar />
        <a href="/notification" rel="noopener noreferrer">
          notification page
        </a>
      </div>
    );
  }
  