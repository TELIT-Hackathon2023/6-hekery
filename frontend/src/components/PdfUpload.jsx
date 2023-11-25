import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SummaryContext } from '../context/SummaryContext';
import LoadingIndicator from './LoadingIndicator'; // Import the LoadingIndicator component

const PdfUpload = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { updateSummary } = useContext(SummaryContext);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true); 
    try {
      const response = await axios.post('/summarize_pdf', { pdf_text_id: pdfId });
      updateSummary(response.data.summary);  // Ensure this matches the response structure
    } catch (error) {
      console.error('Failed to summarize PDF:', error);
      updateSummary('Summarization failed');
    }
    setIsLoading(false); 
  };

  useEffect(() => {
    fetchPdfTexts();
  }, []);

  return (
    <div className="w-64 fixed top-0 left-0 bottom-0 bg-gray-800 p-6 overflow-y-auto">
      {isLoading && <LoadingIndicator />}
      <h2 className="text-md font-bold text-white mb-8">Upload RFP Document</h2>
      <div className="flex flex-col items-center">
        <label className="bg-blue-500 w-full text-center items-center cursor-pointer hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <span className="mt-2 text-base leading-normal">
            {isUploading && selectedFile ? `Uploading: ${selectedFile.name.substring(0, 10)}...` : 'Select a file'}
          </span>
          <input 
            type='file' 
            className="hidden" 
            onChange={(e) => setSelectedFile(e.target.files[0])} 
            disabled={isUploading} // Disable input while uploading
          />
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
              <li key={text.id} className="bg-white text-gray-800 p-4 rounded shadow relative">
                <span
                  className="font-medium cursor-pointer"
                  onClick={() => handlePdfClick(text.id)}
                >
                  {text.filename.substring(0, 8)}...
                </span>
                <button
                  className="absolute top-0 right-0 text-red-500 hover:text-red-600 transition duration-300 ease-in-out"
                  onClick={() => deletePdfText(text.id)}
                  style={{ top: '10px', right: '10px' }}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PdfUpload; 