"use client";
import { ReactNode } from "react";

export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modalInner" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
