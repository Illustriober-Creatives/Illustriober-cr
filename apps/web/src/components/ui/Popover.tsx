"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentId: string;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<Popover.${component}> must be used inside <Popover>`);
  return ctx;
}

/** Read open state / setOpen from inside a <Popover> subtree — e.g. to close after selecting an option. */
export function usePopover() {
  return usePopoverContext("usePopover consumer");
}

interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Internal-only trigger + floating panel primitive. Replaces native <select>,
 * window.confirm-style popups, and ad-hoc absolute-positioned menus with one
 * accessible, brand-styled base: closes on outside click, Escape, and route
 * change.
 */
export function Popover({ children, open: controlledOpen, onOpenChange, className }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const pathname = usePathname();

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close whenever the route changes, so a menu never lingers over new content.
  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef, contentId }}>
      <div className={`relative inline-block ${className ?? ""}`}>{children}</div>
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

function PopoverTrigger({ children, onClick, ...props }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef, contentId } = usePopoverContext("Trigger");

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={contentId}
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: "start" | "end";
}

function PopoverContent({ children, align = "start", className, ...props }: PopoverContentProps) {
  const { open, contentRef, contentId } = usePopoverContext("Content");

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="menu"
      className={`absolute top-[calc(100%+0.5rem)] z-50 min-w-[10rem] overflow-hidden rounded-xl border border-glass-border bg-surface shadow-lg ${
        align === "end" ? "right-0" : "left-0"
      } ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
