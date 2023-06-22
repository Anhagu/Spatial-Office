import React from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/lobby");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleOfficeClick = () => {
    navigate("/virtualoffice");
  };

  return (
    <div>
      <h1>Spatial Office</h1>
      <button onClick={handleButtonClick}>화상통화방</button>
      <button onClick={handleLoginClick}>Login</button>
      <button onClick={handleSignupClick}>Signup</button>
      <button onClick={handleOfficeClick}>시작하기</button>
    </div>
  );
};

export default MainPage;
