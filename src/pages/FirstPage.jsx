import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Autoplay } from 'swiper/modules';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ko } from 'date-fns/locale';
import styles from '../css/FirstPage.module.css';
import heroImage from '../assets/firstPage1.jpg';
import r1 from '../assets/r1.jpg';
import r2 from '../assets/r2.jpg';
import r3 from '../assets/r3.jpg';
import rc1 from '../assets/rc1.jpg';
import rc2 from '../assets/rc2.jpg';
import rc3 from '../assets/rc3.jpg';
import event1 from '../assets/event1.jpg';
import event2 from '../assets/event2.jpg';
import event3 from '../assets/event3.jpg';
import event4 from '../assets/event4.jpg';
import instargram from '../assets/instargram.jpg';
import facebook from '../assets/facebook.jpg';
import twitter from '../assets/twitter.jpg';
import { useNavigate } from "react-router-dom";

const FirstPage = () => {
  const mapRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate(); // 백엔드 추가
  const [hotel, setHotel] = useState(null); // 백엔드 호텔 정보 추가

  // 예약 관련 상태
  const [location, setLocation] = useState('');
  const [checkin, setCheckin] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [guests, setGuests] = useState(1);

  // 백엔드 로그인, 로그아웃 추가
  useEffect(() => {
    fetch('http://localhost:8080/api/userinfo', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('네트워크 에러');
        return res.json();
      })
      .then(data => {
        // boolean 혹은 string 모두 커버
        const auth = data.authenticated === true || data.authenticated === 'true';
        setIsAuthenticated(auth);

        // name 필드가 있으면 그걸, 없으면 username
        const user = data.name || data.username || '';
        setUsername(user);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUsername('');
      });
  }, []);

  // --- 2) 카카오 스크립트 한 번만 로드 ---
  useEffect(() => {
    if (window.kakao && window.kakao.maps) return;
    const script = document.createElement('script');
    script.src =
      'https://dapi.kakao.com/v2/maps/sdk.js?appkey=d14da4067c563de35ba14987b99bdb89&autoload=false';
    script.async = true;
    document.head.appendChild(script);
    // SDK 로드완료 시점에 초기화 콜백 등록
    script.onload = () => {
      window.kakao.maps.load(() => {
        // 호텔 데이터가 이미 있으면 즉시 그려주고
        if (hotel) drawMap(hotel);
      });
    };
    return () => {
      document.head.removeChild(script);
    };
  }, [hotel]);  // hotel 바뀔 때도 재실행

  // --- 3) 호텔 정보 fetch ---
  useEffect(() => {
    const hotelId = 1;  // 예시
    fetch(`http://localhost:8080/api/hotels/${hotelId}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('호텔을 못 찾음');
        return res.json();
      })
      .then(data => setHotel(data))
      .catch(console.error);
  }, []);

  // --- 4) hotel 상태 변경 시 지도 그리기 ---
  useEffect(() => {
    if (hotel && window.kakao && window.kakao.maps && mapRef.current) {
      drawMap(hotel);
    }
  }, [hotel]);

  // 지도 그려주는 헬퍼
  const drawMap = ({ latitude, longitude }) => {
    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(latitude, longitude),
      level: 4,
    };
    const map = new window.kakao.maps.Map(container, options);
    new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(latitude, longitude),
      map,
    });
  };


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
    <div>
      {/* 1) 지도 섹션 백엔드 테스트용추가*/}
      <section className={styles.mapSection}>
        <h2>지도 서비스</h2>
        <div
          ref={mapRef}
          className={styles.mapContainer}
        />
      </section>
      {/* Booking Form */}
      <section className={styles.hero}>
        <div className={styles.heroImage}
          style={{ backgroundImage: `url(${heroImage})` }}>
          <header className={styles.header}>
            <div className={styles.logo}>
              <a href="/">Stay Manager</a>
            </div>
            <div className={styles.userLinks}>
              {isAuthenticated
                ? (
                  <>
                    <span>안녕하세요, {username}님        </span>
                    <Link to="/myPage">MyPage</Link>
                    <Link to="/savedPage">찜 목록</Link>
                    <Link to="/"
                      onClick={handleLogout}
                      className={styles.logoutLink}
                    >로그아웃</Link>
                  </>
                )
                : (
                  <>
                    <Link to="/signupPage">회원가입</Link>
                    <Link to="/login">로그인</Link>
                  </>
                )
              }
            </div>
          </header>
        </div>
        <div className={styles.bookingForm}>
          <h2>원하는 숙소를 예약하세요</h2>

          <div>
            <label htmlFor="location">목적지</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className={styles.sb}>
            <div>
              <label>체크인</label>
              <DatePicker
                selected={checkin}
                onChange={(date) => setCheckin(date)}
                placeholderText="날짜 선택"
                dateFormat="yyyy/MM/dd"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                locale={ko}
              />
            </div>
            <div>
              <label>체크아웃</label>
              <DatePicker
                selected={checkout}
                onChange={(date) => setCheckout(date)}
                placeholderText="날짜 선택"
                dateFormat="yyyy/MM/dd"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                locale={ko}
              />
            </div>
          </div>

          <div>
            <label htmlFor="guests">인원 수</label>
            <input
              type="number"
              id="guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              min="1"
            />
          </div>

          <Link to="/listPage">
            <button className={styles.searchBtn}>검색</button>
          </Link>
        </div>
      </section>

      {/* AI 컨설팅 */}
      <section className={styles.consulting}>
        <h2>Ai: 나에게 딱 맞는 여행지 컨설팅</h2>
        <Link to="/ai" className={styles.btn}>Ai 컨설팅 받기</Link>
      </section>

      {/* 서비스 카드 */}
      <section className={styles.services}>
        <div className={styles.serviceItem}>
          <div className={styles.serviceImg1} style={{ backgroundImage: `url(${rc1})` }}></div>
          <p>휴양</p>
        </div>
        <div className={styles.serviceItem}>
          <div className={styles.serviceImg2} style={{ backgroundImage: `url(${rc2})` }}></div>
          <p>액티비티</p>
        </div>
        <div className={styles.serviceItem}>
          <div className={styles.serviceImg3} style={{ backgroundImage: `url(${rc3})` }}></div>
          <p>쇼핑</p>
        </div>
      </section>

      {/* 광고 슬라이더 */}
      <section className={styles.adSlider}>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            nextEl: `.${styles.customNext}`,
            prevEl: `.${styles.customPrev}`,
          }}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false
          }}
          slidesPerView={1}
        >
          <SwiperSlide>
            <div className={styles.slideBox}>
              <div style={{ backgroundImage: `url(${event1})` }}></div>
              <div style={{ backgroundImage: `url(${event2})` }}></div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className={styles.slideBox}>
              <div style={{ backgroundImage: `url(${event3})` }}></div>
              <div style={{ backgroundImage: `url(${event4})` }}></div>
            </div>
          </SwiperSlide>
        </Swiper>

        <button className={`${styles.sliderBtn} ${styles.customPrev}`}>&lt;</button>
        <button className={`${styles.sliderBtn} ${styles.customNext}`}>&gt;</button>
      </section>

      {/* 추천 여행지 */}
      <section className={styles.recommend}>
        <h3>추천 여행지</h3>
        <div className={styles.destinations}>
          <div className={styles.destItem}>
            <div className={styles.destImg1} style={{ backgroundImage: `url(${r1})` }}></div>
            <h4>전주 한옥마을</h4>
            <p>한옥마을</p>
          </div>
          <div className={styles.destItem}>
            <div className={styles.destImg2} style={{ backgroundImage: `url(${r2})` }}></div>
            <h4>제주도</h4>
            <p>성산일출봉</p>
          </div>
          <div className={styles.destItem}>
            <div className={styles.destImg3} style={{ backgroundImage: `url(${r3})` }}></div>
            <h4>강릉</h4>
            <p>경포해변</p>
          </div>
        </div>
      </section>

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

export default FirstPage;