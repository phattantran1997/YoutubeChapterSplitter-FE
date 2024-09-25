import React, { useState } from "react";
import QRCode from "react-qr-code";
import { setNotification } from "../../reducers/notificationReducer";
import loginService from "../../services/login";
import { useDispatch } from "react-redux";
import { setUser } from "../../reducers/userReducer";  // Make sure you have this import
import { useNavigate } from "react-router-dom";
const MfaSetupForm = ({ username, session, challengeName }) => {
  const [secretCode, setSecretCode] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [newSession, setNewSession] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMfaSetup = async () => {
    try {
      const response = await loginService.mfaSetup({ session });
      setSecretCode(response.secretCode);
      setNewSession(response.session);
    } catch (exception) {
      console.log(exception);
      dispatch(setNotification({ message: "MFA setup failed", type: "error" }, 2500));
    }
  };

  const handleMfaVerification = async (event) => {
    event.preventDefault();
    try {
      const response = await loginService.verifyMfa({ username, mfaCode, session: newSession, challengeName });
      
      // Check for status 200 in the response to ensure MFA was successful
      if (response.status === 200) {
        // Store session and tokens in local storage and set user in Redux
        window.localStorage.setItem("AKAppSessionID", JSON.stringify(response.data));
        dispatch(setUser(response.data));
        // Navigate to the home page
        navigate("/home");
        
        // Show success notification
        dispatch(setNotification({ message: "MFA setup verified successfully", type: "success" }, 2500));
      } else {
        // Handle other status codes or error conditions
        dispatch(setNotification({ message: "MFA verification failed", type: "error" }, 2500));
      }
    } catch (exception) {
      // Log exception and show error notification
      console.error("MFA verification error:", exception);
      dispatch(setNotification({ message: "MFA verification failed", type: "error" }, 2500));
    }
};


  return (
    <div>
      <button onClick={handleMfaSetup} className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
        Setup MFA
      </button>
      {secretCode && (
        <div className="mt-4">
          <p>Enter this secret into your Authenticator app: <strong>{secretCode}</strong></p>
          <p>Or scan this QR code:</p>
          <QRCode value={`otpauth://totp/${username}?secret=${secretCode}&issuer=VideoUtilise`} />
          <p>After setting it up, enter the code below to verify.</p>
          <form onSubmit={handleMfaVerification}>
            <input
              type="text"
              value={mfaCode}
              onChange={({ target }) => setMfaCode(target.value)}
              placeholder="Enter MFA Code"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
              required
            />
            <button className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              Verify MFA
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MfaSetupForm;
