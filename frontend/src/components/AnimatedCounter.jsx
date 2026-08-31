import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value = 0, duration = 900, className = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString("en-IN")}</span>;
}
