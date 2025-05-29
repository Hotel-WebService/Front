import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo, updateUserInfo } from '../features/userSlice';
import { setSortOption, setFilters, toggleService } from '../features/filterSlice';
import { setDestination, setDates, setPeople } from '../features/searchSlice';
import { toggleLike } from '../features/likedHotelsSlice';
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
import banyanTree1 from '../assets//hotel1/banyanTree1.jpg';
import banyanTree2 from '../assets/hotel1/banyanTree2.jpg';
import banyanTree3 from '../assets/hotel1/banyanTree3.jpg';
import courtyard1 from '../assets/hotel2/courtyard1.jpg';
import courtyard2 from '../assets/hotel2/courtyard2.jpg';
import courtyard3 from '../assets/hotel2/courtyard3.jpg';
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
  const [allReviews, setAllReviews] = useState([]);
  const [searchTriggeredDestination, setSearchTriggeredDestination] = useState(null);

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

  useEffect(() => {
    fetch('http://localhost:8080/api/reviews', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('리뷰 불러오기 실패');
        return res.json();
      })
      .then(setAllReviews)
      .catch(console.error);
  }, []);

  useEffect(() => {
    console.log('📌 likedHotels Redux 상태:', likedHotels);
  }, [likedHotels]);

  const mappedHotels = hotelsinfo.map(hotel => {
    // 해당 호텔의 리뷰만 필터링
    const hotelReviews = allReviews.filter(r => r.hotelID === hotel.hotelID);

    // 평균 점수 계산
    const averageRating = hotelReviews.length
      ? (hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length).toFixed(1)
      : "0.0";

    return {
      id: hotel.hotelID,
      name: hotel.hotelName,
      location: hotel.address,
      rating: averageRating, // ✅ 여기 실제 평균 평점으로 대체
      discount: '0%',
      pricePerNight: room.find(r => r.hotelID === hotel.hotelID)?.price
        ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
        : '가격정보없음',
      total: room.find(r => r.hotelID === hotel.hotelID)?.price
        ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
        : '가격정보없음',
      liked: false,
      images: [courtyard1, courtyard2, courtyard3],
      facilities: [
        '호텔',
        '수영장',
        '조식제공',
        hotel.parking_lot ? '주차시설' : null,
      ].filter(Boolean),
      star: hotel.star,
    };
  });

  console.log('매핑된 호텔 정보:', mappedHotels);

  const toggleLocalLike = (id) => {
    setHotelsinfo(prev =>
      prev.map(item =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const filteredHotels = [...mappedHotels].filter(hotel => {
    const serviceMatch = filters.services.every(service =>
      hotel.facilities.includes(service)
    );

    const starMatch = filters.star ? hotel.star === filters.star : true;

    const price = parseInt(hotel.pricePerNight.replace(/[₩,]/g, ''));
    const priceMatch = price <= filters.price;

    const destinationMatch = searchTriggeredDestination
      ? hotel.location.toLowerCase().includes(searchTriggeredDestination.trim().toLowerCase())
      : true;

    return serviceMatch && starMatch && priceMatch && destinationMatch;
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

  const handleSearchClick = () => {
    setSearchTriggeredDestination(destination);
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

  useEffect(() => {
    if (destination) {
      setSearchTriggeredDestination(destination);
    }
  }, [destination]);

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
          minDate={new Date()}
        />

        <input
          type="number"
          value={people}
          min={1}
          onChange={(e) => dispatch(setPeople(Number(e.target.value)))}
          placeholder="인원 수"
          className={styles.peopleInput}
        />

        <button onClick={handleSearchClick}>
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
                {[5, 4, 3, 2, 1].map(star => {
                  const label = `${star}성`;
                  return (
                    <li key={star}>
                      <label>
                        <input
                          type="radio"
                          name="star"
                          value={label}
                          checked={filters.star === label}
                          onChange={(e) => dispatch(setFilters({ star: e.target.value }))}
                        />
                        {label}
                      </label>
                    </li>
                  );
                })}
                <li>
                  <label>
                    <input
                      type="radio"
                      name="star"
                      value=""
                      checked={!filters.star}
                      onChange={() => dispatch(setFilters({ star: null }))}
                    />
                    전체
                  </label>
                </li>
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
                            e.preventDefault();
                            dispatch(toggleLike(item)); // ✅ Redux에 찜 상태 저장
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
                          <div className={styles.starVisual}>
                            {
                              (() => {
                                const starNum = parseInt(item.star?.replace('성', '') || '0', 10);
                                return '★'.repeat(starNum) + '☆'.repeat(5 - starNum);
                              })()
                            }
                          </div>
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