import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserInfo } from "../features/userSlice"; // 경로는 프로젝트 구조에 따라
import styles from "../css/MyPage.module.css";
import Modal from "react-modal";
import html2canvas from "html2canvas";

// 이미지
import h1 from "../assets/h1.jpg";
import instargram from "../assets/icon/instargram.jpg";
import facebook from "../assets/icon/facebook.jpg";
import twitter from "../assets/icon/twitter.jpg";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [editableUser, setEditableUser] = useState({
    username: "",
    email: "",
    loginPassword: "",
    punNumber: "",
  });

  const getRoomImagePath = (hotelId, roomId) => {
    try {
      // hotelId, roomId가 문자열이면 정수 변환
      return require(`../assets/hotel${hotelId}/room${roomId}.jpg`);
    } catch (e) {
      // 해당 이미지가 없으면 기본 이미지 반환
      return h1;
    }
  };

  // 백엔드 임의 결제 내역 팝업창
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] =
    useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // 결제내역 모달 열기 함수
  const openPaymentDetailModal = (payment) => {
    setSelectedPayment({ ...payment, user });
    setIsPaymentDetailModalOpen(true);
  };

  const closePaymentDetailModal = () => {
    setIsPaymentDetailModalOpen(false);
    setSelectedPayment(null);
  };

  useEffect(() => {
    setEditableUser({
      username: user.username,
      email: user.email,
      loginPassword: "",
      punNumber: user.punNumber,
    });
  }, [user]);

  useEffect(() => {
    console.log("📌 현재 사용자 ID:", user.userID); // 이미 있는 로그

    if (!user.userID) return;

    fetch(`http://localhost:8080/api/payment/user/${user.userID}/details`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("결제 내역 불러오기 실패");
        return res.json();
      })
      .then((data) => {
        console.log("🔍 전체 응답 구조:", JSON.stringify(data, null, 2));
        setPayments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("결제 내역 오류:", err);
        setPayments([]);
      });
  }, [user.userID]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  Modal.setAppElement("#root");

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();
  const reservationRef = useRef(null);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  const [payments, setPayments] = useState([]);

  const closeShareModal = () => setIsShareModalOpen(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null); // 어떤 예약을 취소할지 저장

  // 백엔드 예약취소 가능여부확인
  const isCancelable = (checkInDate, checkOutDate) => {
    // checkInDate, checkOutDate가 yyyy-MM-dd 또는 yyyy-MM-ddTHH:mm:ss 형태일 수 있음

    const today = new Date();
    const inDate = new Date(checkInDate?.slice(0, 10));
    const outDate = new Date(checkOutDate?.slice(0, 10));
    // 오늘이 체크인 날짜 "이전"에만 취소 가능
    return today < inDate;
  };

  const checkOutNextDayAction = async (roomID, checkOutDate) => {
    // 오늘이 체크아웃 다음날(혹은 그 이후)라면 서버로 요청
    const today = new Date();
    const checkOut = new Date(checkOutDate);
    const nextDay = new Date(checkOut);
    nextDay.setDate(checkOut.getDate() + 1);
    // 만약 오늘 >= 체크아웃 다음날이면
    if (today >= nextDay) {
      await fetch(`http://localhost:8080/api/room-quantity/checkout-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomID, date: checkOutDate }), // date는 체크아웃 날짜!
      });
    }
  };

  // 삭제 함수
  const handleCancel = async (
    paymentId,
    roomID,
    checkInDate,
    reservationID
  ) => {
    if (!reservationID) {
      alert("예약 ID가 없습니다.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/reservation/${reservationID}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("삭제 실패");
      // UI 등 후처리
      setPayments((prev) => prev.filter((p) => p.paymentID !== paymentId));

      alert("예약이 취소되었습니다.");
    } catch (err) {
      alert("예약 취소 중 오류가 발생했습니다.");
    }
  };

  // 모달 캡쳐 복사 기능
  const handleCaptureAndCopy = async () => {
    try {
      const canvas = await html2canvas(reservationRef.current, {
        useCORS: true, // 외부 이미지 대응
        scale: 2, // 고화질
      });

      canvas.toBlob(async (blob) => {
        if (navigator.clipboard && blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            alert("이미지가 클립보드에 복사되었습니다!");
          } catch (err) {
            alert("복사 실패: 보안 정책 또는 브라우저 제한일 수 있습니다.");
            console.error(err);
          }
        } else {
          alert("클립보드 API를 지원하지 않는 브라우저입니다.");
        }
      });
    } catch (err) {
      console.error("캡처 실패:", err);
      alert("예약 정보를 캡처하는 데 실패했습니다.");
    }
  };

  // 모달 캡쳐영역 미리보기
  const generatePreview = async () => {
    try {
      const canvas = await html2canvas(reservationRef.current, {
        useCORS: true,
        scale: 2,
      });
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewImage(dataUrl);
    } catch (err) {
      console.error("미리보기 캡처 실패:", err);
    }
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
    generatePreview(); // 모달 열릴 때 미리보기 생성
  };

  // 1) 마운트 시 사용자 정보 가져오기 백엔드추가
  useEffect(() => {
    fetch("http://localhost:8080/api/userinfo", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("세션 정보 불러오기 실패");
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
        setIsAuthenticated(false);
      });
  }, [dispatch]);

  // 2) input 값 바뀔 때마다 상태 업데이트, 백엔드수정
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  // 3) 수정하기 버튼 눌렀을 때 백엔드에 PUT, 백엔드 수정
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/api/userinfo", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editableUser.username,
        email: editableUser.email,
        loginPassword: editableUser.loginPassword,
        punNumber: editableUser.punNumber,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          alert("회원정보가 수정되었습니다.");
          dispatch(setUserInfo(editableUser)); // 최신값으로 다시 Redux에 반영
        } else {
          alert("수정에 실패했습니다.");
        }
      });
  };

  // 백엔드 로그아웃 추가
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      navigate("/"); // 로그아웃 후 홈으로
    } catch (e) {
      console.error("로그아웃 실패", e);
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
          <a>{user.username}님</a>
          <a href="/myPage">MyPage</a>
          <a href="/savedPage">찜 목록</a>
          <Link to="/" onClick={handleLogout} className={styles.logoutLink}>
            로그아웃
          </Link>
        </div>
      </header>
      {/* Header */}

      <section className={styles.welcome}>
        <h1 className={styles.h2}>MyPage</h1>
        <div className={styles.hello}>
          <h4 className={styles.h4}>{user.username}님, 환영합니다.</h4>
        </div>
      </section>

      <div className={styles.divider}></div>

      <h2 className={styles.h2}>나의 예약현황</h2>

      {payments.filter((pay) => pay.payment_status === "Y").length === 0 ? (
        <p className={styles.noReservation}>결제된 예약이 없습니다.</p>
      ) : (
        payments
          .filter((pay) => pay.payment_status === "Y")
          .map((pay) => (
            <div key={pay.paymentID} className={styles.reservationWrapper}>
              <div
                className={styles.reservationCard}
                ref={reservationRef}
                onClick={() => navigate(`/reservationPage/${pay.hotelID}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={getRoomImagePath(pay.hotelID, pay.roomID)}
                  alt="방 이미지"
                />
                <div className={styles.reservationInfo}>
                  <div className={styles.sb}>
                    <h3 className={styles.hotelName}>{pay.hotelName}</h3>
                    <p className={styles.reserverName}>
                      예약자: {user.username}
                    </p>
                  </div>
                  <div className={styles.sb}>
                    <p className={styles.roomName}>객실명: {pay.roomName}</p>
                    <p className={styles.payDate}>
                      결제일자: {pay.pay_date?.slice(0, 10)}
                    </p>
                  </div>
                  <div className={styles.sb}>
                    <p>결제수단: {pay.payment_method}</p>
                    <p>결제상태: {pay.payment_status}</p>
                  </div>
                  <div className={styles.sb}>
                    <p>결제 금액: ₩{Number(pay.amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className={styles.cardButtons}>
                <button onClick={openShareModal}>공유하기</button>
                <button onClick={() => openPaymentDetailModal(pay)}>
                  결제내역
                </button>
                <button
                  onClick={() => {
                    setCancelTarget({
                      paymentID: pay.paymentID,
                      roomID: pay.roomID,
                      checkInDate: pay.check_in_date,
                      reservationID: pay.reservationID,
                    });
                    setIsConfirmModalOpen(true);
                  }}
                  disabled={
                    !isCancelable(pay.check_in_date, pay.check_out_date)
                  }
                  style={{
                    opacity: isCancelable(pay.check_in_date, pay.check_out_date)
                      ? 1
                      : 0.5,
                    cursor: isCancelable(pay.check_in_date, pay.check_out_date)
                      ? "pointer"
                      : "not-allowed",
                  }}
                >
                  예약취소
                </button>
              </div>
            </div>
          ))
      )}

      <div className={styles.divider}></div>

      <h2 className={styles.h2}>회원정보</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.halfGroup}>
          <label>
            이름
            <input
              type="text"
              name="name"
              value={editableUser.username}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>
            이메일
            <input
              type="email"
              name="email"
              value={editableUser.email}
              onChange={handleChange}
              className="full-width"
            />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>
            아이디
            <input
              type="text"
              name="loginID"
              value={user.loginID}
              onChange={handleChange}
              className="full-width"
            />
          </label>
        </div>

        <div className={styles.halfGroup}>
          <label>
            비밀번호
            {isPasswordEditing ? (
              <input
                type="password"
                name="loginPassword"
                value={editableUser.loginPassword}
                onChange={handleChange}
                className="full-width"
              />
            ) : (
              <input
                type="text"
                value="******"
                className="full-width"
                readOnly
                onFocus={() => setIsPasswordEditing(true)} // 클릭하면 진짜 input으로 전환
              />
            )}
          </label>
        </div>

        <div className={styles.inlineGroup}>
          <div className={styles.halfGroup}>
            <label>
              전화번호
              <input
                type="text"
                name="punNumber"
                value={editableUser.punNumber}
                onChange={handleChange}
                className="full-width"
              />
            </label>
          </div>

          <button type="submit" className={styles.submitBtn}>
            수정하기
          </button>
        </div>
      </form>

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
        isOpen={isShareModalOpen}
        onRequestClose={closeShareModal}
        contentLabel="공유 모달"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>공유하기</h2>
        {previewImage && (
          <div className={styles.previewBox}>
            <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              캡처 미리보기
            </p>
            <img
              src={previewImage}
              alt="예약정보 미리보기"
              className={styles.previewImage}
            />
          </div>
        )}
        <button onClick={handleCaptureAndCopy} className={styles.copyBtn}>
          예약정보 캡처해서 복사
        </button>
        <button onClick={closeShareModal} className={styles.closeBtn}>
          닫기
        </button>
      </Modal>

      <Modal
        isOpen={isPaymentDetailModalOpen}
        onRequestClose={closePaymentDetailModal}
        contentLabel="결제 내역"
        className={styles.paymentModal}
        overlayClassName={styles.overlay}
      >
        <h2>결제 상세 내역</h2>
        {selectedPayment && (
          <div className={styles.paymentDetailBox}>
            <p>
              <b>예약자:</b> {user.username}
            </p>
            <p>
              <b>이메일:</b> {user.email}
            </p>
            <p>
              <b>번호:</b> {user.punNumber}
            </p>
            <p>
              <b>호텔명:</b> {selectedPayment.hotelName}
            </p>
            <p>
              <b>객실명:</b> {selectedPayment.roomName}
            </p>
            <p>
              <b>결제금액:</b> ₩
              {Number(selectedPayment.amount).toLocaleString()}
            </p>
            <p>
              <b>결제수단:</b> {selectedPayment.payment_method}
            </p>
            <p>
              <b>결제상태:</b> {selectedPayment.payment_status}
            </p>
            <p>
              <b>결제일자:</b> {selectedPayment.pay_date?.slice(0, 10)}
            </p>
            <p>
              <b>체크인:</b> {selectedPayment.check_in_date}
            </p>
            <p>
              <b>체크아웃:</b> {selectedPayment.check_out_date}
            </p>
            {/* 필요시 paymentID 등 추가 가능 */}
          </div>
        )}
        <button onClick={closePaymentDetailModal} className={styles.closeBtn}>
          닫기
        </button>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onRequestClose={() => setIsConfirmModalOpen(false)}
        contentLabel="예약 취소 확인"
        className={styles.confirmModal}
        overlayClassName={styles.overlay}
      >
        <h3 style={{ fontSize: "1.1rem" }}>예약을 취소하시겠습니까?</h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.2rem",
          }}
        >
          <button
            className={styles.confirmBtn}
            onClick={() => {
              handleCancel(
                cancelTarget.paymentID,
                cancelTarget.roomID,
                cancelTarget.checkInDate,
                cancelTarget.reservationID
              );
              setIsConfirmModalOpen(false);
            }}
          >
            확인
          </button>
          <button
            className={styles.cancelBtn}
            onClick={() => setIsConfirmModalOpen(false)}
          >
            취소
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MyPage;
