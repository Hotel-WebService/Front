import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo, updateUserInfo } from '../features/userSlice';
import { setSortOption, setFilters, toggleService } from '../features/filterSlice';
import { setDateRange } from '../features/reservationSlice';
import styles from '../css/ListPage.module.css';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';


// 이미지
import search from '../assets/icon/search.jpg';
import grand1 from '../assets//hotel2/grand1.jpg';
import grand2 from '../assets/hotel2/grand2.jpg';
import grand3 from '../assets/hotel2/grand3.jpg';
import paradise1 from '../assets/hotel1/paradise1.jpg';
import paradise2 from '../assets/hotel1/paradise2.jpg';
import paradise3 from '../assets/hotel1/paradise3.jpg';
import signiel1 from '../assets/hotel3/signiel1.jpg';
import signiel2 from '../assets/hotel3/signiel2.jpg';
import signiel3 from '../assets/hotel3/signiel3.jpg';
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';


const ListPage = () => {
  const dispatch = useDispatch();
  const sortOption = useSelector(state => state.filter.sortOption);
  const filters = useSelector(state => state.filter.filters);
  const { dateRange } = useSelector(state => state.reservation);
  const user = useSelector(state => state.user);

  const [startDate, endDate] = Array.isArray(dateRange) ? dateRange : [null, null];
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([
    {
      id: 1,
      name: '파라다이스 호텔 부산',
      location: '해운대',
      rating: '9.7',
      discount: '14%',
      pricePerNight: '₩125,000',
      total: '₩875,000',
      liked: false,
      images: [
        paradise1,
        paradise2,
        paradise3,
      ],
      facilities: ['호텔', '수영장', '조식제공', '주차시설']
    },
    {
      id: 2,
      name: '시그니엘 부산',
      location: '해운대',
      rating: '9.5',
      discount: '8%',
      pricePerNight: '₩137,000',
      total: '₩1,050,000',
      liked: false,
      images: [
        signiel1,
        signiel2,
        signiel3,
      ],
      facilities: ['호텔', '조식제공', '주차시설']
    },
    {
      id: 3,
      name: '그랜드 조선 부산',
      location: '해운대',
      rating: '9.3',
      discount: '18%',
      pricePerNight: '₩155,000',
      total: '₩920,000',
      liked: false,
      images: [
        grand1,
        grand2,
        grand3,
      ],
      facilities: ['호텔', '수영장', '주차시설']
    },
  ]);

  const toggleLike = (id) => {
    setHotels(prev =>
      prev.map(item =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const filteredHotels = [...hotels].filter(hotel => {
    // 서비스 필터: 체크한 모든 서비스가 호텔의 facilities에 포함되어야 통과
    const serviceMatch = filters.services.every(service =>
      hotel.facilities.includes(service)
    );

    const starMatch = filters.star ? hotel.rating[0] === filters.star : true;

    const price = parseInt(hotel.pricePerNight.replace(/[₩,]/g, ''));
    const priceMatch = price <= filters.price;

    return serviceMatch && starMatch && priceMatch;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortOption === 'rating') {
      return parseFloat(b.rating) - parseFloat(a.rating);
    }
    if (sortOption === 'priceLow') {
      return parseInt(a.total.replace(/[₩,]/g, '')) - parseInt(b.total.replace(/[₩,]/g, ''));
    }
    if (sortOption === 'priceHigh') {
      return parseInt(b.total.replace(/[₩,]/g, '')) - parseInt(a.total.replace(/[₩,]/g, ''));
    }
    return 0;
  });

  const handleServiceChange = (e) => {
    dispatch(toggleService(e.target.value));
  };

  // 1) 마운트 시 사용자 정보 가져오기 백엔드추가
  useEffect(() => {
    fetch('http://localhost:8080/api/userinfo', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('세션 정보 불러오기 실패');
        return res.json();
      })
      .then((data) => {
        dispatch(
          setUserInfo({
            username: data.name,
            email: data.email,
            loginID: data.loginID,
            punNumber: data.punNumber,
          })
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }, [dispatch]);

  // 2) input 값 바뀔 때마다 상태 업데이트, 백엔드수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateUserInfo({ [name]: value }));
  };

  // 3) 수정하기 버튼 눌렀을 때 백엔드에 PUT, 백엔드 수정
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8080/api/userinfo', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.username,     // Redux에서 가져온 값
        email: user.email,
        loginPassword: '',       // 비밀번호 수정은 별도 처리 필요
        punNumber: user.punNumber,
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('정보 수정 실패');
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          alert('회원정보가 수정되었습니다.');
          // 필요하다면 Redux 상태 업데이트도 가능
        } else {
          alert('수정에 실패했습니다.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('수정 중 오류가 발생했습니다.');
      });
  };

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
          <Link to="/"
            onClick={handleLogout}
            className={styles.logoutLink}
          >로그아웃</Link>
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
          onChange={(update) => dispatch(setDateRange(update))}
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

      {/* Main */}
      <div className={styles.main}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.firstDivider}></div>
          <div className={styles.filterSection}>
            <h4>필터링</h4>
            <div className={styles.filteringTitle}>
              <h5>서비스</h5>
              <ul>
                <li><label><input type="checkbox" value="호텔" onChange={handleServiceChange} />호텔</label></li>
                <li><label><input type="checkbox" value="수영장" onChange={handleServiceChange} />수영장</label></li>
                <li><label><input type="checkbox" value="조식제공" onChange={handleServiceChange} />조식제공</label></li>
                <li><label><input type="checkbox" value="주차시설" onChange={handleServiceChange} />주차시설</label></li>
              </ul>
            </div>
            <div className={styles.divider}></div>
          </div>
          <div className={styles.filterSection}>
            <div className={styles.filteringTitle}>
              <h5>시설 등급</h5>
              <ul>
                <li><label><input type="radio" name="star" />5성</label></li>
                <li><label><input type="radio" name="star" />4성</label></li>
                <li><label><input type="radio" name="star" />3성</label></li>
                <li><label><input type="radio" name="star" />2성</label></li>
                <li><label><input type="radio" name="star" />1성</label></li>
              </ul>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.filterSection}>
            <div className={styles.filteringTitle}>
              <h5>가격 (1박당)</h5>
              <input type="range" min="0" max="1000000" step="10000" value={filters.price}
                onChange={(e) =>
                  dispatch(setFilters({ price: parseInt(e.target.value) }))
                }
              />
              <div className={styles.priceRange}>₩0 ~ ₩{filters.price.toLocaleString()}</div>
            </div>
          </div>
        </aside>

        {/* 호텔 카드 리스트 */}
        <section className={styles.content}>
          <div className={styles.sortSection}>
            <label htmlFor="sort" style={{ marginRight: '8px', fontWeight: '500' }}>정렬 기준:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => dispatch(setSortOption(e.target.value))}
              className={styles.sortSelect}
            >
              <option value="rating">평점순</option>
              <option value="priceLow">낮은 가격순</option>
              <option value="priceHigh">높은 가격순</option>
            </select>
          </div>

          {sortedHotels.length > 0 ? (
            sortedHotels.map(item => (
              <div key={item.id} className={styles.cardWrapper}>
                {/* 카드 내용 */}
              </div>
            ))
          ) : (
            <div className={styles.emptyBox}>
              조건에 맞는 호텔이 없습니다.
            </div>
          )}

          {sortedHotels.map(item => (
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
                    <button
                      className={styles.btnSchedule}
                      style={{ backgroundColor: item.liked ? '#40c9c9' : '#ccc' }}
                      onClick={() => toggleLike(item.id)}
                    >
                      {item.liked ? '찜해제' : '찜하기'}
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
                      <span className={styles.badgeDiscount}>-{item.discount}</span>
                      <p className={styles.perNight}>1박 요금 {item.pricePerNight}</p>
                      <p className={styles.total}>{item.total}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className={styles.loadMore}>더보기</button>
        </section>
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

export default ListPage;