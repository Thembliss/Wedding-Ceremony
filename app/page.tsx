"use client";

import { useState } from "react";

import OpeningCurtains from "@/components/OpeningCurtains";
import ScratchReveal from "@/components/ScratchReveal";
import Fireworks from "@/components/Fireworks";
import InvitationCard from "@/components/InvitationCard";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [dateRevealed, setDateRevealed] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  /*
   * ==========================================
   * DATE REVEAL
   * ==========================================
   */

  const handleDateReveal = () => {
    if (dateRevealed) return;

    setDateRevealed(true);
    setShowFireworks(true);

    window.setTimeout(() => {
      setShowFireworks(false);
    }, 6500);
  };


  /*
   * ==========================================
   * REPLAY EXPERIENCE
   * ==========================================
   */

  const replayExperience = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      window.location.reload();
    }, 500);
  };


  return (
    <main className="wedding-page">

      {/* ==========================================
          OPENING CURTAINS
      ========================================== */}

      {!started && (
        <OpeningCurtains
          onComplete={() => {
            setStarted(true);
          }}
        />
      )}


      {/* ==========================================
          FIREWORKS
      ========================================== */}

      {showFireworks && (
        <Fireworks duration={6500} />
      )}


      {/* ==========================================
          HERO
      ========================================== */}

      <section className="hero">

        {/* Liquid glass background objects */}

        <div className="liquid-shape liquid-shape-one" />

        <div className="liquid-shape liquid-shape-two" />

        <div className="liquid-shape liquid-shape-three" />


        {/* Floating glass objects */}

        <div className="floating-glass glass-one" />

        <div className="floating-glass glass-two" />

        <div className="floating-glass glass-three" />


        {/* Gold cinematic lighting */}

        <div className="gold-light gold-light-one" />

        <div className="gold-light gold-light-two" />


        {/* Hero content */}

        <div className="hero-content">

          <p className="hero-eyebrow">
            TOGETHER WITH THEIR FAMILIES
          </p>


          <h1 className="couple-names">

            <span className="name">
              Groom Name
            </span>

            <span className="ampersand">
              &amp;
            </span>

            <span className="name">
              Bride Name
            </span>

          </h1>


          <p className="hero-description">
            Invite you to celebrate their special day
          </p>


          <div className="scroll-wrapper">

            <div className="scroll-glass">

              <span>
                SCROLL TO DISCOVER
              </span>

              <span className="scroll-arrow">
                ↓
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ==========================================
          SCRATCH DATE REVEAL
      ========================================== */}

      <section className="scratch-area">

        <ScratchReveal
          onReveal={handleDateReveal}
        />

      </section>


      {/* ==========================================
          MAIN INVITATION
      ========================================== */}

      {dateRevealed && (
        <InvitationCard />
      )}


      {/* ==========================================
          CLOSING / REPLAY
      ========================================== */}

      {dateRevealed && (
        <section className="replay-section">

          <div className="replay-content">

            <p className="replay-eyebrow">
              THE BEGINNING OF FOREVER
            </p>


            <h2 className="replay-title">
              Our story
              <br />
              continues...
            </h2>


            <button
              className="replay-button"
              onClick={replayExperience}
            >
              REPLAY EXPERIENCE
            </button>

          </div>

        </section>
      )}

    </main>
  );
}