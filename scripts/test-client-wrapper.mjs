import { isAffiliateNetworkUrl, buildDealRedirectUrl, wrapAffiliateTracking } from '../src/lib/services/store-registry.ts';

const cjUrl = 'https://www.tkqlhce.com/click-101896072-17350043';
const admitadUrl = 'https://ad.admitad.com/g/WTuJJKIiFNj2ZnibEj23HScasY0fTk/?ulp=https%3A%2F%2Fwww.ajio.com';
const myntraClean = 'https://www.myntra.com/shoes';

console.log('CJ is affiliate:', isAffiliateNetworkUrl(cjUrl));
console.log('Admitad is affiliate:', isAffiliateNetworkUrl(admitadUrl));

const cjWrapped = wrapAffiliateTracking(cjUrl, 'test');
console.log('CJ wrapped:', cjWrapped);
if (!cjWrapped.includes(encodeURIComponent(cjUrl))) {
  throw new Error('CJ was corrupted!');
}

const admitadDeal = buildDealRedirectUrl({ url: admitadUrl, storeSlug: 'ajio' });
console.log('Admitad deal redirect:', admitadDeal);
if (!admitadDeal.includes(encodeURIComponent(admitadUrl))) {
  throw new Error('Admitad deal was overridden with EarnKaro!');
}

const myntraDeal = buildDealRedirectUrl({ url: myntraClean, storeSlug: 'myntra' });
console.log('Myntra clean deal redirect (should use EarnKaro):', myntraDeal);
if (!myntraDeal.includes('myntr.it')) {
  throw new Error('Clean Myntra deal did not use EarnKaro!');
}

console.log('ALL CLIENT-SIDE WRAPPER TESTS PASSED!');
