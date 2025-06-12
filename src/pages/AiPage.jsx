import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Container,
  Text,
  VStack,
  Spinner,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import SeoulDistrictMap from "./SeoulDistrictMap";
import HotelRecommendModal from "./HotelRecommendModal";
import { useNavigate } from "react-router-dom";

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const animation = `${gradient} 10s ease infinite`;

// DB에서 필터링 가능한 질문
const dbQuestions = [
  {
    field: "district",
    question: "어느 지역(구/시)의 호텔을 찾으세요?",
    type: "district",
    options: [],
  },
  {
    field: "star",
    question: "호텔의 등급(성급)을 선택해 주세요.",
    type: "choice",
    options: ["2성급", "3성급", "4성급", "5성급"],
  },
  {
    field: "parking_lot",
    question: "주차장이 반드시 필요한가요?",
    type: "choice",
    options: ["필수", "상관없음"],
  },
  {
    field: "capacity",
    question: "몇 명이서 숙박하시나요?",
    type: "choice",
    options: ["1명", "2명", "3명", "4명", "5명 이상"],
  },
  {
    field: "price",
    question: "1박당 객실 가격대는 얼마가 적당한가요?",
    type: "choice",
    options: ["10만원 미만", "10~20만원", "20~40만원", "40만원 이상"],
  },
  {
    field: "check_in",
    question: "체크인 시간대에 제한이 있으신가요?",
    type: "choice",
    options: ["상관없음", "오후 3시 이후", "오후 6시 이후"],
  },
];

// 추상적(주관적) 질문 - ChatGPT에 전달
const aiQuestions = [
  {
    field: "theme",
    question: "호텔을 고를 때 가장 중요한 테마를 골라주세요",
    options: [
      "가족여행에 적합",
      "조용한 곳",
      "경치 좋은 곳",
      "힐링/휴식",
      "액티비티/레저",
      "로맨틱한 분위기",
    ],
  },
  {
    field: "mood",
    question: "선호하는 호텔의 분위기는 어떤가요?",
    options: [
      "모던/세련됨",
      "전통/고풍스러움",
      "감성/아늑함",
      "럭셔리/고급스러움",
    ],
  },
  {
    field: "special",
    question: "특별히 원하는 경험이나 서비스가 있으신가요?",
    options: [
      "조용한 독립 공간",
      "아이 동반 친화 시설",
      "스파/마사지",
      "루프탑/뷰 좋은 곳",
    ],
  },
];

const totalSteps = dbQuestions.length + aiQuestions.length;

const AiPage = () => {
  const [userId, setUserId] = useState(null); // 로그인 유저ID 상태
  const [step, setStep] = useState(0);
  const [dbAnswers, setDbAnswers] = useState({});
  const [aiAnswers, setAiAnswers] = useState({});
  const [hoverDistrict, setHoverDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [recommendResult, setRecommendResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 백엔드 모달 오픈
  const navigate = useNavigate(); // 백엔드 뒤로가기

  const boxHover = useColorModeValue("gray.100", "gray.700");
  const boxStyle = {
    p: 6,
    minH: "100px",
    borderRadius: "lg",
    border: "1px solid #ccc",
    boxShadow: "md",
    cursor: "pointer",
    fontSize: "xl",
    textAlign: "center",
    fontWeight: "semibold",
    _hover: { bg: boxHover },
  };

  // 1) 마운트 시 userID 가져오기
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
        setUserId(data.userID); // 실제 userID 키 맞춰주세요!
      })
      .catch((err) => {
        setUserId(null);
        console.error("로그인 정보 없음", err);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (field, value) => {
    if (dbQuestions.map((q) => q.field).includes(field)) {
      setDbAnswers((prev) => ({ ...prev, [field]: value }));
    } else {
      setAiAnswers((prev) => ({ ...prev, [field]: value }));
    }
    setStep((prev) => prev + 1);
  };

  const handleDistrict = (district) => {
    setDbAnswers((prev) => ({ ...prev, district }));
    setStep((prev) => prev + 1);
  };

  const handleRecommend = async () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 1. 상담 답변 저장(확실한 질문만)
    const dbSaveData = { userId };
    dbQuestions.forEach((q) => {
      dbSaveData[q.field] = dbAnswers[q.field] || "";
    });
    aiQuestions.forEach((q) => {
      dbSaveData[q.field] = aiAnswers[q.field] || "";
    });
    try {
      const res = await fetch("http://localhost:8080/api/consulting/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbSaveData),
      });
      if (!res.ok) throw new Error();
      console.log("🟢 상담 답변 저장 성공:", dbSaveData);
    } catch (e) {
      console.error("🔴 상담 답변 저장 실패", e, dbSaveData);
      alert("상담 답변 저장에 실패했습니다.");
      return;
    }

    // 2. **프론트에서 실제 DB 파라미터로 변환**
    const paramStar = dbAnswers.star
      ? dbAnswers.star.replace("급", "")
      : undefined;
    let paramParkingLot;
    if (dbAnswers.parking_lot === "필수") paramParkingLot = 1;
    // '상관없음'이면 undefined로 (파라미터 전송 X)
    let paramCapacity;
    if (dbAnswers.capacity) {
      paramCapacity = dbAnswers.capacity.includes("이상")
        ? 5
        : parseInt(dbAnswers.capacity);
    }
    let paramMinPrice, paramMaxPrice;
    if (dbAnswers.price) {
      if (dbAnswers.price.includes("미만")) {
        paramMaxPrice = parseInt(dbAnswers.price) * 10000;
      } else if (dbAnswers.price.includes("이상")) {
        paramMinPrice = parseInt(dbAnswers.price) * 10000;
      } else if (dbAnswers.price.includes("~")) {
        const [min, max] = dbAnswers.price.split("~").map((s) => parseInt(s));
        paramMinPrice = min * 10000;
        paramMaxPrice = max * 10000;
      }
    }

    // 3. **DB 파라미터 조립**
    const params = new URLSearchParams();
    params.append("city", "서울특별시");
    if (dbAnswers.district) params.append("district", dbAnswers.district);
    if (paramStar) params.append("star", paramStar);
    if (typeof paramParkingLot === "number")
      params.append("parking_lot", paramParkingLot);
    if (paramCapacity) params.append("capacity", paramCapacity);
    if (paramMinPrice) params.append("minPrice", paramMinPrice);
    if (paramMaxPrice) params.append("maxPrice", paramMaxPrice);
    if (dbAnswers.check_in) params.append("check_in", dbAnswers.check_in);

    let filteredHotels = [];
    try {
      console.log("🟡 DB 필터 쿼리 파라미터:", params.toString());
      const res = await fetch(
        `http://localhost:8080/api/hotels/filter?${params.toString()}`
      );
      if (res.ok) filteredHotels = await res.json();
      else throw new Error();
      console.log("🟢 DB 필터링 결과(후보 호텔 리스트):", filteredHotels);
    } catch (e) {
      console.error("🔴 DB 필터 오류:", e);
      alert("호텔 후보를 불러오지 못했습니다.");
      return;
    }
    try {
      const requestBody = {
        hotelCandidates: filteredHotels,
        ...aiAnswers,
      };
      console.log("🟠 AI 추천 요청 데이터 (ChatGPT에 전달):", requestBody);
      const aiRes = await fetch(
        "http://localhost:8080/api/hotels/ai-recommend",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
      if (!aiRes.ok) throw new Error();
      const result = await aiRes.json();
      console.log("🔵 AI 추천 결과:", result);
      setRecommendResult(result); // 1. 추천 결과 세팅
      setIsModalOpen(true); // 2. 모달창 오픈(팝업)
    } catch (e) {
      console.error("🔴 AI 추천 오류:", e);
      alert("AI 추천에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        bgGradient="linear(to-r, gray.300, gray.700, gray.500)"
        backgroundSize="300% 300%"
        animation={animation}
      >
        <Box display="flex" alignItems="center" gap={4}>
          <Spinner
            thickness="6px"
            speed="0.65s"
            emptyColor="gray.200"
            color="white"
            size="lg"
            position="relative"
            top="3px"
            opacity={0.7}
          />
          <Heading
            fontSize="5xl"
            color="white"
            opacity={0.7}
            textShadow="0 0 10px rgba(0, 0, 0, 0.2)"
          >
            AI Consulting
          </Heading>
        </Box>
        <Text
          color="white"
          mt={6}
          fontSize="md"
          opacity={0.7}
          textShadow="0 0 10px rgba(0, 0, 0, 0.2)"
        >
          AI 컨설팅을 준비 중입니다. 잠시만 기다려 주세요...
        </Text>
      </Box>
    );
  }

  // 맨처음으로 돌아가기: 질문, 답변, 추천 결과 등 모두 초기화
  const handleGoToStart = () => {
    setStep(0);
    setDbAnswers({});
    setAiAnswers({});
    setRecommendResult(null);
    setIsModalOpen(false);
  };

  const handleGoBackToFirstPage = () => {
    navigate("/"); // 또는 "/main" 등 원하는 경로로
  };

  return (
    <Box
      minH="100vh"
      py={8}
      px={4}
      animation={animation}
      bgGradient="linear(to-r, gray.300, gray.700, gray.500)"
      backgroundSize="300% 300%"
    >
      <Heading
        textAlign="center"
        fontSize="5xl"
        mb={10}
        color="white"
        fontWeight="extrabold"
        letterSpacing="tight"
        opacity={0.7}
        textShadow="0 0 10px rgba(0, 0, 0, 0.2)"
      >
        AI Consulting
      </Heading>

      <Container
        maxW="3xl"
        bg="white"
        borderRadius="2xl"
        boxShadow="2xl"
        p={8}
        pt={8}
        pb={1}
        minH="600px"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
      >
        {/* step에 따라 dbQuestions -> aiQuestions 순서대로 */}
        {step < dbQuestions.length &&
          (() => {
            const q = dbQuestions[step];
            if (q.type === "district") {
              return (
                <>
                  <Box
                    w="100%"
                    h="500px"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    boxShadow="md"
                    bg="gray.50"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    cursor="pointer"
                    overflow="hidden"
                  >
                    <SeoulDistrictMap
                      onDistrictClick={handleDistrict}
                      onDistrictHover={setHoverDistrict}
                    />
                  </Box>
                  <Text
                    mt={6}
                    textAlign="center"
                    fontSize="lg"
                    color="gray.600"
                    fontWeight="medium"
                  >
                    {hoverDistrict ? (
                      `'${hoverDistrict}'를 선택했습니다.`
                    ) : (
                      <>
                        원하는{" "}
                        <Text as="span" color="red.500" fontWeight="bold">
                          지역(구)
                        </Text>
                        를 선택해주세요
                      </>
                    )}
                  </Text>
                </>
              );
            } else {
              return (
                <>
                  <Text fontWeight="bold" mb={6} fontSize="xl">
                    {q.question}
                  </Text>
                  <VStack spacing={4} align="stretch">
                    {q.options.map((option) => (
                      <Box
                        key={option}
                        {...boxStyle}
                        onClick={() => handleSelect(q.field, option)}
                      >
                        {option}
                      </Box>
                    ))}
                  </VStack>
                </>
              );
            }
          })()}

        {/* aiQuestions 랜더링 */}
        {step >= dbQuestions.length &&
          step < totalSteps &&
          (() => {
            const aiStep = step - dbQuestions.length;
            const q = aiQuestions[aiStep];
            return (
              <>
                <Text fontWeight="bold" mb={6} fontSize="xl">
                  {q.question}
                </Text>
                <VStack spacing={4} align="stretch">
                  {q.options.map((option) => (
                    <Box
                      key={option}
                      {...boxStyle}
                      onClick={() => handleSelect(q.field, option)}
                    >
                      {option}
                    </Box>
                  ))}
                </VStack>
              </>
            );
          })()}

        {/* 모든 질문 끝나면 결과 + 추천 + 추천결과 */}
        {step === totalSteps && (
          <Box
            flex="1"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            textAlign="center"
          >
            <Text fontSize="xl" color="teal.500" fontWeight="bold">
              ✅ 모든 질문 완료! <br />
              추천을 생성할 수 있습니다.
            </Text>
            <Text mt={4} fontSize="md" color="gray.600">
              <b>선택한 지역:</b> {dbAnswers.district} <br />
              <b>성급:</b> {dbAnswers.star} <br />
              <b>주차:</b> {dbAnswers.parking_lot} <br />
              <b>인원:</b> {dbAnswers.capacity} <br />
              <b>가격:</b> {dbAnswers.price} <br />
              <b>체크인:</b> {dbAnswers.check_in} <br />
              <b>테마:</b> {aiAnswers.theme} <br />
              <b>분위기:</b> {aiAnswers.mood} <br />
              <b>특별요구:</b> {aiAnswers.special}
            </Text>
            <Button
              colorScheme="teal"
              mt={8}
              size="lg"
              onClick={handleRecommend}
            >
              추천받기
            </Button>

            {/* 추천 결과 출력부 */}
            {/* 
            {recommendResult && (
              <Box mt={8} p={6} borderRadius="lg" boxShadow="md" bg="gray.50">
                <Text fontWeight="bold" fontSize="xl" color="teal.600" mb={3}>
                  AI 추천 결과
                </Text>
                {recommendResult.bestHotel ? (
                  <Box>
                    <Text fontSize="lg">
                      <b>추천 호텔명:</b> {recommendResult.bestHotel.hotelName}
                    </Text>
                    <Text>
                      <b>주소:</b> {recommendResult.bestHotel.address}
                    </Text>
                    <Text>
                      <b>설명:</b> {recommendResult.bestHotel.description}
                    </Text>
                  </Box>
                ) : (
                  <Text color="red.400">추천 결과가 없습니다.</Text>
                )}
                <Text mt={3} color="gray.500">
                  {recommendResult.message}
                </Text>
                */}
            <HotelRecommendModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              hotel={recommendResult?.bestHotel}
              aiMessage={recommendResult?.message}
            />
            {/* 추천 결과가 떠 있는 상태에서 보이도록 버튼 추가 */}
            <Box mt={4} display="flex" gap={4} justifyContent="center">
              <Button
                colorScheme="gray"
                variant="outline"
                onClick={handleGoBackToFirstPage}
              >
                뒤로가기
              </Button>
              <Button colorScheme="red" onClick={handleGoToStart}>
                맨처음으로
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AiPage;
