import { useAuth } from "@/context/auth.context";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { LoginForm } from "../login/loginForm";
import { useState } from "react";
import { SignupForm } from "../signup/signupForm";
import { Button } from "../ui/button";

interface AuthModalProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthModal = ({
  isModalOpen,
  setIsModalOpen,
}: AuthModalProps) => {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    !isLoggedIn && (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
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
        </DialogContent>
      </Dialog>
    )
  );
};

export default AuthModal;
