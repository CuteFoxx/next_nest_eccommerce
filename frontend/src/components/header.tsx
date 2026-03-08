"use client";

import { User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth.context";
import Link from "next/link";
import AuthModal from "./authModal/authModal";

const Header = () => {
  const { isLoggedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="container flex min-h-14 items-center justify-between py-4">
        <Link href="/">NextNext eCommerce</Link>
        {isLoggedIn ? (
          <Link href="/profile">
            <User />
          </Link>
        ) : (
          <button onClick={() => setIsModalOpen(true)}>
            <User />
          </button>
        )}
      </header>
      <AuthModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

export default Header;
