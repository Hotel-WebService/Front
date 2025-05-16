import React, { useState } from 'react';
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


const ReservationPage = () => {

    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [activeTab, setActiveTab] = useState(null);

    const handleTabClick = (tab, scrollOffset) => {
        setActiveTab(tab);
        window.scrollBy({
            top: scrollOffset,
            behavior: 'smooth'
        });
    };

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
                <div className={styles.big}><img style={{ backgroundImage: `url(${paradise1})` }} /></div>
                <div className={styles.thumb1}></div>
                <div className={styles.thumb2}></div>
                <div className={styles.thumb3}></div>
                <div className={styles.thumb4}>
                    <div className={styles.more}>+124</div>
                </div>
            </section>

            <div className={styles.sectionTabs}>
                <div className={styles.sectionTabs}>
                    <button
                        className={activeTab === 'intro' ? styles.active : ''}
                        onClick={() => handleTabClick('intro', 100)}
                    >
                        소개
                    </button>
                    <button
                        className={activeTab === 'rooms' ? styles.active : ''}
                        onClick={() => handleTabClick('rooms', 350)}
                    >
                        객실
                    </button>
                    <button
                        className={activeTab === 'policy' ? styles.active : ''}
                        onClick={() => handleTabClick('policy', 1600)}
                    >
                        정책
                    </button>
                    <button
                        className={activeTab === 'reviews' ? styles.active : ''}
                        onClick={() => handleTabClick('reviews', 2200)}
                    >
                        리뷰
                    </button>
                </div>
            </div>

            <div className={styles.hotelInfo}>
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
                        <span className={styles.ratingBadge}>★ 9.7</span>
                        <span className={styles.reviewCount}>리뷰 28개</span>
                    </div>
                </div>
                <div className={styles.mapPreviewBox}>
                    <iframe
                        title="지도"
                        src="https://maps.google.com/maps?q=해운대구 해운대해변로 296&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className={styles.mapIframe}
                        loading="lazy"
                    ></iframe>
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
                </div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.roomInfo}>객실 정보</div>
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
                {[1, 2, 3].map((_, idx) => (
                    <div key={idx} className={styles.roomCard}>
                        <div className={styles.img}></div>
                        <div className={styles.roomContent}>
                            <div className={styles.roomName}>
                                디럭스 더블룸, 시내 전망 <span>(Main Building)</span>
                            </div>
                            <div className={styles.roomSpecs}>
                                - 32㎡<br />- 더블베드 1개<br />- 2인 투숙 가능<br />- 조식 포함
                            </div>
                            <div className={styles.roomPrice}>₩{525000 + idx * 50000}</div>
                            <button className={styles.reserveBtn}>예약하기</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.divider}></div>

            <h3 className={styles.policyHeader}>요금 및 정책</h3>
            <ul className={styles.policyList}>
                <li>취소 시 취소료: 무료</li>
                <li>어린이(12세 이하) 무료 투숙</li>
                <li>반려동물 동반 불가</li>
                <li>보증금: KRW 150,000 (체크인 시 결제)</li>
            </ul>

            <div className={styles.divider}></div>

            <div className={styles.reviews}>
                <div className={styles.reviewsHeader}>
                    <div className={styles.reviewsScore}>9.7<span>/10</span></div>
                    <div className={styles.reviewsSub}>리뷰 수 27개</div>
                </div>
                <div className={styles.review}>
                    <p>10/10 최고예요</p>
                    <div className={styles.reviewMeta}>NickName · 2025/04/23</div>
                </div>
                <button className={styles.btnMore}>더보기</button>
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