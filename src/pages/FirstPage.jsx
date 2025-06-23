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
import { setCheckin, setCheckout, setGuests } from '../features/reservationSlice';
import { Button, useToast } from '@chakra-ui/react';
import FooterModal from "../pages/FooterModal";
import { useDisclosure } from "@chakra-ui/react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";

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
  const [guestsRaw, setGuestsRaw] = useState('');
  const search = useSelector(state => state.search);
  const dispatch = useDispatch();
  const { isAuthenticated, username } = useSelector((state) => state.user);
  const { checkin, checkout, guests } = useSelector((state) => state.reservation);
  const destination = useSelector((state) => state.search.destination);

  const mapRef = useRef(null);
  const navigate = useNavigate(); // 백엔드 추가
  const [hotel, setHotel] = useState(null); // 백엔드 호텔 정보 추가

  const [hotelsinfo, setHotelsinfo] = useState([]);
  const [room, setRoom] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [recommendHotels, setRecommendHotels] = useState([]);

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

  // 1) 호텔 정보
  useEffect(() => {
    fetch("http://localhost:8080/api/hotels", { credentials: "include" })
      .then((res) => res.json())
      .then(setHotelsinfo)
      .catch(console.error);
  }, []);

  // 2) 방 정보
  useEffect(() => {
    fetch("http://localhost:8080/api/rooms", { credentials: "include" })
      .then((res) => res.json())
      .then(setRoom)
      .catch(console.error);
  }, []);

  // 3) 리뷰 정보
  useEffect(() => {
    fetch("http://localhost:8080/api/reviews", { credentials: "include" })
      .then((res) => res.json())
      .then(setAllReviews)
      .catch(console.error);
  }, []);

  // 4) 추천 호텔 계산: 평점 기준 내림차순 Top 3
  useEffect(() => {
    if (hotelsinfo.length === 0) return;
    const mappedHotels = hotelsinfo.map((hotel) => {
      const hotelReviews = allReviews.filter(
        (r) => r.hotelID === hotel.hotelID
      );
      const averageRating = hotelReviews.length
        ? (
          hotelReviews.reduce((sum, r) => sum + r.rating, 0) /
          hotelReviews.length
        ).toFixed(1)
        : "0.0";

      return {
        hotelID: hotel.hotelID,
        hotelName: hotel.hotelName,
        address: hotel.address,
        averageRating,
        reviewCount: hotelReviews.length,
      };
    });

    // 평점순 내림차순 Top 5만 추려서 세팅
    const topHotels = [...mappedHotels]
      .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
      .slice(0, 5);

    setRecommendHotels(topHotels);
  }, [hotelsinfo, allReviews]);

  // 호텔 이미지 자동 매핑 함수
  const getHotelImageList = (hotelId, count = 5) => {
    const images = [];
    for (let i = 1; i <= count; i++) {
      try {
        // jpg 또는 png로도 가능
        const img = require(`../assets/hotel${hotelId}/hotel${i}.jpg`);
        images.push(img);
      } catch (e) {
        images.push("https://placehold.co/400x300?text=No+Image");
      }
    }
    return images;
  };

  return (
    <div>
      {/* Booking Form */}
      <section className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <header className={styles.header}>
            <div className={styles.logo}><a href="/">Stay Manager</a></div>
            <div className={styles.userLinks}>
              {isAuthenticated ? (
                <>
                  <span>안녕하세요, {username}님</span>
                  <Link to="/myPage">MyPage</Link>
                  <Link to="/savedPage">찜 목록</Link>
                  <Link to="/" onClick={handleLogout} className={styles.logoutLink}>로그아웃</Link>
                </>
              ) : (
                <>
                  <Link to="/signupPage">회원가입</Link>
                  <Link to="/login">로그인</Link>
                </>
              )}
            </div>
          </header>

          <h2 className={styles.heroTitle}>어디로 떠나고 싶으신가요?</h2>

          <div className={styles.bookingForm}>
            <div className={styles.formBox}>
              {/* 목적지 */}
              <div className={styles.formItem}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => dispatch(setDestination(e.target.value))}
                  placeholder="여행지나 숙소를 검색해보세요."
                />
              </div>

              {/* 날짜 */}
              <div className={styles.formItem}>
                <i className="fa-solid fa-calendar-days"></i>
                <DatePicker
                  selected={checkin}
                  onChange={(date) => dispatch(setCheckin(date))}
                  placeholderText="체크인"
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
                <span style={{ margin: "0 6px" }}>-</span>
                <DatePicker
                  selected={checkout}
                  onChange={(date) => dispatch(setCheckout(date))}
                  placeholderText="체크아웃"
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

              {/* 인원 수 */}
              <div className={styles.formItem}>
                <i className="fa-solid fa-user"></i>
                <NumberInput
                  value={guestsRaw}
                  onChange={(valueString, valueNumber) => {
                    const safeValue = valueNumber < 1 ? 1 : valueNumber;
                    setGuestsRaw(valueString === '' ? '' : String(safeValue));
                    dispatch(setGuests(safeValue));
                  }}
                  clampValueOnBlur={false}
                  focusBorderColor="transparent"
                  width="100%"
                >
                  <NumberInputField
                    placeholder="인원 수"
                    textAlign="left"
                    pr="2.5rem"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </div>

              {/* 검색 버튼 */}
              <div className={styles.searchButtonWrapper}>
                <button
                  className={styles.searchBtn}
                  onClick={() => {
                    dispatch(setDestination(destination));
                    dispatch(setDates({ startDate: checkin, endDate: checkout }));
                    dispatch(setPeople(guests));
                    navigate("/listPage");
                  }}
                >
                  검색
                </button>
              </div>
            </div>
          </div>
          {/* AI 컨설팅 */}
          <section className={styles.consulting}>
            <span className={styles.consultingText}>당신에게 딱 맞는 호텔 추천</span>
            <Button
              colorScheme="whiteAlpha"
              size="md"
              width="100%"
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
        </div>
      </section>

      <div
        className={styles.recommendSection}
        style={{
          margin: "30px 0 24px",
          width: "100%",
          padding: "0 4rem",
        }}
      >
        <h3
          className={styles.recommendTitle}
          style={{
            fontSize: "1.09rem",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            color: "#233044",
            marginBottom: "13px",
            paddingLeft: "2px",
            lineHeight: "1.2",
          }}
        >
          추천 호텔{" "}
          <span
            style={{
              fontSize: "0.92rem",
              fontWeight: "600",
              color: "#00b1b1",
              marginLeft: "5px",
            }}
          >
            (평점기준)
          </span>
        </h3>

        <div
          className={styles.recommendList}
          style={{
            display: "flex",
            flexWrap: "nowrap",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "13px",
            width: "100%",
          }}
        >
          {recommendHotels.length === 0 ? (
            <p
              style={{
                fontSize: "0.98rem",
                color: "#888",
                padding: "18px 0",
                textAlign: "center",
                width: "100%",
              }}
            >
              추천 호텔 정보를 불러오는 중이거나 데이터가 없습니다.
            </p>
          ) : (
            recommendHotels.slice(0, 5).map((hotel) => {
              const images = getHotelImageList(hotel.hotelID, 5);
              return (
                <div
                  className={styles.recommendCard}
                  key={hotel.hotelID}
                  style={{
                    flex: "1 1 16.5%",
                    maxWidth: "19%",
                    minWidth: "180px",
                    boxSizing: "border-box",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    textDecoration: "none",
                    transition: "box-shadow 0.17s, transform 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                >
                  {/* Swiper 영역 (이미지 슬라이드) */}
                  <div
                    className={styles.recommendImgBox}
                    style={{ width: "100%" }}
                  >
                    <Swiper
                      spaceBetween={1}
                      slidesPerView={1}
                      loop={true}
                      navigation={true}
                      modules={[Navigation]}
                      style={{
                        width: "100%",
                        height: "140px",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      {images.map((img, idx) => (
                        <SwiperSlide key={idx}>
                          <img
                            src={img}
                            alt={`${hotel.hotelName} 이미지${idx + 1}`}
                            className={styles.recommendImg}
                            style={{
                              width: "100%",
                              height: "140px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              transition: "transform 0.2s",
                              marginBottom: "0",
                              // 아래가 핵심! Swiper 이미지 클릭 시 Link 이동 방지
                              cursor: "grab",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                  {/* 호텔 정보 영역 (여기만 Link 처리) */}
                  <Link
                    to={`/reservationPage/${hotel.hotelID}`}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      flex: "1 1 auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    className={styles.recommendInfo}
                  >
                    <div
                      style={{
                        padding: "7px 7px 8px 7px",
                        flex: "1 1 auto",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        margin: 0,
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 2px",
                          fontSize: "0.98rem",
                          fontWeight: 700,
                          color: "#222",
                        }}
                      >
                        {hotel.hotelName}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.87rem",
                          color: "#444",
                          lineHeight: "1.4",
                        }}
                      >
                        <b style={{ color: "#00b1b1" }}>
                          ⭐ {hotel.averageRating}
                        </b>{" "}
                        <span style={{ color: "#aaa" }}>
                          ({hotel.reviewCount}명)
                        </span>
                        <br />
                        <span style={{ color: "#888" }}>{hotel.address}</span>
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>


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
            delay: 7000,
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