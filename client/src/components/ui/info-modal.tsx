
import * as React from "react";
import { Info } from "lucide-react";
import { Modal, useModal } from "./modal";

interface InfoModalProps {
  title: string;
  content: React.ReactNode;
  buttonLabel?: string;
  iconOnly?: boolean;
}

export function InfoModal({ 
  title, 
  content, 
  buttonLabel = "More Info",
  iconOnly = false
}: InfoModalProps) {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      {iconOnly ? (
        <button 
          onClick={openModal} 
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
          aria-label={buttonLabel}
        >
          <Info className="h-5 w-5" />
        </button>
      ) : (
        <button 
          onClick={openModal} 
          className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
        >
          <Info className="h-4 w-4 mr-1" />
          {buttonLabel}
        </button>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} title={title} size="md">
        <div className="prose dark:prose-invert max-w-none">
          {content}
        </div>
      </Modal>
    </>
  );
}
