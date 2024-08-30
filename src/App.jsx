import { useState, useEffect } from "react";
import Notif from "./components/Notif";
import SignIn from "./components/LoginForm";
import { useSelector, useDispatch } from "react-redux";
import { initializeBlogs } from "./reducers/blogReducer";
import { initializeUsers, setUser } from "./reducers/userReducer";
import BlogList from "./components/BlogList";
import YoutubeChapterSplitter from "./components/YoutubeSpliiter/YoutubeChapterSplitter";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useMatch,
} from "react-router-dom";
import NewBlog from "./components/NewBlog";
import NavigationBar from "./components/Navigation/NavigationBar";
import { Navigate } from "react-router-dom";
import { initializeAllUsers } from "./reducers/allUsersReducer";
import BlogView from "./components/BlogView";
import UserView from "./components/UserView";
import VideoTranscoding from "./components/VideoTranscode/VideoTranscoding";
import RegisterUser from "./components/RegisterUser";
import ErrorPage from "./components/ErrorPage";
import BlogEdit from "./components/BlogEdit";

const App = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.users);
  const blogs = useSelector((state) => state.blogs);
  const allUsers = useSelector((state) => state.allUsers);

  useEffect(() => {
    dispatch(initializeBlogs());
  }, [dispatch]);

  useEffect(() => {
    dispatch(initializeUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(initializeAllUsers());
  }, [dispatch]);

  const match = useMatch("/posts/:id");
  const blog = match ? blogs.find((blog) => blog.id === match.params.id) : null;
  const match2 = useMatch("/posts/edit/:id");
  const blog1 = match2
    ? blogs.find((blog) => blog.id === match2.params.id)
    : null;

  const match1 = useMatch("/users/:id");
  const userInView = match1
    ? allUsers.find((user) => user.username === match1.params.id)
    : null;

  return (
    <div>
      <div>
        <div>
          <NavigationBar
            user={user}
          />

          <Routes>
            <Route path="/create" element={<NewBlog />} />
            <Route
              path="/"
              element={<BlogList user={user} setUser={setUser} />}
            />
            <Route path="/splitter" element={<YoutubeChapterSplitter></YoutubeChapterSplitter>} />
            <Route
              path="/login"
              element={user ? <Navigate replace to="/" /> : <SignIn />}
            />
            <Route path="/posts/:id" element={<BlogView blog={blog} />} />
            <Route
              path="/users/:id"
              element={<UserView userInView={userInView} />}
            />
            <Route path="/transcoding" element={<VideoTranscoding />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/posts/edit/:id" element={<BlogEdit blog={blog1} />} />
          </Routes>
        </div>
        <Notif />
      </div>
    </div>
  );
};

export default App;
