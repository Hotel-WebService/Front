import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setDestination, setDates, setPeople } from '../features/searchSlice';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';
import styles from '../css/ReservationPage.module.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { setUserInfo } from '../features/userSlice';

// 이미지
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';
import searchIcon from '../assets/icon/search.jpg';
import courtyard1 from '../assets/hotel2/courtyard1.jpg';
import courtyard2 from '../assets/hotel2/courtyard2.jpg';
import courtyard3 from '../assets/hotel2/courtyard3.jpg';
import courtyard4 from '../assets/hotel2/courtyard4.jpg';
import courtyard5 from '../assets/hotel2/courtyard5.jpg';
import courtyardRoom1 from '../assets/hotel2/courtyardRoom1.jpg';
import courtyardRoom2 from '../assets/hotel2/courtyardRoom2.jpg';
import courtyardRoom3 from '../assets/hotel2/courtyardRoom3.jpg';


const ReservationPage = () => {

    const user = useSelector(state => state.user); // 추가
    const search = useSelector(state => state.search);
    const dispatch = useDispatch();
    const { destination, startDate, endDate, people } = useSelector(state => state.search);
    const [dateRange, setDateRange] = useState([null, null]);
    const [activeTab, setActiveTab] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [hotel, setHotel] = useState(null); // 백엔드 호텔 정보 추가
    const { id } = useParams();               // 백엔드 호텔 정보 추가
    console.log("받은 hotel id:", id);
    const [rhotel, rsetHotel] = useState(null); // 백엔드 호텔 정보 추가
    const [rrooms, rsetRooms] = useState([]); // 백엔드 호텔 정보 추가
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    Modal.setAppElement('#root');

    const openGalleryModal = () => setIsGalleryOpen(true);
    const closeGalleryModal = () => setIsGalleryOpen(false);

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
        fetch(`http://localhost:8080/api/hotels/${id}`, { credentials: 'include' })
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
            hotelId: id, // 서버에서 hotelId가 필요하다면 포함
            user: user.username || "익명",
            date: new Date().toISOString().split("T")[0],
            content: `${newScore}/10 ${newReview}`,
            score: newScore
        };

        // 1. 로컬 상태 업데이트
        setReviews(prev => [review, ...prev]);
        setNewReview("");
        setNewScore(10);

        // 2. 서버에 저장 요청
        fetch("http://localhost:8080/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(review), // ✅ 배열이 아니라 하나의 리뷰 객체
        })
            .then(res => {
                if (!res.ok) throw new Error("리뷰 저장 실패");
                return res.json();
            })
            .then(data => {
                console.log("리뷰 저장 완료:", data);
            })
            .catch(err => {
                console.error("리뷰 저장 오류:", err);
            });
    };

    useEffect(() => {
        fetch(`http://localhost:8080/api/reviews/hotel/${id}`, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error("리뷰 불러오기 실패");
                return res.json();
            })
            .then(data => setReviews(data))
            .catch(console.error);
    }, [id]);

    const averageScore = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.length).toFixed(1)
        : "0.0";

    const rooms = rrooms.map(room => ({
        id: room.roomID,
        name: room.room_name,
        specs: [room.room_description],
        price: room.price,
        image: courtyardRoom1,
    }));

    const imageList = [
        courtyard1,
        courtyard2,
        courtyard3,
        courtyard4,
        courtyard5,
    ];

    const openBookingModal = (room) => {
        setSelectedRoom(room);
        setIsBookingModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsBookingModalOpen(false);
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
    };

    const handlePayment = () => {
        console.log("예약 정보 전송:", {
            room: selectedRoom,
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
        });
        alert("결제가 완료되었습니다!");
        closeBookingModal();
    };

    useEffect(() => {
        fetch('http://localhost:8080/api/userinfo', {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error('사용자 정보 불러오기 실패');
                return res.json();
            })
            .then(data => {
                dispatch(setUserInfo({
                    username: data.name,
                    email: data.email,
                    loginID: data.loginID,
                    punNumber: data.punNumber,
                }));
            })
            .catch(err => {
                console.error('사용자 정보 로드 실패:', err);
            });
    }, []);

    useEffect(() => {
        // 호텔 정보 불러오기 (API 엔드포인트는 예시)
        axios.get(`http://localhost:8080/api/hotels/${id}`).then(res => setHotel(res.data));
        // 방 정보도 id로 필터 (혹은 hotels에서 room을 받아와도 됨)
        axios.get(`http://localhost:8080/api/rooms/hotel/${id}`).then(res => rsetRooms(res.data));
    }, [id]);

    //  if (!rhotel) return <div>로딩중...</div>;

    return (
        <div>
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <Link to="/">🔴 Stay Manager</Link>
                </div>
                <div className="navLinks">
                    <a>{user.username}님</a>
                    <a href="/myPage">MyPage</a>
                    <a href="/savedPage">찜 목록</a>
                    <a href="/">로그아웃</a>
                </div>
            </header>
            {/* Header */}

            <div className={styles.searchBox}>
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => dispatch(setDestination(e.target.value))}
                />

                <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={([start, end]) => dispatch(setDates({ startDate: start, endDate: end }))}
                    isClearable={false}
                    placeholderText="날짜 선택"
                    dateFormat="yyyy/MM/dd"
                    locale={ko}

                />

                <input
                    type="number"
                    min="1"
                    value={people}
                    onChange={(e) => dispatch(setPeople(Number(e.target.value)))}
                />

                <button>
                    <img src={searchIcon} alt="검색" />
                </button>
            </div>

            <Link to="/listPage" className={styles.backLink}>+ 돌아가기</Link>

            <section className={styles.hero}>
                <div className={styles.big} style={{ backgroundImage: `url(${courtyard1})` }}></div>
                <div className={styles.thumb1} style={{ backgroundImage: `url(${courtyard2})` }}></div>
                <div className={styles.thumb2} style={{ backgroundImage: `url(${courtyard3})` }}></div>
                <div className={styles.thumb3} style={{ backgroundImage: `url(${courtyard4})` }}></div>
                <div className={styles.thumb4} style={{ backgroundImage: `url(${courtyard5})` }}>
                    <div className={styles.thumb4} style={{ backgroundImage: `url(${courtyard5})` }} onClick={openGalleryModal}>
                        <div className={styles.more}>+{imageList.length - 5}</div>
                    </div>
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
                    {hotel ? (
                        <div className={styles.hotelTitle}>{hotel.hotelName}</div>
                    ) : (
                        <div className={styles.hotelTitle}>호텔 정보를 불러오는 중...</div>
                    )}

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
                                {room.specs[0].split(',').map((line, idx) => (
                                    <div key={idx}>- {line.trim()}</div>
                                ))}
                            </div>
                            <div className={styles.priceBox}>
                                <div className={styles.price}>₩{room.price.toLocaleString()}</div>
                                <div className={styles.totalPrice}>총 요금: ₩{Math.round(room.price * 1.18).toLocaleString()}</div>
                                <div className={styles.taxNote}>세금 및 수수료 포함</div>
                            </div>

                            <button className={styles.reserveBtn} onClick={() => openBookingModal(room)}>
                                예약하기
                            </button>
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
                isOpen={isGalleryOpen}
                onRequestClose={closeGalleryModal}
                contentLabel="전체 사진 보기"
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                <h2>전체 사진</h2>
                <div className={styles.galleryGrid}>
                    {imageList.map((img, idx) => (
                        <img key={idx} src={img} alt={`호텔 사진 ${idx + 1}`} className={styles.galleryImg} />
                    ))}
                </div>
                <button onClick={closeGalleryModal} className={styles.closeBtn}>닫기</button>
            </Modal>

            <Modal
                isOpen={isBookingModalOpen}
                onRequestClose={closeBookingModal}
                contentLabel="객실 예약하기"
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                <h2>객실 예약</h2>
                {selectedRoom && (
                    <div className={styles.bookingRoomInfo}>
                        <div
                            className={styles.bookingImage}
                            style={{ backgroundImage: `url(${selectedRoom.image})` }}
                        ></div>

                        <div className={styles.roomName}>{selectedRoom.name}</div>

                        {/* ✅ 좌우 나란히 배치할 wrapper 추가 */}
                        <div className={styles.roomDetailsWrapper}>
                            {/* 왼쪽: 스펙 */}
                            <div className={styles.roomSpecs}>
                                {selectedRoom.specs[0].split(',').map((line, idx) => (
                                    <div key={idx}>- {line.trim()}</div>
                                ))}
                            </div>

                            {/* 오른쪽: 가격 */}
                            <div className={styles.priceBox}>
                                <div className={styles.modalPrice}>₩{selectedRoom.price.toLocaleString()}</div>
                                <div className={styles.totalPrice}>총 요금: ₩{Math.round(selectedRoom.price * 1.18).toLocaleString()}</div>
                                <div className={styles.taxNote}>세금 및 수수료 포함</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.bookingForm}>
                    <input
                        type="text"
                        placeholder="체크인 성함"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className={styles.inputField}
                    />
                    <input
                        type="email"
                        placeholder="이메일"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className={styles.inputField}
                    />
                    <input
                        type="tel"
                        placeholder="전화번호"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className={styles.inputField}
                    />
                    <button className={styles.paymentBtn} onClick={handlePayment}>결제하기</button>
                    <button className={styles.closeBtn} onClick={closeBookingModal}>닫기</button>
                </div>
            </Modal>
        </div>
    );
};

export default ReservationPage;