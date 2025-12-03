import React, { useRef, useEffect, useState } from 'react';

interface VariableFontCursorProps {
  label: string;
  font?: string;
  weightRange?: [number, number];
  widthRange?: [number, number]; // For font-stretch or simulated width
  distRange?: [number, number];
  spreadRange?: [number, number]; // Range for letter spacing spread (in px)
  className?: string;
}

const VariableFontCursor: React.FC<VariableFontCursorProps> = ({
  label,
  font = "Inter, sans-serif",
  weightRange = [400, 800],
  widthRange = [100, 125],
  distRange = [0, 300],
  spreadRange = [0, 0], // Default to no spread if not provided
  className = "",
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      // Check if cursor is near the text container
      const isNear = 
        e.clientX >= rect.left - 100 && 
        e.clientX <= rect.right + 100 && 
        e.clientY >= rect.top - 100 && 
        e.clientY <= rect.bottom + 100;
        
      setIsHovering(isNear);
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <h1 
      ref={containerRef}
      className={`flex flex-wrap justify-center md:justify-start font-heading ${className}`}
      style={{ fontFamily: 'Inter, sans-serif', fontWeight: weightRange[0], cursor: 'default' }}
    >
      {label.split(" ").map((word, wordIndex) => (
        <div key={wordIndex} className="flex whitespace-nowrap mr-[0.25em] last:mr-0">
          {word.split("").map((char, charIndex) => {
            return (
              <Char 
                key={charIndex} 
                char={char} 
                cursorPos={cursorPos} 
                isHovering={isHovering}
                weightRange={weightRange}
                widthRange={widthRange}
                distRange={distRange}
                spreadRange={spreadRange}
              />
            );
          })}
        </div>
      ))}
    </h1>
  );
};

const Char: React.FC<{
  char: string;
  cursorPos: { x: number, y: number };
  isHovering: boolean;
  weightRange: [number, number];
  widthRange: [number, number];
  distRange: [number, number];
  spreadRange: [number, number];
}> = ({ char, cursorPos, isHovering, weightRange, widthRange, distRange, spreadRange }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    fontWeight: weightRange[0],
    fontVariationSettings: `'wght' ${weightRange[0]}`,
  });

  useEffect(() => {
    if (!ref.current) return;
    
    let animationFrameId: number;

    const updateStyle = () => {
      if (!ref.current) return;

      if (!isHovering) {
        setStyle({
          fontWeight: weightRange[0],
          fontVariationSettings: `'wght' ${weightRange[0]}`,
          transform: 'scaleX(1)',
          opacity: 1,
          marginRight: '0px', // Reset margin
          display: 'inline-block',
          transition: 'all 0.3s ease-out', // Smooth return
        });
        return;
      }

      const rect = ref.current.getBoundingClientRect();
      const charCenterX = rect.left + rect.width / 2;
      const charCenterY = rect.top + rect.height / 2;

      const dist = Math.sqrt(
        Math.pow(cursorPos.x - charCenterX, 2) + 
        Math.pow(cursorPos.y - charCenterY, 2)
      );

      // Normalize distance
      const maxDist = distRange[1];
      const minDist = distRange[0];
      let normalizedDist = Math.min(Math.max(dist - minDist, 0) / (maxDist - minDist), 1);
      
      // Invert: 1 = close, 0 = far
      const proximity = 1 - normalizedDist;
      
      // Easing (cubic)
      const eased = 1 - Math.pow(1 - proximity, 3);

      const weight = weightRange[0] + (weightRange[1] - weightRange[0]) * eased;
      const widthScale = 1 + ((widthRange[1] - widthRange[0]) / 100) * eased;
      const spread = spreadRange[0] + (spreadRange[1] - spreadRange[0]) * eased;
      
      setStyle({
        fontWeight: Math.round(weight),
        fontVariationSettings: `'wght' ${weight}`,
        transform: `scaleX(${widthScale})`,
        marginRight: `${spread}px`, // Apply spread as margin right
        display: 'inline-block',
        willChange: 'font-weight, transform, margin-right',
      });
    };

    // Use requestAnimationFrame for performance
    animationFrameId = requestAnimationFrame(updateStyle);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cursorPos, isHovering, weightRange, widthRange, distRange, spreadRange]);

  return (
    <span ref={ref} style={style}>
      {char}
    </span>
  );
};

export default VariableFontCursor;
