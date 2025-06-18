import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../features/userSlice';
import styles from '../css/LoginPage.module.css';
import { useToast } from '@chakra-ui/react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, Input, useDisclosure, Text, HStack, Box
} from '@chakra-ui/react';

// 이미지
import instargram from '../assets/icon/instargram.jpg';
import facebook from '../assets/icon/facebook.jpg';
import twitter from '../assets/icon/twitter.jpg';

const LoginPage = () => {
  const [loginID, setLoginID] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState('id');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [foundId, setFoundId] = useState('');
  const [findError, setFindError] = useState('');

  const {
    isOpen: isPwOpen, onOpen: onPwOpen, onClose: onPwClose
  } = useDisclosure();

  const [pwLoginID, setPwLoginID] = useState('');
  const [pwPhone, setPwPhone] = useState('');
  const [pwCode, setPwCode] = useState('');
  const [pwVerified, setPwVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('loginID', loginID);
    formData.append('loginPassword', loginPassword);

    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        credentials: 'include',
      });

      if (res.ok) {
        // 로그인 성공 후 사용자 정보 요청
        const userRes = await fetch('http://localhost:8080/api/userinfo', {
          method: 'GET',
          credentials: 'include',
        });

        if (!userRes.ok) throw new Error('사용자 정보 조회 실패');

        const userData = await userRes.json();

        dispatch(
          setUserInfo({
            username: userData.name,
            email: userData.email,
            loginID: userData.loginID,
            punNumber: userData.punNumber,
          })
        );

        navigate('/'); // 홈으로 이동
      } else {
        toast({
          title: "로그인 실패",
          description: "아이디 또는 비밀번호가 일치하지 않습니다.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "서버 오류",
        description: "로그인 중 오류가 발생했습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Link to="/">🔴 Stay Manager</Link>
        </div>
      </header>
      {/* Header */}

      <div className={styles.loginContainer}>
        <h1>로그인</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="userId" className={styles.label}>아이디</label>
            <input className={styles.input}
              type="text"
              id="userId"
              name="loginID"
              placeholder="아이디 입력 (6~20자)"
              required
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>비밀번호</label>
            <input className={styles.input}
              type="password"
              id="password"
              name="loginPassword"
              placeholder="비밀번호 입력 (8자리 이상)"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button}>로그인</button>
        </form>

        <div className={styles.links}>
          <Link to="/signupPage">회원가입</Link> /
          <Link
            as="button"
            onClick={() => {
              setActiveTab('id');
              onOpen();
            }}
          >
            아이디 찾기
          </Link> /
          <Link
            as="button"
            onClick={() => {
              setActiveTab('pw');
              onOpen();  // 모달 열기
            }}
          >
            비밀번호 찾기
          </Link>
        </div>
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

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent borderRadius="xl" boxShadow="xl" px={7} py={6}>
          <ModalHeader textAlign="center" fontSize="xl" fontWeight="bold">
            아이디 / 비밀번호 찾기
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {/* 탭 */}
            <HStack justify="center" mb={6} spacing={10} borderBottom="1px solid #e2e8f0">
              {['id', 'pw'].map((tab) => (
                <Text
                  key={tab}
                  fontSize="md"
                  fontWeight={activeTab === tab ? 'bold' : 'normal'}
                  color={activeTab === tab ? 'blue.500' : 'gray.400'}
                  borderBottom={activeTab === tab ? '2px solid #3182CE' : 'none'}
                  pb="8px"
                  cursor="pointer"
                  transition="all 0.2s"
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'id') {
                      setIsVerified(false);
                      setFoundId('');
                      setFindError('');
                    } else {
                      setPwVerified(false);
                      setResetSuccess('');
                    }
                  }}
                >
                  {tab === 'id' ? '아이디 찾기' : '비밀번호 찾기'}
                </Text>
              ))}
            </HStack>

            {/* 아이디 찾기 탭 */}
            {activeTab === 'id' && (
              <>
                <Input
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  mb={3}
                  bg="gray.50"
                  borderRadius="md"
                  py={2}
                  px={3}
                  focusBorderColor="blue.300"
                  _placeholder={{ color: 'gray.400' }}
                />
                <Input
                  placeholder="전화번호 (하이픈 없이)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  mb={3}
                  bg="gray.50"
                  borderRadius="md"
                  py={2}
                  px={3}
                  focusBorderColor="blue.300"
                  _placeholder={{ color: 'gray.400' }}
                />
                <Button
                  size="sm"
                  colorScheme="blue"
                  boxShadow="sm"
                  onClick={async () => {
                    await fetch('http://localhost:8080/api/auth/request-sms', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phoneNumber: phone }),
                    });
                    toast({ title: '인증번호 전송 완료', status: 'success', duration: 3000 });
                  }}
                  mb={2}
                  w="100%"
                >
                  인증번호 전송
                </Button>

                <Input
                  placeholder="인증번호 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  mb={2}
                  bg="gray.50"
                  borderRadius="md"
                  py={2}
                  px={3}
                  focusBorderColor="blue.300"
                  _placeholder={{ color: 'gray.400' }}
                />
                <Button
                  size="sm"
                  colorScheme="green"
                  w="100%"
                  onClick={async () => {
                    const res = await fetch('http://localhost:8080/api/auth/verify-sms', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phoneNumber: phone, code }),
                    });
                    if (res.ok) {
                      setIsVerified(true);
                      toast({ title: '인증 성공', status: 'success', duration: 3000 });
                    }
                  }}
                >
                  인증 확인
                </Button>

                {isVerified && (
                  <Button
                    mt={3}
                    w="100%"
                    colorScheme="blue"
                    onClick={async () => {
                      const res = await fetch(`http://localhost:8080/api/find-id-by-phone?name=${name}&phone=${phone}`);
                      if (res.ok) {
                        const id = await res.text();
                        setFoundId(id);
                      } else {
                        setFindError('일치하는 사용자가 없습니다.');
                      }
                    }}
                  >
                    아이디 찾기
                  </Button>
                )}

                {foundId && (
                  <Text mt={3} color="green.500" textAlign="center" fontWeight="bold">
                    ✔️ 아이디: <strong>{foundId}</strong>
                  </Text>
                )}
                {findError && (
                  <Text mt={3} color="red.500" textAlign="center">
                    {findError}
                  </Text>
                )}
              </>
            )}

            {/* 비밀번호 찾기 탭 */}
            {activeTab === 'pw' && (
              <>
                <Input
                  placeholder="아이디"
                  value={pwLoginID}
                  onChange={(e) => setPwLoginID(e.target.value)}
                  mb={3}
                  bg="gray.50"
                  borderRadius="md"
                  py={2}
                  px={3}
                  focusBorderColor="blue.300"
                  _placeholder={{ color: 'gray.400' }}
                />
                <Input
                  placeholder="전화번호 (하이픈 없이)"
                  value={pwPhone}
                  onChange={(e) => setPwPhone(e.target.value)}
                  mb={3}
                  bg="gray.50"
                  borderRadius="md"
                  py={2}
                  px={3}
                  focusBorderColor="blue.300"
                  _placeholder={{ color: 'gray.400' }}
                />
                <Button
                  size="sm"
                  colorScheme="blue"
                  boxShadow="sm"
                  onClick={async () => {
                    await fetch('http://localhost:8080/api/auth/request-sms', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phoneNumber: pwPhone }),
                    });
                    toast({ title: '인증번호 전송 완료', status: 'success', duration: 3000 });
                  }}
                  mb={2}
                  w="100%"
                >
                  인증번호 전송
                </Button>

                <Input
                  placeholder="인증번호 입력"
                  value={pwCode}
                  onChange={(e) => setPwCode(e.target.value)}
                  mb={2}
                  bg="gray.50"
                  borderRadius="md"
                  py={2}
                  px={3}
                  focusBorderColor="blue.300"
                  _placeholder={{ color: 'gray.400' }}
                />
                <Button
                  size="sm"
                  colorScheme="green"
                  w="100%"
                  onClick={async () => {
                    const res = await fetch('http://localhost:8080/api/auth/verify-sms', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phoneNumber: pwPhone, code: pwCode }),
                    });
                    if (res.ok) {
                      const verifyRes = await fetch(
                        `http://localhost:8080/api/find-password?loginID=${pwLoginID}&phone=${pwPhone}`
                      );
                      if (verifyRes.ok) {
                        setPwVerified(true);
                        toast({ title: '인증 성공', status: 'success', duration: 3000 });
                      }
                    }
                  }}
                >
                  인증 확인
                </Button>

                {pwVerified && (
                  <>
                    <Input
                      type="password"
                      placeholder="새 비밀번호"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      mt={3}
                      mb={2}
                      bg="gray.50"
                      borderRadius="md"
                      py={2}
                      px={3}
                      focusBorderColor="blue.300"
                    />
                    <Input
                      type="password"
                      placeholder="비밀번호 확인"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      mb={3}
                      bg="gray.50"
                      borderRadius="md"
                      py={2}
                      px={3}
                      focusBorderColor="blue.300"
                    />
                    <Button
                      w="100%"
                      colorScheme="blue"
                      onClick={async () => {
                        if (newPassword !== confirmPassword) {
                          toast({ title: '비밀번호 불일치', status: 'error' });
                          return;
                        }
                        const res = await fetch('http://localhost:8080/api/reset-password', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ loginID: pwLoginID, newPassword }),
                        });
                        if (res.ok) {
                          setResetSuccess('비밀번호가 성공적으로 변경되었습니다!');
                          toast({ title: '비밀번호 변경 완료', status: 'success' });
                        }
                      }}
                    >
                      비밀번호 재설정
                    </Button>
                    {resetSuccess && (
                      <Text mt={3} color="green.500" textAlign="center">
                        {resetSuccess}
                      </Text>
                    )}

                    <Box mt={4} fontSize="sm" color="gray.500">
                      <Text>🔒 비밀번호 설정 조건</Text>
                      <Text>• 8자 이상 20자 이하</Text>
                      <Text>• 아이디 포함 불가</Text>
                      <Text>• 특수문자 포함</Text>
                      <Text>• 영문 + 숫자 조합</Text>
                    </Box>
                  </>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>


  );
};

export default LoginPage;