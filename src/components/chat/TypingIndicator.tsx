"use client";

interface TypingIndicatorProps {
  label?: string;
}

export default function TypingIndicator({ label = "Support is typing" }: TypingIndicatorProps) {
  return (
    <div className="flex flex-col items-start max-w-[85%] animate-fade-in">
      <span className="text-[10px] text-muted-foreground mb-0.5">Support</span>
      <div className="px-3 py-2.5 bg-muted text-foreground text-sm flex items-center gap-2">
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}
