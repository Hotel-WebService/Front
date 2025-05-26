import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo, updateUserInfo } from '../features/userSlice';
import { setSortOption, setFilters, toggleService } from '../features/filterSlice';
import { setDestination, setDates, setPeople } from '../features/searchSlice';
import { toggleLike as toggleLikeAction } from '../features/likedHotelsSlice';
import styles from '../css/ListPage.module.css';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import HotelList from './HotelList'; // 백엔드 추가

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
  const { destination, startDate, endDate, people } = useSelector(state => state.search);
  const sortOption = useSelector(state => state.filter.sortOption);
  const filters = useSelector(state => state.filter.filters);
  const likedHotels = useSelector(state => state.likedHotels);
  const [likedHotelIds, setLikedHotelIds] = useState([]);

  const { dateRange } = useSelector(state => state.reservation);
  const user = useSelector(state => state.user);

  // 소스 추가: 호텔 DB 정보 저장
  const [hotelsinfo, setHotelsinfo] = useState([]);
  // 소스 추가: 객실(방) DB 정보 저장
  const [room, setRoom] = useState([]);

  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = useState(2); // 최초 2개만 보이기

  // 호텔 정보 가져오기 (누락된 부분)
  useEffect(() => {
    fetch('http://localhost:8080/api/hotels', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('fetch hotels failed');
        return res.json();
      })
      .then(list => setHotelsinfo(list)) // ✅ 여기!
      .catch(console.error);
  }, []);

  // 소스 추가: DB에서 객실(방) 목록 불러오기
  useEffect(() => {
    fetch('http://localhost:8080/api/rooms', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('fetch rooms failed');
        return res.json();
      })
      .then(list => setRoom(list))    // room에 저장
      .catch(console.error);
  }, []);

  const mappedHotels = hotelsinfo.map(hotel => ({
    id: hotel.hotelID,
    name: hotel.hotelName,
    location: hotel.address,
    rating: '9.0', // rating은 없는 경우 임의로 지정하거나 별도 API 필요
    discount: '0%', // 할인 없으면 0%, 실제 할인율 있으면 계산
    pricePerNight: room.find(r => r.hotelID === hotel.hotelID)?.price
      ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
      : '가격정보없음',
    total: room.find(r => r.hotelID === hotel.hotelID)?.price
      ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
      : '가격정보없음',
    liked: false,
    images: [paradise1, paradise2, paradise3], // DB에 이미지 없으면 샘플 이미지
    facilities: [
      '호텔',
      '수영장',
      '조식제공',
      hotel.parking_lot ? '주차시설' : null,
      // ...필요하면 더 추가
    ].filter(Boolean)
  }));

  console.log('매핑된 호텔 정보:', mappedHotels);

  const toggleLocalLike = (id) => {
    setHotelsinfo(prev =>
      prev.map(item =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const filteredHotels = [...mappedHotels].filter(hotel => {
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

  const handleLike = async (hotel) => {
    try {
      const res = await fetch(`http://localhost:8080/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hotelId: hotel.id })
      });
      if (res.ok) {
        setLikedHotelIds(prev => [...prev, hotel.id]);
      }
    } catch (err) {
      console.error('찜 추가 실패:', err);
    }
  };

  const handleUnlike = async (hotelId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/likes/${hotelId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setLikedHotelIds(prev => prev.filter(id => id !== hotelId));
      }
    } catch (err) {
      console.error('찜 해제 실패:', err);
    }
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

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 2); // 2개씩 추가
    console.log('매핑된 호텔 정보:', mappedHotels);
    console.log('🔍 filters:', filters);
    console.log('📌 filteredHotels.length:', filteredHotels.length);
    console.log('📌 sortedHotels.length:', sortedHotels.length);
    console.log('📌 visibleCount:', visibleCount);
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
          value={destination}
          onChange={(e) => dispatch(setDestination(e.target.value))}
          placeholder="목적지"
          className={styles.input}
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
          value={people}
          min={1}
          onChange={(e) => dispatch(setPeople(Number(e.target.value)))}
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



          {sortedHotels.slice(0, visibleCount).map(item => {
            const isLiked = likedHotels.some(h => h.id === item.id);
            return (
              <div key={item.id} className={styles.cardWrapper}>
                <Link to={`/reservation/${item.id}`} className={styles.cardLink}>
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
                            <img className={styles.cardImg} src={imgSrc} alt={`호텔 이미지 ${index + 1}`} />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardTop}>
                        <h3 className={styles.hotelName}>{item.name}</h3>
                        <button
                          className={styles.btnSchedule}
                          style={{ backgroundColor: isLiked ? '#40c9c9' : '#ccc' }}
                          onClick={(e) => {
                            e.preventDefault(); // 페이지 이동 막기
                            handleLike(item);  // Redux 상태 업데이트
                          }}
                        >
                          {isLiked ? '찜해제' : '찜하기'}
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
                </Link>
              </div>
            );
          })}
          {visibleCount < sortedHotels.length && (
            <button className={styles.loadMore} onClick={handleLoadMore}>
              더보기
            </button>
          )}

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