import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../features/userSlice'; // 경로는 프로젝트 구조에 따라
import styles from '../css/MyPage.module.css';
import Modal from 'react-modal';
import html2canvas from 'html2canvas';

// 이미지
import h1 from '../assets/h1.jpg';
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const [editableUser, setEditableUser] = useState({
    username: '',
    email: '',
    loginPassword: '',
    punNumber: ''
  });

  useEffect(() => {
    setEditableUser({
      username: user.username,
      email: user.email,
      loginPassword: '',
      punNumber: user.punNumber
    });
  }, [user]);

  useEffect(() => {
    console.log('📌 현재 사용자 ID:', user.userID); // 추가
    if (!user.userID) return;

    fetch(`http://localhost:8080/api/payment/user/${user.userID}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('결제 내역 불러오기 실패');
        return res.json();
      })
      .then(data => {
        console.log("🔍 유저별 결제 데이터:", data);
        setPayments(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("결제 내역 오류:", err);
        setPayments([]);
      });
  }, [user.userID]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  Modal.setAppElement('#root');

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();
  const reservationRef = useRef(null);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [payments, setPayments] = useState([]);

  const closeShareModal = () => setIsShareModalOpen(false);

  // 모달 캡쳐 복사 기능
  const handleCaptureAndCopy = async () => {
    try {
      const canvas = await html2canvas(reservationRef.current, {
        useCORS: true,  // 외부 이미지 대응
        scale: 2        // 고화질
      });

      canvas.toBlob(async (blob) => {
        if (navigator.clipboard && blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('이미지가 클립보드에 복사되었습니다!');
          } catch (err) {
            alert('복사 실패: 보안 정책 또는 브라우저 제한일 수 있습니다.');
            console.error(err);
          }
        } else {
          alert('클립보드 API를 지원하지 않는 브라우저입니다.');
        }
      });
    } catch (err) {
      console.error('캡처 실패:', err);
      alert('예약 정보를 캡처하는 데 실패했습니다.');
    }
  };

  // 모달 캡쳐영역 미리보기
  const generatePreview = async () => {
    try {
      const canvas = await html2canvas(reservationRef.current, {
        useCORS: true,
        scale: 2
      });
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewImage(dataUrl);
    } catch (err) {
      console.error('미리보기 캡처 실패:', err);
    }
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
    generatePreview(); // 모달 열릴 때 미리보기 생성
  };

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
        dispatch(setUserInfo({
          userID: data.userID,
          username: data.name,
          email: data.email,
          loginID: data.loginID,
          punNumber: data.punNumber,
        }));
      })
      .catch(err => {
        console.error(err);
        setIsAuthenticated(false);
      });
  }, [dispatch]);

  // 2) input 값 바뀔 때마다 상태 업데이트, 백엔드수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser(prev => ({ ...prev, [name]: value }));
  };

  // 3) 수정하기 버튼 눌렀을 때 백엔드에 PUT, 백엔드 수정
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/api/userinfo', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editableUser.username,
        email: editableUser.email,
        loginPassword: editableUser.loginPassword,
        punNumber: editableUser.punNumber,
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert('회원정보가 수정되었습니다.');
          dispatch(setUserInfo(editableUser)); // 최신값으로 다시 Redux에 반영
        } else {
          alert('수정에 실패했습니다.');
        }
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
          <a>{user.username}님</a>
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
          <h4 className={styles.h4}>{user.username}님, 환영합니다.</h4>
        </div>
      </section>

      <div className={styles.divider}></div>

      <h2 className={styles.h2}>나의 예약현황</h2>

      {payments.length === 0 ? (
        <p className={styles.noReservation}>결제된 예약이 없습니다.</p>
      ) : (
        payments.map(pay => (
          <div key={pay.paymentID} className={styles.reservationCard}>
            <img src={h1} alt="호텔 이미지" />
            <div className={styles.reservationInfo}>
              <div className={styles.sb}>
                <h3>{pay.hotelName}</h3>
                <p>예약자 성함: {user.username}</p>
              </div>
              <div className={styles.sb}>
                <p>{pay.hotelAddress}</p>
                <p>결제 금액: ₩{Number(pay.amount).toLocaleString()}</p>
              </div>
              <div className={styles.sb}>
                <p>결제일자</p>
                <p>{pay.pay_date?.slice(0, 10)}</p>
              </div>
              <div className={styles.sb}>
                <p>결제상태: {pay.payment_status}</p>
                <p>결제수단: {pay.payment_method}</p>
              </div>
            </div>
          </div>
        ))
      )}

      <div className={styles.reservationButtons}>
        <button onClick={openShareModal}>공유하기</button>
        <button>결제내역</button>
        <button>예약취소</button>
      </div>

      <div className={styles.divider}></div>

      <h2 className={styles.h2}>회원정보</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.halfGroup}>
          <label>이름
            <input type="text" name="name" value={editableUser.username} onChange={handleChange} />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>이메일
            <input type="email" name="email" value={editableUser.email} onChange={handleChange} className="full-width" />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>아이디
            <input type="text" name="loginID" value={user.loginID} onChange={handleChange} className="full-width" />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>비밀번호
            {isPasswordEditing ? (
              <input
                type="password"
                name="loginPassword"
                value={editableUser.loginPassword}
                onChange={handleChange}
                className="full-width"
              />
            ) : (
              <input
                type="text"
                value="******"
                className="full-width"
                readOnly
                onFocus={() => setIsPasswordEditing(true)} // 클릭하면 진짜 input으로 전환
              />
            )}
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>전화번호
            <input type="text" name="punNumber" value={editableUser.punNumber} onChange={handleChange} className="full-width" />
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

      <Modal
        isOpen={isShareModalOpen}
        onRequestClose={closeShareModal}
        contentLabel="공유 모달"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>공유하기</h2>
        {previewImage && (
          <div className={styles.previewBox}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>캡처 미리보기</p>
            <img src={previewImage} alt="예약정보 미리보기" className={styles.previewImage} />
          </div>
        )}
        <button onClick={handleCaptureAndCopy} className={styles.copyBtn}>
          예약정보 캡처해서 복사
        </button>
        <button onClick={closeShareModal} className={styles.closeBtn}>닫기</button>
      </Modal>
    </div>
  );
};

export default MyPage;
