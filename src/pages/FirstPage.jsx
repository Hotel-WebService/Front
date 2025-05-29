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
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { setLogin, setLogout } from '../features/userSlice';
import { setDestination, setDates, setPeople } from '../features/searchSlice';
import { setLocation, setCheckin, setCheckout, setGuests } from '../features/reservationSlice';

// 이미지
import heroImage from '../assets/firstPage/firstPage.jpg';
import r1 from '../assets/firstPage/r1.jpg';
import r2 from '../assets/firstPage/r2.jpg';
import r3 from '../assets/firstPage/r3.jpg';
import rc1 from '../assets/firstPage/rc1.jpg';
import rc2 from '../assets/firstPage/rc2.jpg';
import rc3 from '../assets/firstPage/rc3.jpg';
import event1 from '../assets/event/event1.jpg';
import event2 from '../assets/event/event2.jpg';
import event3 from '../assets/event/event3.jpg';
import event4 from '../assets/event/event4.jpg';
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';

const FirstPage = () => {
  const search = useSelector(state => state.search);
  const dispatch = useDispatch();
  const { isAuthenticated, username } = useSelector((state) => state.user);
  const { location, checkin, checkout, guests } = useSelector((state) => state.reservation);

  const mapRef = useRef(null);
  const navigate = useNavigate(); // 백엔드 추가
  const [hotel, setHotel] = useState(null); // 백엔드 호텔 정보 추가

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
        const auth = data.authenticated === true || data.authenticated === 'true';
        if (auth) dispatch(setLogin(data.name || data.username || ''));
        else dispatch(setLogout());
      })
      .catch(() => dispatch(setLogout()));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include'
      });
      dispatch(setLogout());
      navigate('/');
    } catch (e) {
      console.error('로그아웃 실패', e);
    }
  };

  return (
    <div>
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
              onChange={(e) => dispatch(setLocation(e.target.value))}
            />
          </div>

          <div className={styles.sb}>
            <div>
              <label>체크인</label>
              <DatePicker
                selected={checkin}
                onChange={(date) => dispatch(setCheckin(date))}
                placeholderText="날짜 선택"
                dateFormat="yyyy/MM/dd"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                locale={ko}
                minDate={new Date()}
              />
            </div>
            <div>
              <label>체크아웃</label>
              <DatePicker
                selected={checkout}
                onChange={(date) => dispatch(setCheckout(date))}
                placeholderText="날짜 선택"
                dateFormat="yyyy/MM/dd"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                locale={ko}
                minDate={new Date()}
              />
            </div>
          </div>

          <div>
            <label htmlFor="guests">인원 수</label>
            <input
              type="number"
              id="guests"
              value={guests}
              onChange={(e) => dispatch(setGuests(Number(e.target.value)))}
              min="1"
            />
          </div>

          <Link to="/listPage">
            <button
              className={styles.searchBtn}
              onClick={() => {
                dispatch(setDestination(location));
                dispatch(setDates({ startDate: checkin, endDate: checkout }));
                dispatch(setPeople(guests));
              }}
            >
              검색
            </button>
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