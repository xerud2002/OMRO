"use client";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode, useEffect } from "react";

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

/**
 * Animates children when they scroll into view.
 */
export default function FadeInWhenVisible({
  children,
  delay = 0.1,
  duration = 0.6,
}: FadeInWhenVisibleProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      transition={{ duration, delay }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 30 },
      }}
    >
      {children}
    </motion.div>
  );
}
