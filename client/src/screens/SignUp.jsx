import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'; // db 추가
import { collection, addDoc } from 'firebase/firestore'; // Firestore 모듈 추가
import styled from 'styled-components';

const Signup = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [userColor, setUserColor] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault()

        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);

                // Firestore에 사용자 정보 추가
                const userDocRef = collection(db, 'users'); // users 컬렉션 참조
                const userData = { email: user.email, userColor: userColor }; // 사용자 정보
                addDoc(userDocRef, userData) // Firestore에 데이터 추가

                navigate("/login")
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                // ..
            });


    }

    return (
        <main >
            <section style={{ display: 'flex', justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw" }}>
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
                    <SignupText>회원가입</SignupText>
                    <form>
                        <div style={{ marginBottom: "10px", marginTop: "40px" }}>
                            <Input
                                type="email"
                                label="Email address"
                                style={{ width: "75%" }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="이메일을 입력해주세요"
                            />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <Input
                                type="password"
                                label="Create password"
                                style={{ width: "75%" }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="비밀번호를 입력해주세요"
                            />
                        </div>

                        <div>
                            <button onClick={onSubmit} style={{
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
                                가입
                            </button>
                        </div>

                    </form>

                    <p className="text-sm text-white text-center" style={{ marginTop: "15px" }}>
                        이미 계정이 있으신가요?{' '}
                        <NavLink to="/login" >
                            로그인
                        </NavLink>
                    </p>

                    <p style={{ fontSize: "13px", fontWeight: "border", position: "absolute", bottom: "10px", left: "30px" }}>
                        개인정보 처리방침
                    </p>

                </div>
            </section>
        </main>
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

const SignupText = styled.div`
  margin-top: 20px;
  font-size: 30px;
  font-weight: bold;
`;

export default Signup