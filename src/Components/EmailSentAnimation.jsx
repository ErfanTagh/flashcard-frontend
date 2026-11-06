import React from "react";
import { Mail } from "lucide-react";

/**
 * "We emailed you" badge: a brand-gradient circle with an envelope, and three
 * rings swelling out of it one after another. After 123resume's confirmation
 * animation, in RecallCards' blue-to-sky gradient.
 *
 * The rings only move when the visitor has not asked for reduced motion.
 */
export default function EmailSentAnimation() {
  // A pale sky tint, not the full brand gradient. The lightness has to be in
  // the colour's alpha (bg-accent/10): pulse-ring animates `opacity` from 1 to
  // 0, which overrides any opacity class and left the rings at full strength.
  const ring = "absolute inset-0 rounded-full motion-safe:animate-pulse-ring";

  return (
    <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center" aria-hidden="true">
      <div className={`${ring} bg-accent/10`} />
      <div className={`${ring} bg-accent/15`} style={{ animationDelay: "1s" }} />
      <div className={`${ring} bg-accent/20`} style={{ animationDelay: "2s" }} />

      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 motion-safe:animate-pop-in">
        <Mail className="h-8 w-8 text-primary-foreground" />
      </div>
    </div>
  );
}
