"use client";

import { User } from "lucide-react";
import { Modal, ModalContent, ModalTitle } from "./modal";
import { useRef, useState } from "react";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <header className="container flex min-h-14 items-center justify-between py-4">
        <h1>NextNext eCommerce</h1>
        <button ref={triggerRef} onClick={() => setIsModalOpen(true)}>
          <User />
        </button>
      </header>
      <Modal
        triggerElement={triggerRef}
        controls={{ isOpen: isModalOpen, setIsOpen: setIsModalOpen }}
      >
        <ModalContent>
          <ModalTitle>Login</ModalTitle>
          <p>Login form goes here</p>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Header;
