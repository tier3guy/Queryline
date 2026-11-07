import { cn } from "cn";
import type { ReactNode } from "react";

export default function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={cn(`min-h-screen overflow-hidden bg-[#faf9f6] text-[#171717]`)}>
      {children}
    </div>
  );
};
