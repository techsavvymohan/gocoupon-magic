import React, { useState, useEffect } from "react";
import { Flame, Trophy, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface StreakData {
  count: number;
  lastVisitDate: string;
  points: number;
  level: string;
}

export const DailySavingsStreak: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [streak, setStreak] = useState<StreakData>({
    count: 1,
    lastVisitDate: new Date().toISOString().slice(0, 10),
    points: 50,
    level: "Bronze Saver",
  });
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const stored = localStorage.getItem("gocoupon_user_streak");

      if (stored) {
        const parsed: StreakData = JSON.parse(stored);
        const lastDate = new Date(parsed.lastVisitDate);
        const todayDate = new Date(todayStr);
        const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 0) {
          // Already visited today
          setStreak(parsed);
          setHasCheckedInToday(true);
        } else if (diffDays === 1) {
          // Consecutive day streak!
          const newCount = parsed.count + 1;
          const newPoints = parsed.points + 25;
          const newLevel = newCount >= 7 ? "Gold VIP Saver" : newCount >= 3 ? "Silver Arbitrage" : "Bronze Saver";
          const updated: StreakData = {
            count: newCount,
            lastVisitDate: todayStr,
            points: newPoints,
            level: newLevel,
          };
          setStreak(updated);
          localStorage.setItem("gocoupon_user_streak", JSON.stringify(updated));
          setHasCheckedInToday(true);
        } else if (diffDays > 1) {
          // Streak broken
          const reset: StreakData = {
            count: 1,
            lastVisitDate: todayStr,
            points: parsed.points + 10,
            level: "Bronze Saver",
          };
          setStreak(reset);
          localStorage.setItem("gocoupon_user_streak", JSON.stringify(reset));
          setHasCheckedInToday(true);
        }
      } else {
        // First visit initialization
        const initial: StreakData = {
          count: 1,
          lastVisitDate: todayStr,
          points: 50,
          level: "Bronze Saver",
        };
        setStreak(initial);
        localStorage.setItem("gocoupon_user_streak", JSON.stringify(initial));
        setHasCheckedInToday(true);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleClaimReward = () => {
    toast.success(`🎉 Daily Bonus Claimed! You have a ${streak.count}-day savings streak with ${streak.points} reward points.`);
  };

  const progressPct = Math.min(Math.round((streak.count / 7) * 100), 100);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-4 sm:p-5 shadow-sm transition-all ${className}`}>
      {/* Background Accent glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Streak Icon & Level */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20">
            <Flame className="h-6 w-6 fill-white text-white animate-pulse" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-mono font-bold text-amber-400 border border-amber-500/40">
              {streak.count}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-display text-sm sm:text-base font-extrabold text-foreground">
                {streak.count}-Day Savings Streak Active!
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300">
                <Trophy className="h-2.5 w-2.5" />
                {streak.level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visit daily to prevent streak resets &amp; unlock verified VIP partner cashback arbitrage.
            </p>
          </div>
        </div>

        {/* Right: Points & Action Button */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-xs font-mono font-bold text-foreground block">
              {streak.points} Points
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              VIP Tier Access
            </span>
          </div>

          <button
            type="button"
            onClick={handleClaimReward}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold px-3.5 py-2 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Claim Daily Bonus</span>
          </button>
        </div>
      </div>

      {/* 7-Day Progress Bar */}
      <div className="mt-3.5 pt-3 border-t border-amber-500/20">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
            <Award className="h-3 w-3" />
            Day {streak.count} of 7 to Gold VIP
          </span>
          <span>{progressPct}% Completed</span>
        </div>
        <div className="h-2 w-full rounded-full bg-amber-500/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
