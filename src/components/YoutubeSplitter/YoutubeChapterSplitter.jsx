import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import './YoutubeChapterSplitter.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';  // Import useSelector to get the user from Redux

const YoutubeChapterSplitter = () => {
  const [videoId, setVideoId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trimSuccess, setTrimSuccess] = useState(false);
  const playerRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.users); // Assuming user information is stored in users slice
  console.log(user);
  const userId = user ? user.user.sub : null; // Extract userId (sub)
  console.log(userId);

  // Extract Video ID from YouTube URL
  const handleVideoIdExtract = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      setVideoId(videoIdMatch[1]);
      fetchVideoDetails(videoIdMatch[1]);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  // Fetch video details from YouTube
  const fetchVideoDetails = async (id) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BE_SIDE_URL}/youtube/video-details/${id}`);
      const description = response.data.items[0].snippet.description;
      const extractedChapters = extractChaptersFromDescription(description);
      setChapters(extractedChapters);
    } catch (error) {
      console.error('Failed to fetch video details', error);
    }
  };

  // Extract chapters from video description
  const extractChaptersFromDescription = (description) => {
    const chapterRegex = /(\d{1,2}:\d{2}(:\d{2})?)\s+(.+)/g;
    let matches;
    const chapters = [];

    while ((matches = chapterRegex.exec(description)) !== null) {
      chapters.push({
        timestamp: matches[1],
        title: matches[3],
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
    }

    return chapters;
  };

  // Seek video to a particular timestamp
  const seekToTimestamp = (timestamp) => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    const timeInSeconds = minutes * 60 + (seconds || 0);
    playerRef.current.internalPlayer.seekTo(timeInSeconds);
  };

  // Handle chapter selection
  const handleCheckboxChange = (chapter) => {
    setSelectedChapters((prevSelectedChapters) =>
      prevSelectedChapters.includes(chapter)
        ? prevSelectedChapters.filter((c) => c !== chapter)
        : [...prevSelectedChapters, chapter]
    );
  };

  // Handle trimming selected chapters
  const handleTrimVideos = async () => {
    setIsLoading(true);

    try {
      // Call API to trimming
      const response = await axios.post(`${import.meta.env.VITE_BE_SIDE_URL}/youtube/trim-video`, {
        videoId,
        user: userId,  // Pass userId to the API,
        chapters: selectedChapters,
      });
      if (response.status === 200) {
        setTrimSuccess(true); 
      }
      
    } catch (error) {
      console.error('Error trimming videos:', error);
      alert('Failed to start trimming', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download after trimming videos
  const handleDownload = async () => {
    for (let i = 0; i < selectedChapters.length; i++) {
      const chapter = selectedChapters[i];
      try {
        const sanitizedTitle = chapter.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
        const filename = `${videoId}_${sanitizedTitle}.mp4`;

        // Fetch the pre-signed download URL
        const response = await axios.get(`${import.meta.env.VITE_BE_SIDE_URL}/youtube/generate-download-url/${videoId}_${sanitizedTitle}`);
        const downloadURL = response.data.downloadUrl;

        const link = document.createElement("a");
        link.href = downloadURL;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Add delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error downloading videos:', error);
        alert('Error downloading video:', error);
      }
    }
  };

  // Handle sharing the trimmed video
  const handleShare = () => {
    navigate("/post/create", { state: { videos: selectedChapters.map((chapter) => chapter.title), videoId: videoId } });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">YouTube Chapter Trimmer</h2>

      <div className="flex gap-4 mb-4">
        <input 
          type="text"
          placeholder="Enter YouTube URL"
          onChange={(e) => handleVideoIdExtract(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <button
                  href="/create"
                  onClick={handleShare}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Share on Forum
                </button>
      {videoId && (
        <>
          <YouTube videoId={videoId} ref={playerRef} />

          <ul className="mt-4">
            {chapters.map((chapter, index) => (
              <li
                key={index}
                className="mt-2 cursor-pointer flex items-center"
              >
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(chapter)}
                  className="mr-2"
                  disabled={isLoading} // Disable checkbox while loading
                />
                <img
                  src={chapter.thumbnailUrl}
                  alt={`Thumbnail for ${chapter.title}`}
                  className="w-16 h-9 object-cover mr-4"
                  onClick={() => seekToTimestamp(chapter.timestamp)}
                />
                <div>
                  <span className="font-semibold">{chapter.timestamp}</span> -{' '}
                  <span>{chapter.title}</span>
                </div>
              </li>
            ))}
          </ul>

          {selectedChapters.length > 0 && (
            <button
              onClick={handleTrimVideos}
              className="mt-4 bg-blue-500 text-white p-2 rounded"
              disabled={isLoading} // Disable button while loading
            >
              Trim Selected Chapters
            </button>
          )}

          {isLoading && (
            <div className="mt-4 text-center">
              <p>Trimming in progress... Please wait</p>
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
            </div>
          )}

          {trimSuccess && !isLoading && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
              <p>Trimming successful! What would you like to do next?</p>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={handleDownload}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Download
                </button>
                <button
                  href="/create"
                  onClick={handleShare}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Share on Forum
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default YoutubeChapterSplitter;
