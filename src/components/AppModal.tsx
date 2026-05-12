"use client";
import { Modal, ModalOverlay, Dialog } from "react-aria-components";
import { ReactNode } from "react";

type AppModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
  className?: string;
  // Passed through to Dialog — use "h-full" when the child needs a
  // resolved pixel height to expand into (e.g. Photo360Viewer canvas).
  dialogClassName?: string;
};

export default function AppModal({
  isOpen,
  onOpenChange,
  children,
  className = "",
  dialogClassName = "",
}: AppModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={({ isEntering, isExiting }) =>
        `fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 duration-200 ${
          isEntering ? "animate-in fade-in" : ""
        } ${isExiting ? "animate-out fade-out" : ""}`
      }
    >
      <Modal
        className={({ isEntering, isExiting }) =>
          `max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl duration-200 outline-none ${
            isEntering ? "animate-in zoom-in-95" : ""
          } ${isExiting ? "animate-out zoom-out-95" : ""} ${className}`
        }
      >
        <Dialog className={`outline-none ${dialogClassName}`}>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
