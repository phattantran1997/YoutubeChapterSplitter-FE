import React, { useState, useEffect } from "react";
import { createBlog } from "../../reducers/blogReducer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setNotification } from "../../reducers/notificationReducer";
import { TextInput, Label, Textarea, Button } from "flowbite-react";
import BlogFooter from "./BlogFooter";
import axios from "axios";

const NewBlog = () => {
  const dispatch = useDispatch();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videos, setVideos] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useSelector((state) => state.users); // Get the user data from Redux

  const userId = user ? user.user : null; // Extract userId (sub) from user token

  useEffect(() => {
    if (location.state && location.state.videos && userId) {
      const fetchPresignedUrls = async () => {
        try {
          const videoRequests = location.state.videos.map(async (chapterTitle) => {
            const sanitizedTitle = chapterTitle.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
            const filename = `${location.state.videoId}_${sanitizedTitle}`;
            const response = await axios.get(`${import.meta.env.VITE_BE_SIDE_URL}/video/presigned-url/${userId}/${filename}`);
            return {
              url: response.data.presignedUrl,
              filename: filename,
              title: chapterTitle,
            };
          });

          const fetchedVideos = await Promise.all(videoRequests);
          setVideos(fetchedVideos);

          const videosContent = location.state.videos.join("\n");
          const newContent = `Chapters of ${location.state.videoId} will share\n ${videosContent}`;
          setNewContent(newContent);
        } catch (error) {
          console.error('Error fetching presigned URLs:', error);
        }
      };

      fetchPresignedUrls();
    }
  }, [location.state, userId]);

  const handleBlogSubmit = async (event) => {
    event.preventDefault();
  
    try {
      let updatedVideos = [...videos]; // Use the existing videos state
  
      // Create the blog post object
      const blogObject = {
        title: newTitle,
        content: newContent,
        videos: updatedVideos, 
        dateCreated: new Date(),
      };
      // Dispatch action to create the blog
      await dispatch(createBlog(blogObject));
  
      // Reset form fields and notify the user
      setNewContent("");
      setNewTitle("");
      navigate("/home");
  
      dispatch(setNotification({
        message: `Post was successfully added`,
        type: "success",
      }, 2500));
    } catch (error) {
      console.error('Error while adding post:', error);
      dispatch(setNotification({
        message: `Cannot add post`,
        type: "failure",
      }, 2500));
    }
  };

  const handleVideoUpload = (e) => {
    setVideoFile(e.target.files[0]);
  };

  return (
    <>
      <div className="">
        <main className="pt-8 pb-16 lg:pt-16 lg:pb-12 bg-gray-50 min-h-screen"> {/* Changed background to light */}
          <div className="flex justify-between px-4 mx-auto max-w-6xl">
            <article className="mx-auto w-full max-w-6xl format format-sm sm:format-base lg:format-lg format-blue">
              <header className="mb-4 lg:mb-6 not-format">
                <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl">
                  Create a Post
                </h1>
              </header>
              <form onSubmit={handleBlogSubmit} className="flex flex-col gap-4">
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
                    className="bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Render multiple video tags based on videos array */}
                <div>
                  {videos.map((video, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                      <a
                        href={video.url}
                        download={video.filename}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Link on S3: {video.filename}
                      </a>
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
