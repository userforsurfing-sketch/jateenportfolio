import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TouchButtonProps {
  label: string;
  children: ReactNode;
  onPress: () => void;
  onRelease?: () => void;
  className?: string;
}

/** Hold-able on-screen control for touch devices. */
export function TouchButton({ label, children, onPress, onRelease, className }: TouchButtonProps) {
  const release = () => onRelease?.();
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "glass flex h-14 min-w-14 touch-none select-none items-center justify-center rounded-2xl px-4 font-mono text-sm font-semibold text-foreground active:scale-95 active:border-primary/60 active:bg-primary/20",
        className,
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture?.(e.pointerId);
        onPress();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

/** Row that holds touch controls; visible on small screens and touch devices. */
export function TouchControls({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "hidden w-full shrink-0 items-center justify-center gap-3 pt-3 max-md:flex pointer-coarse:flex",
        className,
      )}
    >
      {children}
    </div>
  );
}
