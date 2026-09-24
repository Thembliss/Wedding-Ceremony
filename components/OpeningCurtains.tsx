"use client";

import { useState } from "react";

interface OpeningCurtainsProps {
  onComplete: () => void;
}

export default function OpeningCurtains({
  onComplete,
}: OpeningCurtainsProps) {
  const [opening, setOpening] = useState(false);

  const handleStart = () => {
    if (opening) return;

    setOpening(true);

    window.setTimeout(() => {
      onComplete();
    }, 2500);
  };

  return (
    <div className="curtain-screen">

      {/* Light behind the curtains */}
      <div
        className="curtain-light"
        style={{
          opacity: opening ? 1 : 0.35,
        }}
      />

      {/* LEFT CURTAIN */}
      <div
        className="stage-curtain curtain-left"
        style={{
          transform: opening
            ? "translate3d(-105%, 0, 0)"
            : "translate3d(0, 0, 0)",

          transition:
            "transform 2.4s cubic-bezier(0.76, 0, 0.18, 1)",
        }}
      >
        <div className="curtain-fabric">
          <div className="curtain-folds" />
          <div className="curtain-sheen" />
        </div>
      </div>


      {/* RIGHT CURTAIN */}
      <div
        className="stage-curtain curtain-right"
        style={{
          transform: opening
            ? "translate3d(105%, 0, 0)"
            : "translate3d(0, 0, 0)",

          transition:
            "transform 2.4s cubic-bezier(0.76, 0, 0.18, 1)",
        }}
      >
        <div className="curtain-fabric">
          <div className="curtain-folds" />
          <div className="curtain-sheen" />
        </div>
      </div>


      {/* CENTER BUTTON */}
      <div
        className="curtain-content"
        style={{
          opacity: opening ? 0 : 1,
          transform: opening
            ? "translateY(-20px) scale(0.96)"
            : "translateY(0) scale(1)",
          transition:
            "opacity 0.7s ease, transform 0.9s ease",
          pointerEvents: opening ? "none" : "auto",
        }}
      >

        <button
          className="begin-button"
          onClick={handleStart}
          disabled={opening}
        >
          <span>
            CLICK TO BEGIN
          </span>
        </button>

        <p>
          A little story is about to unfold...
        </p>

      </div>

    </div>
  );
}