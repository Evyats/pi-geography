import { motion } from "motion/react";

import { Card, CardContent } from "@/components/ui/card";
import { MAP_TOP_HUD_CARD_CLASS } from "@/components/game/map-hud/hudStyles";

type ProgressHudCardProps = {
  roundProgressPct: number;
};

export function ProgressHudCard({ roundProgressPct }: ProgressHudCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className={`h-10 min-w-[118px] sm:min-w-[138px] ${MAP_TOP_HUD_CARD_CLASS}`}>
        <CardContent className="flex h-full items-center p-1.5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${roundProgressPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
