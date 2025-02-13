import Sidebar from "../components/Sidebar";
import Layout from "../components/Layout";

export default function Notification() {
    return (
      <Layout>
      <div className="flex items-center justify-center h-screen">
        <Sidebar />
        <a href="/notification" rel="noopener noreferrer">
          notification page
        </a>
      </div>
      </Layout>
    );
  }
  