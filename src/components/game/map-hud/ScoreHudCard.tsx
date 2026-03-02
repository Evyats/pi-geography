import { motion } from "motion/react";

import { Card, CardContent } from "@/components/ui/card";
import { MAP_TOP_HUD_CARD_CLASS } from "@/components/game/map-hud/hudStyles";

type ScoreHudCardProps = {
  score: number;
  displayScore: number;
};

export function ScoreHudCard({ score, displayScore }: ScoreHudCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className={`h-[64px] min-w-[74px] text-center sm:min-w-[88px] ${MAP_TOP_HUD_CARD_CLASS}`}>
        <CardContent className="flex h-full flex-col items-center justify-center p-2">
          <p className="text-xs text-ink/70">ניקוד</p>
          <motion.p
            key={score}
            initial={{ scale: 0.92, opacity: 0.82 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            className="text-2xl font-bold text-primary"
          >
            {displayScore}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
