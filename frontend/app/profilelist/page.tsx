import Sidebar from "../components/Sidebar";

export default function AllProfile() {
    return (
      <div className="flex items-center justify-center bg-gray-100 h-screen">
        <Sidebar />
        <a href="/profilelist" rel="noopener noreferrer">
          profile list page
        </a>
      </div>
    );
  }
  