import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setDestination, setDates, setPeople } from "../features/searchSlice";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import styles from "../css/ReservationPage.module.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { setUserInfo } from "../features/userSlice";
import { useNavigate } from "react-router-dom";
import Holidays from "date-holidays"; 
import { setLikedHotels } from "../features/likedHotelsSlice"; 
// 이미지
import instargram from "../assets/icon/instargram.jpg";
import facebook from "../assets/icon/facebook.jpg";
import twitter from "../assets/icon/twitter.jpg";
import searchIcon from "../assets/icon/search.jpg";

const ReservationPage = () => {
    const user = useSelector((state) => state.user);
    const search = useSelector((state) => state.search);
    const dispatch = useDispatch();
    const { destination, startDate, endDate, people } = useSelector(
        (state) => state.search
    );
    const [dateRange, setDateRange] = useState([null, null]);
    const [activeTab, setActiveTab] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [hotel, setHotel] = useState(null);
    const { id } = useParams();
    console.log("받은 hotel id:", id);
    const [rhotel, rsetHotel] = useState(null);
    const [rrooms, rsetRooms] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const isAuthenticated = !!user.userID; // 0613
    const navigate = useNavigate(); // 0613

    const [bookingPeople, setBookingPeople] = useState(people); // 인원체크 추가

    const [selectedPG, setSelectedPG] = useState("kakaopay.TC0ONETIME"); // 결제 초기값, 백엔드추가

    const [myReservations, setMyReservations] = useState([]);
    const [selectedReservationID, setSelectedReservationID] = useState("");

    const [reviewslist, setReviewslist] = useState([]);

    const [roomAvailabilities, setRoomAvailabilities] = useState({}); // { roomID: 가능개수 }

    const [isAvailLoading, setIsAvailLoading] = useState(false);

    // 결제사(PG) 코드 목록
    const PG_CODES = [
        { label: "카카오페이", value: "kakaopay.TC0ONETIME" }, // 테스트용 코드
        { label: "헥토파이낸셜(신용카드)", value: "settle.portone1" },
        // 필요시 다른 결제사도 추가 가능
    ];

    const formatDate = (date) =>
        date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(date.getDate()).padStart(2, "0")}`
            : null;

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    Modal.setAppElement("#root");

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
            reviews: reviewsRef,
        }[tab];

        if (scrollToRef?.current) {
            scrollToRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const mapRef = useRef(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [newScore, setNewScore] = useState(10); // 기본값 10점

    const hd = new Holidays("KR");

    // 날짜 변경할 때 마다 방 이용여부 확인
    useEffect(() => {
        if (!startDate || !endDate || rrooms.length === 0) {
            setRoomAvailabilities({});
            setIsAvailLoading(false); // 초기화
            return;
        }
        setRoomAvailabilities({}); // ← 로딩 직전, 항상 초기화
        setIsAvailLoading(true);
        const fetchAvailabilities = async () => {
            setIsAvailLoading(true);
            const results = {};
            for (const room of rrooms) {
                try {
                    // *checkRoomAvailability는 이미 구현됨
                    const available = await checkRoomAvailability(
                        room.roomID,
                        formatDate(startDate)
                    );
                    results[room.roomID] = available;
                } catch (e) {
                    results[room.roomID] = 0; // 오류시 0으로 처리
                }
            }
            setRoomAvailabilities(results);
            setIsAvailLoading(false); // fetch 끝!
        };
        fetchAvailabilities();
    }, [startDate, endDate, rrooms]);

    // --- 2) 카카오 스크립트 한 번만 로드 ---
    useEffect(() => {
        if (window.kakao && window.kakao.maps) return;
        const script = document.createElement("script");
        script.src =
            "https://dapi.kakao.com/v2/maps/sdk.js?appkey=d14da4067c563de35ba14987b99bdb89&autoload=false";
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
    }, [hotel]); // hotel 바뀔 때도 재실행

    // --- 3) 호텔 정보 fetch ---
    useEffect(() => {
        fetch(`http://localhost:8080/api/hotels/${id}`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("호텔을 못 찾음");
                return res.json();
            })
            .then((data) => setHotel(data))
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
        if (!(window.kakao && window.kakao.maps && window.kakao.maps.LatLng)) {
            // 아직 로드 안 됐으면 그냥 종료(또는 재시도/메시지)
            return;
        }
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

    useEffect(() => {
        if (user.userID && id) {
            fetch(`http://localhost:8080/api/reservation/my?hotelID=${id}`, {
                credentials: "include",
            })
                .then((res) => {
                    if (!res.ok) {
                        // 상세 정보 찍기!
                        console.error("예약 목록 API 실패", res.status, res.statusText);
                        throw new Error("예약 목록 불러오기 실패");
                    }
                    return res.json();
                })
                .then((data) => setMyReservations(data))
                .catch((err) => {
                    // 에러 객체와 메시지 모두 출력
                    console.error("예약목록 불러오기 에러", err);
                });
        }
    }, [user.userID, id]);

    // 호텔별 리뷰 불러오기 (호텔 id가 바뀔 때마다)
    useEffect(() => {
        if (!id) return;
        fetch(`http://localhost:8080/api/reviews/hotel/${id}`, {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("리뷰 목록 불러오기 실패");
                return res.json();
            })
            .then((data) => setReviews(data))
            .catch((err) => {
                console.error("리뷰 목록 불러오기 에러:", err);
            });
    }, [id]);

    // ⭐ 리뷰 등록 함수 (예약ID 포함)
    const handleAddReview = () => {
        if (newReview.trim() === "") return;
        if (!selectedReservationID) {
            alert("리뷰를 작성할 예약을 선택하세요!");
            return;
        }

        const selectedReservation = myReservations.find(
            (r) => r.reservationID === Number(selectedReservationID)
        );
        if (!selectedReservation) {
            alert("예약 정보를 찾을 수 없습니다.");
            return;
        }

        const review = {
            hotelID: Number(id), // DB 컬럼에 맞춰서
            userID: user.userID,
            reservationID: selectedReservation.reservationID,
            rating: newScore,
            comment: newReview,
            // commentDate는 백엔드에서 자동 입력
        };

        console.log("저장할 리뷰 데이터:", review);

        fetch("http://localhost:8080/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(review),
        })
            .then((res) => {
                if (!res.ok) throw new Error("리뷰 저장 실패");
                return res.json();
            })
            .then((data) => {
                alert("리뷰가 등록되었습니다!");
                setNewReview("");
                setNewScore(10);
                setSelectedReservationID("");
                // 리뷰 새로고침
                fetch(`http://localhost:8080/api/reviews/hotel/${id}`, {
                    credentials: "include",
                })
                    .then((res) => res.json())
                    .then((data) => setReviews(data));
            })
            .catch((err) => {
                alert("리뷰 저장 오류: " + err.message);
            });
    };

    const averageScore = reviews.length
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
        : "0.0";

    const getRoomImagePath = (hotelId, roomId) => {
        try {
            // hotelId, roomId가 문자열이면 parseInt로 정수 변환
            return require(`../assets/hotel${hotelId}/room${roomId}.jpg`);
        } catch (e) {
            // 없는 이미지일 때 기본 이미지 반환
            return require("../assets/no-image.jpg");
        }
    };

    const rooms = rrooms.map((room) => ({
        id: room.roomID,
        name: room.room_name,
        specs: [room.room_description],
        price: room.price,
        image: getRoomImagePath(id, room.roomID),
        capacity: room.capacity,
    }));

    const getImageList = (hotelId, maxCount = 20) => {
        const images = [];
        for (let i = 1; i <= maxCount; i++) {
            try {
                const img = require(`../assets/hotel${hotelId}/hotel${i}.jpg`);
                images.push(img);
            } catch (e) {
                break; // 이미지가 없으면 반복 종료
            }
        }
        return images;
    };

    const imageList = getImageList(id, 5);

    const allGalleryImages = [
        ...getImageList(id, 5), // hero 이미지들
        ...rrooms.map((room) => getRoomImagePath(id, room.roomID)), // 객실 이미지들
    ];

    const openBookingModal = async (room) => {
        if (!startDate || !endDate) {
            alert("입실일/퇴실일을 선택하세요.");
            return;
        } else {
            const roomDate = formatDate(startDate);
            const available = await checkRoomAvailability(room.id, roomDate);
            setSelectedRoom(room);
            setIsBookingModalOpen(true);
            console.log("선택된 방 정보:", room);
        }
    };

    const closeBookingModal = () => {
        setIsBookingModalOpen(false);
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
    };

    // 2. 함수 추가
    function getTotalRoomPrice(roomPrice, startDate, endDate) {
        if (!startDate || !endDate) return 0;
        let total = 0;
        const day = new Date(startDate);
        const lastDay = new Date(endDate);

        while (day < lastDay) {
            //    const ymd = day.toISOString().slice(0, 10);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const isHoliday = hd.isHoliday(day);
            //holidays.includes(ymd);
            if (isWeekend || isHoliday) {
                total += Math.round(roomPrice * 1.1);
            } else {
                total += roomPrice;
            }
            day.setDate(day.getDate() + 1);
        }
        return total;
    }

    // 3. 숙박일수 표시/결제 금액 계산에 사용
    const totalAmount =
        selectedRoom && startDate && endDate
            ? getTotalRoomPrice(selectedRoom.price, startDate, endDate)
            : 0;

    const handlePayment = async () => {
        if (!user.userID) {
            alert("로그인이 필요합니다!");
            return;
        }
        if (!selectedRoom) {
            alert("객실을 선택하세요!");
            return;
        }
        if (!startDate || !endDate) {
            alert("입실일/퇴실일을 선택하세요.");
            return;
        }

        const ok = await checkRoomAvailability(
            selectedRoom.id,
            formatDate(startDate)
        );
        if (!ok) {
            alert("방이 모두 예약되었습니다!");
            return;
        }

        // [2] 입실일이 오늘보다 이전이면 예약 불가
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 시간 00시로 맞춰 비교
        if (startDate < today) {
            alert("입실일은 오늘 날짜 이후만 선택 가능합니다.");
            return;
        }
        // [3] 선택한 인원 > 객실 가용 인원

        if (
            people > selectedRoom.capacity ||
            bookingPeople > selectedRoom.capacity
        ) {
            alert(`이 객실의 최대 인원은 ${selectedRoom.capacity}명입니다.`);
            return;
        }

        if (!window.IMP) {
            alert("결제 모듈이 로드되지 않았습니다.");
            return;
        }
        window.IMP.init("imp83146667"); // 자신의 가맹점 식별코드로 변경

        window.IMP.request_pay(
            {
                pg: selectedPG, // 결제 PG사 (테스트는 'kcp.T0000' 등 가능)
                //      pg: "html5_inicis",
                pay_method: "card", // 결제수단
                merchant_uid: "mid_" + new Date().getTime(), // 주문번호
                name: "호텔 결제",
                amount: 100, // 결제금액 (테스트용)
                buyer_email: guestEmail,
                buyer_name: guestName,
                buyer_tel: guestPhone,
            },
            async function (rsp) {
                // rsp.success: true/false
                if (rsp.success) {
                    const ok = await reserveRoom(
                        selectedRoom.id,
                        formatDate(startDate),
                        1
                    );
                    if (!ok) {
                        alert(
                            "결제 성공했으나, 방이 모두 예약되었습니다!\n결제 환불 요청 바랍니다."
                        );
                        return;
                    }
                    fetch("http://localhost:8080/api/pay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ imp_uid: rsp.imp_uid }),
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            alert("결제 성공 및 검증 완료");
                            // data로 추가 처리 가능

                            handleReservationAndPayment();
                            closeBookingModal();
                        })
                        .catch(() => {
                            alert("결제 검증 실패");
                        });
                } else {
                    alert("결제가 취소되었거나 실패했습니다.");
                }
            }
        );
    };

    const handleReservationAndPayment = async () => {
        console.log("user 객체 구조:", user);

        // 1. 예약 데이터
        const reservationData = {
            userID: user.userID,
            roomID: selectedRoom.id,
            check_in_date: formatDate(startDate),
            check_out_date: formatDate(endDate),
            // status, reservationDate는 백엔드에서 자동
        };

        const amount = getTotalRoomPrice(selectedRoom.price, startDate, endDate);

        // 2. 결제 데이터
        const paymentData = {
            amount: selectedRoom.price,
            payment_method: selectedPG,
            payment_status: "Y",
            // pay_date는 백엔드에서 자동
        };

        // 3. 콘솔에 데이터 확인
        console.log("저장할 예약 데이터:", reservationData);
        // reservationData의 각 필드가 제대로 나오는지 확인
        console.log("저장할 결제 데이터:", paymentData);

        try {
            // 예약 저장 요청
            const res = await fetch("http://localhost:8080/api/reservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reservationData),
            });
            const reservation = await res.json();

            console.log("예약 저장 결과(응답):", reservation);

            // 결제 저장 요청
            const payRes = await fetch("http://localhost:8080/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...paymentData,
                    reservationID: reservation.reservationID,
                    userID: user.userID,
                }),
            });
            const paymentResult = await payRes.json();

            console.log("결제 저장 결과(응답):", paymentResult);

            alert("예약 및 결제 완료!");
            // 이후 이동/상태변경 등 추가 처리
        } catch (err) {
            alert("예약 또는 결제 저장에 실패했습니다.");
            console.error(err);
        }
    };

    useEffect(() => {
        fetch("http://localhost:8080/api/userinfo", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("사용자 정보 불러오기 실패");
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
                console.error("사용자 정보 로드 실패:", err);
            });
    }, []);

    useEffect(() => {
        // 호텔 정보 불러오기 (API 엔드포인트는 예시)
        axios
            .get(`http://localhost:8080/api/hotels/${id}`)
            .then((res) => setHotel(res.data));
        // 방 정보도 id로 필터 (혹은 hotels에서 room을 받아와도 됨)
        axios
            .get(`http://localhost:8080/api/rooms/hotel/${id}`)
            .then((res) => rsetRooms(res.data));
    }, [id]);

    //  if (!rhotel) return <div>로딩중...</div>;

    // 백엔드 로그아웃 추가 (0613 내용 전체수정)
    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8080/logout", {
                method: "POST",
                credentials: "include",
            });
            dispatch(setLikedHotels([]));
            navigate("/");
        } catch (e) {
            console.error("로그아웃 실패", e);
        }
    };

    // 결제 성공 후 실제 예약(재고 차감)
    const reserveRoom = async (roomID, date, count = 1) => {
        const res = await fetch(
            `http://localhost:8080/api/room-quantity/reserve?roomID=${roomID}&date=${date}&count=${count}`,
            { method: "POST", credentials: "include" }
        );
        if (!res.ok) return false;
        const ok = await res.json();
        return ok;
    };

    // 객실 재고만 조회 (방이 없으면 row 생성, reserved_count=0)
    const checkRoomAvailability = async (roomID, date) => {
        const res = await fetch(
            `http://localhost:8080/api/room-quantity?roomID=${roomID}&date=${date}`,
            { credentials: "include" }
        );
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("객실 재고 조회 실패");
        const q = await res.json();
        // DB 컬럼명: availableCount (백엔드 camelCase)
        return q.available_count ?? q.availableCount ?? null;
    };

    const holidays = [
        "2025-01-01",
        "2025-01-27",
        "2025-01-28",
        "2025-01-29",
        "2025-01-30",
        "2025-03-01",
        "2025-03-03",
        "2025-05-05",
        "2025-05-06",
        "2025-06-03",
        "2025-06-06",
        "2025-08-15",
        "2025-10-03",
        "2025-10-05",
        "2025-10-06",
        "2025-10-07",
        "2025-10-08",
        "2025-10-09",
        "2025-12-25",
    ];

    const isFuture = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 시간 제거
        return date > today;
    };

    const isHoliday = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formatted = `${year}-${month}-${day}`; // YYYY-MM-DD 형식
        return holidays.includes(formatted);
    };

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // 일요일(0), 토요일(6)
    };

    return (
        <div>
            {/* Header 0613 전체수정*/}
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
                            <Link to="/" onClick={handleLogout} className={styles.logoutLink}>
                                로그아웃
                            </Link>
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
                    value={destination}
                    onChange={(e) => dispatch(setDestination(e.target.value))}
                />

                <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={([start, end]) =>
                        dispatch(setDates({ startDate: start, endDate: end }))
                    }
                    isClearable={false}
                    placeholderText="날짜 선택"
                    dateFormat="yyyy/MM/dd"
                    locale={ko}
                    minDate={new Date()}
                    dayClassName={(date) => {
                        if (!isFuture(date)) return "";
                        if (isHoliday(date)) return "holiday";
                        if (isWeekend(date)) return "weekend";
                        return undefined;
                    }}
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

            <Link to="/listPage" className={styles.backLink}>
                + 돌아가기
            </Link>

            <section className={styles.hero}>
                <div
                    className={styles.big}
                    style={{ backgroundImage: `url(${imageList[0]})` }}
                ></div>
                <div
                    className={styles.thumb1}
                    style={{ backgroundImage: `url(${imageList[1]})` }}
                ></div>
                <div
                    className={styles.thumb2}
                    style={{ backgroundImage: `url(${imageList[2]})` }}
                ></div>
                <div
                    className={styles.thumb3}
                    style={{ backgroundImage: `url(${imageList[3]})` }}
                ></div>
                <div
                    className={styles.thumb4}
                    style={{ backgroundImage: `url(${imageList[4]})` }}
                >
                    <div
                        className={styles.thumb4}
                        style={{ backgroundImage: `url(${imageList[4]})` }}
                        onClick={openGalleryModal}
                    >
                        <div className={styles.more}>+{allGalleryImages.length - 5}</div>
                    </div>
                </div>
            </section>

            <div className={styles.sectionTabs}>
                <div className={styles.sectionTabs}>
                    <button
                        className={activeTab === "intro" ? styles.active : ""}
                        onClick={() => handleTabClick("intro")}
                    >
                        소개
                    </button>
                    <button
                        className={activeTab === "rooms" ? styles.active : ""}
                        onClick={() => handleTabClick("rooms")}
                    >
                        객실
                    </button>
                    <button
                        className={activeTab === "policy" ? styles.active : ""}
                        onClick={() => handleTabClick("policy")}
                    >
                        정책
                    </button>
                    <button
                        className={activeTab === "reviews" ? styles.active : ""}
                        onClick={() => handleTabClick("reviews")}
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

                    <div className={styles.starVisual}>
                        {(() => {
                            const starNum = parseInt(
                                hotel?.star.replace("성", "") || "0",
                                10
                            );
                            return "★".repeat(starNum) + "☆".repeat(5 - starNum);
                        })()}
                    </div>
                    <div className={styles.facilities}>
                        <div className={styles.serviceInfo}>시설/서비스 요약 정보</div>
                    </div>
                    {hotel?.facilities && (
                        <div className={styles.facilities}>
                            {hotel.facilities.split(",").map((f, i) => (
                                <span key={i} className={styles.facility}>
                                    {f.trim()}
                                </span>
                            ))}
                        </div>
                    )}
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
                            <div ref={mapRef} className={styles.mapContainer} />
                            <div className={styles.mapAddress}>
                                {hotel?.address} <br />
                                <a
                                    className={styles.mapLink}
                                    href={
                                        hotel
                                            ? `https://www.google.com/maps?q=${encodeURIComponent(
                                                hotel.address
                                            )}`
                                            : "#"
                                    }
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

            <div ref={roomsRef} className={styles.roomInfo}>
                객실 정보
            </div>
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
                        minDate={new Date()}
                        dayClassName={(date) => {
                            if (!isFuture(date)) return "";
                            if (isHoliday(date)) return "holiday";
                            if (isWeekend(date)) return "weekend";
                            return undefined;
                        }}
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
                        minDate={new Date()}
                        dayClassName={(date) => {
                            if (!isFuture(date)) return "";
                            if (isHoliday(date)) return "holiday";
                            if (isWeekend(date)) return "weekend";
                            return undefined;
                        }}
                    />
                </div>
                <div className={styles.dateBox}>
                    <label className={styles.dateLabel}>인원 수</label>
                    <input
                        type="number"
                        min="1"
                        value={bookingPeople}
                        onChange={(e) => setBookingPeople(Number(e.target.value))}
                        className={styles.dateInput}
                    />
                </div>
            </div>

            <div className={styles.rooms}>
                {rooms.map((room) => {
                    const available = roomAvailabilities[room.id];
                    return (
                        <div key={room.id} className={styles.roomCard}>
                            <div
                                className={styles.img}
                                style={{ backgroundImage: `url(${room.image})` }}
                            ></div>
                            <div className={styles.roomContent}>
                                <div className={styles.roomName}>{room.name}</div>
                                <div className={styles.roomSpecs}>
                                    {room.specs[0].split(",").map((line, idx) => (
                                        <div key={idx}>- {line.trim()}</div>
                                    ))}
                                </div>
                                <div className={styles.priceBox}>
                                    <div className={styles.price}>
                                        1박 요금: ₩{room.price.toLocaleString()}
                                    </div>
                                    <div className={styles.totalPrice}>
                                        총 요금: ₩
                                        {getTotalRoomPrice(
                                            room.price,
                                            startDate,
                                            endDate
                                        ).toLocaleString()}
                                    </div>
                                    <div className={styles.taxNote}>세금 및 수수료 포함</div>
                                </div>

                                {isAvailLoading ? (
                                    <div className={styles.loadingAvail}>
                                        예약 가능 여부 확인중...
                                    </div>
                                ) : available !== null &&
                                    typeof available === "number" &&
                                    available === 0 ? (
                                    <div className={styles.soldoutText}>
                                        해당 날짜에는 방이 모두 예약되었습니다
                                    </div>
                                ) : (
                                    <button
                                        className={styles.reserveBtn}
                                        onClick={() => openBookingModal(room)}
                                    >
                                        예약하기
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.divider}></div>

            <h3 ref={policyRef} className={styles.policyHeader}>
                요금 및 정책
            </h3>
            <ul className={styles.policyList}>
                <li>취소 시 취소료: 무료</li>
                <li>어린이(12세 이하) 무료 투숙</li>
                <li>반려동물 동반 불가</li>
                <li>보증금: KRW 150,000 (체크인 시 결제)</li>
            </ul>

            <div className={styles.divider}></div>

            <div ref={reviewsRef} className={styles.reviews}>
                <div className={styles.reviewsHeader}>
                    <div className={styles.reviewsScore}>
                        {averageScore}
                        <span>/10</span>
                    </div>
                    <div className={styles.reviewsSub}>리뷰 수 {reviews.length}개</div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <label htmlFor="score">별점 : 10 /</label>
                    <select
                        id="score"
                        value={newScore}
                        onChange={(e) => setNewScore(Number(e.target.value))}
                        style={{ marginLeft: "0.5rem", padding: "4px", width: "4rem" }}
                        className={styles.reservationID}
                    >
                        {Array.from({ length: 11 }, (_, i) => (
                            <option key={i} value={i}>
                                {i}점
                            </option>
                        ))}
                    </select>
                </div>
                {/* 예약 선택 드롭다운 */}
                <div style={{ marginTop: "1rem" }}>
                    <label htmlFor="reservationSelect">리뷰 쓸 예약 선택 : </label>
                    <select
                        id="reservationSelect"
                        value={selectedReservationID}
                        onChange={(e) => setSelectedReservationID(e.target.value)}
                        className={styles.reservationID}
                    >
                        <option value="">예약 선택</option>
                        {myReservations.map((res) => (
                            <option key={res.reservationID} value={res.reservationID}>
                                #{res.reservationID} - {res.check_in_date} ~{" "}
                                {res.check_out_date}
                            </option>
                        ))}
                    </select>
                </div>
                <textarea
                    className={styles.reviewInput}
                    placeholder="리뷰를 작성하세요"
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                />

                <button className={styles.reserveBtn} onClick={handleAddReview}>
                    등록하기
                </button>

                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((r) => (
                    <div key={r.reviewID} className={styles.review}>
                        <p>
                            {r.rating}/10 {r.comment}
                        </p>
                        <div className={styles.reviewMeta}>
                            UserID: {r.userID} ·{" "}
                            {r.commentDate && r.commentDate.split("T")[0]}
                        </div>
                    </div>
                ))}

                {reviews.length > 3 && (
                    <button
                        className={styles.btnMore}
                        onClick={() => setShowAllReviews(!showAllReviews)}
                    >
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
                        <div
                            className="social-icon"
                            style={{ backgroundImage: `url(${facebook})` }}
                        ></div>
                        <div
                            className="social-icon"
                            style={{ backgroundImage: `url(${instargram})` }}
                        ></div>
                        <div
                            className="social-icon"
                            style={{ backgroundImage: `url(${twitter})` }}
                        ></div>
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
                    {allGalleryImages.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`호텔 사진 ${idx + 1}`}
                            className={styles.galleryImg}
                        />
                    ))}
                </div>
                <button onClick={closeGalleryModal} className={styles.closeBtn}>
                    닫기
                </button>
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

                        <div className={styles.roomDetailsWrapper}>
                            {/* 왼쪽: 스펙 */}
                            <div className={styles.roomSpecs}>
                                {selectedRoom.specs[0].split(",").map((line, idx) => (
                                    <div key={idx}>- {line.trim()}</div>
                                ))}
                            </div>

                            {/* 오른쪽: 가격 */}
                            <div className={styles.priceBox}>
                                <div className={styles.modalPrice}>
                                    ₩{selectedRoom.price.toLocaleString()}
                                </div>
                                <div className={styles.totalPrice}>
                                    총 요금: ₩
                                    {getTotalRoomPrice(
                                        selectedRoom.price,
                                        startDate,
                                        endDate
                                    ).toLocaleString()}
                                </div>
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
                    {/* 결제사 선택 */}
                    <div className={styles.pgSelectBox}>
                        <label>결제수단 : </label>
                        <select
                            value={selectedPG}
                            onChange={(e) => setSelectedPG(e.target.value)}
                            className={styles.pgSelect}
                        >
                            {PG_CODES.map((pg) => (
                                <option key={pg.value} value={pg.value}>
                                    {pg.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className={styles.paymentBtn} onClick={handlePayment}>
                        결제하기
                    </button>
                    <button className={styles.closeBtn} onClick={closeBookingModal}>
                        닫기
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ReservationPage;
