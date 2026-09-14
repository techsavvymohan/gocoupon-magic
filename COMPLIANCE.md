# GoCoupon Affiliate Compliance & Regulatory Guidelines

GoCoupon operates in compliance with international and regional advertising standards, including the **Federal Trade Commission (FTC)** guidelines, the **Advertising Standards Council of India (ASCI)** rules, and the terms of service of partner affiliate networks.

---

## 1. Statutory Affiliate Disclosures

In accordance with FTC (16 CFR § 255.5) and ASCI guidelines for digital media:

### Mandatory Sitewide Disclosure
Displayed in the footer across every page:
> *"GoCoupon is reader-supported. When you purchase through links on our site or use our verified promo codes, we may earn an affiliate commission at no additional cost to you. Store logos and trademarks belong to their respective owners."*

### Merchant Deal Disclosures
Every outgoing affiliate link (`/api/affiliates/out?url=...`) informs users that:
1. Prices and availability are subject to merchant updates.
2. Promo codes are tested for validity prior to publication.
3. Cashback rates are subject to merchant validation cycles.

---

## 2. Amazon Associates Program Compliance

As an Amazon Associate, GoCoupon adheres strictly to the **Amazon Associates Program Operating Agreement**:

1. **No Cloaking of Amazon URLs**: Outgoing links to Amazon explicitly identify the merchant destination.
2. **No Misleading Price Claims**: Dynamic pricing fetched via API reflects actual product conditions and timestamps.
3. **No Offline / App Store Bundling**: The Chrome Extension does not inject Amazon affiliate tags into organic customer searches without user-initiated coupon testing.
4. **Required Associate Statement**:
   > *"As an Amazon Associate, GoCoupon earns from qualifying purchases."*

---

## 3. Cuelinks & Admitad Network Terms

For domestic (India) and international affiliate feeds:

1. **Validity-Based Deal Ingestion**: Expired campaigns (`end_date < NOW()`) are automatically pruned to prevent misleading users with expired coupon codes.
2. **Zero Click Fraud**: Affiliate links are only triggered upon explicit user clicks (e.g. "Get Code", "Activate Deal", "Compare Store").
3. **Transparent Merchant Tagging**: Deals state their merchant brand and campaign source transparently.
4. **Data Privacy**: No Personally Identifiable Information (PII) is transmitted in tracking URLs or sub-ID parameters.

---

## 4. Consumer Protection & Fair Competition

* **Deal Honesty Engine**: GoCoupon actively detects artificial pre-sale price increases (where a merchant inflates the sticker price before offering a "discount").
* **No Pay-for-Rank In Comparison**: Price comparison listings on `/compare` are sorted strictly by effective net price, not by which merchant pays the highest commission.
