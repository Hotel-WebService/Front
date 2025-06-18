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
import { Button, useToast } from '@chakra-ui/react';
import FooterModal from "../pages/FooterModal";
import { useDisclosure } from "@chakra-ui/react";

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

  const holidays = [
    '2025-01-01',
    '2025-01-27',
    '2025-01-28',
    '2025-01-29',
    '2025-01-30',
    '2025-03-01',
    '2025-03-03',
    '2025-05-05',
    '2025-05-06',
    '2025-06-03',
    '2025-06-06',
    '2025-08-15',
    '2025-10-03',
    '2025-10-05',
    '2025-10-06',
    '2025-10-07',
    '2025-10-08',
    '2025-10-09',
    '2025-12-25'
  ];

  const isFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 제거
    return date > today;
  };

  const isHoliday = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`; // YYYY-MM-DD 형식
    return holidays.includes(formatted);
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 일요일(0), 토요일(6)
  };

  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => {
    setModalType(type);
    onOpen();
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
                dayClassName={(date) => {
                  if (!isFuture(date)) return '';
                  if (isHoliday(date)) return 'holiday';
                  if (isWeekend(date)) return 'weekend';
                  return undefined;
                }}
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
                minDate={checkin || new Date()} // checkin이 있으면 그 이후부터 가능
                dayClassName={(date) => {
                  if (!isFuture(date)) return '';
                  if (isHoliday(date)) return 'holiday';
                  if (isWeekend(date)) return 'weekend';
                  return undefined;
                }}
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
            <Button
              colorScheme="red"
              size="md"
              mt={4}
              w="100%"
              onClick={() => {
                dispatch(setDestination(location));
                dispatch(setDates({ startDate: checkin, endDate: checkout }));
                dispatch(setPeople(guests));
              }}
            >
              검색
            </Button>
          </Link>
        </div>
      </section>

      {/* AI 컨설팅 */}
      <section className={styles.consulting}>
        <h2>AI: 나에게 딱 맞는 여행지 컨설팅</h2>
        <Button
          colorScheme="red"
          size="md"
          width="10%"
          fontWeight="bold"
          borderRadius="full"
          _hover={{ transform: "scale(1.05)" }}
          transition="all 0.2s"
          right="-25px"
          onClick={() => {
            if (isAuthenticated) {
              navigate("/ai");
            } else {
              toast({
                title: "로그인이 필요합니다.",
                description: "AI 컨설팅 기능은 로그인 후 이용 가능합니다.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top"
              });
              navigate("/login");
            }
          }}
        >
          AI 컨설팅 받기
        </Button>
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
        <h3>추천 관광지</h3>
        <div className={styles.destinations}>
          <div className={styles.destItem}>
            <div className={styles.destImg1} style={{ backgroundImage: `url(${r1})` }}></div>
            <h4>남산 서울타워</h4>
            <p>용산구</p>
          </div>
          <div className={styles.destItem}>
            <div className={styles.destImg2} style={{ backgroundImage: `url(${r2})` }}></div>
            <h4>한옥마을</h4>
            <p>북촌</p>
          </div>
          <div className={styles.destItem}>
            <div className={styles.destImg3} style={{ backgroundImage: `url(${r3})` }}></div>
            <h4>덕수궁</h4>
            <p>중구</p>
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
                <li onClick={() => openModal("faq")} style={{ cursor: "pointer" }}>자주 묻는 질문</li>
                <li onClick={() => openModal("contact")} style={{ cursor: "pointer" }}>연락처</li>
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
            <a href="https://www.instagram.com/stay_manager" target="_blank" rel="noopener noreferrer">
              <div className="social-icon" style={{ backgroundImage: `url(${instargram})` }}></div>
            </a>
            <div className="social-icon" style={{ backgroundImage: `url(${twitter})` }}></div>
          </div>
          <p>© 2025 Stay Manager. All rights reserved.</p>
        </div>

        <FooterModal type={modalType} isOpen={isOpen} onClose={onClose} />
      </footer>
      {/* Footer */}
    </div>
  );
};

export default FirstPage;