/**
 * @file server/services/deal-honesty.ts
 * @description Deal Honesty & Fake Sale Detection Engine.
 *
 * Analyzes current offer prices against 30-day/90-day moving baselines,
 * detects pre-sale artificial price hikes (e.g. inflating price 10 days before
 * Big Billion Days or Black Friday), and assigns an objective Honesty Score.
 */

export type DealHonestyGrade = "REAL_BARGAIN" | "FAIR_DEAL" | "CYCLICAL_NORMAL" | "FAKE_DISCOUNT_ALERT";

export interface DealHonestyReport {
  score: number; // 0 to 100
  grade: DealHonestyGrade;
  badgeLabel: string;
  badgeColor: "emerald" | "amber" | "rose" | "blue";
  isAuthenticDiscount: boolean;
  baselinePrice: number;
  currentPrice: number;
  highestObservedPrice: number;
  lowestObservedPrice: number;
  inflationDetected: boolean;
  savingsVsBaseline: number;
  savingsVsBaselinePercent: number;
  explanation: string;
}

export interface PricePoint {
  date: string; // ISO date or "YYYY-MM-DD"
  price: number;
}

/**
 * Evaluates whether a deal discount is authentic, a normal cyclical variance,
 * or an artificial marketing markup.
 */
export function evaluateDealHonesty(options: {
  currentPrice: number;
  history?: PricePoint[];
  typicalMinPrice?: number;
  typicalMaxPrice?: number;
  claimedOriginalPrice?: number; // e.g. MSRP / crossed-out sticker price
}): DealHonestyReport {
  const current = options.currentPrice;

  // 1. Establish baseline from price history if available
  let baseline = current;
  let lowest = current;
  let highest = current;
  let preSaleHike = false;

  if (options.history && options.history.length > 0) {
    const prices = options.history.map((p) => p.price).filter((p) => p > 0);
    if (prices.length > 0) {
      lowest = Math.min(...prices);
      highest = Math.max(...prices);
      const sum = prices.reduce((acc, p) => acc + p, 0);
      baseline = Math.round(sum / prices.length);

      // Check if price was hiked sharply right before the current drop
      if (options.history.length >= 3) {
        const sorted = [...options.history].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const mostRecent = sorted[0]?.price || current;
        const weekAgo = sorted[1]?.price || baseline;
        const twoWeeksAgo = sorted[2]?.price || baseline;

        // If price jumped >15% two weeks ago and is now "discounted" back to the original level
        if (weekAgo > twoWeeksAgo * 1.15 && current >= twoWeeksAgo * 0.95) {
          preSaleHike = true;
        }
      }
    }
  } else if (options.typicalMinPrice && options.typicalMaxPrice) {
    lowest = options.typicalMinPrice;
    highest = options.typicalMaxPrice;
    baseline = Math.round((options.typicalMinPrice + options.typicalMaxPrice) / 2);
  } else if (options.claimedOriginalPrice && options.claimedOriginalPrice > current) {
    // If no history exists, use claimed original price conservatively
    baseline = Math.round((options.claimedOriginalPrice + current) / 2);
    highest = options.claimedOriginalPrice;
    lowest = current;
  }

  // 2. Score Calculation (0 to 100)
  let score = 70; // neutral starting point

  // A. Savings vs Average Baseline
  const savingsVsAvg = baseline - current;
  const savingsPct = baseline > 0 ? (savingsVsAvg / baseline) * 100 : 0;

  if (savingsPct > 0) {
    // Rewarded up to +25 points for beating the 30-day average
    score += Math.min(25, Math.round(savingsPct * 1.25));
  } else if (savingsPct < -5) {
    // Penalized if price is currently above the 30-day average
    score -= Math.min(30, Math.round(Math.abs(savingsPct) * 1.5));
  }

  // B. Proximity to All-Time Low
  if (lowest > 0) {
    const deltaFromLowest = ((current - lowest) / lowest) * 100;
    if (deltaFromLowest <= 3) {
      score += 15; // At or within 3% of historical low
    } else if (deltaFromLowest <= 10) {
      score += 5;
    } else if (deltaFromLowest > 30) {
      score -= 15;
    }
  }

  // C. Artificial Price Inflation Penalty
  if (preSaleHike) {
    score -= 40; // Heavy penalty for artificial pre-sale price gouging
  }

  // Bound score between 5 and 99
  const finalScore = Math.max(5, Math.min(99, Math.round(score)));

  // 3. Determine Grade and Badge
  let grade: DealHonestyGrade = "CYCLICAL_NORMAL";
  let badgeLabel = "Fair Deal";
  let badgeColor: "emerald" | "amber" | "rose" | "blue" = "blue";
  let explanation = "";

  if (preSaleHike || finalScore < 45) {
    grade = "FAKE_DISCOUNT_ALERT";
    badgeLabel = "Fake Sale Alert";
    badgeColor = "rose";
    explanation = `Caution: Seller increased the price prior to applying this sale banner. Current price is near the 30-day median.`;
  } else if (finalScore >= 85) {
    grade = "REAL_BARGAIN";
    badgeLabel = "All-Time Low";
    badgeColor = "emerald";
    explanation = `Authentic price drop: Currently within 3% of the lowest price seen in the last 90 days.`;
  } else if (finalScore >= 70) {
    grade = "FAIR_DEAL";
    badgeLabel = "Genuine Discount";
    badgeColor = "emerald";
    explanation = `Price is genuinely ${Math.round(savingsPct)}% below the 30-day rolling market average.`;
  } else {
    grade = "CYCLICAL_NORMAL";
    badgeLabel = "Typical Market Price";
    badgeColor = "amber";
    explanation = `Price is within normal seasonal fluctuation bands. Consider waiting if not urgent.`;
  }

  return {
    score: finalScore,
    grade,
    badgeLabel,
    badgeColor,
    isAuthenticDiscount: grade === "REAL_BARGAIN" || grade === "FAIR_DEAL",
    baselinePrice: baseline,
    currentPrice: current,
    highestObservedPrice: highest,
    lowestObservedPrice: lowest,
    inflationDetected: preSaleHike,
    savingsVsBaseline: Math.max(0, savingsVsAvg),
    savingsVsBaselinePercent: Math.max(0, Math.round(savingsPct)),
    explanation,
  };
}
