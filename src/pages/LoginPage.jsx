import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import styles from '../css/LoginPage.module.css';
import instargram from '../assets/instargram.jpg';
import facebook from '../assets/facebook.jpg';
import twitter from '../assets/twitter.jpg';

const LoginPage = () => {
  const [loginID, setLoginID] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // console.log('로그인 시도:', { loginID, loginPassword });
    // 여기에 로그인 API 연동 가능

    // spring-security 기본 form-login 처리에 맞춘 URLSearchParams
    const formData = new URLSearchParams();
    formData.append('loginID', loginID);
    formData.append('loginPassword', loginPassword);

    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString(),
        credentials: 'include'     // ✅ 세션 쿠키 주고받기

      });

      if (res.ok) {
        navigate('/');   // 로그인 성공 시

      } else {
        setError('아이디/비밀번호가 맞지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Link to="/">🔴 Stay Manager</Link>
        </div>
      </header>
      {/* Header */}

      <div className={styles.loginContainer}>
        <h1>로그인</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="userId" className={styles.label}>아이디</label>
            <input className={styles.input}
              type="text"
              id="userId"
              name="loginID"
              placeholder="아이디 입력 (6~20자)"
              required
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>비밀번호</label>
            <input className={styles.input}
              type="password"
              id="password"
              name="loginPassword"
              placeholder="비밀번호 입력 (8자리 이상)"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button}>로그인</button>
        </form>

        <div className={styles.links}>
          <Link to="/signupPage">회원가입</Link> /
          <a href="#">아이디 찾기</a> /
          <a href="#">비밀번호 찾기</a>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-top">
          <div className="footer-section">
            <div className="footer-logo">Stay Manager</div>
          </div>

          <div className="footer-right">
            <div className="footer-section">
              <h4>지원</h4>
              <ul>
                <li>자주 묻는 질문</li>
                <li>연락처</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>정책</h4>
              <ul>
                <li>이용약관</li>
                <li>개인정보 보호</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="social-wrapper">
            <div className="social-icon" style={{ backgroundImage: `url(${facebook})` }}></div>
            <div className="social-icon" style={{ backgroundImage: `url(${instargram})` }}></div>
            <div className="social-icon" style={{ backgroundImage: `url(${twitter})` }}></div>
          </div>
          <p>© 2025 Stay Manager. All rights reserved.</p>
        </div>
      </footer>
      {/* Footer */}
    </div>
  );
};

export default LoginPage;