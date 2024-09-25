import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VideoTranscoding.css';
const VideoTranscoding = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [transcodingOption, setTranscodingOption] = useState('3840x2160-libx264');
  const [progress, setProgress] = useState(0);
  const [transcodedVideoPath, setTranscodedVideoPath] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(`${import.meta.env.VITE_BE_SIDE_URL}/video/progress`);

    eventSource.onmessage = (event) => {
      const progressData = JSON.parse(event.data);
      if (progressData.done) {
        setProgress(100);
        setUploadStatus('Transcoding completed!');
      } else if (progressData.error) {
        setErrorMessage(progressData.error);
        setUploadStatus('');
      } else {
        setProgress(Math.round(progressData.percent));
        setUploadStatus(`Processing: ${Math.round(progressData.percent)}% done`);
      }
    };

    eventSource.onerror = (event) => {
      console.error('Error with EventSource:', event);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    setUploadStatus('');
    setErrorMessage('');
    setTranscodedVideoPath(null); // Clear the previous transcoded video path
    setProgress(0); // Reset progress bar
  };

  const handleOptionChange = (event) => {
    setTranscodingOption(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a video file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('transcodingOption', transcodingOption);

    try {
      setUploading(true);
      setUploadStatus('Uploading and transcoding video...');

      const response = await axios.post(`${import.meta.env.VITE_BE_SIDE_URL}/video/transcoding`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus('Video uploaded and transcoded successfully!');
      setErrorMessage('');
      setTranscodedVideoPath(response.data.outputFilePath); // Store the transcoded video path
    } catch (error) {
      setUploadStatus('');
      setErrorMessage('Error uploading video: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="video-upload-container">
      <h2 className="title">Upload Your Video</h2>
      <input onChange={handleFileChange} type="file" className="file-input" accept="video/*" />

      <select onChange={handleOptionChange} value={transcodingOption} className="transcoding-option">
        <option value="3840x2160-libx264">4K - 3840x2160 - libx264 (MP4)</option>
        <option value="3840x2160-libvpx">4K - 3840x2160 - libvpx (WebM)</option>
        <option value="1920x1080-libx264">1080p - 1920x1080 - libx264 (MP4)</option>
        <option value="1920x1080-libvpx">1080p - 1920x1080 - libvpx (WebM)</option>
        <option value="1280x720-libx264">720p - 1280x720 - libx264 (MP4)</option>
      </select>

      <button onClick={handleUpload} className="upload-button" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {progress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {uploadStatus && <p className="success-message">{uploadStatus}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {transcodedVideoPath && (
        <div className="transcoded-video-container">
          <h3 className="transcoded-video-title">
            Transcoded Video: <span className="video-path">{transcodedVideoPath}</span>
          </h3>
        </div>
      )}
    </div>
  );
};

export default VideoTranscoding;
