import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SummaryContext } from '../context/SummaryContext';

const PdfUpload = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { updateSummary } = useContext(SummaryContext);

  // Fetch PDF texts
  const fetchPdfTexts = async () => {
    try {
      const res = await axios.get("/pdf_texts");
      setPdfTexts(res.data);
    } catch (error) {
      console.error("Failed to fetch PDF texts:", error);
    }
  };

  // Upload PDF
  const uploadPdf = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsUploading(true);

    try {
      const response = await axios.post("/upload_pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchPdfTexts();
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  // Delete PDF text
  const deletePdfText = async (id) => {
    try {
      await axios.delete(`/delete_pdf_text/${id}`);
      fetchPdfTexts();
    } catch (error) {
      console.error("Failed to delete PDF text:", error);
    }
  };

  // Handle PDF click for summarization
  const handlePdfClick = async (pdfId) => {
    try {
      const response = await axios.post('/summarize_pdf', { pdf_text_id: pdfId });
      updateSummary(response.data.summary);  // Ensure this matches the response structure
    } catch (error) {
      console.error('Failed to summarize PDF:', error);
      updateSummary('Summarization failed');
    }
  };

  useEffect(() => {
    fetchPdfTexts();
  }, []);

  return (
    <div className="w-64 fixed top-0 left-0 bottom-0 bg-gray-800 p-6 overflow-y-auto">
      <h2 className="text-md font-bold text-white mb-8">Upload RFP Document</h2>
      <div className="flex flex-col items-center">
        <label className="bg-blue-500 w-full text-center items-center cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <span className="mt-2 text-base leading-normal">Select a file</span>
          <input type='file' className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
        </label>
        <button
          className="bg-blue-500 w-full my-2 cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={uploadPdf}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <div className="mt-8">
        {pdfTexts.length > 0 && (
          <ul className="space-y-4">
            {pdfTexts.map((text) => (
              <li key={text.id} className="bg-white text-gray-800 p-4 rounded shadow">
                <div className="flex items-center justify-between">
                  <span
                    className="font-medium cursor-pointer"
                    onClick={() => handlePdfClick(text.id)}
                  >
                    {text.filename}
                  </span>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400 transition duration-300 ease-in-out"
                    onClick={() => deletePdfText(text.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PdfUpload;
