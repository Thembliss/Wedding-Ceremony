"use client";

import { motion } from "framer-motion";

export default function InvitationCard() {
  return (
    <section className="invitation-section">

      <motion.div
        className="invitation-card"
        initial={{
          opacity: 0,
          y: 120,
          rotateX: 12,
          rotateY: -4,
          scale: 0.92,
          filter: "blur(8px)",
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          filter: "blur(0px)",
        }}
        viewport={{
          once: true,
          amount: 0.25,
        }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      >

        {/* =================================
            LIQUID GLASS LIGHT
        ================================= */}

        <div className="invitation-light" />

        <div className="invitation-reflection" />


        {/* =================================
            CARD CONTENT
        ================================= */}

        <div className="invitation-inner">

          <p className="invitation-eyebrow">
            WITH THE BLESSINGS OF OUR FAMILIES
          </p>


          <div className="invitation-names">

            <span>
              Groom Name
            </span>

            <small>
              &amp;
            </small>

            <span>
              Bride Name
            </span>

          </div>


          <div className="invitation-divider">

            <span />

            <i>
              ✦
            </i>

            <span />

          </div>


          <p className="invitation-request">
            REQUEST THE PLEASURE OF YOUR COMPANY
          </p>


          <p className="invitation-ceremony">
            AT THEIR WEDDING CEREMONY
          </p>


          <div className="invitation-details">

            <div>
              <span>
                DATE
              </span>

              <strong>
                12 DECEMBER 2027
              </strong>
            </div>


            <div>
              <span>
                TIME
              </span>

              <strong>
                7:00 PM
              </strong>
            </div>


            <div>
              <span>
                VENUE
              </span>

              <strong>
                GRAND CONVENTION HALL
              </strong>
            </div>

          </div>


          <div className="invitation-bottom-line" />

        </div>

      </motion.div>

    </section>
  );
}