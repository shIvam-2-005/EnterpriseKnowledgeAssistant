import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const API = import.meta.env.VITE_API_URL;

function PDFViewer({ fileName }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  // Keep the file object stable so Document doesn't reload every render
  const pdfFile = useMemo(
    () => ({
      url: `${API}/uploads/${fileName}`,
    }),
    [fileName]
  );

  // Reset page only when a different PDF is selected
  useEffect(() => {
    setPageNumber(1);
  }, [fileName]);

  function onLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (!fileName) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a document
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full overflow-auto">
      <Document
        file={pdfFile}
        onLoadSuccess={onLoadSuccess}
        onLoadError={(error) => {
          console.error("PDF Error:", error);
        }}
        loading="Loading PDF..."
      >
        <Page
          key={pageNumber}
          pageNumber={pageNumber}
          width={500}
        />
      </Document>

      <div className="flex items-center gap-4 mt-4">
        <button
          disabled={pageNumber === 1}
          onClick={() =>
            setPageNumber((prev) => Math.max(prev - 1, 1))
          }
          className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {pageNumber} / {numPages}
        </span>

        <button
          disabled={pageNumber === numPages}
          onClick={() =>
            setPageNumber((prev) => Math.min(prev + 1, numPages))
          }
          className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PDFViewer;