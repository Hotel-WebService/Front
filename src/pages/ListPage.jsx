import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo, updateUserInfo } from '../features/userSlice';
import { setSortOption, setFilters, toggleService } from '../features/filterSlice';
import { setDestination, setDates, setPeople } from '../features/searchSlice';
import styles from '../css/ListPage.module.css';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { setLikedHotels } from '../features/likedHotelsSlice';

// 이미지
import search from '../assets/icon/search.jpg';
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
  const listRef = useRef(null);
  const [inputDestination, setInputDestination] = useState("");

  const { dateRange } = useSelector(state => state.reservation);
  const user = useSelector(state => state.user);
  const isAuthenticated = !!user.userID;


  const [hotelsinfo, setHotelsinfo] = useState([]);
  const [room, setRoom] = useState([]);

  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = useState(5); // 최초 5개만 보이기

  // 호텔 정보 가져오기 (누락된 부분)
  useEffect(() => {
    fetch('http://localhost:8080/api/hotels', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('fetch hotels failed');
        return res.json();
      })
      .then(list => setHotelsinfo(list))
      .catch(console.error);
  }, []);

  // 소스 추가: DB에서 객실(방) 목록 불러오기
  useEffect(() => {
    fetch('http://localhost:8080/api/rooms', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('fetch rooms failed');
        return res.json();
      })
      .then(list => setRoom(list))
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

    // 호텔 이미지 자동 매핑 함수
    const getHotelImageList = (hotelId, count = 5) => {
      const images = [];
      for (let i = 1; i <= count; i++) {
        try {
          // jpg 또는 png로도 가능
          const img = require(`../assets/hotel${hotelId}/hotel${i}.jpg`);
          images.push(img);
        } catch (e) {
          // 이미지가 없으면 placeholder
          images.push('https://placehold.co/400x300?text=No+Image');
        }
      }
      return images;
    };

    return {
      id: hotel.hotelID,
      name: hotel.hotelName,
      location: hotel.address,
      rating: averageRating,
      discount: '0%',
      pricePerNight: room.find(r => r.hotelID === hotel.hotelID)?.price
        ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
        : '가격정보없음',
      total: room.find(r => r.hotelID === hotel.hotelID)?.price
        ? `₩${room.find(r => r.hotelID === hotel.hotelID).price.toLocaleString()}`
        : '가격정보없음',
      liked: false,
      images: getHotelImageList(hotel.hotelID, 5),
      facilities: hotel.facilities
        ? hotel.facilities.split(',').map(f => f.trim())
        : [],
      star: hotel.star,
    };
  });

  console.log('매핑된 호텔 정보:', mappedHotels);

  // 찜 목록 불러오기
  const fetchUserLikes = async () => {
    if (!user.userID) return;
    const res = await fetch(`http://localhost:8080/api/likes?userID=${user.userID}`, {
      credentials: "include"
    });
    const likeList = await res.json();
    console.log('likeList:', likeList);
    if (Array.isArray(likeList)) {
      dispatch(setLikedHotels(likeList.map(like => Number(like.hotelID)))); // hotelID로!
    } else {
      dispatch(setLikedHotels([]));
    }
  };

  // 찜 불러오기 초기화
  useEffect(() => {
    fetchUserLikes();
  }, [user.userID]);

  const handleInputChange = (e) => {
    setInputDestination(e.target.value);
  };

  const handleSearch = () => {
    dispatch(setDestination(inputDestination));
    fetchHotels(inputDestination);
  };

  const fetchHotels = (dest) => {
    setSearchTriggeredDestination(dest); // 검색 트리거용 목적지 설정
  };

  const handleLike = async (hotel) => {
    if (!user.userID) return alert("로그인이 필요합니다!");
    const isLiked = likedHotels.includes(hotel.id);
    if (isLiked) {
      await fetch(`http://localhost:8080/api/likes?userID=${user.userID}&hotelID=${hotel.id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } else {
      await fetch(`http://localhost:8080/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userID: user.userID, hotelID: hotel.id }), // userID, hotelID로!
      });
    }
    await fetchUserLikes();
  };

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
            userID: data.userID,
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
    const navType = performance.getEntriesByType("navigation")[0].type;

    return () => {
      if (navType === "back_forward" || navType === "reload") {
        setSearchTriggeredDestination(null);
        dispatch(setDestination(""));
        dispatch(setFilters({
          services: [],
          star: null,
          price: 1000000,
        }));
      }
    };
  }, []);

  useEffect(() => {
    if (searchTriggeredDestination && listRef.current) {
      listRef.current.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }, [searchTriggeredDestination]);

  useEffect(() => {
    // destination이 있을 경우에만 최초 1회 검색 트리거
    if (destination && searchTriggeredDestination === null) {
      setSearchTriggeredDestination(destination);
      setInputDestination(destination);
    }
  }, [destination, searchTriggeredDestination]);

  // 백엔드 로그아웃 추가
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include',
      });
      dispatch(setLikedHotels([]));
      navigate('/');
    } catch (e) {
      console.error('로그아웃 실패', e);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5); // 5개씩 추가
    console.log('매핑된 호텔 정보:', mappedHotels);
    console.log('🔍 filters:', filters);
    console.log('📌 filteredHotels.length:', filteredHotels.length);
    console.log('📌 sortedHotels.length:', sortedHotels.length);
    console.log('📌 visibleCount:', visibleCount);
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

  return (
    <div>
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

      <div className={styles.searchBox}>
        <input
          type="text"
          value={inputDestination}
          onChange={handleInputChange}
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
          dayClassName={(date) => {
            if (!isFuture(date)) return '';
            if (isHoliday(date)) return 'holiday';
            if (isWeekend(date)) return 'weekend';
            return undefined;
          }}
        />

        <input
          type="number"
          value={people}
          min={1}
          onChange={(e) => dispatch(setPeople(Number(e.target.value)))}
          placeholder="인원 수"
          className={styles.peopleInput}
        />

        <button onClick={handleSearch}>
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
                <li><label><input type="checkbox" value="바" checked={filters.services.includes("바")} onChange={handleServiceChange} />바</label></li>
                <li><label><input type="checkbox" value="레스토랑" checked={filters.services.includes("레스토랑")} onChange={handleServiceChange} />레스토랑</label></li>
                <li><label><input type="checkbox" value="피트니스 센터" checked={filters.services.includes("피트니스 센터")} onChange={handleServiceChange} />피트니스 센터</label></li>
                <li><label><input type="checkbox" value="수영장" checked={filters.services.includes("수영장")} onChange={handleServiceChange} />수영장</label></li>
                <li><label><input type="checkbox" value="무료 주차" checked={filters.services.includes("무료 주차")} onChange={handleServiceChange} />무료 주차</label></li>
                <li><label><input type="checkbox" value="세탁 시설" checked={filters.services.includes("세탁 시설")} onChange={handleServiceChange} />세탁 시설</label></li>
                <li><label><input type="checkbox" value="공항 교통편" checked={filters.services.includes("공항 교통편")} onChange={handleServiceChange} />공항 교통편</label></li>
                <li><label><input type="checkbox" value="전기차 충전소" checked={filters.services.includes("전기차 충전소")} onChange={handleServiceChange} />전기차 충전소</label></li>
                <li><label><input type="checkbox" value="카지노" checked={filters.services.includes("카지노")} onChange={handleServiceChange} />카지노</label></li>
                <li><label><input type="checkbox" value="반려동물 동반 가능" checked={filters.services.includes("반려동물 동반 가능")} onChange={handleServiceChange} />반려동물 동반 가능</label></li>
                <li><label><input type="checkbox" value="매일 24시간 프런트데스크 운영" checked={filters.services.includes("매일 24시간 프런트데스크 운영")} onChange={handleServiceChange} />매일 24시간 프런트데스크 운영</label></li>
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
        <section ref={listRef} className={styles.content}>
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
            const isLiked = isAuthenticated && likedHotels.some(hid => Number(hid) === Number(item.id));
            return (
              <div key={item.id} className={styles.cardWrapper}>
                <Link to={`/reservationPage/${item.id}`} className={styles.cardLink}>
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
                          onClick={async (e) => {
                            e.preventDefault();
                            await handleLike(item);
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

export default ListPage;