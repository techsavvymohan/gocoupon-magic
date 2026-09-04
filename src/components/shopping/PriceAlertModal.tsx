/**
 * @file PriceAlertModal.tsx
 * @description UI/UX Pro Max Target Price & Price-Drop Alert Modal.
 */

import { useState, useEffect } from "react";
import { addToWatchlist } from "@/lib/services/watchlist-service";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  triggerPriceDropNotification,
  savePriceAlert,
} from "@/lib/services/notification-service";
import { Bell, Check, X, ShieldCheck, Percent, Smartphone, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  productImage: string;
  currentPrice: number;
}

export function PriceAlertModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  productImage,
  currentPrice,
}: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState<number>(Math.round(currentPrice * 0.9));
  const [email, setEmail] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>("default");
  const [isTestingPush, setIsTestingPush] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPushStatus(getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPushStatus(granted ? "granted" : "denied");
  };

  const handleTestAlert = async () => {
    setIsTestingPush(true);
    await triggerPriceDropNotification({
      title: productTitle,
      originalPrice: currentPrice,
      newPrice: targetPrice,
      store: "Amazon.in",
      url: `/compare?q=${encodeURIComponent(productTitle)}`,
    });
    setIsTestingPush(false);
    setPushStatus(getNotificationPermission());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local watchlist service
    addToWatchlist({
      productId,
      productTitle,
      productImage,
      targetPrice,
      currentLowestPrice: currentPrice,
      email: email.trim() || undefined,
    });

    // Save to push notification price-alert registry
    savePriceAlert({
      productId,
      productTitle,
      targetPrice,
      currentPrice,
      store: "Amazon / Flipkart",
    });

    // If push is supported and not denied, prompt user to receive notifications
    if (pushStatus === "default") {
      await requestNotificationPermission();
      setPushStatus(getNotificationPermission());
    }

    setIsSaved(true);
    toast.success(`Price alert set for ₹${targetPrice.toLocaleString("en-IN")}!`, {
      description: "You'll be alerted as soon as the price drops on Amazon or Flipkart.",
    });
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const discountTargetPct = Math.round(((currentPrice - targetPrice) / currentPrice) * 100);

  const applyPercentDrop = (percent: number) => {
    setTargetPrice(Math.round(currentPrice * (1 - percent / 100)));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Set Target Price Alert</h3>
            <p className="text-xs text-muted-foreground">We'll alert you the instant the price drops.</p>
          </div>
        </div>

        {/* Product Snapshot */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3">
          <img
            src={productImage}
            alt={productTitle}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-semibold text-foreground">{productTitle}</h4>
            <span className="font-mono text-xs text-muted-foreground">
              Current Lowest: <strong className="text-foreground">₹{currentPrice.toLocaleString("en-IN")}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Target Price Slider & Presets */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-foreground">Desired Target Price:</span>
              <span className="font-display text-base font-bold text-primary">
                ₹{targetPrice.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-emerald-500 font-mono">({discountTargetPct}% drop)</span>
              </span>
            </div>

            {/* Quick Percentage Preset Buttons */}
            <div className="mt-2.5 flex items-center gap-2">
              {[5, 10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyPercentDrop(pct)}
                  className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all ${
                    discountTargetPct === pct
                      ? "bg-primary text-primary-foreground shadow-xs scale-105"
                      : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  -{pct}%
                </button>
              ))}
            </div>

            <input
              type="range"
              min={Math.round(currentPrice * 0.5)}
              max={currentPrice}
              step={50}
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="mt-3 w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>₹{Math.round(currentPrice * 0.5).toLocaleString("en-IN")} (-50%)</span>
              <span>₹{currentPrice.toLocaleString("en-IN")} (Current)</span>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Email for Instant Alerts (Optional):
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base sm:text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 touch-manipulation"
            />
          </div>

          {/* Instant Browser & Mobile Web Push Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  Browser &amp; Phone Push Alerts
                </span>
              </div>
              {pushStatus === "granted" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-500 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : pushStatus === "denied" ? (
                <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] font-medium text-destructive">
                  Blocked
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/25 transition-colors"
                >
                  Enable
                </button>
              )}
            </div>

            <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
              Receive instant lockscreen and desktop popups the moment this drops below ₹
              {targetPrice.toLocaleString("en-IN")}.
            </p>

            {pushStatus === "granted" && (
              <button
                type="button"
                onClick={handleTestAlert}
                disabled={isTestingPush}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-background px-3 py-1.5 font-mono text-[10px] font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                {isTestingPush ? "Dispatching notification…" : "Send Test Push Alert"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Zero spam guarantee. Handled securely via standard Web Push.</span>
          </div>

          <button
            type="submit"
            disabled={isSaved}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Price Alert Activated!</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Set Price Drop Alert</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
