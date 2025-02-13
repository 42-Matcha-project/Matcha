import Sidebar  from "../components/Sidebar";
import Layout from "../components/Layout";

export default function Message() {
  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
      <Sidebar />
      <a href="/timeline" rel="noopener noreferrer">
        DM page
      </a>
    </div>
    </Layout>
  );
}
