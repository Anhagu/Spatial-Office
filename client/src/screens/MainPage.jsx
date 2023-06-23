import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from 'styled-components';

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
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
    navigate("/virtualoffice");
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
          <img className="webRTCImage" alt="webRTC" src="../image/RTCPic.png" />
          <ContentText>
            어디서나 간편한 직장생활<br />
            가상공간 사무실로 출근하여 현장감있는 업무를 경험해보세요
          </ContentText>
        </ContentContainer>

        <FaceCallButton onClick={handleButtonClick}>화상통화방</FaceCallButton>
        <div style={{display:"flex", justifyContent:"center", alignItem:"center", backgroundColor: "#34d188", height:"196 px"}}>
          <ConnectOfficeButton onClick={handleOfficeClick}>시작하기</ConnectOfficeButton>
        </div>
        {email && <p>Welcome, {email}!</p>}
      </Container>
    </div>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100vw;
  height: 70px;
  background-color: #ff4e4e;
`;

const Logo = styled.div`
  display: flex;
  font-size: 32px;
  font-weight: bold;
  margin-left: 30px;
`;

const LoginButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 100px;
  font-size: 20px;
  font-weight: bold;
  background-color: #D9D9D9;
  border-radius: 7px;
  margin-right: 10px;
  margin-left: 77vw;
`;

const SignupButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 100px;
  font-size: 20px;
  font-weight: bold;
  background-color: #D9D9D9;
  border-radius: 7px;
  
`;

const ContentContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100vw;
  height: 70vh;
  position: relative;
  background-color: #76b1e8;
  .webRTCImage {
    width: 100vw;
    height: 45vh;
}
`;

const ContentText = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 64vh;
  width: 100vw;
  font-size: 2vw;
  position: absolute;
  
`;

const FaceCallButton = styled.div`
  
`;

const ConnectOfficeButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 15vw;
  height: 8vh;
  font-size: xx-large;
  font-weight: bolder;
  border-radius: 20px;
  margin-top: 50px;
  background-color: #0379E5;
`;

export default MainPage;
