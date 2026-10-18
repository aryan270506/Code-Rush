import React, { useRef, useEffect } from "react";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  onComplete?: (code: string) => void;
  error?: boolean;
}

export default function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  onComplete,
  error = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split string into array of characters
  const digits = value.split("").slice(0, length);
  while (digits.length < length) {
    digits.push("");
  }

  useEffect(() => {
    // Focus first input on mount
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow only single numeric digit
    const cleaned = rawVal.replace(/\D/g, "");

    if (!cleaned) {
      // Clear digit
      const newDigits = [...digits];
      newDigits[index] = "";
      const newValue = newDigits.join("");
      onChange(newValue);
      return;
    }

    const digit = cleaned[cleaned.length - 1]; // pick last entered digit
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newValue = newDigits.join("");
    onChange(newValue);

    // Auto advance to next input
    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits entered, trigger onComplete
    if (newValue.length === length && !newDigits.includes("")) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous box and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    // Keep only numbers up to length
    const numeric = pastedData.replace(/\D/g, "").slice(0, length);

    if (numeric) {
      onChange(numeric);
      // Focus appropriate input box
      const nextIndex = Math.min(numeric.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      if (numeric.length === length) {
        onComplete?.(numeric);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1} of verification code`}
          className={`h-12 w-10 sm:h-14 sm:w-12 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border bg-bg-secondary/90 text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 select-all ${
            error
              ? "border-danger focus:border-danger focus:ring-danger/30 text-danger"
              : digit
              ? "border-violet-primary/60 bg-violet-primary/5 text-violet-light ring-1 ring-violet-primary/30"
              : "border-border hover:border-border-glow focus:border-violet-primary focus:ring-violet-primary/30"
          }`}
        />
      ))}
    </div>
  );
}
