import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PDFViewer from "../components/PDFViewer";

const API = import.meta.env.VITE_API_URL;

function Chat() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const loadChatHistory = async (documentId) => {
    try {
      const res = await fetch(`${API}/api/chat/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        if (data.messages.length === 0) {
          setMessages([
            {
              sender: "assistant",
              text: "👋 Ask me anything about this document.",
            },
          ]);
        } else {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await fetch(`${API}/api/upload`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setDocuments(data.documents);

        if (!selectedDocument && data.documents.length) {
          setSelectedDocument(data.documents[0]);
          loadChatHistory(data.documents[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const uploadPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        await loadDocuments();
        setSelectedDocument(data.document);
        await loadChatHistory(data.document._id);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      const res = await fetch(`${API}/api/upload/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const updated = documents.filter((d) => d._id !== id);
        setDocuments(updated);

        if (selectedDocument?._id === id) {
          if (updated.length) {
            setSelectedDocument(updated[0]);
            loadChatHistory(updated[0]._id);
          } else {
            setSelectedDocument(null);
            setMessages([
              {
                sender: "assistant",
                text: "Upload a document to begin.",
              },
            ]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendQuestion = async () => {
    if (!question.trim()) return;

    if (!selectedDocument) {
      alert("Select a document first.");
      return;
    }

    const q = question;

    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: q,
          documentId: selectedDocument._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: data.message,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Something went wrong.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">

        <div className="p-5 border-b border-slate-800">
          <h1 className="text-2xl font-bold">Enterprise AI</h1>
        </div>

        <div className="p-4">
          <label className="block bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-lg cursor-pointer">
            Upload PDF
            <input
              hidden
              type="file"
              accept=".pdf"
              onChange={uploadPDF}
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => {
                setSelectedDocument(doc);
                loadChatHistory(doc._id);
              }}
              className={`mb-2 p-3 rounded cursor-pointer ${
                selectedDocument?._id === doc._id
                  ? "bg-blue-600"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              <div className="font-medium truncate">
                {doc.originalName}
              </div>

              <button
                className="text-red-400 text-sm mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDocument(doc._id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </aside>

      <main className="flex-1 flex">

        {/* LEFT SIDE */}

        <div className="w-1/2 border-r border-slate-800 flex flex-col">

          <div className="border-b border-slate-800 p-4">
            <h2 className="text-2xl font-bold">
              PDF Preview
            </h2>

            <p className="text-gray-400">
              {selectedDocument
                ? selectedDocument.originalName
                : "No document selected"}
            </p>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <PDFViewer
              fileName={selectedDocument?.fileName}
            />
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="w-1/2 flex flex-col">

          <div className="border-b border-slate-800 p-4">
            <h2 className="text-2xl font-bold">
              Chat
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4"></div>

                    {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.sender === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl px-5 py-3 rounded-xl ${
                  m.sender === "user"
                    ? "bg-blue-600"
                    : "bg-slate-800"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-3">
                        {children}
                      </h1>
                    ),

                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mt-4 mb-2">
                        {children}
                      </h2>
                    ),

                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold mt-3 mb-2">
                        {children}
                      </h3>
                    ),

                    p: ({ children }) => (
                      <p className="leading-7 mb-2">
                        {children}
                      </p>
                    ),

                    ul: ({ children }) => (
                      <ul className="list-disc ml-6 mb-2">
                        {children}
                      </ul>
                    ),

                    ol: ({ children }) => (
                      <ol className="list-decimal ml-6 mb-2">
                        {children}
                      </ol>
                    ),

                    li: ({ children }) => (
                      <li className="mb-1">
                        {children}
                      </li>
                    ),

                    code({ children }) {
                      return (
                        <pre className="bg-black rounded-lg p-3 overflow-x-auto my-2">
                          <code>{children}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <p className="text-gray-400">
              Thinking...
            </p>
          )}

          <div className="border-t border-slate-800 p-5 flex gap-3">
            <input
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && sendQuestion()
              }
              placeholder="Ask about the selected PDF..."
              className="flex-1 bg-slate-800 rounded-lg px-4 py-3 outline-none"
            />

            <button
              onClick={sendQuestion}
              className="bg-blue-600 hover:bg-blue-700 px-8 rounded-lg"
            >
              Send
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Chat;