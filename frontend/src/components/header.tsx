"use client";

import { User } from "lucide-react";
import { Modal, ModalContent, ModalTitle } from "./modal";
import { useRef, useState } from "react";
import { LoginForm } from "./login/loginForm";
import { useAuth } from "@/context/auth.context";
import Link from "next/link";

const Header = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <header className="container flex min-h-14 items-center justify-between py-4">
        <h1>NextNext eCommerce</h1>
        {isLoggedIn ? (
          <Link href="/profile">
            <User />
          </Link>
        ) : (
          <button ref={triggerRef} onClick={() => setIsModalOpen(true)} disabled={isLoading}>
            <User />
          </button>
        )}
      </header>
      {!isLoggedIn && (
        <Modal
          triggerElement={triggerRef}
          controls={{ isOpen: isModalOpen, setIsOpen: setIsModalOpen }}
        >
          <ModalContent>
            <ModalTitle>Login</ModalTitle>
            <LoginForm />
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Header;
