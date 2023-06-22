import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Input = styled.input`
  font-family: 'Noto Sans KR','Noto Sans Korean', "Nanum Gothic", sans-serif;
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  border: 0;
  outline: none;
  font-size: 10px;
  width: 100%;
  border: 1px solid #dddddd !important;
  font-size: 1rem;
  line-height: 1.45;
  letter-spacing: -0.04rem;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  &::placeholder{
    color: #d9d9d9;
  }
`;

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
        <section>
          <div style={{
            backgroundColor: "#9F9F9F",
            borderRadius: "40px",
            padding: "20px",
            width: "400px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative"
          }}>
            <p>Spatial Office</p>
            <p>로그인</p>

            <form>
              <div style={{marginBottom: "10px"}}>
                <label htmlFor="email-address" style={{display: "block"}}>
                  이메일
                </label>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  style={{width: "80%"}}
                  required
                  placeholder="Email address"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{marginBottom: "20px"}}>
                <label htmlFor="password" style={{display: "block"}}>
                  비밀번호
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  style={{width: "80%"}}
                  required
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <button onClick={onLogin} style={{
                  width: "60%",
                  backgroundColor: "#0379E5",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}>
                  Login
                </button>
              </div>
            </form>

            <p className="text-sm text-white text-center" style={{marginTop: "20px"}}>
              No account yet?{' '}
              <NavLink to="/signup" style={{color: "#0379E5"}}>
                Sign up
              </NavLink>
            </p>

            <p style={{fontSize: "8px", color: "#d9d9d9", position: "absolute", bottom: "10px", left: "10px"}}>
              개인정보 처리방침
            </p>

          </div>
        </section>
      </main>
    </>
  )
}

export default Login;
