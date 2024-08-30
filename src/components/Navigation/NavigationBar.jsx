import React from "react";
import { Avatar, Navbar, Dropdown } from "flowbite-react";
import { useDispatch } from "react-redux";
import { setUser } from "../../reducers/userReducer";
import { useNavigate } from "react-router-dom";
import ContentCutIcon from '@mui/icons-material/ContentCut';
import '../Navigation/NavigationBar.css'
const NavigationBar = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = (event) => {
    if (event) event.preventDefault();
    window.localStorage.removeItem("AKAppSessionID");
    dispatch(setUser(null));
    navigate("/");
  };

  return (
    <Navbar fluid rounded className="navbar-style">
      <Navbar.Brand href="/">
        <ContentCutIcon className="icon-style" />
      </Navbar.Brand>
        <Navbar.Link href="/" className="link-style">Home Page</Navbar.Link>

        {user ? (
          <>
            <Navbar.Link href="/create" className="link-style">Create Post</Navbar.Link>
            <Navbar.Link href="/transcoding" className="link-style">Transcode</Navbar.Link>
            <Navbar.Link href="/splitter" className="link-style">Youtube Splitter</Navbar.Link>
            <Dropdown arrowIcon={false} inline label={<Avatar className="avatar-style"  img="https://flowbite.com/docs/images/people/profile-picture-2.jpg" alt="User settings" rounded />}>
              <Dropdown.Header>
                <span className="user-name">{user.username}</span>
              </Dropdown.Header>
              <Dropdown.Item>
                <a href={`/users/${user.username}`}>My Profile</a>
              </Dropdown.Item>
              <Dropdown.Item onClick={logout}>Sign out</Dropdown.Item>
            </Dropdown>
          </>
        ) : (
          <>
            {/* <Navbar.Link href="/login" className="link-style">Create Post</Navbar.Link> */}
            <Navbar.Link href="/login" className="login-style">Log In</Navbar.Link>
          </>
        )}
    </Navbar>
  );
};

export default NavigationBar;
