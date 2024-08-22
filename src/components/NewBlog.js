import React, { useState, useCallback, useEffect } from "react";
import { createBlog } from "../reducers/blogReducer";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setNotification } from "../reducers/notificationReducer";
import { TextInput, Label, Textarea, Button, Progress } from "flowbite-react";
import BlogFooter from "./BlogFooter";
import CreateIcon from '@mui/icons-material/Create';
import GifIcon from '@mui/icons-material/Gif';
import { createGIF } from 'gifshot';

const NewBlog = () => {
  const dispatch = useDispatch();
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [images, setImages] = useState([]);
  const [gifUrl, setGifUrl] = useState(null);
  const [videoUrls, setVideoUrls] = useState([]);
  const [progress, setProgress] = useState(0);
  const location = useLocation(); // Access the location object
  useEffect(() => {
    if (location.state && location.state.videos) {
      console.log(location.state);
      const videosContent = location.state.videos.join("\n");
      const videoUrls = location.state.videos.map((chapterTitle) => {
        const sanitizedTitle = chapterTitle.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
        const filename = `${location.state.videoId}_${sanitizedTitle}`;
        return `http://localhost:3000/api/youtube/videos/${filename}`;
      });
      console.log(videoUrls);
      setVideoUrls(videoUrls); // Set the array of video URLs
      const newContent = `Chapters of ${location.state.videoId} will share\n ${videosContent}`;
      setNewContent(newContent);
    }
  }, [location.state]);

  const navigate = useNavigate();

  const addBlog = (event) => {
    event.preventDefault();
    const blogObject = {
      title: newTitle,
      content: newContent,
      videos: videoUrls,
      dateCreated: new Date(),
    };
    addNewBlog(blogObject);
    setNewContent("");
    setNewTitle("");
    setGifUrl(null);
  };

  const addNewBlog = async (blogObject) => {
    try {
      const notif1 = {
        message: `Post was successfully added`,
        type: "success",
      };
      await dispatch(createBlog(blogObject));
      navigate("/");

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



  const createGifFromImages = useCallback(() => {
    if (images.length === 0) {
      alert("Please upload images first.");
      return;
    }

    const imageUrls = images.map((image) => URL.createObjectURL(image));

    const options = {
      images: imageUrls,
      gifWidth: 500,
      gifHeight: 300,
      numWorkers: 1,
      frameDuration: 1,
      progressCallback: (progress) => {
        setProgress(progress * 100);
      },
    };

    createGIF(options, (obj) => {
      if (!obj.error) {
        setGifUrl(obj.image);
        setProgress(100);
        // setNewContent((prevContent) => `${prevContent}\n<img src="${obj.image}" alt="Generated GIF" style={{ maxWidth: '100px', maxHeight: '100px' }}/>`);
      }
    });
  }, [images]);

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
                {/* Render multiple video tags based on videoUrls */}
                <div>
                  {videoUrls.map((url, index) => (
                    <div key={index} className="mb-4">
                      <video width="600" controls>
                        <source src={url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ))}
                </div>
                {gifUrl && (
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Generated GIF:
                    </h2>
                    <img
                      src={gifUrl}
                      alt="Generated GIF"
                      className="w-full h-auto rounded-lg shadow-md mt-2"
                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                    />
                  </div>
                )}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="image-upload" value="Upload Images" />
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:placeholder-gray-400 dark:bg-gray-700"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(image)}
                        alt={`upload-${index}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Button
                    type="button"
                    onClick={createGifFromImages}
                    color="purple"
                    className="bg-purple-500 text-white hover:bg-purple-600"
                  >
                    <GifIcon className="mr-2" />
                    Create GIF
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <CreateIcon className="mr-2" />
                    Submit Post
                  </Button>
                </div>
              </form>
              {progress > 0 && progress < 100 && (
                <div className="mt-4">
                  <label>Creating GIF... {progress}%</label>
                  <Progress value={progress} />
                </div>
              )}
            </article>
          </div>
        </main>
      </div>

      <BlogFooter />
    </>
  );
};

export default NewBlog;
