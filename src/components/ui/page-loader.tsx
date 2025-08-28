import React from 'react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function PageLoader({ className, size = 'md', message = 'Carregando...' }: PageLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px] space-y-4",
      className
    )}>
      {/* Animated Motorcycle SVG */}
      <div className={cn(
        "relative animate-fade-in",
        sizeClasses[size]
      )}>
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Motorcycle Body */}
          <g className="animate-pulse">
            {/* Main body frame */}
            <path
              d="M60 60 L120 60 L125 45 L140 45 L145 60 L160 60"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              fill="none"
              className="animate-[draw_2s_ease-in-out_infinite]"
            />
            
            {/* Seat */}
            <ellipse
              cx="95"
              cy="55"
              rx="15"
              ry="5"
              fill="hsl(var(--primary))"
              className="animate-[fade-in_1.5s_ease-in-out_infinite_alternate]"
            />
            
            {/* Handlebars */}
            <path
              d="M125 45 L120 40 M130 40 L125 45"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className="animate-[draw_1.8s_ease-in-out_infinite]"
            />
            
            {/* Engine */}
            <rect
              x="75"
              y="65"
              width="20"
              height="15"
              rx="3"
              fill="hsl(var(--muted-foreground))"
              className="animate-[scale-in_2s_ease-in-out_infinite_alternate]"
            />
          </g>

          {/* Front Wheel */}
          <g className="animate-[spin_3s_linear_infinite]" style={{ transformOrigin: '45px 80px' }}>
            <circle
              cx="45"
              cy="80"
              r="15"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="45"
              cy="80"
              r="3"
              fill="hsl(var(--primary))"
            />
            {/* Spokes */}
            <line x1="30" y1="80" x2="60" y2="80" stroke="hsl(var(--primary))" strokeWidth="1" />
            <line x1="45" y1="65" x2="45" y2="95" stroke="hsl(var(--primary))" strokeWidth="1" />
            <line x1="34.4" y1="69.4" x2="55.6" y2="90.6" stroke="hsl(var(--primary))" strokeWidth="1" />
            <line x1="55.6" y1="69.4" x2="34.4" y2="90.6" stroke="hsl(var(--primary))" strokeWidth="1" />
          </g>

          {/* Rear Wheel */}
          <g className="animate-[spin_3s_linear_infinite]" style={{ transformOrigin: '155px 80px' }}>
            <circle
              cx="155"
              cy="80"
              r="15"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="155"
              cy="80"
              r="3"
              fill="hsl(var(--primary))"
            />
            {/* Spokes */}
            <line x1="140" y1="80" x2="170" y2="80" stroke="hsl(var(--primary))" strokeWidth="1" />
            <line x1="155" y1="65" x2="155" y2="95" stroke="hsl(var(--primary))" strokeWidth="1" />
            <line x1="144.4" y1="69.4" x2="165.6" y2="90.6" stroke="hsl(var(--primary))" strokeWidth="1" />
            <line x1="165.6" y1="69.4" x2="144.4" y2="90.6" stroke="hsl(var(--primary))" strokeWidth="1" />
          </g>

          {/* Animated exhaust smoke */}
          <g className="animate-[fade-in_1s_ease-in-out_infinite_alternate]">
            <circle cx="185" cy="75" r="2" fill="hsl(var(--muted-foreground))" opacity="0.5" className="animate-[fade-out_2s_ease-out_infinite]" />
            <circle cx="190" cy="72" r="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3" className="animate-[fade-out_2.5s_ease-out_infinite]" />
            <circle cx="195" cy="69" r="1" fill="hsl(var(--muted-foreground))" opacity="0.2" className="animate-[fade-out_3s_ease-out_infinite]" />
          </g>
        </svg>
      </div>

      {/* Loading message */}
      <div className="text-center space-y-2 animate-fade-in">
        <p className="text-sm font-medium text-foreground animate-pulse">
          {message}
        </p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:-0.32s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_ease-in-out_infinite] [animation-delay:-0.16s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1.4s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
}

// Full-screen loader for page transitions
export function FullPageLoader({ message = 'Carregando página...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg p-8 mx-4 max-w-sm w-full">
        <PageLoader size="lg" message={message} />
      </div>
    </div>
  );
}

// Inline loader for components
export function InlineLoader({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <PageLoader size="sm" message={message} />
    </div>
  );
}