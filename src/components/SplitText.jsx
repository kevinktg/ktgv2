/**
 * Word + character spans for GSAP stagger (no @gsap/splittext Club plugin).
 * Pass a plain string as children only.
 */
export function SplitText({
  children,
  className = "",
  wordClass = "split-word",
  charClass = "split-char",
}) {
  const text = typeof children === "string" ? children : String(children ?? "");
  if (!text.trim()) return null;

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className={`${wordClass} inline-block whitespace-nowrap`}
          style={{
            marginRight: "0.25em",
            display: "inline-block",
            verticalAlign: "middle",
          }}
        >
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className={`${charClass} inline-block`}
              style={{ display: "inline-block" }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
