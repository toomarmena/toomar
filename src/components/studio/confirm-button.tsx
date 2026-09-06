"use client";

import type { ReactNode } from "react";

/** A submit button that asks first. Used for deletes. */
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <button type="submit" className={className} onClick={(e) => (confirm(message) ? undefined : e.preventDefault())}>
      {children}
    </button>
  );
}
