import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from 'styled-components';

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {

    // 사용자가 로그인되었는지 확인합니다
    setIsLoggedIn(!!email);

    // 로그인된 사용자의 이메일을 출력
    console.log("Logged-in user's email:", email);

    // 로그인된 사용자의 이메일을 로컬 스토리지에 저장
    localStorage.setItem("email", email);
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
    if (isLoggedIn) {
      navigate("/virtualoffice");
    } else {
      navigate("/login");
    }
  };

  return (
    <div>
      <Container>
        <HeaderContainer>
          <Logo>Spatial Office</Logo>
          <LoginButton onClick={handleLoginClick}>로그인</LoginButton>
          <SignupButton onClick={handleSignupClick}>회원가입</SignupButton>
        </HeaderContainer>

        <ContentContainer>
          <img className="webRTCImage" alt="webRTC" src="../image/HomeOffice.png" />
          <ContentText>
            어디서나 간편한 직장생활<br />
            가상공간 사무실로 출근하여 현장감있는 업무를 경험해보세요
          </ContentText>
        </ContentContainer>

        <div style={{ display: "flex", justifyContent: "center", alignItem: "center", backgroundColor: "#3bc484", height: "160px" }}>
          <ConnectOfficeButton onClick={handleOfficeClick}>시작하기</ConnectOfficeButton>
        </div>
      </Container>
    </div>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 60px;
  background-color: #5898ff;
`;

const Logo = styled.div`
  display: flex;
  font-size: 28px;
  font-weight: bold;
  width: 180px;
  margin-left: 30px;
`;

const LoginButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 80px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  background-color: #D9D9D9;
  border-radius: 7px;
  margin-left: 1120px;  
`;

const SignupButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 100px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  background-color: #D9D9D9;
  border-radius: 7px;
  margin-left: 10px;
  
`;

const ContentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: 70vh;
  position: relative;
  background-color: #b5ccfd;
  .webRTCImage {
    width: 100%;
    height: 100%;
}
`;

const ContentText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 480px;
  width: 100vw;
  font-size: 2.2vw;
  font-weight: bold;
  position: absolute;
  text-shadow: 1px 1px white;
`;

const ConnectOfficeButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 15vw;
  height: 8vh;
  font-size: xx-large;
  font-weight: bolder;
  cursor: pointer;
  border-radius: 20px;
  margin-top: 50px;
  background-color: #0379E5;
`;

export default MainPage;
