
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardFooter } from "./card";

interface AmbientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  ambientColor?: string;
  ambientIntensity?: "subtle" | "medium" | "strong";
  interactiveGlow?: boolean;
  glowOnHover?: boolean;
  children: React.ReactNode;
  contentProps?: React.HTMLAttributes<HTMLDivElement>;
  headerProps?: React.HTMLAttributes<HTMLDivElement>;
  footerProps?: React.HTMLAttributes<HTMLDivElement>;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const AmbientCard = ({
  className,
  ambientColor = "var(--ambient-glow-primary)",
  ambientIntensity = "medium",
  interactiveGlow = true,
  glowOnHover = true,
  children,
  contentProps,
  headerProps,
  footerProps,
  header,
  footer,
  ...props
}: AmbientCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Calculate intensity based on prop
  const getIntensityValue = () => {
    switch (ambientIntensity) {
      case "subtle": return "0.1";
      case "strong": return "0.3";
      default: return "0.2";
    }
  };

  // Handle mouse move for interactive glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveGlow) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Dynamic styles for the card
  const cardStyle = {
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    ...(glowOnHover && isHovering ? {
      boxShadow: `0 0 25px ${getIntensityValue()} ${ambientColor}`,
    } : {}),
    ...(interactiveGlow && isHovering ? {
      background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                  rgba(255, 255, 255, 0.1) 0%, 
                  rgba(255, 255, 255, 0) 70%)`,
    } : {})
  } as React.CSSProperties;

  return (
    <Card
      className={cn("relative transform transition-all duration-300", 
        glowOnHover && "hover:scale-[1.02]",
        className)}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {header && <CardHeader {...headerProps}>{header}</CardHeader>}
      <CardContent {...contentProps}>{children}</CardContent>
      {footer && <CardFooter {...footerProps}>{footer}</CardFooter>}
    </Card>
  );
};

export default AmbientCard;
