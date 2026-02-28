import { useAuth } from "@/context/auth.context";
import { Modal, ModalContent, ModalTitle } from "../ui/modal";
import { LoginForm } from "../login/loginForm";
import { useState } from "react";
import { SignupForm } from "../signup/signupForm";
import { Button } from "../ui/button";

interface AuthModalProps {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthModal = ({
  triggerRef,
  isModalOpen,
  setIsModalOpen,
}: AuthModalProps) => {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    !isLoggedIn && (
      <Modal
        triggerElement={triggerRef}
        controls={{ isOpen: isModalOpen, setIsOpen: setIsModalOpen }}
      >
        <ModalContent>
          <ul
            className="mb-2 flex gap-1 [&_button]:w-full [&_li]:flex-1"
            role="tablist"
          >
            <li role="presentation">
              <Button
                variant={activeTab === "login" ? "default" : "outline"}
                role="tab"
                aria-selected={activeTab === "login"}
                onClick={() => setActiveTab("login")}
              >
                Login
              </Button>
            </li>
            <li role="presentation">
              <Button
                variant={activeTab === "register" ? "default" : "outline"}
                role="tab"
                aria-selected={activeTab === "register"}
                onClick={() => setActiveTab("register")}
              >
                Register
              </Button>
            </li>
          </ul>
          <div role="tabpanel">
            {activeTab === "login" ? <LoginForm /> : <SignupForm />}
          </div>
        </ModalContent>
      </Modal>
    )
  );
};

export default AuthModal;
