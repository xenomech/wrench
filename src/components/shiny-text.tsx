'use client';

type ShinyTextProps = {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: 'left' | 'right';
};

export function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  direction = 'left',
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: disabled
          ? 'none'
          : `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: disabled ? undefined : 'transparent',
        color: disabled ? color : undefined,
        animation: disabled ? 'none' : `shiny-slide ${speed}s linear infinite`,
        animationDirection: direction === 'right' ? 'reverse' : 'normal',
      }}
    >
      {text}
    </span>
  );
}
