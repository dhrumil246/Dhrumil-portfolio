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
import { detectDevice } from "@/lib/deviceCheck";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// ─── Output Line Renderer ───
function OutputLine({
  item,
  onRun,
}: {
  item: TerminalLine;
  onRun: (cmd: string) => void;
}) {
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

  const cmd = item.cmd;
  const content = cmd ? (
    <>
      {/* Indent stays plain text so the hanging-indent math below still applies */}
      {item.text.match(/^\s*/)?.[0]}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRun(cmd);
        }}
        className="cmd-link"
        aria-label={`Run ${cmd}`}
      >
        {item.text.trimStart()}
      </button>
    </>
  ) : item.href ? (
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

  // Optical hanging indent: wrapped lines align with the text start — past a
  // leading "• " bullet too, so a long bullet doesn't wrap under its own marker
  const match = item.text.match(/^(\s+(?:• )?)/);
  const leadingSpaces = match ? match[1].length : 0;

  return (
    <div
      ref={ref}
      className="terminal-text"
      style={{
        color: `var(--${item.color === "text" ? "text" : item.color})`,
        minHeight: item.text === "" ? 10 : "auto",
        // GSAP leaves a transform on each line, so each is its own stacking
        // context; lift tappable lines so their enlarged hit area sits on top
        ...(cmd && { position: "relative", zIndex: 1 }),
        paddingLeft: leadingSpaces > 0 ? `${leadingSpaces}ch` : undefined,
        textIndent: leadingSpaces > 0 ? `-${leadingSpaces}ch` : undefined,
      }}
    >
      {content}
    </div>
  );
}


// ─── Main Terminal Component ───
export default function Terminal() {
  const output = useTerminalStore((s) => s.output);
  const appendOutput = useTerminalStore((s) => s.appendOutput);
  const clearOutput = useTerminalStore((s) => s.clearOutput);
  const pushHistory = useTerminalStore((s) => s.pushHistory);
  const navigateHistory = useTerminalStore((s) => s.navigateHistory);
  const setLastCommand = useTerminalStore((s) => s.setLastCommand);
  const deviceType = useTerminalStore((s) => s.deviceType);

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const welcomed = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  // Print the welcome once on mount — the entry screen is the boot sequence,
  // so the terminal starts ready instead of booting a second time.
  useEffect(() => {
    if (welcomed.current) return; // StrictMode runs effects twice in dev
    welcomed.current = true;
    const { name, title, tagline } = useTerminalStore.getState().portfolioData.PROFILE;

    appendOutput([
      EMPTY,
      line(`  ${name}`, "accent"),
      line(`  ${title}`, "green"),
      EMPTY,
      line(`  ${tagline}`, "textDim"),
      EMPTY,
      line(
        // Child effects run before TerminalWindow stores deviceType, so ask directly
        detectDevice() === "mobile"
          ? "  Tap a chip below to explore. In lists, underlined lines open details."
          : '  Type "help" for commands, or click a chip below.',
        "text"
      ),
      EMPTY,
    ]);
  }, [appendOutput]);

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
        className="flex-1 overflow-y-auto py-2 min-h-[200px]"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
      >
        {output.map((item, i) => (
          <OutputLine
            key={`${i}-${item.text.slice(0, 20)}`}
            item={item}
            onRun={runCommand}
          />
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

      </div>
    </div>
  );
}