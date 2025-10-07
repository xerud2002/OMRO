"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  xOffset?: number;
}

/**
 * Reusable fade-and-slide animation wrapper.
 * Reveals its children smoothly when they come into the viewport.
 *
 * @param delay   Optional delay in seconds before animation starts
 * @param yOffset Vertical offset in pixels (default: 40)
 * @param xOffset Horizontal offset in pixels (default: 0)
 */
export default function FadeInWhenVisible({
  children,
  delay = 0,
  yOffset = 40,
  xOffset = 0,
}: FadeInWhenVisibleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
