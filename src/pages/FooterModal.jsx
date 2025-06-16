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