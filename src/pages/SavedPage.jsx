import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from '../features/userSlice';
import styles from '../css/SavedPage.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { toggleLike } from '../features/likedHotelsSlice';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { setLikedHotels } from '../features/likedHotelsSlice';
import { useNavigate } from "react-router-dom";

// 이미지
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';

const SavedPage = () => {
    const user = useSelector(state => state.user);
    const isAuthenticated = !!user.userID;
    const dispatch = useDispatch();
    const likedHotels = useSelector(state => state.likedHotels);
    const [sortOrder, setSortOrder] = useState('oldest');
    const [hotelsinfo, setHotelsinfo] = useState([]);
    const navigate = useNavigate();
    const [hotelsLoading, setHotelsLoading] = useState(true);
    const [roomLoading, setRoomLoading] = useState(true);
    const [likesLoading, setLikesLoading] = useState(true);
    const [room, setRoom] = useState([]);

    // 사용자 정보 fetch (첫 마운트 시)
    useEffect(() => {
        if (!user.userID) {
            fetch('http://localhost:8080/api/userinfo', {
                method: 'GET',
                credentials: 'include',
            })
                .then(res => res.json())
                .then(data => {
                    dispatch(setUserInfo({
                        userID: data.userID,
                        username: data.name,
                        email: data.email,
                        loginID: data.loginID,
                        punNumber: data.punNumber,
                    }));
                })
                .catch(console.error);
        }
    }, [dispatch, user.username]);

    // 1. 전체 호텔 정보 가져오기
    useEffect(() => {
        setHotelsLoading(true);
        fetch('http://localhost:8080/api/hotels', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('fetch hotels failed');
                return res.json();
            })
            .then(list => { setHotelsinfo(list); setHotelsLoading(false); })
            .catch(err => { setHotelsLoading(false); console.error(err); });
    }, []);

    // 소스 추가: DB에서 객실(방) 목록 불러오기
    useEffect(() => {
        setRoomLoading(true);
        fetch('http://localhost:8080/api/rooms', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('fetch rooms failed');
                return res.json();
            })
            .then(list => { setRoom(list); setRoomLoading(false); })
            .catch(err => { setRoomLoading(false); console.error(err); });
    }, []);

    // 2. 로그인한 유저의 userID로 찜 목록(호텔ID 배열)만 불러오기
    useEffect(() => {
        if (!user.userID) return;
        setLikesLoading(true); // fetch 시작할 때 로딩!
        if (user.userID) {
            fetch(`http://localhost:8080/api/likes?userID=${user.userID}`, { credentials: 'include' })
                .then(res => res.json())
                .then(list => {
                    // list는 [{likeID, userID, hotelID, likedat}, ...]
                    // hotelID만 추출, 숫자 타입으로 강제
                    const idList = list.map(like => Number(like.hotelID));
                    dispatch(setLikedHotels(idList));
                    setLikesLoading(false); // fetch 끝나면 로딩 해제
                })
                .catch(error => {
                    setLikesLoading(false);
                    console.error(error);
                });
        } else {
            dispatch(setLikedHotels([]));
            setLikesLoading(false); // userID 없으면 즉시 로딩 해제
        }
    }, [user.userID, dispatch]);

    console.log('likedHotels:', likedHotels);
    console.log('hotelsinfo:', hotelsinfo);

    // ⭐️ 찜한 호텔만 hotelID로 필터!
    const savedHotelList = hotelsinfo.filter(hotel => likedHotels.includes(Number(hotel.hotelID)))

    // 3. (옵션) 호텔 정보 매핑 - 이미지 등 추가
    const mappedSavedHotels = savedHotelList.map(hotel => {
        const getHotelImageList = (hotelId, count = 5) => {
            const images = [];
            for (let i = 1; i <= count; i++) {
                try {
                    const img = require(`../assets/hotel${hotelId}/hotel${i}.jpg`);
                    images.push(img);
                } catch (e) {
                    images.push('https://placehold.co/400x300?text=No+Image');
                }
            }
            return images;
        };

        return {
            id: hotel.hotelID,
            name: hotel.hotelName,
            location: hotel.address,
            pricePerNight: room.find(r => r.hotelID === hotel.hotelID)?.price
                ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
                : '가격정보없음',
            total: room.find(r => r.hotelID === hotel.hotelID)?.price
                ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
                : '가격정보없음',
            facilities: [
                '호텔',
                '수영장',
                '조식제공',
                hotel.parking_lot ? '주차시설' : null,
            ].filter(Boolean),
            star: hotel.star,
            rating: hotel.rating || "0.0",
            images: getHotelImageList(hotel.hotelID, 5),
        };
    });

    const sortedLikedHotels =
        sortOrder === 'recent'
            ? [...mappedSavedHotels].slice().reverse()
            : [...mappedSavedHotels];

    // 백엔드 로그아웃 추가
    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8080/logout', {
                method: 'POST',
                credentials: 'include',
            });
            navigate('/');
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
                    {isAuthenticated ? (
                        <>
                            <a>{user.username}님</a>
                            <a href="/myPage">MyPage</a>
                            <a href="/savedPage">찜 목록</a>
                            <Link to="/"
                                onClick={handleLogout}
                                className={styles.logoutLink}
                            >로그아웃</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/signupPage">회원가입</Link>
                            <Link to="/login">로그인</Link>
                        </>
                    )}
                </div>
            </header>
            {/* Header */}

            {/* Main */}
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <div className={styles.title}>
                        <span className={styles.icon}>▶</span>
                        <span>찜한 목록</span>
                    </div>
                    <div className={styles.sortBox}>
                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className={styles.sortSelect}
                        >
                            <option value="recent">최신 순</option>
                            <option value="oldest">오래된 순</option>
                        </select>
                    </div>
                </div>

                <div className={styles.divider}></div>

                {(hotelsLoading || roomLoading || likesLoading) ? (
                    <div className={styles.emptyBox}>로딩 중...</div>
                ) : (
                    mappedSavedHotels.length === 0 ? (
                        <div className={styles.emptyBox}>찜한 호텔이 없습니다.</div>
                    ) : (
                        sortedLikedHotels.map(item => (
                            <Link to={`/reservationPage/${item.id}`} className={styles.cardLink} key={item.id}>
                                <div className={styles.cardWrapper}>
                                    <div className={styles.card}>
                                        <div className={styles.imageGroup}>
                                            <Swiper
                                                modules={[Navigation]}
                                                navigation
                                                spaceBetween={10}
                                                slidesPerView={1}
                                                className={styles.cardSlider}
                                            >
                                                {item.images.map((imgSrc, index) => (
                                                    <SwiperSlide key={index}>
                                                        <img
                                                            className={styles.cardImg}
                                                            src={imgSrc}
                                                            alt={`호텔 이미지 ${index + 1}`}
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </div>
                                        <div className={styles.cardInfo}>
                                            <div className={styles.cardTop}>
                                                <h3 className={styles.hotelName}>{item.name}</h3>
                                                <button
                                                    className={styles.unlikeBtn}
                                                    onClick={async (e) => {
                                                        e.preventDefault();       // 링크 이동 막기
                                                        e.stopPropagation();      // 이벤트 버블링 방지
                                                        try {
                                                            console.log(user.userID);
                                                            console.log(item.id);
                                                            await fetch(`http://localhost:8080/api/likes?userID=${user.userID}&hotelID=${item.id}`,
                                                                {
                                                                    method: "DELETE",
                                                                    credentials: "include",
                                                                });
                                                            dispatch(toggleLike(item.id));
                                                        } catch (err) {
                                                            alert("찜해제 실패. 다시 시도해 주세요.");
                                                            console.error(err);
                                                        }
                                                    }
                                                    }
                                                >
                                                    찜해제
                                                </button>
                                            </div>
                                            <div className={styles.cardMiddle}>
                                                <p className={styles.location}>{item.location}</p>
                                                <div className={styles.facilities}>
                                                    {item.facilities.map((f, i) => (
                                                        <span key={i}>{f}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={styles.cardBottom}>
                                                <div className={styles.rating}>★ {item.rating}</div>
                                                <div className={styles.priceInfo}>

                                                    <p className={styles.perNight}>1박 요금 {item.pricePerNight}</p>
                                                    <p className={styles.total}>{item.total}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )
                )}


                <div className={styles.divider}></div>

            </div>

            {/* Footer */}
            < footer >
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
                        <a href="https://www.instagram.com/stay_manager" target="_blank" rel="noopener noreferrer">
                            <div className="social-icon" style={{ backgroundImage: `url(${instargram})` }}></div>
                        </a>
                        <div className="social-icon" style={{ backgroundImage: `url(${twitter})` }}></div>
                    </div>
                    <p>© 2025 Stay Manager. All rights reserved.</p>
                </div>
            </footer>
            {/* Footer */}
        </div>
    );
};

export default SavedPage;