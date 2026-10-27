"use client";

import { useEffect, useState } from "react";

export default function useScrollVisibility(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (!window.matchMedia("(max-width: 767px)").matches || currentY < 48) {
        setHidden(false);
      } else if (currentY - lastY > 8) {
        setHidden(true);
      } else if (lastY - currentY > 8) {
        setHidden(false);
      }
      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return hidden;
}
