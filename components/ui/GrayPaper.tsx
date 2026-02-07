import { ReactNode } from "react";

interface GrayPaperProps {
  children: ReactNode;
  className?: string;
}

export const GlassPaper = ({ children, className }: GrayPaperProps) => {
  return (
    <div 
      className={`rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 ${className}`}
    >
      {children}
    </div>
  );
};