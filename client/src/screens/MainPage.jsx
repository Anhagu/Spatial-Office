import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    // 로그인된 사용자의 이메일을 출력
    console.log("Logged-in user's email:", email);
  }, [email]);

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

      {email && <p>Welcome, {email}!</p>}
    </div>
  );
};

export default MainPage;
