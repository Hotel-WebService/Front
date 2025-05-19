import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../css/ReservationPage.module.css';
import instargram from '../assets/instargram.jpg';
import facebook from '../assets/facebook.jpg';
import twitter from '../assets/twitter.jpg';
import search from '../assets/search.jpg';
import paradise1 from '../assets/paradise1.jpg';
import paradise2 from '../assets/paradise2.jpg';
import paradise3 from '../assets/paradise3.jpg';
import paradise4 from '../assets/paradise4.jpg';
import paradise5 from '../assets/paradise5.jpg';
import paradiseRoom1 from '../assets/paradiseRoom1.jpg';
import paradiseRoom2 from '../assets/paradiseRoom2.jpg';
import paradiseRoom3 from '../assets/paradiseRoom3.jpg';


const ReservationPage = () => {

    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [activeTab, setActiveTab] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [hotel, setHotel] = useState(null); // 백엔드 호텔 정보 추가

    const introRef = useRef(null);
    const roomsRef = useRef(null);
    const policyRef = useRef(null);
    const reviewsRef = useRef(null);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        const scrollToRef = {
            intro: introRef,
            rooms: roomsRef,
            policy: policyRef,
            reviews: reviewsRef
        }[tab];

        if (scrollToRef?.current) {
            scrollToRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const mapRef = useRef(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [newScore, setNewScore] = useState(10); // 기본값 10점

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

    const handleAddReview = () => {
        if (newReview.trim() === "") return;

        const review = {
            id: reviews.length + 1,
            user: "익명",
            date: new Date().toISOString().split("T")[0],
            content: `${newScore}/10 ${newReview}`,
            score: newScore
        };
        setReviews([review, ...reviews]);
        setNewReview("");
        setNewScore(10);
    };

    const averageScore = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.length).toFixed(1)
        : "0.0";

    const rooms = [
        {
            id: 1,
            name: "디럭스룸, 부분 바다 전망 (Annex Building)",
            specs: ["3명", "더블침대 1개", "2인 수용장 무료 이용(1일 기준)", "스파 이용"],
            price: 364000,
            image: paradiseRoom1,
        },
        {
            id: 2,
            name: "디럭스 더블룸, 바다 전망 (Main Building)",
            specs: ["3명", "더블침대 1개", "2인 수영장 무료 이용(1일 기준)", "스파 이용", "바다 전망"],
            price: 382000,
            image: paradiseRoom2,
        },
        {
            id: 3,
            name: "이그제큐티브 더블룸, 시내 전망 (Main Building)",
            specs: ["2인", "더블침대 1개", "2인 유럽식 아침 식사", "2인 수영장 무료 이용(1일 기준)", "시내 전망"],
            price: 436800,
            image: paradiseRoom3,
        },
    ];

    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <Link to="/">🔴 Stay Manager</Link>
                </div>
                <div className="navLinks">
                    <a>OOO님</a>
                    <a href="/myPage">MyPage</a>
                    <a href="/savedPage">찜 목록</a>
                    <a href="/">로그아웃</a>
                </div>
            </header>
            {/* Header */}

            <div className={styles.searchBox}>
                <input
                    type="text"
                    placeholder="목적지"
                    className={styles.input}
                />

                <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    isClearable={false}
                    placeholderText="날짜 선택"
                    dateFormat="yyyy/MM/dd"
                    locale={ko}

                />

                <input
                    type="number"
                    min="1"
                    placeholder="인원 수"
                    className={styles.peopleInput}
                />

                <button>
                    <img src={search} alt="검색" />
                </button>
            </div>

            <a href="#" className={styles.backLink}>+ 돌아가기</a>

            <section className={styles.hero}>
                <div className={styles.big} style={{ backgroundImage: `url(${paradise1})` }}></div>
                <div className={styles.thumb1} style={{ backgroundImage: `url(${paradise2})` }}></div>
                <div className={styles.thumb2} style={{ backgroundImage: `url(${paradise3})` }}></div>
                <div className={styles.thumb3} style={{ backgroundImage: `url(${paradise4})` }}></div>
                <div className={styles.thumb4} style={{ backgroundImage: `url(${paradise5})` }}>
                    <div className={styles.more}>+124</div>
                </div>
            </section>

            <div className={styles.sectionTabs}>
                <div className={styles.sectionTabs}>
                    <button
                        className={activeTab === 'intro' ? styles.active : ''}
                        onClick={() => handleTabClick('intro')}
                    >
                        소개
                    </button>
                    <button
                        className={activeTab === 'rooms' ? styles.active : ''}
                        onClick={() => handleTabClick('rooms')}
                    >
                        객실
                    </button>
                    <button
                        className={activeTab === 'policy' ? styles.active : ''}
                        onClick={() => handleTabClick('policy')}
                    >
                        정책
                    </button>
                    <button
                        className={activeTab === 'reviews' ? styles.active : ''}
                        onClick={() => handleTabClick('reviews')}
                    >
                        리뷰
                    </button>
                </div>
            </div>

            <div ref={introRef} className={styles.hotelInfo}>
                <div className={styles.hotelDetails}>
                    <div className={styles.hotelTitle}>파라다이스 호텔 부산</div>
                    <div className={styles.hotelSubtitle}>Paradise Hotel Busan</div>
                    <div className={styles.stars}>★★★★★</div>
                    <div className={styles.facilities}>
                        <div className={styles.serviceInfo}>시설/서비스 요약 정보</div>
                    </div>
                    <div className={styles.facilities}>
                        <span className={styles.facility}>실내 수영장</span>
                        <span className={styles.facility}>사우나</span>
                        <span className={styles.facility}>피트니스</span>
                        <span className={styles.facility}>공항 셔틀</span>
                    </div>
                    <div className={styles.ratingContainer}>
                        <span className={styles.ratingBadge}>★ {averageScore}</span>
                        <span className={styles.reviewCount}>리뷰 {reviews.length}개</span>
                    </div>
                </div>
                <div>
                    <h3>지도 위치</h3>
                    <div className={styles.mapPreviewBox}>

                        {/* 1) 지도 섹션 백엔드 테스트용추가*/}
                        <section className={styles.mapSection}>
                            <div
                                ref={mapRef}
                                className={styles.mapContainer}
                            />
                            <div className={styles.mapAddress}>
                                해운대구 해운대해변로 296, 부산광역시, 부산광역시, 612-010<br />
                                <a
                                    className={styles.mapLink}
                                    href="https://www.google.com/maps?q=해운대구 해운대해변로 296"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    지도에서 보기
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <div className={styles.divider}></div>

            <div ref={roomsRef} className={styles.roomInfo}>객실 정보</div>
            <div className={styles.roomFilters}>
                <div className={styles.dateBox}>
                    <label className={styles.dateLabel}>입실일</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setDateRange([date, endDate])}
                        dateFormat="M월 d일"
                        locale={ko}
                        placeholderText="입실일"
                        className={styles.dateInput}
                    />
                </div>
                <div className={styles.dateBox}>
                    <label className={styles.dateLabel}>퇴실일</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setDateRange([startDate, date])}
                        dateFormat="M월 d일"
                        locale={ko}
                        placeholderText="퇴실일"
                        className={styles.dateInput}
                    />
                </div>
                <div className={styles.dateBox}>
                    <label className={styles.dateLabel}>인원 수</label>
                    <input
                        type="number"
                        min="1"
                        placeholder="1"
                        className={styles.dateInput}
                    />
                </div>
            </div>

            <div className={styles.rooms}>
                {rooms.map(room => (
                    <div key={room.id} className={styles.roomCard}>
                        <div
                            className={styles.img}
                            style={{ backgroundImage: `url(${room.image})` }}
                        ></div>
                        <div className={styles.roomContent}>
                            <div className={styles.roomName}>
                                {room.name}
                            </div>
                            <div className={styles.roomSpecs}>
                                {room.specs.map((spec, idx) => (
                                    <div key={idx}>- {spec}</div>
                                ))}
                            </div>
                            <div className={styles.priceBox}>
                                <div className={styles.price}>₩{room.price.toLocaleString()}</div>
                                <div className={styles.totalPrice}>총 요금: ₩{Math.round(room.price * 1.18).toLocaleString()}</div>
                                <div className={styles.taxNote}>세금 및 수수료 포함</div>
                            </div>

                            <button className={styles.reserveBtn}>예약하기</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.divider}></div>

            <h3 ref={policyRef} className={styles.policyHeader}>요금 및 정책</h3>
            <ul className={styles.policyList}>
                <li>취소 시 취소료: 무료</li>
                <li>어린이(12세 이하) 무료 투숙</li>
                <li>반려동물 동반 불가</li>
                <li>보증금: KRW 150,000 (체크인 시 결제)</li>
            </ul>

            <div className={styles.divider}></div>

            <div ref={reviewsRef} className={styles.reviews}>
                <div className={styles.reviewsHeader}>
                    <div className={styles.reviewsScore}>{averageScore}<span>/10</span></div>
                    <div className={styles.reviewsSub}>리뷰 수 {reviews.length}개</div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <label htmlFor="score">별점 : 10 /</label>
                    <select
                        id="score"
                        value={newScore}
                        onChange={(e) => setNewScore(Number(e.target.value))}
                        style={{ marginLeft: "0.5rem", padding: "4px" }}
                    >
                        {Array.from({ length: 11 }, (_, i) => (
                            <option key={i} value={i}>{i}점</option>
                        ))}
                    </select>
                </div>
                <textarea
                    className={styles.reviewInput}
                    placeholder="리뷰를 작성하세요"
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                />



                <button className={styles.reserveBtn} onClick={handleAddReview}>등록하기</button>

                {(showAllReviews ? reviews : reviews.slice(0, 3)).map(r => (
                    <div key={r.id} className={styles.review}>
                        <p>{r.content}</p>
                        <div className={styles.reviewMeta}>{r.user} · {r.date}</div>
                    </div>
                ))}

                {reviews.length > 3 && (
                    <button className={styles.btnMore} onClick={() => setShowAllReviews(!showAllReviews)}>
                        {showAllReviews ? "접기" : "더보기"}
                    </button>
                )}
            </div>

            {/* Footer */}
            <footer>
                <div className="footer-top">
                    <div className="footer-section">
                        <div className="footer-logo">Stay Manager</div>
                    </div>

                    <div className="footer-right">
                        <div className="footer-section">
                            <h4>Topic</h4>
                            <ul>
                                <li>Page</li>
                                <li>Page</li>
                                <li>Page</li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4>Topic</h4>
                            <ul>
                                <li>Page</li>
                                <li>Page</li>
                                <li>Page</li>
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

export default ReservationPage;