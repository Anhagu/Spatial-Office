import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'; // db 추가
import { collection, addDoc } from 'firebase/firestore'; // Firestore 모듈 추가

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
            <section>
                <div>
                    <div>
                        <h1> Spatial Office </h1>
                        <h3> 회원가입 </h3>
                        <form>
                            <div>
                                <label htmlFor="email-address">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    label="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="이메일을 입력해주세요"
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    비밀번호
                                </label>
                                <input
                                    type="password"
                                    label="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="비밀번호를 입력해주세요"
                                />
                            </div>

                            <div>
                                <label htmlFor="user-color">
                                    색상 선택
                                </label>
                                <input
                                    type="color"
                                    id="user-color"
                                    value={userColor}
                                    onChange={(e) => setUserColor(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                onClick={onSubmit}
                            >
                                가입
                            </button>

                        </form>

                        <p>
                            이미 계정이 있으신가요?{' '}
                            <NavLink to="/login" >
                                로그인
                            </NavLink>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Signup