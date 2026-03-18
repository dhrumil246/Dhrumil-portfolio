"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { useTerminalStore, type TerminalLine } from "@/store/useTerminalStore";
import {
  executeCommand,
} from "@/components/terminal/commands";
import { getHistoryPrompt } from "@/components/terminal/Prompt";
import { autocomplete, line, EMPTY } from "@/lib/commandParser";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// ─── Output Line Renderer ───
function OutputLine({ item }: { item: TerminalLine }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (ref.current) {
      gsap.from(ref.current, {
        opacity: 0,
        y: 3,
        duration: 0.15,
        ease: "power2.out",
      });
    }
  }, { scope: ref });

  const content = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline transition-colors"
      style={{ textUnderlineOffset: "4px" }}
    >
      {item.text}
    </a>
  ) : (
    item.text
  );

  // Optical hanging indent to align wrapped lines with text start
  const match = item.text.match(/^(\s+)/);
  const leadingSpaces = match ? match[1].length : 0;

  return (
    <div
      ref={ref}
      className="terminal-text"
      style={{
        color: `var(--${item.color === "text" ? "text" : item.color})`,
        minHeight: item.text === "" ? 10 : "auto",
        paddingLeft: leadingSpaces > 0 ? `${leadingSpaces}ch` : undefined,
        textIndent: leadingSpaces > 0 ? `-${leadingSpaces}ch` : undefined,
      }}
    >
      {content}
    </div>
  );
}

// ─── Boot Sequence Line ───
function BootLine({
  text,
  color,
  delay,
  typewriter = false,
  speed = 30,
  onComplete,
}: {
  text: string;
  color: string;
  delay: number;
  typewriter?: boolean;
  speed?: number;
  onComplete?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setVisible(true);

      if (typewriter && text.length > 0) {
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setDisplayText(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(interval);
            onComplete?.();
          }
        }, speed);
        return () => clearInterval(interval);
      } else {
        setDisplayText(text);
        // Small delay before calling onComplete for non-typewriter lines
        const completeTimer = setTimeout(() => onComplete?.(), 50);
        return () => clearTimeout(completeTimer);
      }
    }, delay);

    return () => clearTimeout(showTimer);
  }, [text, delay, typewriter, speed, onComplete]);

  useGSAP(() => {
    if (ref.current && visible && !typewriter) {
      gsap.from(ref.current, {
        opacity: 0,
        y: 4,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  }, { scope: ref, dependencies: [visible] });

  if (!visible) return null;

  // Optical hanging indent to align wrapped lines with text start
  const match = text.match(/^(\s+)/);
  const leadingSpaces = match ? match[1].length : 0;

  return (
    <div
      ref={ref}
      className="terminal-text"
      style={{
        color: `var(--${color})`,
        minHeight: text === "" ? 10 : "auto",
        paddingLeft: leadingSpaces > 0 ? `${leadingSpaces}ch` : undefined,
        textIndent: leadingSpaces > 0 ? `-${leadingSpaces}ch` : undefined,
      }}
    >
      {displayText}
      {typewriter && displayText.length < text.length && (
        <span
          className="cursor-blink inline-block"
          style={{
            width: 7,
            height: 14,
            background: "var(--accent)",
            opacity: 0.7,
            marginLeft: 1,
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </div>
  );
}

// ─── Boot Sequence ───
function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pData = useTerminalStore((s) => s.portfolioData);
  const profile = pData?.PROFILE || {
    name: "GUEST_USER",
    title: "System Initialized",
    tagline: "Connection active.",
  };

  // Phase progression
  const advance = useCallback(() => {
    setPhase((p) => p + 1);
  }, []);

  // Boot sequence timing:
  // Phase 0: system init lines (fast)
  // Phase 1: name typewriter
  // Phase 2: title fade
  // Phase 3: tagline fade
  // Phase 4: blank + help instruction
  // Phase 5: done → hand off to terminal

  useEffect(() => {
    if (phase >= 6) {
      const t = setTimeout(onComplete, 200);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  return (
    <div ref={containerRef} className="py-2">
      {/* System init flicker */}
      <BootLine
        text="  Initializing portfolio..."
        color="textDim"
        delay={200}
        onComplete={advance}
      />

      {phase >= 1 && (
        <BootLine
          text="  Loading modules: react, three, zustand ✓"
          color="textDim"
          delay={100}
          onComplete={advance}
        />
      )}

      {phase >= 2 && (
        <BootLine
          text="  Fetching remote profile..."
          color="textDim"
          delay={100}
          onComplete={advance}
        />
      )}

      {phase >= 3 && (
        <BootLine text="" color="text" delay={100} onComplete={advance} />
      )}

      {/* Name — typewriter effect */}
      {phase >= 4 && (
        <BootLine
          text={`  ${profile.name}`}
          color="accent"
          delay={150}
          typewriter
          speed={45}
          onComplete={advance}
        />
      )}

      {/* Title — fade in */}
      {phase >= 5 && (
        <BootLine
          text={`  ${profile.title}`}
          color="green"
          delay={200}
          onComplete={advance}
        />
      )}

      {/* Tagline */}
      {phase >= 6 && (
        <>
          <BootLine text="" color="text" delay={100} />
          <BootLine
            text={`  ${profile.tagline}`}
            color="textDim"
            delay={200}
          />
          <BootLine text="" color="text" delay={400} />
          <BootLine
            text='  Type "help" for commands, or click a chip below.'
            color="text"
            delay={500}
            onComplete={advance}
          />
          <BootLine text="" color="text" delay={600} />
        </>
      )}
    </div>
  );
}

// ─── Main Terminal Component ───
export default function Terminal({ onBootComplete }: { onBootComplete?: () => void }) {
  const output = useTerminalStore((s) => s.output);
  const appendOutput = useTerminalStore((s) => s.appendOutput);
  const clearOutput = useTerminalStore((s) => s.clearOutput);
  const pushHistory = useTerminalStore((s) => s.pushHistory);
  const navigateHistory = useTerminalStore((s) => s.navigateHistory);
  const setLastCommand = useTerminalStore((s) => s.setLastCommand);
  const deviceType = useTerminalStore((s) => s.deviceType);

  const [input, setInput] = useState("");
  const [booting, setBooting] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, booting]);

  // After boot finishes, push welcome into store, focus input, notify parent
  const handleBootComplete = useCallback(() => {
    // Push the static welcome message into the store so it persists
    const pData = useTerminalStore.getState().portfolioData;
    const name = pData?.PROFILE?.name || "GUEST_USER";
    const title = pData?.PROFILE?.title || "System Initialized";
    const tagline = pData?.PROFILE?.tagline || "Connection active.";

    appendOutput([
      EMPTY,
      line(`  ${name}`, "accent"),
      line(`  ${title}`, "green"),
      EMPTY,
      line(`  ${tagline}`, "textDim"),
      EMPTY,
      line('  Type "help" for commands, or click a chip below.', "text"),
      EMPTY,
    ]);
    setBooting(false);
    onBootComplete?.();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [onBootComplete, appendOutput]);

  // Fetch dynamic data on mount
  useEffect(() => {
    useTerminalStore.getState().fetchPortfolioData();
  }, []);

  // Execute a command
  const runCommand = useCallback(
    (cmd: string) => {
      const promptLine = line(`${getHistoryPrompt()}${cmd}`, "accent");
      const result = executeCommand(cmd);

      if (cmd.trim().toLowerCase() === "clear") {
        clearOutput();
      } else {
        appendOutput([promptLine, ...result]);
      }

      pushHistory(cmd);
      setLastCommand(cmd);
      setInput("");
    },
    [appendOutput, clearOutput, pushHistory, setLastCommand]
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
          if (input.trim()) runCommand(input);
          break;

        case "Tab":
          e.preventDefault();
          const match = autocomplete(input);
          if (match) setInput(match);
          break;

        case "ArrowUp":
          e.preventDefault();
          const prevCmd = navigateHistory("up");
          if (prevCmd) setInput(prevCmd);
          break;

        case "ArrowDown":
          e.preventDefault();
          const nextCmd = navigateHistory("down");
          setInput(nextCmd);
          break;

        case "l":
          if (e.ctrlKey) {
            e.preventDefault();
            clearOutput();
          }
          break;

        case "c":
          if (e.ctrlKey) {
            e.preventDefault();
            appendOutput([line(`${getHistoryPrompt()}${input}^C`, "red")]);
            setInput("");
          }
          break;
      }
    },
    [input, runCommand, navigateHistory, clearOutput, appendOutput]
  );

  const focusInput = () => inputRef.current?.focus();
  const isMobile = deviceType === "mobile";

  return (
    <div
      onClick={focusInput}
      className="flex flex-col flex-1 min-h-0 cursor-text"
    >
      {/* Scrollable output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-2 min-h-[300px]"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
      >
        {/* Boot sequence OR regular output */}
        {booting ? (
          <BootSequence onComplete={handleBootComplete} />
        ) : (
          <>
            {output.map((item, i) => (
              <OutputLine key={`${i}-${item.text.slice(0, 20)}`} item={item} />
            ))}

            {/* Input line */}
            {!isMobile && (
              <div className="flex items-center py-0.5 terminal-text">
                <span
                  style={{ color: "var(--green)", whiteSpace: "pre" }}
                >
                  {"  ❯ "}
                </span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="bg-transparent border-none outline-none w-full"
                    style={{
                      color: "var(--text)",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      caretColor: "transparent",
                    }}
                    aria-label="Terminal command input"
                  />
                  {/* Custom block cursor */}
                  <span
                    className="absolute top-0 cursor-blink pointer-events-none"
                    style={{
                      left: `${input.length * 7.8}px`,
                      width: 8,
                      height: 17,
                      background: "var(--accent)",
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Mobile read-only indicator */}
            {isMobile && (
              <div className="terminal-text py-1" style={{ color: "var(--textDim)" }}>
                {"  Use the chips below to navigate ↓"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}