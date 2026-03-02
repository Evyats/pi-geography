import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { MAP_TOP_HUD_ICON_BUTTON_CLASS } from "@/components/game/map-hud/hudStyles";

type ThemeToggleMapButtonProps = {
  isDarkMode: boolean;
  onToggleTheme: () => void;
};

export function ThemeToggleMapButton({ isDarkMode, onToggleTheme }: ThemeToggleMapButtonProps) {
  return (
    <div className="absolute left-[58px] top-[10px] z-[500] sm:left-[60px] sm:top-[10px]">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className={MAP_TOP_HUD_ICON_BUTTON_CLASS}
        aria-label={isDarkMode ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
        data-no-continue="true"
        onClick={onToggleTheme}
      >
        <span className="relative block h-4 w-4 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {isDarkMode ? (
              <motion.span
                key="sun"
                className="absolute inset-0"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Sun className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                className="absolute inset-0"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Moon className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </Button>
    </div>
  );
}
