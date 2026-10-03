/**
 * @file WhyUsExpenseSaviour.tsx
 * @description Compact expense leak diagnosis highlighting common online shopping pitfalls
 * and how GoCoupon rescues monthly household budgets.
 */

import { useCurrency } from "@/context/CurrencyContext";
import { Ticket, CreditCard, Zap, ShieldCheck } from "lucide-react";

export function WhyUsExpenseSaviour() {
  const { isIndia } = useCurrency();

  const expenseLeaks = [
    {
      icon: Ticket,
      title: "1. The Dead Coupon Trap",
      leak: "Wasting 15 mins on expired codes",
      solution:
        "Generic directories leave broken codes for months. GoCoupon tests and purges expired vouchers daily through direct automated cart verification.",
    },
    {
      icon: CreditCard,
      title: "2. Unclaimed Bank Discounts",
      leak: isIndia ? "Leaving ₹2,500+ card offers unclaimed" : "Missing $50+ card partner rebates",
      solution:
        "GoCoupon auto-detects eligible HDFC, ICICI, SBI, Axis, and UPI discounts, stacking them with active promo codes for maximum cart reduction.",
    },
    {
      icon: Zap,
      title: "3. Checkout Friction",
      leak: "Missing secret merchant vouchers",
      solution:
        "Our free Chrome Extension tests all working promo codes and auto-clips on-page checkboxes in 1.4 seconds directly at checkout.",
    },
    {
      icon: ShieldCheck,
      title: "4. Broken Redirection Links",
      leak: "Annoying 404 & 503 error links",
      solution:
        "GoCoupon's smart routing engine guarantees clean destination URLs while automatically copying your active discount voucher.",
    },
  ];

  return (
    <section className="relative overflow-hidden border-t border-border bg-card/20 px-4 sm:px-6 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Common Checkout Leaks We Solve
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Stop losing money to hidden expired codes, unclaimed payment discounts, and broken links.
          </p>
        </div>

        {/* 4 Clean Expense Leak Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {expenseLeaks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      {item.leak}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-foreground">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
