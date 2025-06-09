import React, { useState } from 'react';
import {
    Box,
    Heading,
    Container,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const animation = `${gradient} 10s ease infinite`;

const AiPage = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({
        district: '',
        purpose: '',
        type: '',
        amenity: '',
    });

    const boxHover = useColorModeValue('gray.100', 'gray.700');

    const handleSelect = (field, value) => {
        setAnswers((prev) => ({ ...prev, [field]: value }));
        setStep((prev) => prev + 1);
    };

    const boxStyle = {
        p: 6,
        minH: '100px',
        borderRadius: 'lg',
        border: '1px solid #ccc',
        boxShadow: 'md',
        cursor: 'pointer',
        fontSize: 'xl',
        textAlign: 'center',
        fontWeight: 'semibold',
        _hover: { bg: boxHover },
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
            >
                AI Consulting
            </Heading>

            <Container
                maxW="3xl"
                bg="white"
                borderRadius="2xl"
                boxShadow="2xl"
                p={8}
                pt={8}  // ✅ 위 여백 줄이기
                pb={1}  // ✅ 아래 여백도 조정
                minH="600px"
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"  // ✅ 상단 정렬로 변경
            >
                {step === 0 && (
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
                            onClick={() => {
                                setAnswers({ ...answers, district: '강남구' });
                                setStep(1);
                            }}
                        >
                            <Text fontSize="xl" color="gray.400">
                                📍 서울 구 지도 클릭 (예시: 강남구)
                            </Text>
                        </Box>

                        <Text
                            mt={6}
                            textAlign="center"
                            fontSize="lg"
                            color="gray.600"
                            fontWeight="medium"
                        >
                            원하는 <Text as="span" color="red.500" fontWeight="bold">지역(구)</Text>를 선택해주세요
                        </Text>
                    </>
                )}

                {/* Step 1 */}
                {step === 1 && (
                    <>
                        <Text fontWeight="bold" mb={6} fontSize="xl">
                            1. 여행 목적은 무엇인가요?
                        </Text>
                        <VStack spacing={4} align="stretch">
                            {['휴식', '비즈니스', '가족 여행', '액티비티'].map((option) => (
                                <Box key={option} {...boxStyle} onClick={() => handleSelect('purpose', option)}>
                                    {option}
                                </Box>
                            ))}
                        </VStack>
                    </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <>
                        <Text fontWeight="bold" mb={6} fontSize="xl">
                            2. 선호하는 숙소 유형은?
                        </Text>
                        <VStack spacing={4} align="stretch">
                            {['호텔', '펜션', '게스트하우스', '풀빌라'].map((option) => (
                                <Box key={option} {...boxStyle} onClick={() => handleSelect('type', option)}>
                                    {option}
                                </Box>
                            ))}
                        </VStack>
                    </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <>
                        <Text fontWeight="bold" mb={6} fontSize="xl">
                            3. 원하는 편의시설은?
                        </Text>
                        <VStack spacing={4} align="stretch">
                            {['수영장', '조식 포함', '주차 가능', '스파'].map((option) => (
                                <Box key={option} {...boxStyle} onClick={() => handleSelect('amenity', option)}>
                                    {option}
                                </Box>
                            ))}
                        </VStack>
                    </>
                )}

                {/* Step 4: 완료 */}
                {step === 4 && (
                    <Box flex="1" display="flex" flexDirection="column" justifyContent="center" textAlign="center">
                        <Text fontSize="xl" color="teal.500" fontWeight="bold">
                            ✅ 모든 질문 완료! 추천을 생성할 수 있습니다.
                        </Text>
                        <Text mt={4} fontSize="md" color="gray.600">
                            선택한 지역: {answers.district} / 목적: {answers.purpose} / 숙소: {answers.type} / 편의시설: {answers.amenity}
                        </Text>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default AiPage;