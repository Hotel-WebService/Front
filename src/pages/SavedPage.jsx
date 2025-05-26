import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from '../features/userSlice';
import styles from '../css/SavedPage.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

// 이미지
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';
import grand1 from '../assets/hotel2/grand1.jpg';
import grand2 from '../assets/hotel2/grand2.jpg';
import grand3 from '../assets/hotel2/grand3.jpg';
import paradise1 from '../assets/hotel1/paradise1.jpg';
import paradise2 from '../assets/hotel1/paradise2.jpg';
import paradise3 from '../assets/hotel1/paradise3.jpg';
import signiel1 from '../assets/hotel3/signiel1.jpg';
import signiel2 from '../assets/hotel3/signiel2.jpg';
import signiel3 from '../assets/hotel3/signiel3.jpg';

const SavedPage = () => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const likedHotels = useSelector(state => state.likedHotels);
    const [savedHotels, setSavedHotels] = useState([]);
    
    // const [savedItems, setSavedItems] = useState([
    //     {
    //         id: 1,
    //         hotel: '파라다이스 호텔 부산',
    //         location: '해운대',
    //         rating: '9.7',
    //         discount: '14%',
    //         pricePerNight: '₩125,000',
    //         total: '₩875,000',
    //         liked: true,
    //         selected: false,
    //         images: [
    //             paradise1,
    //             paradise2,
    //             paradise3,
    //         ]
    //     },
    //     {
    //         id: 2,
    //         hotel: '시그니엘 부산',
    //         location: '해운대',
    //         rating: '9.5',
    //         discount: '8%',
    //         pricePerNight: '₩137,000',
    //         total: '₩1,050,000',
    //         liked: true,
    //         selected: false,
    //         images: [
    //             signiel1,
    //             signiel2,
    //             signiel3,
    //         ]
    //     },
    //     {
    //         id: 3,
    //         hotel: '그랜드 조선 부산',
    //         location: '해운대',
    //         rating: '9.3',
    //         discount: '18%',
    //         pricePerNight: '₩155,000',
    //         total: '₩920,000',
    //         liked: true,
    //         selected: false,
    //         images: [
    //             grand1,
    //             grand2,
    //             grand3,
    //         ]
    //     },
    // ]);

    useEffect(() => {
        if (!user.username) {
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
                .catch(err => console.error('유저 정보 로딩 실패:', err));
        }
    }, [dispatch, user.username]);

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/likes`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await res.json();
                setSavedHotels(data);  // 서버에서 hotel 정보 전체 내려준다는 가정
            } catch (err) {
                console.error('찜 목록 불러오기 실패:', err);
            }
        };

        fetchLikes();
    }, []);

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
                    <a href="/">로그아웃</a>
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
                    <button className={styles.filterBtn}>필터링 : 지역 - 부산</button>
                </div>

                <div className={styles.divider}></div>

                {likedHotels.length === 0 ? (
                    <div className={styles.emptyBox}>찜한 호텔이 없습니다.</div>
                ) : (
                    likedHotels.map(item => (
                        <div key={item.id} className={styles.cardWrapper}>
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
                                    </div>
                                    <div className={styles.cardMiddle}>
                                        <p className={styles.location}>{item.location}</p>
                                        <div className={styles.facilities}>
                                            {item.facilities?.map((f, i) => (
                                                <span key={i}>{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.cardBottom}>
                                        <div className={styles.rating}>★ {item.rating}</div>
                                        <div className={styles.priceInfo}>
                                            <span className={styles.badgeDiscount}>-{item.discount}</span>
                                            <p className={styles.perNight}>1박 요금 {item.pricePerNight}</p>
                                            <p className={styles.total}>{item.total}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}


                <div className={styles.divider}></div>

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

export default SavedPage;