import { useState, useEffect } from "react";
import Notif from "./components/Notif";
import SignIn from "./components/Credential/LoginForm";
import { useSelector, useDispatch } from "react-redux";
import { initializeBlogs } from "./reducers/blogReducer";
import { initializeUsers, setUser } from "./reducers/userReducer";
import BlogList from "./components/Blog/BlogList";
import YoutubeChapterSplitter from "./components/YoutubeSplitter/YoutubeChapterSplitter";
import { BrowserRouter as Router, Routes, Route, useMatch, Navigate } from "react-router-dom";
import NewBlog from "./components/Blog/NewBlog";
import NavigationBar from "./components/Navigation/NavigationBar";
import { initializeAllUsers } from "./reducers/allUsersReducer";
import BlogView from "./components/Blog/BlogView";
import UserView from "./components/UserView";
import VideoTranscoding from "./components/VideoTranscode/VideoTranscoding";
import RegisterUser from "./components/Credential/RegisterUser";
import ErrorPage from "./components/ErrorPage";
import BlogEdit from "./components/Blog/BlogEdit";
import blogService from './services/blogs'
import { jwtDecode } from 'jwt-decode' // import dependency

const App = () => {
  const dispatch = useDispatch();

  // Get user state from Redux
  const user = useSelector((state) => state.users);
  const blogs = useSelector((state) => state.blogs);
  const allUsers = useSelector((state) => state.allUsers);
  const [tokenLoaded, setTokenLoaded] = useState(false);


 useEffect(() => {
    console.log('effect app.js');
    const loggedUser = window.localStorage.getItem("AKAppSessionID");

    if (loggedUser) {
      const parsedUser = JSON.parse(loggedUser);
      const accessToken = parsedUser.accessToken;
      const decodedUser = jwtDecode(accessToken);

      dispatch(setUser({
        accessToken: accessToken, 
        user: decodedUser,
      }));

      // Set the token for the blogService to use in API calls
      blogService.setToken(accessToken);
    }

    // Mark token as loaded once the user is set
    setTokenLoaded(true);
  }, [dispatch]);

  // Only fetch blogs after the token has been loaded
  useEffect(() => {
    if (user && tokenLoaded) {
      dispatch(initializeBlogs());
    }
  }, [dispatch, user, tokenLoaded]);

  const match = useMatch("/posts/:id");
  const blog = match ? blogs.find((blog) => blog.id === match.params.id) : null;
  const match2 = useMatch("/posts/edit/:id");
  const blog1 = match2 ? blogs.find((blog) => blog.id === match2.params.id) : null;

  const match1 = useMatch("/users/:id");
  const userInView = match1 ? allUsers.find((user) => user.username === match1.params.id) : null;

  return (
    <div>
      <div>
        <NavigationBar user={user} />

        <Routes>
          {/* Redirect to login if user is null */}
          <Route
            path="/post/create"
            element=<NewBlog />
          />
          <Route
            path="/home"
            element={<BlogList user={user} setUser={setUser} />}
          />
          <Route
            path="/splitter"
            element=<YoutubeChapterSplitter />
          />
          <Route
            path="/login"
            element={user ? <Navigate replace to="/home" /> : <SignIn />}
          />
          <Route
            path="/posts/:id"
            element={<BlogView tokenLoaded={tokenLoaded} />} 
          />
          <Route
            path="/users/:id"
            element={user ? <UserView userInView={userInView} /> : <Navigate to="/login" />}
          />
          <Route
            path="/transcoding"
            element=<VideoTranscoding />
          />
          <Route
            path="/register"
            element={user ? <Navigate replace to="/" /> : <RegisterUser />}
          />
          <Route
            path="/posts/edit/:id"
            element={user ? <BlogEdit blog={blog1} /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
      <Notif />
    </div>
  );
};

export default App;
