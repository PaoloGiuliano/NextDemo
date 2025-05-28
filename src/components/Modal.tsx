"use client";

import { ReactNode, useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, children }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div
        ref={modalRef}
        className="relative w-3/4 max-w-4xl rounded-lg bg-white lg:w-full"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 text-xl font-bold text-white hover:cursor-pointer"
        >
          ×
        </button>
        <div className="h-[250px] w-full overflow-hidden md:h-[400px] lg:h-[750px] lg:w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
