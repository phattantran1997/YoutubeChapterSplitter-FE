import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Blog from "./Blog";
import BlogFooter from "./BlogFooter";
import { generateBlogs } from "../reducers/blogReducer";

const BlogList = () => {
  const blogs = useSelector((state) => state.blogs);
  const dispatch = useDispatch();
  const blogs1 = [...blogs];

  // Function to call the API to generate 1000 blogs
  const handleGenerateBlogs = async () => {
    try {
      await dispatch(generateBlogs());
      alert("1000 blogs generated successfully!");
    } catch (error) {
      console.error("Error generating blogs:", error);
      alert("Failed to generate blogs.");
    }
  };

  return (
    <div>
      <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between px-4 mx-auto max-w-6xl">
          <article className="mx-auto w-full max-w-6xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
            <header className="mb-4 lg:mb-6 not-format">
              <h1 className="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">
                Posts
              </h1>
              <div className="flex items-center mb-6 not-italic">
                {/* Button to generate 1000 blogs */}
                <button
                  onClick={handleGenerateBlogs}
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                >
                  Generate 1000 Blogs
                </button>
              </div>
            </header>
            {blogs1.length > 0 ? (
              blogs1
                .sort((a, b) => (a.likes > b.likes ? -1 : 1))
                .map((blog) => <Blog key={blog.id} blog={blog} />)
            ) : (
              <article className="p-6 text-base bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
                <footer className="flex justify-between items-center"></footer>
                <p className="text-gray-500 dark:text-gray-400">
                  No posts yet... Create one!
                </p>
              </article>
            )}
          </article>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
};

export default BlogList;
