/**
 * @file CheckoutSimulator.tsx
 * @description Interactive live checkout simulator demonstrating GoCoupon's 1.4-second
 * auto-apply coupon engine and bank discount stacking on real D2C brand checkouts.
 */

import { useState, useEffect, useRef } from "react";
import {
  Zap,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Tag,
  CreditCard,
  Check,
} from "lucide-react";

interface SimulatorStore {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  cartItemName: string;
  cartItemDesc: string;
  cartItemImg: string;
  originalPrice: number;
  codesToTest: Array<{
    code: string;
    result: "expired" | "min_order" | "winner";
    label: string;
    discountAmount: number;
  }>;
  winningCode: string;
  couponDiscount: number;
  bankRebateName: string;
  bankRebateAmount: number;
  finalPrice: number;
}

const STORES: SimulatorStore[] = [
  {
    id: "souled-store",
    name: "The Souled Store",
    tagline: "Official Pop Culture & Casual Wear",
    logo: "/Brand logos/the-souled-store.webp",
    cartItemName: "Oversized Supima Cotton Hoodie (Black Panther Edition)",
    cartItemDesc: "Size: L • 100% Terry Cotton • In Stock",
    cartItemImg: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80",
    originalPrice: 2499,
    codesToTest: [
      { code: "WELCOME10", result: "expired", label: "Expired 2 days ago", discountAmount: 0 },
      { code: "SUPER50", result: "min_order", label: "Requires min order ₹3,999", discountAmount: 0 },
      { code: "D2CVIP20", result: "winner", label: "20% Sitewide Discount (-₹500)", discountAmount: 500 },
      { code: "APPFIRST", result: "min_order", label: "Valid on app only", discountAmount: 0 },
    ],
    winningCode: "D2CVIP20",
    couponDiscount: 500,
    bankRebateName: "HDFC / Instant UPI Stacking (-₹200)",
    bankRebateAmount: 200,
    finalPrice: 1799,
  },
  {
    id: "boat",
    name: "boAt Lifestyle",
    tagline: "True Wireless Audio & Smartwatches",
    logo: "/Brand logos/gonoise.svg",
    cartItemName: "Airdopes 141 ANC with 42H Playback & Beast Mode",
    cartItemDesc: "Color: Bold Black • Active Noise Cancellation",
    cartItemImg: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
    originalPrice: 1999,
    codesToTest: [
      { code: "SAVE100", result: "min_order", label: "Only saves ₹100", discountAmount: 100 },
      { code: "BOATNEW", result: "expired", label: "Expired offer", discountAmount: 0 },
      { code: "BASSHEAD30", result: "winner", label: "Flat 20% Instant Code (-₹400)", discountAmount: 400 },
      { code: "FIRSTTIME", result: "min_order", label: "First order only", discountAmount: 0 },
    ],
    winningCode: "BASSHEAD30",
    couponDiscount: 400,
    bankRebateName: "ICICI / Cred Pay Instant Cashback (-₹150)",
    bankRebateAmount: 150,
    finalPrice: 1449,
  },
  {
    id: "mamaearth",
    name: "Mamaearth",
    tagline: "Toxin-Free Natural Personal Care",
    logo: "/Brand logos/Mamaearth.webp",
    cartItemName: "Onion Hair Fall Control Kit (Shampoo + Conditioner + Oil)",
    cartItemDesc: "100% Organic Red Onion Seed Extract • Pack of 3",
    cartItemImg: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80",
    originalPrice: 1599,
    codesToTest: [
      { code: "MAMA10", result: "min_order", label: "Saves ₹160 only", discountAmount: 160 },
      { code: "FREESHIP", result: "expired", label: "Standard shipping already free", discountAmount: 0 },
      { code: "REDUCE25", result: "winner", label: "Special D2C 25% Off (-₹400)", discountAmount: 400 },
      { code: "FLAT200", result: "min_order", label: "Saves ₹200 only", discountAmount: 200 },
    ],
    winningCode: "REDUCE25",
    couponDiscount: 400,
    bankRebateName: "Prepaid UPI Instant Off (-₹100)",
    bankRebateAmount: 100,
    finalPrice: 1099,
  },
  {
    id: "snitch",
    name: "Snitch",
    tagline: "Contemporary Menswear & Streetwear",
    logo: "/Brand logos/Ajio.webp?v=2",
    cartItemName: "Resort Camp Collar Textured Linen Shirt + Chinos Set",
    cartItemDesc: "Color: Sand Khaki • Relaxed Summer Fit",
    cartItemImg: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80",
    originalPrice: 3299,
    codesToTest: [
      { code: "SNITCH10", result: "min_order", label: "Saves ₹330 only", discountAmount: 330 },
      { code: "SUMMERDROP", result: "expired", label: "Expired last Sunday", discountAmount: 0 },
      { code: "DRIP600", result: "winner", label: "Exclusive ₹600 Off Code (-₹600)", discountAmount: 600 },
      { code: "FREEWALLET", result: "min_order", label: "Gift with purchase only", discountAmount: 0 },
    ],
    winningCode: "DRIP600",
    couponDiscount: 600,
    bankRebateName: "Axis Bank / SBI Card Instant Rebate (-₹250)",
    bankRebateAmount: 250,
    finalPrice: 2449,
  },
];

export function CheckoutSimulator() {
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [simulatorState, setSimulatorState] = useState<"idle" | "running" | "completed">("idle");
  const [activeCodeIndex, setActiveCodeIndex] = useState<number>(-1);
  const [testedCodesHistory, setTestedCodesHistory] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStore = STORES[selectedStoreIndex];
  const totalSaved = currentStore.couponDiscount + currentStore.bankRebateAmount;
  const savingsPercent = Math.round((totalSaved / currentStore.originalPrice) * 100);

  // Switch store handler
  const handleSelectStore = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedStoreIndex(index);
    setSimulatorState("idle");
    setActiveCodeIndex(-1);
    setTestedCodesHistory([]);
  };

  // Run auto-apply simulation
  const runSimulation = () => {
    if (simulatorState === "running") return;
    setSimulatorState("running");
    setActiveCodeIndex(0);
    setTestedCodesHistory([]);

    const codes = currentStore.codesToTest;
    let step = 0;

    const testNext = () => {
      if (step < codes.length) {
        setActiveCodeIndex(step);
        setTestedCodesHistory((prev) => [...prev, step]);
        step++;
        timerRef.current = setTimeout(testNext, 450);
      } else {
        timerRef.current = setTimeout(() => {
          setSimulatorState("completed");
          setActiveCodeIndex(-1);
        }, 300);
      }
    };

    timerRef.current = setTimeout(testNext, 450);
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSimulatorState("idle");
    setActiveCodeIndex(-1);
    setTestedCodesHistory([]);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section id="checkout-simulator" className="relative border-t border-border bg-slate-50/50 dark:bg-card/20 px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Interactive Checkout Experience</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            See How GoCoupon Saves You Money.
            <span className="text-primary block mt-1">Live in Under 1.4 Seconds.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
            While other extensions fail or make you wait 30 seconds for broken codes, GoCoupon runs parallel testing with custom selectors for Indian and global checkouts. Click below to test it yourself.
          </p>

          {/* Store Selection Pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {STORES.map((store, idx) => (
              <button
                key={store.id}
                onClick={() => handleSelectStore(idx)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedStoreIndex === idx
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                    : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>{store.name}</span>
                <span className="text-[10px] font-mono opacity-80">(₹{store.originalPrice})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Simulator Shell */}
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-border/80 bg-card p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Top Browser Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="ml-2 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1 font-mono text-xs text-muted-foreground">
                <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                <span>{currentStore.id}.com/checkout/payment</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>GoCoupon Capsule Connected</span>
            </div>
          </div>

          {/* Cart & Extension Grid */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Merchant Cart Review (6 cols) */}
            <div className="lg:col-span-6 space-y-4 rounded-2xl border border-border/70 bg-background/60 p-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {currentStore.name} Checkout
                  </h3>
                  <p className="text-xs text-muted-foreground">{currentStore.tagline}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                  1 ITEM IN CART
                </span>
              </div>

              {/* Cart Item Preview */}
              <div className="flex items-center gap-3.5 py-2">
                <img
                  src={currentStore.cartItemImg}
                  alt={currentStore.cartItemName}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover border border-border"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs sm:text-sm font-semibold text-foreground">
                    {currentStore.cartItemName}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {currentStore.cartItemDesc}
                  </p>
                  <p className="text-xs font-mono font-bold text-foreground mt-1">
                    Subtotal: ₹{currentStore.originalPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Price Calculation Table */}
              <div className="space-y-2 border-t border-border/60 pt-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Item Subtotal</span>
                  <span className="font-mono">₹{currentStore.originalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping & Packaging</span>
                  <span className="font-mono text-emerald-500 font-semibold">FREE</span>
                </div>

                {simulatorState === "completed" && (
                  <>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in slide-in-from-left-2">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Coupon ({currentStore.winningCode})
                      </span>
                      <span className="font-mono font-bold">-₹{currentStore.couponDiscount}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium animate-in fade-in slide-in-from-left-2">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> {currentStore.bankRebateName.split(" ")[0]} Offer
                      </span>
                      <span className="font-mono font-bold">-₹{currentStore.bankRebateAmount}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-dashed border-border pt-3 flex justify-between items-baseline">
                  <span className="font-display text-sm font-bold text-foreground">Total Payable</span>
                  <div className="text-right">
                    {simulatorState === "completed" ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-muted-foreground line-through font-mono">
                          ₹{currentStore.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xl font-extrabold font-mono text-emerald-500">
                          ₹{currentStore.finalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-extrabold font-mono text-foreground">
                        ₹{currentStore.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GoCoupon Interactive HUD Column (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-lg">
                {/* HUD Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/icon_48.png"
                      onError={(e) => {
                        e.currentTarget.src = "/icons/icon_128.png";
                      }}
                      alt="GoCoupon Logo"
                      className="h-6 w-6 object-contain"
                    />
                    <div>
                      <span className="font-display font-bold text-sm text-foreground">GoCoupon</span>
                      <span className="ml-1.5 rounded-full bg-emerald-500/10 px-2 py-0.2 font-mono text-[9px] font-bold text-emerald-500">
                        HUD
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {simulatorState === "running"
                      ? "Testing Codes..."
                      : simulatorState === "completed"
                      ? "Saved ₹" + totalSaved + "!"
                      : "Cart Ready"}
                  </span>
                </div>

                {/* HUD Body */}
                <div className="py-4">
                  {simulatorState === "idle" && (
                    <div className="space-y-4 text-center py-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-bold text-foreground">
                          Found 4 Active Coupons for {currentStore.name}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Click to let GoCoupon test all promo codes in parallel and stack your bank rebate.
                        </p>
                      </div>

                      <button
                        onClick={runSimulation}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Auto-Apply All Codes (1.4s Demo)</span>
                      </button>
                    </div>
                  )}

                  {simulatorState === "running" && (
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">Testing Promo Codes...</span>
                          <span className="text-primary font-bold">
                            {activeCodeIndex + 1} / {currentStore.codesToTest.length}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all duration-300 rounded-full"
                            style={{
                              width: `${((activeCodeIndex + 1) / currentStore.codesToTest.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Cycling Code Cards */}
                      <div className="space-y-2">
                        {currentStore.codesToTest.map((c, idx) => {
                          const isCurrentlyTesting = activeCodeIndex === idx;
                          const hasBeenTested = testedCodesHistory.includes(idx);

                          return (
                            <div
                              key={c.code}
                              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                                isCurrentlyTesting
                                  ? "border-primary bg-primary/10 scale-[1.02]"
                                  : hasBeenTested
                                  ? c.result === "winner"
                                    ? "border-emerald-500/40 bg-emerald-500/10"
                                    : "border-border/60 bg-muted/40 opacity-70"
                                  : "border-border/40 bg-background/40 opacity-40"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-mono font-bold text-foreground">{c.code}</span>
                              </div>
                              <div className="text-[11px] font-mono">
                                {isCurrentlyTesting ? (
                                  <span className="text-primary font-bold animate-pulse">Injecting code...</span>
                                ) : hasBeenTested ? (
                                  c.result === "winner" ? (
                                    <span className="flex items-center gap-1 font-bold text-emerald-500">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Applied (-₹{c.discountAmount})
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <XCircle className="h-3.5 w-3.5 text-rose-500/80" /> {c.label}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground/60">Queued</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {simulatorState === "completed" && (
                    <div className="space-y-4 py-2 animate-in fade-in duration-300">
                      {/* Big Savings Callout */}
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-500 mb-2">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>MAXIMUM SAVINGS APPLIED IN 1.4s</span>
                        </div>
                        <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          You Saved ₹{totalSaved.toLocaleString("en-IN")}!
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {savingsPercent}% slashed off your {currentStore.name} cart automatically.
                        </p>
                      </div>

                      {/* Applied Breakdown */}
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between rounded-lg bg-muted/60 p-2.5">
                          <span className="text-foreground font-semibold flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-500" /> Code {currentStore.winningCode}
                          </span>
                          <span className="font-bold text-emerald-500">-₹{currentStore.couponDiscount}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/60 p-2.5">
                          <span className="text-foreground font-semibold flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-blue-500" /> {currentStore.bankRebateName}
                          </span>
                          <span className="font-bold text-blue-500">-₹{currentStore.bankRebateAmount}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <a
                          href="https://chromewebstore.google.com/detail/gbmfihnboadlmmjbikajlmocjmlpehij"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          <img
                            src="/icons/icon_48.png"
                            onError={(e) => {
                              e.currentTarget.src = "/icons/icon_128.png";
                            }}
                            alt=""
                            className="h-4 w-4 object-contain"
                          />
                          <span>Add to Chrome (Free)</span>
                        </a>

                        <button
                          onClick={handleReset}
                          title="Test Again"
                          className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-3 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Security Note */}
                <div className="border-t border-border pt-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% Free &bull; Manifest V3
                  </span>
                  <span>Zero Credit Card Data Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
