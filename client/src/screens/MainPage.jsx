import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ''; // 변경된 부분: 전달된 email 값을 받아옴

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

      {email && <p>Welcome, {email}!</p>} {/* 변경된 부분: email 값을 출력 */}
    </div>
  );
};

export default MainPage;
