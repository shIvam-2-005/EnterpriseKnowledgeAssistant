import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
    const API = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState({
    documents: 0,
    chats: 0,
    queries: 0,
    latestDocument: null,
  });

  const token = localStorage.getItem("token");
const loadDashboard = async () => {
  try {
    const res = await fetch(`${API}/api/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success) {
      setStats(data.stats);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  loadDashboard();
}, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">

        <div className="p-6 text-2xl font-bold border-b border-slate-800">
          EKA
        </div>

        <nav className="flex-1 p-4 space-y-3">

          <Link
            to="/dashboard"
            className="block px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            🏠 Dashboard
          </Link>

          <Link
            to="/chat"
            className="block px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            💬 Chat Assistant
          </Link>

          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
            📄 Documents
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
            ⚙ Settings
          </button>

        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg">
            Logout
          </button>
        </div>

      </div>

      {/* Main Content */}

      <div className="flex-1 p-10">

        <h1 className="text-4xl font-bold mb-3">
          Welcome 👋
        </h1>

        <p className="text-slate-400 mb-8">
          Enterprise Knowledge Assistant Dashboard
        </p>

        <div className="grid grid-cols-3 gap-6">

          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              Uploaded Documents
            </h2>

            <p className="text-4xl font-bold text-blue-400">
              {stats.documents}
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              Chats
            </h2>

            <p className="text-4xl font-bold text-green-400">
              {stats.chats}
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              AI Queries
            </h2>

            <p className="text-4xl font-bold text-purple-400">
                {stats.queries}
            </p>
          </div>

        </div>

        <div className="mt-10 bg-slate-900 rounded-xl p-8">

         <h2 className="text-2xl font-bold mb-4">
  Latest Upload
</h2>

{stats.latestDocument ? (
  <>
    <p className="text-xl font-semibold text-blue-400">
      {stats.latestDocument.originalName}
    </p>

    <p className="text-slate-400 mt-2">
      Uploaded on{" "}
      {new Date(stats.latestDocument.createdAt).toLocaleString()}
    </p>

    <Link
      to="/chat"
      className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
    >
      Open Chat
    </Link>
  </>
) : (
  <>
    <p className="text-slate-400 mb-6">
      No documents uploaded yet.
    </p>

    <Link
      to="/chat"
      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg inline-block"
    >
      Upload Document
    </Link>
  </>
)}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;