import  Sidebar  from "../components/Sidebar";

export default function Message() {
  return (
    <div className="flex items-center justify-center bg-gray-100 h-screen">
      <Sidebar />
      <a href="/timeline" rel="noopener noreferrer">
        DM page
      </a>
    </div>
  );
}
