import React, { useState, useCallback, useEffect } from "react";
import { createBlog } from "../reducers/blogReducer";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setNotification } from "../reducers/notificationReducer";
import { TextInput, Label, Textarea, Button } from "flowbite-react";
import BlogFooter from "./BlogFooter";
import axios from "axios";

const NewBlog = () => {
  const dispatch = useDispatch();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null); // State for the selected video file
  const [videos, setVideos] = useState([]); // State to hold the videos array
  const location = useLocation(); // Access the location object

  useEffect(() => {
    if (location.state && location.state.videos) {
      const videosContent = location.state.videos.join("\n");
      const videos = location.state.videos.map((chapterTitle) => {
        const sanitizedTitle = chapterTitle.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
        const filename = `${location.state.videoId}_${sanitizedTitle}.mp4`;
        return {
          url: `${process.env.REACT_APP_BE_SIDE_URL}/youtube/videos/${filename}`,
          title: chapterTitle,
        };
      });
      console.log(videos);
      setVideos(videos); // Set the array of video objects
      const newContent = `Chapters of ${location.state.videoId} will share\n ${videosContent}`;
      setNewContent(newContent);
    }
  }, [location.state]);

  const navigate = useNavigate();

  const addBlog = async (event) => {
    event.preventDefault();

    if (videoFile ) {
      try {
        const formData = new FormData();
        formData.append("video", videoFile);

        const response = await axios.post(`${process.env.REACT_APP_BE_SIDE_URL}/blogs/upload-video`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const uploadedVideo = {
          url: `${process.env.REACT_APP_BE_SIDE_URL}/youtube/download-video/${response.data.url}`,
          title: response.data.title,
        };

         // Use callback to ensure the videos state is updated before proceeding
      setVideos((prevVideos) => {
        const updatedVideos = [...prevVideos, uploadedVideo];
        createBlogPost(updatedVideos); // Create blog post with updated videos
        return updatedVideos;
      });
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video');
      }
    }
    else {
      createBlogPost(videos);
    }
    
  };
  const createBlogPost = async (videosToUse) => {
    const blogObject = {
      title: newTitle,
      content: newContent,
      videos: videosToUse, // Use the updated videos array
      dateCreated: new Date(),
    };
    addNewBlog(blogObject);
    setNewContent("");
    setNewTitle("");
  };
  const addNewBlog = async (blogObject) => {
    try {
      const notif1 = {
        message: `Post was successfully added`,
        type: "success",
      };
      await dispatch(createBlog(blogObject));
      //navigate("/");

      dispatch(setNotification(notif1, 2500));
    } catch (exception) {
      const notif2 = {
        message: `Cannot add post`,
        type: "failure",
      };
      dispatch(setNotification(notif2, 2500));
    }
  };

  const handleImageUpload = useCallback((e) => {
    const uploadedImages = Array.from(e.target.files);
    setImages([...uploadedImages]);
  }, []);

  const handleVideoUpload = (e) => {
    setVideoFile(e.target.files[0]);
  };

  return (
    <>
      <div className="">
        <main className="pt-8 pb-16 lg:pt-16 lg:pb-12 bg-white dark:bg-gray-900 min-h-screen">
          <div className="flex justify-between px-4 mx-auto max-w-6xl">
            <article className="mx-auto w-full max-w-6xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
              <header className="mb-4 lg:mb-6 not-format">
                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl dark:text-white">
                  Create a Post
                </h1>
              </header>
              <form onSubmit={addBlog} className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="post-title" value="Title of Post" />
                  </div>
                  <TextInput
                    id="post-title"
                    type="text"
                    placeholder="An Amazing Post"
                    required={true}
                    value={newTitle}
                    onChange={({ target }) => setNewTitle(target.value)}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="post-content" value="Content of Post" />
                  </div>
                  <Textarea
                    required={true}
                    value={newContent}
                    placeholder="Text"
                    onChange={({ target }) => setNewContent(target.value)}
                    rows={10}
                  />
                </div>
                {/* Video Upload Section */}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="video-upload" value="Upload Video" />
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:placeholder-gray-400 dark:bg-gray-700"
                  />
                </div>
                {/* Render multiple video tags based on videos array */}
                <div>
                  {videos.map((video, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                      <video width="600" controls>
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                    Submit Post
                  </Button>
                </div>
              </form>
            </article>
          </div>
        </main>
      </div>
      <BlogFooter />
    </>
  );
};

export default NewBlog;
