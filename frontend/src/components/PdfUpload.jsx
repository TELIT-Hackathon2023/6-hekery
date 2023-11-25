import React, { useState, useEffect } from "react";
import axios from "axios";

const PdfUpload = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    fetchPdfTexts();
  }, []);

  return (
    <div className="p-10 m-auto text-white">
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
                <button onClick={() => deletePdfText(text.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
