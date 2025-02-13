import Sidebar from "../components/Sidebar";
import Layout from "../components/Layout";

export default function AllProfile() {
    return (
      <Layout>
      <div className="flex items-center justify-center h-screen">
        <Sidebar />
        <a href="/profilelist" rel="noopener noreferrer">
          profile list page
        </a>
      </div>
      </Layout>
    );
  }
  