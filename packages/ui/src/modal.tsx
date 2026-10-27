'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from './cn.ts';

/**
 * A modal built on the native `<dialog>`: the browser provides focus containment, the inert
 * page, Esc and back-gesture dismissal, and focus return. `closedby="any"` adds light dismiss.
 */
export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Synchronizes React state with the dialog's imperative open state (an external system).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      closedby="any"
      onClose={onClose}
      className={cn(
        'border-line bg-surface-raised text-ink m-auto w-[min(40rem,calc(100vw-2rem))] rounded-2xl border p-6',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <form method="dialog">
          <button
            type="submit"
            aria-label="Close"
            className="hover:bg-line/50 grid size-8 place-items-center rounded-md"
          >
            ×
          </button>
        </form>
      </div>
      {children}
    </dialog>
  );
}
