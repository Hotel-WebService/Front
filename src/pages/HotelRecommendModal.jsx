// HotelRecommendModal.jsx
import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import TouristAttractionsModal from "./TouristAttractionsModal";

// 호텔 이미지 리스트 생성 함수
const getHotelImageList = (hotelId, count = 5) => {
  const images = [];
  for (let i = 1; i <= count; i++) {
    try {
      const img = require(`../assets/hotel${hotelId}/hotel${i}.jpg`);
      images.push(img);
    } catch (e) {
      images.push("https://placehold.co/400x300?text=No+Image");
    }
  }
  return images;
};

const HotelRecommendModal = ({ isOpen, onClose, hotel, aiMessage }) => {
  const [mainIdx, setMainIdx] = useState(0);
  const [tourModalOpen, setTourModalOpen] = useState(false); // 관광지 모달 상태

  // ⭐ 추천 결과가 없으면 안내 메시지만 출력 (hotel이 null, undefined 등)
  if (!hotel) {
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
              추천 결과가 없습니다.
            </Box>
            {aiMessage && (
              <Box mt={2} textAlign="center" color="gray.600">
                <Text>{aiMessage}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // 추천 결과가 있으면 기존 호텔 정보 모달 출력
  const images = getHotelImageList(hotel.hotelID, 5);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>추천 호텔 : {hotel.hotelName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* 이미지 슬라이드 */}
            <Box mb={4}>
              <Image
                src={images[mainIdx]}
                alt={hotel.hotelName}
                borderRadius="lg"
                boxShadow="md"
                w="100%"
                h="250px"
                objectFit="cover"
              />
              <HStack spacing={2} mt={3} justify="center">
                {images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={`호텔 이미지 ${idx + 1}`}
                    borderRadius="md"
                    boxShadow={mainIdx === idx ? "outline" : "base"}
                    w="60px"
                    h="40px"
                    objectFit="cover"
                    border={
                      mainIdx === idx ? "2px solid teal" : "1px solid #ddd"
                    }
                    cursor="pointer"
                    onClick={() => setMainIdx(idx)}
                    opacity={mainIdx === idx ? 1 : 0.7}
                    transition="all 0.2s"
                  />
                ))}
              </HStack>
            </Box>

            <VStack align="start" spacing={2}>
              <Text>
                <b>주소:</b> {hotel.address}
              </Text>
              <Text>
                <b>설명:</b> {hotel.description}
              </Text>
              {aiMessage && (
                <Box mt={3} p={2} bg="gray.50" borderRadius="md">
                  <Text color="teal.600" fontWeight="semibold">
                    AI 추천 이유: <br />
                  </Text>
                  <Text color="gray.600">{aiMessage}</Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter flexDirection="column" alignItems="stretch" gap={2}>
            {/* 예약 이동 버튼 */}
            <Link to={`/reservationPage/${hotel.hotelID}`}>
              <Button colorScheme="teal" width="100%">
                이 호텔 예약하러 가기
              </Button>
            </Link>
            {/* 관광지 확인 버튼(이제 모달로 연동!) */}
            <Button
              colorScheme="blue"
              width="100%"
              onClick={() => setTourModalOpen(true)}
            >
              주변 관광지 확인하기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 관광지 모달 컴포넌트 */}
      <TouristAttractionsModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        hotel={hotel}
      />
    </>
  );
};

export default HotelRecommendModal;
