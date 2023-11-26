import React, { useState, useEffect,useCallback, useContext } from 'react';
import axios from 'axios';
import { SummaryContext } from '../context/SummaryContext';
import LoadingIndicator from './LoadingIndicator'; // Import the LoadingIndicator component
import CustomLoadingIndicator from './LoadingIndicator';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { ScoreContext } from '../context/ScoreContext';
const PdfUpload = () => {
  const [pdfTexts, setPdfTexts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { updateSummary } = useContext(SummaryContext);
  const [loadingState, setLoadingState] = useState('');
  const { updateScores } = useContext(ScoreContext); // Use ScoreContext


  const onDrop = useCallback(acceptedFiles => {
    setSelectedFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsUploading(true);

    try {
      const response = await axios.post("/upload_pdf", formData);
      setIsUploading(false);
      setSelectedFile(null);
      fetchPdfTexts();
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
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
  const scrollableListStyle = {
    maxHeight: '500px', // Adjust height as needed
    overflowY: 'auto'
};
  // Handle PDF click for summarization
  const handlePdfClick = async (pdfId) => {
    setLoadingState('analyzing');
    try {
      // Check if the PDF has already been summarized
      const summaryResponse = await axios.get(`/pdf_summary/${pdfId}`);
      if (summaryResponse.data.already_summarized) {
        // If already summarized, use existing summary
        updateSummary(summaryResponse.data.summary);
      } else {
        // If not, proceed with new summarization
        const summarizeResponse = await axios.post('/summarize_pdf', { pdf_text_id: pdfId });
        updateSummary(summarizeResponse.data.summary);
      }

      // Fetch and update scores regardless of whether the summary was pre-existing or newly created
      const scoreResponse = await axios.get(`/get_input_data/${pdfId}`);
      if (scoreResponse.data) {
        updateScores(scoreResponse.data); // Assuming updateScores is a method in your context/state to update the scores
      }

      // Update the loading state for UI feedback
      setLoadingState('scoring');
      setTimeout(() => {
        setLoadingState('dashboard');
        setTimeout(() => {
          setLoadingState(''); // Reset loading state after simulating dashboard creation
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Failed to handle PDF:', error);
      setLoadingState('');
      updateSummary('Error occurred');
    }
};

  

  useEffect(() => {
    fetchPdfTexts();
  }, []);

  return (
    <div className="w-1/4 fixed top-0 left-0 bottom-0 z-40 bg-white text-white p-6 overflow-y-auto">
       {loadingState && <CustomLoadingIndicator className='z-40' loadingState={loadingState} />}

      <h2 className="text-2xl font-bold w-max m-auto text-black p-4 text-center mb-4">Upload RFP Document</h2>
      <div className="flex flex-col items-center">
      <div {...getRootProps()} className="dropzone text-[#e20274]  font-bold border-dashed border-2 border-[#e20274] py-8 px-4 rounded text-center cursor-pointer ">
        <input {...getInputProps()} disabled={isUploading} /> 
        {selectedFile ? <p>{selectedFile.name.substring(0, 20) + (selectedFile.name.length > 20 ? '...' : '')}</p> : <p>Drag 'n' drop some files here, or click to select files</p>}   </div>
     
      <button
        className="bg-[#e20274] w-full my-2 cursor-pointer hover:bg-[#b43777] text-white font-bold py-2 px-4 rounded"
        onClick={uploadPdf}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      </div>
      <div className="mt-4" style={scrollableListStyle}>
        {pdfTexts.length > 0 && (
          <ul className="space-y-4">
            {pdfTexts.map((text) => (
              <li key={text.id} className=" border-2 border-dashed border-[#b43777] text-black p-4 rounded shadow relative">
                <span
                  className="font-medium cursor-pointer"
                  onClick={() => handlePdfClick(text.id)}
                >
                  {text.filename.substring(0, 15)}...
                </span>
                <button
                  className="absolute top-0 right-0 m-[6px] text-red-500 hover:text-red-600 transition duration-300 ease-in-out"
                  onClick={() => deletePdfText(text.id)}
                  style={{ top: '10px', right: '10px' }}
                >
                  <FontAwesomeIcon icon={faCircleXmark} />
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