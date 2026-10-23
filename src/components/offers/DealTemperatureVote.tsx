import React, { useState, useEffect } from "react";
import { Flame, Snowflake, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface DealTemperatureVoteProps {
  dealId: string;
  initialTemperature?: number;
  compact?: boolean;
}

export const DealTemperatureVote: React.FC<DealTemperatureVoteProps> = ({
  dealId,
  initialTemperature = 75,
  compact = false,
}) => {
  // Deterministic seed temperature based on dealId if initial is default
  const baseTemp = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < dealId.length; i++) {
      hash = (hash << 5) - hash + dealId.charCodeAt(i);
      hash |= 0;
    }
    const offset = Math.abs(hash) % 40;
    return Math.max(initialTemperature + offset, 65);
  }, [dealId, initialTemperature]);

  const [temperature, setTemperature] = useState<number>(baseTemp);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`gocoupon_vote_${dealId}`);
      if (stored === "up") {
        setUserVote("up");
        setTemperature(baseTemp + 1);
      } else if (stored === "down") {
        setUserVote("down");
        setTemperature(baseTemp - 1);
      }
    } catch {
      // Ignore
    }
  }, [dealId, baseTemp]);

  const handleVote = (e: React.MouseEvent, type: "up" | "down") => {
    e.stopPropagation();
    if (userVote === type) {
      // Toggle off
      setUserVote(null);
      setTemperature(baseTemp);
      localStorage.removeItem(`gocoupon_vote_${dealId}`);
      return;
    }

    if (type === "up") {
      setUserVote("up");
      setTemperature(baseTemp + 1);
      localStorage.setItem(`gocoupon_vote_${dealId}`, "up");
      toast.success("🔥 Deal upvoted! Thank you for confirming this offer works.");
    } else {
      setUserVote("down");
      setTemperature(Math.max(baseTemp - 1, 0));
      localStorage.setItem(`gocoupon_vote_${dealId}`, "down");
      toast.info("❄️ Noted! Our automated tests will re-verify this promo code.");
    }
  };

  const isHot = temperature >= 70;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] font-bold">
        <Flame className={`h-3 w-3 ${isHot ? "fill-orange-500 text-orange-500 animate-pulse" : "text-muted-foreground"}`} />
        <span className={isHot ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}>
          {temperature}&deg;
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-secondary/40 px-2 py-1 text-xs font-mono"
    >
      <div className="flex items-center gap-1 pr-1 border-r border-border/60">
        <Flame className={`h-3.5 w-3.5 ${isHot ? "fill-orange-500 text-orange-500 animate-pulse" : "text-muted-foreground"}`} />
        <span className={`font-bold ${isHot ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
          {temperature}&deg; Hot
        </span>
      </div>

      {/* Upvote Button */}
      <button
        type="button"
        title="Vote working / hot"
        aria-label="Vote deal works"
        onClick={(e) => handleVote(e, "up")}
        className={`flex h-5 w-5 items-center justify-center rounded-md transition-all cursor-pointer ${
          userVote === "up"
            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold scale-110"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        <ThumbsUp className="h-3 w-3" />
      </button>

      {/* Downvote Button */}
      <button
        type="button"
        title="Vote expired / cold"
        aria-label="Vote deal expired"
        onClick={(e) => handleVote(e, "down")}
        className={`flex h-5 w-5 items-center justify-center rounded-md transition-all cursor-pointer ${
          userVote === "down"
            ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold scale-110"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        <ThumbsDown className="h-3 w-3" />
      </button>
    </div>
  );
};
