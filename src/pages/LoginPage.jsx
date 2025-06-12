import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../features/userSlice';
import styles from '../css/LoginPage.module.css';
import { useToast } from '@chakra-ui/react';

// 이미지
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';

const LoginPage = () => {
  const [loginID, setLoginID] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('loginID', loginID);
    formData.append('loginPassword', loginPassword);

    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        credentials: 'include',
      });

      if (res.ok) {
        // 로그인 성공 후 사용자 정보 요청
        const userRes = await fetch('http://localhost:8080/api/userinfo', {
          method: 'GET',
          credentials: 'include',
        });

        if (!userRes.ok) throw new Error('사용자 정보 조회 실패');

        const userData = await userRes.json();

        dispatch(
          setUserInfo({
            username: userData.name,
            email: userData.email,
            loginID: userData.loginID,
            punNumber: userData.punNumber,
          })
        );

        navigate('/'); // 홈으로 이동
      } else {
        toast({
          title: "로그인 실패",
          description: "아이디 또는 비밀번호가 일치하지 않습니다.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "서버 오류",
        description: "로그인 중 오류가 발생했습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
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