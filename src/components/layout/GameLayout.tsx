import type { ReactNode } from "react";
import { motion } from "motion/react";

import { containerMotion } from "@/game/constants";

type GameLayoutProps = {
  map: ReactNode;
  panel: ReactNode;
};

export function GameLayout({ map, panel }: GameLayoutProps) {
  return (
    <motion.main
      className="relative mx-auto grid h-full max-w-[1800px] grid-cols-1 grid-rows-1 gap-2 overflow-hidden sm:gap-3 lg:grid-cols-[1.9fr_minmax(320px,420px)]"
      variants={containerMotion}
      initial="hidden"
      animate="show"
    >
      {map}
      <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 z-[1200] max-h-[66dvh] overflow-hidden lg:static lg:inset-auto lg:z-auto lg:max-h-none">
        <div className="w-full">{panel}</div>
      </div>
    </motion.main>
  );
}
