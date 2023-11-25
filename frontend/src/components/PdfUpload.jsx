import React, { useState, useEffect } from "react";
import axios from "axios";

const PdfUpload = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTextId, setActiveTextId] = useState(null);
  const [selectedPdfTextId, setSelectedPdfTextId] = useState(null); // [1
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
      fetchPdfTexts();
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
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
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to summarize PDF text:', error);
      setSummary('');
    }
  };
const handleTextClick = (textId) => {
    if (activeTextId === textId) {
      setActiveTextId(null);
    } else {
      setActiveTextId(textId);
    }
  };

  useEffect(() => {
    fetchPdfTexts();
  }, []);

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
      <div className="mt-8 border-1">
        {pdfTexts.length > 0 && (
          <ul className="space-y-4">
            {pdfTexts.map((text) => (
              <li key={text.id} className="bg-white text-gray-800 p-4 rounded shadow">
                <div className="flex items-center justify-between">
                  <span
                    className="font-medium cursor-pointer"
                    onClick={() => handleTextClick(text.id)}
                  >
                    {text.filename.substring(0, 5) + '...'}
                  </span>
                  {activeTextId === text.id && (
                    <div className="flex flex-col w-full space-x-2">
                      <button
                        className="px-4 ml-2 py-2 w-full bg-blue-500 text-white rounded hover:bg-blue-400 transition duration-300 ease-in-out"
                        onClick={() => summarizePdfText(text.id)}
                      >
                        Summarize
                      </button>
                      <button
                        className="px-4  w-full py-2 bg-red-500 text-white rounded hover:bg-red-400 transition duration-300 ease-in-out"
                        onClick={() => deletePdfText(text.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {activeTextId === text.id && summary && (
                  <p className="mt-4 text-gray-600">{summary}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PdfUpload;