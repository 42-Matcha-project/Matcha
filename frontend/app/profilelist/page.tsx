import Sidebar from "../components/Sidebar";

export default function AllProfile() {
    return (
      <div className="flex items-center justify-center h-screen">
        <Sidebar />
        <a href="/profilelist" rel="noopener noreferrer">
          profile list page
        </a>
      </div>
    );
  }
  