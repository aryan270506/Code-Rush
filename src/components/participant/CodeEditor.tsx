import React, { useState, useRef } from "react";
import {
  RotateCcw,
  Copy,
  Check,
  Code,
  Maximize2,
  Minimize2,
  Terminal,
} from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  language: string;
  onLanguageChange?: (lang: string) => void;
  onResetCode?: () => void;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export const SUPPORTED_LANGUAGES = [
  { id: "python", label: "Python 3.11", ext: ".py" },
  { id: "javascript", label: "JavaScript (Node.js 20)", ext: ".js" },
  { id: "cpp", label: "C++ (GCC 12 / C++17)", ext: ".cpp" },
  { id: "java", label: "Java (OpenJDK 17)", ext: ".java" },
];

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  onResetCode,
  readOnly = false,
  minHeight = "400px",
  maxHeight = "600px",
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");
  const lineCount = Math.max(lines.length, 1);

  // Sync scrolling between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      // Insert 2 spaces
      const updated = code.substring(0, start) + "  " + code.substring(end);
      onChange(updated);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border bg-bg-primary overflow-hidden flex flex-col transition-all shadow-xl ${
        isFullscreen ? "fixed inset-4 z-50 bg-bg-primary/95 backdrop-blur-md" : ""
      }`}
      style={{
        height: isFullscreen ? "calc(100vh - 2rem)" : undefined,
      }}
    >
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-bg-card/70 px-4 py-2.5 gap-2 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-danger/80" />
            <div className="h-3 w-3 rounded-full bg-warning/80" />
            <div className="h-3 w-3 rounded-full bg-success/80" />
          </div>

          <div className="h-4 w-[1px] bg-border mx-1" />

          {/* Language Selector */}
          {onLanguageChange ? (
            <div className="flex items-center gap-2">
              <Code className="h-3.5 w-3.5 text-violet-light" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={readOnly}
                className="bg-bg-secondary text-text-primary text-xs font-mono font-medium rounded-lg px-2.5 py-1 border border-border focus:outline-none focus:border-violet-primary cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
              <Terminal className="h-3.5 w-3.5 text-violet-light" />
              <span>{language.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="hidden sm:inline-block font-mono text-[11px] text-text-muted px-2 py-0.5 rounded bg-bg-secondary border border-border">
            {lineCount} lines • {code.length} chars
          </span>

          {onResetCode && !readOnly && (
            <button
              onClick={onResetCode}
              title="Reset starter code"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-bg-secondary hover:bg-bg-card hover:text-text-primary text-text-muted transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-bg-secondary hover:bg-bg-card hover:text-text-primary text-text-muted transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1 rounded-lg border border-border bg-bg-secondary hover:bg-bg-card text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="relative flex flex-1 overflow-hidden font-mono text-xs sm:text-sm bg-[#070714]"
        style={{
          minHeight: isFullscreen ? "auto" : minHeight,
          maxHeight: isFullscreen ? "auto" : maxHeight,
        }}
      >
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="select-none py-3 pl-3 pr-2 text-right font-mono text-[11px] sm:text-xs text-text-muted/60 bg-[#0a0a1e] border-r border-border overflow-hidden shrink-0"
          style={{ width: "3.2rem" }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Input Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 resize-none bg-transparent p-3 font-mono text-xs sm:text-sm leading-6 text-text-primary placeholder:text-text-muted/40 focus:outline-none overflow-auto whitespace-pre selection:bg-violet-primary/30"
          placeholder="// Type your solution code here..."
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-border bg-bg-card/40 px-3 py-1.5 text-[11px] font-mono text-text-muted">
        <span>Tab Size: 2 • UTF-8</span>
        <span>Standard I/O Execution</span>
      </div>
    </div>
  );
};
