import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Image,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  SimpleGrid,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { SiNaver } from "react-icons/si";
import { FaMapMarkedAlt } from "react-icons/fa";

import noImage from "../assets/no-image.jpg";

const SERVICE_KEY =
  "tNZyFcQn0PxOiEuepPMyTQwurwmAfGzGUL%2FM62kbm3VjkpUdXuquV592epp37ojX%2FATfb8HNMvn6N3jWNM4mQQ%3D%3D";

const touristCategories = [
  { id: 12, label: "관광지" },
  { id: 14, label: "문화시설" },
  { id: 15, label: "축제/공연" },
  { id: 25, label: "여행코스" },
  { id: 28, label: "레포츠" },
  { id: 38, label: "쇼핑" },
  { id: 39, label: "음식점" },
];

const fetchTourApiByCategory = async (
  lat,
  lng,
  radius = 2000,
  contentTypeId = 12
) => {
  const url = `https://apis.data.go.kr/B551011/KorService2/locationBasedList2?serviceKey=${SERVICE_KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TourApp&mapX=${lng}&mapY=${lat}&radius=${radius}&contentTypeId=${contentTypeId}&_type=json`;
  const response = await fetch(url);
  const data = await response.json();
  const items = data.response?.body?.items?.item || [];

  return items.map((item) => ({
    ...item,
    distance:
      item.mapy && item.mapx
        ? haversineDistance(lat, lng, item.mapy, item.mapx)
        : null,
  }));
};

const getHotelImageList = (hotelId, count = 5) => {
  const images = [];
  for (let i = 1; i <= count; i++) {
    try {
      const img = require(`../assets/hotel${hotelId}/hotel${i}.jpg`);
      images.push(img);
    } catch {
      images.push("https://placehold.co/400x300?text=No+Image");
    }
  }
  return images;
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function TouristAttractionsModal({
  isOpen,
  onClose,
  hotels = [],
  recommendReason,
  recommendMessage,
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [touristSpots, setTouristSpots] = useState([]);
  const [loadingTour, setLoadingTour] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(12);

  const selectedHotel = hotels[selectedIdx];
  const images = selectedHotel ? getHotelImageList(selectedHotel.hotelID) : [];

  useEffect(() => {
    if (showTour && selectedHotel) {
      setLoadingTour(true);
      fetchTourApiByCategory(
        selectedHotel.latitude,
        selectedHotel.longitude,
        2000,
        selectedCategoryId
      )
        .then(setTouristSpots)
        .finally(() => setLoadingTour(false));
    }
  }, [showTour, selectedHotel, selectedCategoryId]);

  if (!selectedHotel) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>추천 결과 없음</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              p={6}
              textAlign="center"
              color="red.500"
              fontWeight="bold"
              fontSize="xl"
            >
              {recommendMessage || "추천 결과가 없습니다."}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxHeight="90vh">
        <ModalHeader>
          {showTour
            ? `${selectedHotel.hotelName} 주변 관광지`
            : `추천 호텔 ${hotels.length > 1 ? `(${selectedIdx + 1}/${hotels.length})` : ""
            } : ${selectedHotel.hotelName}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" maxH="70vh" pr={1}>
          {/* 안내 메시지 박스 추가 */}
          {!showTour && recommendMessage && (
            <Box
              mb={4}
              p={3}
              borderRadius="md"
              bg="yellow.50"
              color="yellow.800"
              fontWeight="semibold"
              fontSize="lg"
              textAlign="center"
              border="1px solid #f6e05e"
            >
              {recommendMessage}
            </Box>
          )}
          {showTour ? (
            <>
              <HStack spacing={2} wrap="wrap" justify="center" mb={4}>
                {touristCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={
                      selectedCategoryId === cat.id ? "solid" : "outline"
                    }
                    colorScheme="teal"
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </HStack>
              {loadingTour ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="lg" color="teal.500" />
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {touristSpots.length === 0 ? (
                    <Text>근처 관광지를 찾을 수 없습니다.</Text>
                  ) : (
                    touristSpots.map((spot) => (
                      <Box
                        key={spot.contentid}
                        borderWidth="1px"
                        borderRadius="lg"
                        p={3}
                      >
                        <Text fontWeight="bold">{spot.title}</Text>
                        {spot.addr1 && (
                          <Text fontSize="sm" color="gray.600">
                            {spot.addr1}
                          </Text>
                        )}
                        {spot.distance !== null && isFinite(spot.distance) && (
                          <Text fontSize="xs" color="gray.500">
                            "{selectedHotel.hotelName}"에서 관광지까지의 거리:{" "}
                            {spot.distance < 1
                              ? `${Math.round(spot.distance * 1000)} m`
                              : `${spot.distance.toFixed(2)} km`}
                          </Text>
                        )}

                        <Image
                          src={spot.firstimage || noImage}
                          alt={spot.title}
                          h="200px"
                          w="100%"
                          objectFit="cover"
                          my={2}
                          borderRadius="md"
                        />

                        <ChakraLink
                          href={`https://map.naver.com/v5/search/${encodeURIComponent(
                            spot.title
                          )}`}
                          isExternal
                          color="green.600"
                          display="flex"
                          alignItems="center"
                        >
                          <SiNaver style={{ marginRight: "5px" }} />
                          네이버 지도에서 보기
                        </ChakraLink>

                        <ChakraLink
                          href={`https://map.kakao.com/?q=${encodeURIComponent(
                            spot.title
                          )}`}
                          isExternal
                          color="blue.600"
                          display="flex"
                          alignItems="center"
                        >
                          <FaMapMarkedAlt style={{ marginRight: "5px" }} />
                          카카오맵 위치 보기
                        </ChakraLink>
                      </Box>
                    ))
                  )}
                </SimpleGrid>
              )}
            </>
          ) : (
            <>
              <Image
                src={images[mainImgIdx]}
                alt={selectedHotel.hotelName}
                w="100%"
                h="250px"
                objectFit="cover"
                borderRadius="lg"
                mb={3}
              />
              <HStack spacing={2} justify="center" mb={4}>
                {images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    w="60px"
                    h="40px"
                    borderRadius="md"
                    border={
                      mainImgIdx === idx ? "2px solid teal" : "1px solid #ccc"
                    }
                    cursor="pointer"
                    onClick={() => setMainImgIdx(idx)}
                  />
                ))}
              </HStack>
              <VStack align="start" spacing={2}>
                <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600" whiteSpace="pre-line">
                    <b>주소:</b> {selectedHotel.address}
                  </Text>
                  <Text fontSize="sm" color="gray.600" whiteSpace="pre-line">
                    <b>설명:</b> {selectedHotel.description}
                  </Text>
                </Box>
                {recommendReason && (
                  <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                    <Text fontWeight="semibold" color="teal.600">
                      AI 추천 이유
                    </Text>
                    <Text fontSize="sm" color="gray.600" whiteSpace="pre-line">
                      {recommendReason}
                    </Text>
                  </Box>
                )}
              </VStack>
            </>
          )}
        </ModalBody>
        <ModalFooter flexDirection="column" alignItems="stretch" gap={2}>
          {showTour ? (
            <Button
              onClick={() => setShowTour(false)}
              colorScheme="gray"
              width="100%"
            >
              ← 호텔 정보로 돌아가기
            </Button>
          ) : (
            <>
              <Link to={`/reservationPage/${selectedHotel.hotelID}`}>
                <Button colorScheme="teal" width="100%">
                  이 호텔 예약하러 가기
                </Button>
              </Link>
              <Button
                onClick={() => setShowTour(true)}
                colorScheme="blue"
                width="100%"
              >
                주변 관광지 확인하기
              </Button>
              {hotels.length > 1 && (
                <HStack justify="center" mt={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedIdx(
                        (selectedIdx - 1 + hotels.length) % hotels.length
                      )
                    }
                  >
                    ← 이전 호텔
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedIdx((selectedIdx + 1) % hotels.length)
                    }
                  >
                    다음 호텔 →
                  </Button>
                </HStack>
              )}
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
