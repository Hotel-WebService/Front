import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  List,
  ListItem,
  Spinner,
  Text,
  Image,
  Link as ChakraLink,
} from "@chakra-ui/react";

const fetchTourApiTouristSpots = async (lat, lng, radius = 2000) => {
  // 실제 서비스키(Encoding) 값 사용
  const SERVICE_KEY =
    "tNZyFcQn0PxOiEuepPMyTQwurwmAfGzGUL%2FM62kbm3VjkpUdXuquV592epp37ojX%2FATfb8HNMvn6N3jWNM4mQQ%3D%3D";
  const url = `https://apis.data.go.kr/B551011/KorService2/locationBasedList2?serviceKey=${SERVICE_KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TourApp&mapX=${lng}&mapY=${lat}&radius=${radius}&_type=json`;

  try {
    const response = await fetch(url);

    // 1) 응답 본문 복사본 만들기 (본문 두 번 소비 가능)
    const resClone = response.clone();

    // 2) JSON 파싱 시도
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      // JSON 파싱 실패 시: 복사본에서 text로 본문 출력
      const errText = await resClone.text();
      console.error("❌ JSON 파싱 실패! 실제 본문:", errText);
      throw new Error("JSON 파싱 실패! 실제 본문:\n" + errText);
    }

    // 3) 정상일 때도 혹시 response가 ok가 아니면 본문 출력
    if (!response.ok) {
      const errText = await resClone.text();
      console.error(
        "❌ HTTP 오류! status:",
        response.status,
        response.statusText
      );
      console.error("❌ 응답 본문:", errText);
      throw new Error(
        `HTTP 오류: ${response.status} - ${response.statusText}\n${errText}`
      );
    }

    return data.response?.body?.items?.item || [];
  } catch (err) {
    console.error("❌ fetchTourApiTouristSpots 최종 예외:", err);
    throw err;
  }
};

export default function TouristAttractionsModal({ isOpen, onClose, hotel }) {
  const [touristSpots, setTouristSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && hotel) {
      setLoading(true);
      setError("");
      fetchTourApiTouristSpots(hotel.latitude, hotel.longitude, 2000)
        .then(setTouristSpots)
        .catch((err) => {
          const msg = err && err.message ? err.message : JSON.stringify(err);
          setError("관광지 정보를 불러오는 데 실패했습니다.\n\n" + msg);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, hotel]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>주변 관광지 (반경 2km, TourAPI 4.0)</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading && <Spinner />}
          {error && (
            <Text color="red.500" whiteSpace="pre-line">
              {error}
            </Text>
          )}
          {!loading && !error && (
            <List spacing={4}>
              {touristSpots.length === 0 ? (
                <Text>근처 관광지를 찾을 수 없습니다.</Text>
              ) : (
                touristSpots.map((spot) => (
                  <ListItem key={spot.contentid} mb={4}>
                    <b>{spot.title}</b>
                    <br />
                    <Text fontSize="sm" color="gray.600">
                      {spot.addr1}
                    </Text>
                    {/* 대표 이미지 */}
                    {spot.firstimage && (
                      <Image
                        src={spot.firstimage}
                        alt={spot.title}
                        boxSize="120px"
                        objectFit="cover"
                        mt={1}
                        mb={1}
                        borderRadius="md"
                        border="1px solid #eee"
                      />
                    )}
                    {/* 공식 홈페이지 or 검색링크/카카오맵 */}
                    {spot.homepage ? (
                      <ChakraLink
                        href={spot.homepage.replace(/<[^>]*>?/g, "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="blue.500"
                        fontWeight="bold"
                        display="block"
                        mt={1}
                      >
                        공식 홈페이지 바로가기
                      </ChakraLink>
                    ) : (
                      <>
                        <ChakraLink
                          href={`https://korean.visitkorea.or.kr/search/search_list.do?keyword=${encodeURIComponent(
                            spot.title
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="blue.500"
                          fontWeight="bold"
                          display="block"
                          mt={1}
                        >
                          한국관광공사에서 "{spot.title}" 검색
                        </ChakraLink>
                        <ChakraLink
                          href={`https://map.kakao.com/?q=${encodeURIComponent(
                            spot.title
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="purple.500"
                          fontWeight="bold"
                          display="block"
                        >
                          카카오맵에서 "{spot.title}" 찾기
                        </ChakraLink>
                      </>
                    )}
                  </ListItem>
                ))
              )}
            </List>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
