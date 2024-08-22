import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import './css/YoutubeChapterSplitter.css'
import { useNavigate } from 'react-router-dom';
const YoutubeChapterSplitter = () => {
  const [videoId, setVideoId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trimSuccess, setTrimSuccess] = useState(false);
  const playerRef = useRef(null);
  const navigate = useNavigate();

  const handleVideoIdExtract = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      setVideoId(videoIdMatch[1]);
      fetchVideoDetails(videoIdMatch[1]);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const fetchVideoDetails = async (id) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
      );
      const data = await response.json();
      const description = data.items[0].snippet.description;

      const extractedChapters = extractChaptersFromDescription(description);
      setChapters(extractedChapters);
    } catch (error) {
      console.error('Failed to fetch video details', error);
    }
  };

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

  const seekToTimestamp = (timestamp) => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    const timeInSeconds = minutes * 60 + (seconds || 0);
    playerRef.current.internalPlayer.seekTo(timeInSeconds);
  };

  const handleCheckboxChange = (chapter) => {
    setSelectedChapters((prevSelectedChapters) =>
      prevSelectedChapters.includes(chapter)
        ? prevSelectedChapters.filter((c) => c !== chapter)
        : [...prevSelectedChapters, chapter]
    );
  };

  const handleTrimVideos = async () => {
    setIsLoading(true);  // Start loading indicator

    try {
      await axios.post(process.env.REACT_APP_BE_SIDE_URL + '/youtube/trim-video', {
        videoId,
        chapters: selectedChapters,
      });
      setTrimSuccess(true); // Indicate success
    } catch (error) {
      console.error('Error trimming videos:', error);
      alert('Failed to start trimming', error);
    } finally {
      setIsLoading(false);  // Stop loading indicator
    }
  };

  const handleDownload = async () => {
    for (let i = 0; i < selectedChapters.length; i++) {
      const chapter = selectedChapters[i];
      try {
        const sanitizedTitle = chapter.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
        const filename = `${videoId}_${sanitizedTitle}.mp4`;         
        const downloadURL = `${process.env.REACT_APP_BE_SIDE_URL}/youtube/download-video/${filename}`;
        
        const link = document.createElement("a");
        link.href = downloadURL;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        // Wait for a small delay to ensure the download is triggered properly
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Adjust the delay if needed
      } catch (error) {
        console.error('Error downloading videos:', error);
        alert('Error downloading video:');
      }
    }
   
  };

  const handleShare = () => {
    navigate("/create",{ state: { videos: selectedChapters.map((chapter)=>chapter.title) , videoId: videoId}});
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
            <><button
              onClick={handleTrimVideos}
              className="mt-4 bg-blue-500 text-white p-2 rounded"
              disabled={isLoading} // Disable button while loading
            >
              Trim Selected Chapters
            </button><button
              onClick={handleDownload}
              className="bg-blue-500 text-white p-2 rounded"
              style={{marginLeft:'15px'}}
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
                
              </>

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
