import React, { useState, useEffect } from "react";
import {
  Box, Text, Button, Image, HStack, VStack, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Spinner, SimpleGrid,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import noImage from "../assets/no-image.jpg";

// 관광지 정보 fetch
const fetchTourApiTouristSpots = async (lat, lng, radius = 2000) => {
  const SERVICE_KEY = "tNZyFcQn0PxOiEuepPMyTQwurwmAfGzGUL%2FM62kbm3VjkpUdXuquV592epp37ojX%2FATfb8HNMvn6N3jWNM4mQQ%3D%3D";
  const url = `https://apis.data.go.kr/B551011/KorService2/locationBasedList2?serviceKey=${SERVICE_KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TourApp&mapX=${lng}&mapY=${lat}&radius=${radius}&_type=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.response?.body?.items?.item || [];
};

// 호텔 이미지 리스트
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

export default function TouristAttractionsModal({ isOpen, onClose, hotels = [], recommendReason }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [mainImgIdx, setMainImgIdx] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [touristSpots, setTouristSpots] = useState([]);
  const [loadingTour, setLoadingTour] = useState(false);

  const selectedHotel = hotels[selectedIdx];
  const images = selectedHotel ? getHotelImageList(selectedHotel.hotelID) : [];

  useEffect(() => {
    if (showTour && selectedHotel) {
      setLoadingTour(true);
      fetchTourApiTouristSpots(selectedHotel.latitude, selectedHotel.longitude)
        .then(setTouristSpots)
        .finally(() => setLoadingTour(false));
    }
  }, [showTour, selectedHotel]);

  if (!selectedHotel) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>추천 결과 없음</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box p={6} textAlign="center" color="red.500" fontWeight="bold" fontSize="xl">
              추천 결과가 없습니다.
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxHeight="90vh">
        <ModalHeader>
          {showTour
            ? "주변 관광지"
            : `추천 호텔 ${hotels.length > 1 ? `(${selectedIdx + 1}/${hotels.length})` : ""} : ${selectedHotel.hotelName}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" maxH="70vh" pr={1}>
          {showTour ? (
            loadingTour ? (
              <Box textAlign="center" py={10}><Spinner size="lg" color="teal.500" /></Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {touristSpots.length === 0 ? (
                  <Text>근처 관광지를 찾을 수 없습니다.</Text>
                ) : (
                  touristSpots.map((spot) => (
                    <Box key={spot.contentid} borderWidth="1px" borderRadius="lg" p={3}>
                      <Text fontWeight="bold">{spot.title}</Text>
                      {spot.addr1 && <Text fontSize="sm" color="gray.600">{spot.addr1}</Text>}

                      <Image
                        src={spot.firstimage || noImage}
                        alt={spot.title}
                        h="120px"
                        w="100%"
                        objectFit="cover"
                        my={2}
                        borderRadius="md"
                      />

                      <ChakraLink
                        href={`https://map.kakao.com/?q=${encodeURIComponent(spot.title)}`}
                        isExternal
                        color="blue.600"
                      >
                        🗺 카카오맵 위치 보기
                      </ChakraLink>
                    </Box>
                  ))
                )}
              </SimpleGrid>
            )
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
                    border={mainImgIdx === idx ? "2px solid teal" : "1px solid #ccc"}
                    cursor="pointer"
                    onClick={() => setMainImgIdx(idx)}
                  />
                ))}
              </HStack>
              <VStack align="start" spacing={2}>
                <Text><b>주소:</b> {selectedHotel.address}</Text>
                <Text><b>설명:</b> {selectedHotel.description}</Text>
                {recommendReason && (
                  <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                    <Text fontWeight="semibold" color="teal.600">AI 추천 이유</Text>
                    <Text fontSize="sm" color="gray.600" whiteSpace="pre-line">{recommendReason}</Text>
                  </Box>
                )}
              </VStack>
            </>
          )}
        </ModalBody>
        <ModalFooter flexDirection="column" alignItems="stretch" gap={2}>
          {showTour ? (
            <Button onClick={() => setShowTour(false)} colorScheme="gray" width="100%">
              ← 호텔 정보로 돌아가기
            </Button>
          ) : (
            <>
              <Link to={`/reservationPage/${selectedHotel.hotelID}`}>
                <Button colorScheme="teal" width="100%">이 호텔 예약하러 가기</Button>
              </Link>
              <Button onClick={() => setShowTour(true)} colorScheme="blue" width="100%">
                주변 관광지 확인하기
              </Button>
              {hotels.length > 1 && (
                <HStack justify="center" mt={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIdx((selectedIdx - 1 + hotels.length) % hotels.length)}
                  >
                    ← 이전 호텔
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedIdx((selectedIdx + 1) % hotels.length)}
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