import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";

const FooterModal = ({ type, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        {type === "faq" && (
          <>
            <ModalHeader>자주 묻는 질문 (FAQ)</ModalHeader>
            <ModalBody>
              <Accordion allowToggle>
                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 예약을 변경하거나 취소하고 싶어요.</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    마이페이지에서 예약 내역을 확인하고 변경/취소할 수 있습니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 결제 수단은 어떤 게 있나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    신용카드, kakao pay 결제가 가능합니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 호텔 예약은 어떻게 하나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    원하는 목적지를 검색한 후, 호텔 목록에서 예약 버튼을 클릭해 객실을 선택하고 정보를 입력하시면 예약이 완료됩니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. AI 호텔 추천은 어떤 기준으로 작동하나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    사용자의 여행 목적, 선호 지역, 예산 등을 기준으로 맞춤형 호텔을 추천합니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 회원가입 없이도 예약이 가능한가요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    비회원 예약은 지원하지 않으며, 예약 및 찜 기능을 이용하시려면 로그인이 필요합니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 개인 정보는 안전하게 보호되나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    모든 사용자 정보는 암호화되어 안전하게 저장되며, 외부에 절대 노출되지 않습니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 비밀번호를 잊어버렸는데 어떻게 해야 하나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    로그인 화면의 ‘비밀번호 찾기’ 기능을 통해 이메일 인증 후 비밀번호를 재설정하실 수 있습니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 내 예약 정보는 어디에서 확인할 수 있나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    마이페이지에서 예약 내역을 확인하실 수 있습니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 호텔을 찜하면 어디서 확인할 수 있나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    찜한 호텔은 ‘찜 목록’ 페이지에서 한눈에 확인하고, 예약으로 바로 연결할 수 있습니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 호텔 사진과 실제가 다른 경우 어떻게 하나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    실제와 큰 차이가 있는 경우, 고객센터로 문의 주시면 확인 후 적절한 조치를 취해드립니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 호텔 주변 관광지는 어떻게 확인하나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    각 호텔 상세 페이지에서 '주변 관광지 보기' 버튼을 클릭하면 인근 명소를 확인하실 수 있습니다.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <AccordionButton>
                    <span>Q. 어떤 공공데이터를 활용하나요?</span>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    관광공사 및 서울시 제공의 공공데이터를 기반으로 호텔 및 관광지 정보를 제공합니다.
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </ModalBody>
          </>
        )}
        {type === "contact" && (
          <>
            <ModalHeader>연락처</ModalHeader>
            <ModalBody>
              <p>이메일: support@staymanager.com</p>
              <p>전화: 02-1234-5678</p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FooterModal;