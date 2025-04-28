"use client";

import { motion } from "framer-motion";
import { CloudEffect } from "../../types/settlement";

interface CloudAnimationProps {
  clouds: CloudEffect[];
  showClouds: boolean;
  isMounted: boolean;
}

export default function CloudAnimation({
  clouds,
  showClouds,
  isMounted,
}: CloudAnimationProps) {
  if (!showClouds || !isMounted) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          initial={{ opacity: 1 }}
          animate={{
            opacity: 1,
            y: [0, 10, 0],
            scale: [1, 1.02, 1],
            transition: {
              y: {
                repeat: Infinity,
                duration: 5 + (cloud.id % 5),
                ease: "easeInOut",
                repeatType: "mirror",
              },
              scale: {
                repeat: Infinity,
                duration: 4 + (cloud.id % 3),
                ease: "easeInOut",
                repeatType: "mirror",
              },
            },
          }}
          exit={{
            opacity: 0,
            scale: cloud.scale || 1.5,
            transition: {
              delay: cloud.delay,
              duration: 2,
              ease: "easeOut",
            },
          }}
          className="absolute"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: cloud.size,
            height: cloud.size / 1.8,
          }}
        >
          <div
            className="w-full h-full bg-gradient-radial from-white via-white to-white/60 rounded-full blur-lg"
            style={{
              boxShadow:
                "0 0 40px 30px rgba(255, 255, 255, 0.8), 0 0 100px 60px rgba(255, 255, 255, 0.5)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
