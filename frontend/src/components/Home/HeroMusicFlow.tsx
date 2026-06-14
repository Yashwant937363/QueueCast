import { motion } from "motion/react";
import { Disc3, Headphones, Music2, Music3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FloatingIconProps = {
  Icon: LucideIcon;
  duration: number;
  delay: number;
  top: number;
  rotate?: boolean;
};

function FloatingIcon({
  Icon,
  duration,
  delay,
  top,
  rotate = false,
}: FloatingIconProps) {
  return (
    <motion.div
      className="absolute text-violet-400/70"
      style={{
        top: `${top}%`,
      }}
      animate={{
        x: ["-10vw", "110vw"],
        y: [0, -30, 20, -25, 15, 0],
        scale: [1, 1.15, 1],
        rotate: rotate ? [0, 360] : undefined,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      <Icon size={28} />
    </motion.div>
  );
}

function Wave({
  top,
  opacity,
  duration,
}: {
  top: string;
  opacity: string;
  duration: number;
}) {
  return (
    <motion.div
      className={`absolute left-[-20%] w-[140%] h-40 ${opacity} z-0`}
      style={{
        top,
      }}
      animate={{
        x: [0, -120],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg viewBox="0 0 1200 200" className="w-full h-full">
        <path
          d="
            M0 100
            C100 20 200 180 300 100
            C400 20 500 180 600 100
            C700 20 800 180 900 100
            C1000 20 1100 180 1200 100
          "
          stroke="#8b5cf6"
          strokeWidth="4"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}

export default function HeroMusicFlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Wave Layers */}

      <Wave top="30%" opacity="opacity-10" duration={12} />

      <Wave top="45%" opacity="opacity-20" duration={18} />

      <Wave top="60%" opacity="opacity-15" duration={24} />

      {/* Floating Music Elements */}

      <FloatingIcon Icon={Music2} duration={12} delay={0} top={32} />

      <FloatingIcon Icon={Music3} duration={16} delay={2} top={46} />

      <FloatingIcon Icon={Headphones} duration={20} delay={5} top={60} />

      <FloatingIcon Icon={Disc3} duration={24} delay={8} top={38} rotate />

      {/* Extra Notes */}

      <FloatingIcon Icon={Music2} duration={22} delay={10} top={55} />

      <FloatingIcon Icon={Music3} duration={18} delay={7} top={70} />
    </div>
  );
}
