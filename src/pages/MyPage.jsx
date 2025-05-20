import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/MyPage.module.css';
import h1 from '../assets/h1.jpg';
import instargram from '../assets/instargram.jpg';
import facebook from '../assets/facebook.jpg';
import twitter from '../assets/twitter.jpg';
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    loginID: '',
    loginPassword: '',
    punNumber: ''
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  // 1) 마운트 시 사용자 정보 가져오기 백엔드추가
  useEffect(() => {
    fetch('http://localhost:8080/api/userinfo', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('세션 정보 불러오기 실패');
        return res.json();
      })
      .then(data => {
        console.log(data)
        // 백엔드에서 반환하는 JSON 스키마에 맞춰서 매핑
        setUserInfo({
          name: data.name,
          email: data.email,
          loginID: data.loginID,
          loginPassword: '',      // 보안을 위해 비밀번호는 빈 문자열로
          punNumber: data.punNumber
        });
      })
      .catch(err => {
        console.error(err);
        setIsAuthenticated(false);
      });
  }, []);

  // 2) input 값 바뀔 때마다 상태 업데이트, 백엔드수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  // 3) 수정하기 버튼 눌렀을 때 백엔드에 PUT, 백엔드 수정
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/api/userinfo', {
      method: 'PUT',
      credentials: 'include',               // 세션 쿠키 포함
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        loginPassword: userInfo.loginPassword,  // 빈 문자열이면 백엔드에서 무시
        punNumber: userInfo.punNumber
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('정보 수정 실패');
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          alert('회원정보가 수정되었습니다.');
          // 필요하면 다시 최신 정보 GET 등 추가
        } else {
          alert('수정에 실패했습니다.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('수정 중 오류가 발생했습니다.');
      });
  };

  // 백엔드 로그아웃 추가
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      navigate('/');  // 로그아웃 후 홈으로
    } catch (e) {
      console.error('로그아웃 실패', e);
    }
  };

  return (
    <div className={styles.body}>
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Link to="/">🔴 Stay Manager</Link>
        </div>
        <div className="navLinks">
          <a>{userInfo.name}님</a>
          <a href="/myPage">MyPage</a>
          <a href="/savedPage">찜 목록</a>
          <Link to="/"
            onClick={handleLogout}
            className={styles.logoutLink}
          >로그아웃</Link>
        </div>
      </header>
      {/* Header */}

      <section className={styles.welcome}>
        <h1 className={styles.h1}>MyPage</h1>
        <div className={styles.hello}>
          <h4 className={styles.h4}>{userInfo.name}님, 환영합니다.</h4>
        </div>
      </section>

      <div className={styles.divider}></div>

      <h2 className={styles.h2}>나의 예약현황</h2>
      <div className={styles.reservationCard}>
        <img style={{ backgroundImage: `url(${h1})` }} />
        <div className={styles.reservationInfo}>
          <div className={styles.sb}>
            <h3>시그니엘 부산</h3>
            <p>예약자 성함 : OOO</p>
          </div>
          <div className={styles.sb}>
            <p style={{ marginBottom: '7rem' }}>해운대</p>
            <p>객실 : 트윈베드 오션뷰 (2인)</p>
          </div>
          <div className={styles.sb}>
            <p>예약일자</p>
            <p>체크인 시간 : 14:00</p>
          </div>
          <div className={styles.sb}>
            <p>5월 1일 ~ 5월 7일</p>
            <p>체크아웃 시간 : 10:00</p>
          </div>
        </div>
      </div>

      <div className={styles.reservationButtons}>
        <button>공유하기</button>
        <button>결제내역</button>
        <button>예약취소</button>
      </div>

      <div className={styles.divider}></div>

      <h2 className={styles.h2}>회원정보</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.halfGroup}>
          <label>이름
            <input type="text" name="name" value={userInfo.name} onChange={handleChange} />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>이메일
            <input type="email" name="email" value={userInfo.email} onChange={handleChange} className="full-width" />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>아이디
            <input type="text" name="loginID" value={userInfo.loginID} onChange={handleChange} className="full-width" />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>비밀번호
            <input type="password" name="loginPassword" value={userInfo.loginPassword} onChange={handleChange} className="full-width" />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>전화번호
            <input type="text" name="punNumber" value={userInfo.punNumber} onChange={handleChange} className="full-width" />
          </label>
        </div>

        <div className={styles.reservationButtons}>
          <button type="submit">수정하기</button>
        </div>
      </form>

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

export default MyPage;
