import Sidebar  from "../components/Sidebar";
import Layout from "../components/Layout";

export default function Myprofile() {
    return (
      <Layout>
      <div className="flex items-center justify-center h-screen">
        <Sidebar />
        <a href="/myprofile" rel="noopener noreferrer">
          my profile page
        </a>
      </div>
      </Layout>
    );
  }
  