import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigate("/mainpage", { state: { email: email } });
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage)
      });
  }

  return (
    <>
      <main>
        <section style={{display:'flex', justifyContent:"center", alignItems:"center", height:"100vh", width:"100vw"}}>
          <div style={{
            backgroundColor: "#D9D9D9",
            borderRadius: "40px",
            padding: "20px",
            width: "464px",
            height: "596px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative"
          }}>
            
            <Logo>Spatial Office</Logo>
            <LoginText>로그인</LoginText>

            <form>
              <div style={{ marginBottom: "10px", marginTop: "40px" }}>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  style={{ width: "75%" }}
                  required
                  placeholder="이메일을 입력해주세요"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  style={{ width: "75%" }}
                  required
                  placeholder="비밀번호를 입력해주세요"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <button onClick={onLogin} style={{
                  marginTop: "28px",
                  fontSize: "25px",
                  width: "82.5%",
                  backgroundColor: "#0379E5",
                  color: "white",
                  border: "none",
                  padding: "17px 20px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}>
                  로그인
                </button>
              </div>
            </form>

            <p className="text-sm text-white text-center" style={{ marginTop: "15px" }}>
              아직 계정이 없으신가요?{' '}
              <NavLink to="/signup" style={{ color: "#0379E5" }}>
                회원가입
              </NavLink>
            </p>

            <p style={{ fontSize: "13px", fontWeight:"border", position: "absolute", bottom: "10px", left: "30px" }}>
              개인정보 처리방침
            </p>

          </div>
        </section>
      </main>
    </>
  )
};

const Input = styled.input`
  
  border: 0;
  outline: none;
  font-size: 10px;
  width: 100%;
  height: 30px;
  border: 1px solid #dddddd !important;
  font-size: 1rem;
  line-height: 1.45;
  letter-spacing: -0.04rem;
  padding: 16px;
  margin-top: 12px;
  &::placeholder{
    color: #7c7c7c;
  }
`;

const Logo = styled.div`
  margin-top: 35px;
  font-size: 32px;
  font-weight: bold;
`;

const LoginText = styled.div`
  margin-top: 20px;
  font-size: 30px;
  font-weight: bold;
`;

export default Login;
