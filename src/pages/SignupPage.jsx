import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../css/SignupPage.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        loginID: '',
        loginPassword: '',
        passwordConfirm: '',
        punNumber: '',
        email: '',
        birthday: ''
    });

    const [idValid, setIdValid] = useState(null);
    const [idCheckResult, setIdCheckResult] = useState(null);
    const [pwValid, setPwValid] = useState(null);
    const [pwMatch, setPwMatch] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 아이디 검사 함수
    const validateID = (value) => {
        if (value.length >= 6 && value.length <= 20) {
            setIdValid(true);
        } else {
            setIdValid(false);
        }
    };

    // 비밀번호 검사 함수
    const validatePW = (value) => {
        if (value.length >= 8) {
            setPwValid(true);
        } else {
            setPwValid(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'loginID') {
            validateID(value);
        }

        if (name === 'loginPassword') {
            validatePW(value);
            setPwMatch(value === formData.passwordConfirm);
        }

        if (name === 'passwordConfirm') {
            setPwMatch(formData.loginPassword === value);
        }
    };

    const handleCheckID = async () => {
        if (formData.loginID.length < 6 || formData.loginID.length > 20) {
            alert('아이디는 6자 이상 20자 이하로 입력해주세요.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/check-id?loginID=${formData.loginID}`);
            const data = await res.json();

            if (res.ok) {
                if (data.available) {
                    setIdCheckResult(true);
                    alert('사용 가능한 아이디입니다.');
                } else {
                    setIdCheckResult(false);
                    alert('이미 사용 중인 아이디입니다.');
                }
            } else {
                alert('아이디 중복 확인 중 오류가 발생했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('서버 통신 오류로 중복 확인에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 아이디 길이 조건 검사 (6자 이상, 20자 이하)
        if (formData.loginID.length < 6 || formData.loginID.length > 20) {
            alert('아이디는 6자 이상 20자 이하로 입력해주세요.');
            return;
        }

        // 아이디 중복 확인
        if (idCheckResult !== true) {
            alert('아이디 중복 확인을 먼저 해주세요.');
            return;
        }

        // 비밀번호 길이 조건 검사
        if (formData.loginPassword.length < 8) {
            alert('비밀번호는 8자 이상으로 입력해주세요.');
            return;
        }

        // 1) 비밀번호 확인
        if (formData.loginPassword !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 2) 필수 동의 체크
        if (!agreed) {
            alert('개인정보 수집 및 이용에 동의하셔야 합니다.');
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    loginID: formData.loginID,
                    loginPassword: formData.loginPassword,
                    punNumber: formData.punNumber,
                    email: formData.email,
                    birthday: formData.birthday
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
                navigate('/login');
            } else {
                // 백엔드에서 { error: "메시지" } 형태로 내려오면 표시
                alert(data.error || '회원가입에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('서버와 통신 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.body}>
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <Link to="/">🔴 Stay Manager</Link>
                </div>
            </header>
            {/* Header */}

            <div className={styles.container}>
                <h1 className={styles.h1}>회원가입</h1>
                <p className={styles.subtitle}>회원님의 정보를 입력해주세요.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label}>이름
                        <input
                            type="text"
                            name="name"
                            placeholder="이름을 입력해주세요"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </label>

                    <div className={styles.idField}>
                        <label>아이디</label>
                        <div className={styles.dupCheck}>
                            <input
                                type="text"
                                name="loginID"
                                placeholder="아이디 입력 (6~20자)"
                                value={formData.loginID}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                            <button
                                type="button"
                                onClick={handleCheckID}
                                className={styles.button}
                            >
                                중복확인
                            </button>
                        </div>
                        {/* 메시지 표시 */}
                        {idCheckResult === true && (
                            <span className={styles.success}>사용 가능한 아이디입니다</span>
                        )}
                        {idCheckResult === false && (
                            <span className={styles.error}>이미 사용 중인 아이디입니다</span>
                        )}
                    </div>

                    <label className={styles.label}>비밀번호
                        <input
                            type="password"
                            name="loginPassword"
                            placeholder="비밀번호 입력 (8자 이상)"
                            value={formData.loginPassword}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                        {/* 유효성 메시지 조건부 렌더링 */}
                        {pwValid === false && (
                            <span className={styles.error}>사용할 수 없는 비밀번호입니다</span>
                        )}
                        {pwValid === true && (
                            <span className={styles.success}>사용할 수 있는 비밀번호입니다</span>
                        )}
                    </label>

                    <label className={styles.label}>비밀번호 확인
                        <input
                            type="password"
                            name="passwordConfirm"
                            placeholder="비밀번호 재입력"
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                        {pwMatch === false && (
                            <span className={styles.error}>비밀번호가 일치하지 않습니다</span>
                        )}
                        {pwMatch === true && (
                            <span className={styles.success}>비밀번호가 일치합니다</span>
                        )}
                    </label>

                    <label className={styles.label}>전화번호
                        <input
                            type="text"
                            name="punNumber"
                            placeholder="휴대폰 번호 입력 ('-' 제외)"
                            value={formData.punNumber}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </label>

                    <label className={styles.label}>이메일
                        <input
                            type="email"
                            name="email"
                            placeholder="이메일 주소 입력"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </label>

                    <label className={styles.label}>생일
                        <DatePicker
                            selected={formData.birthday ? new Date(formData.birthday) : null}
                            onChange={(date) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    birthday: date?.toISOString().split('T')[0] || '',
                                }))
                            }
                            dateFormat="yyyy-MM-dd"
                            placeholderText="생년월일 선택"
                            className={styles.input}
                            maxDate={new Date()}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            locale={ko}
                        />
                    </label>

                    <div className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            required
                        />
                        <span>개인정보 수집 및 이용에 대해 동의합니다.</span>
                    </div>

                    <button type="submit" className={`${styles.button} ${styles.submit}`}>가입하기</button>
                </form>
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

export default SignupPage;
