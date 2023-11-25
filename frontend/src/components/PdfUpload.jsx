import React, { useState, useEffect } from "react";
import axios from "axios";

const PdfUpload = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPdfTextId, setSelectedPdfTextId] = useState(null);
  const [summary, setSummary] = useState('');

  const fetchPdfTexts = async () => {
    try {
      const res = await axios.get("/pdf_texts");
      setPdfTexts(res.data);
    } catch (error) {
      console.error("Failed to fetch PDF texts:", error);
    }
  };

  const uploadPdf = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsUploading(true);

    try {
      await axios.post("/upload_pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchPdfTexts(); // Re-fetch the list of PDFs after a successful upload
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    } finally {
      setIsUploading(false);
      setSelectedFile(null); // Clear the selected file after upload
    }
  };

  const deletePdfText = async (id) => {
    try {
      await axios.delete(`/delete_pdf_text/${id}`);
      await fetchPdfTexts();
    } catch (error) {
      console.error("Failed to delete PDF text:", error);
    }
  };

  const summarizePdfText = async (pdfTextId) => {
    setSelectedPdfTextId(pdfTextId);
    try {
      const response = await axios.post('/summarize_pdf', { pdf_text_id: pdfTextId });
      setSummary(response.data.summary); // Store the summary in state
    } catch (error) {
      console.error('Failed to summarize PDF text:', error);
      setSummary(''); // Clear previous summary on error
    }
  };

  useEffect(() => {
    fetchPdfTexts();
  }, []);

  return (
    <div className="p-10 m-auto text-black">
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button
        onClick={uploadPdf}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload PDF"}
      </button>

      {pdfTexts.length > 0 && (
        <div>
          <ul>
            {pdfTexts.map((text) => (
              <li key={text.id}>
                {text.filename}
                <button onClick={() => summarizePdfText(text.id)}>
                  Summarize
                </button>
                <button onClick={() => deletePdfText(text.id)}>
                  Delete
                </button>
                {selectedPdfTextId === text.id && summary && (
                  <div>
                    <p>Summary:</p>
                    <p>{summary}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
