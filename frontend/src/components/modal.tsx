"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { cn } from "@/lib/utils";

interface ModalContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}

const ModalContext = createContext<ModalContextType | null>(null);

const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModalContext must be within Modal");
  }

  return context;
};

interface ModalProps<T = undefined> extends React.HTMLAttributes<T> {
  children?: React.ReactNode;
  controls?: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
  };
  triggerElement?: React.RefObject<HTMLElement | null>;
}

export const Modal = ({
  children,
  controls,
  triggerElement,
  ...rest
}: ModalProps<HTMLDivElement>) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const normalizedControls = {
    isOpen: controls?.isOpen ?? isOpen,
    setIsOpen: controls?.setIsOpen ?? setIsOpen,
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Element;

    if (triggerElement != null && target == triggerElement.current) {
      normalizedControls.setIsOpen(true);
      return;
    }

    if (!wrapperRef.current?.contains(target)) {
      normalizedControls.setIsOpen(false);
      return;
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  return (
    <ModalContext.Provider
      value={{
        isOpen: controls?.isOpen != null ? controls.isOpen : isOpen,
        setIsOpen: controls?.setIsOpen != null ? controls.setIsOpen : setIsOpen,
        wrapperRef,
      }}
    >
      {normalizedControls.isOpen && (
        <div ref={wrapperRef} {...rest}>
          {children}
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const ModalTrigger = ({
  children,
  ...props
}: ModalProps<HTMLDivElement>) => {
  const { setIsOpen } = useModalContext();
  const { className, ...rest } = { ...props };

  return (
    <div
      {...rest}
      className={cn("cursor-pointer", className)}
      onClick={() => setIsOpen((prev) => !prev)}
    >
      {children}
    </div>
  );
};

export const ModalContent = ({
  children,
  ...props
}: ModalProps<HTMLDialogElement>) => {
  const { isOpen } = useModalContext();
  const { className, ...rest } = { ...props };

  return (
    <dialog
      {...rest}
      className={cn(
        "z-999 before:-z-1 fixed right-4 top-1/2 w-screen before:pointer-events-none before:absolute before:h-screen before:w-screen before:-translate-y-1/2 before:bg-black/50 before:content-['']",
        className,
      )}
      open={isOpen ?? false}
    >
      <div className="dark:bg-dark-grey z-99 max-w-120 fixed left-1/2 right-4 top-1/2 w-[calc(100vw-var(--spacing)*12)] -translate-x-1/2 -translate-y-1/2 rounded-[0.375rem] bg-white p-6 pb-8 text-black md:p-8 dark:text-white">
        {children}
      </div>
    </dialog>
  );
};

export const ModalTitle = ({
  children,
  ...props
}: ModalProps<HTMLHeadingElement>) => {
  const { className, ...rest } = { ...props };

  return (
    <h3 {...rest} className={cn("text-heading-l mb-6", className)}>
      {children}
    </h3>
  );
};
