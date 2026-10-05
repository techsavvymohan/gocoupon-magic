async function testLive() {
  const res = await fetch("https://gocoupon.io", {
    headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
  });
  console.log("Status:", res.status);
  const text = await res.text();
  const scripts = text.match(/assets\/[a-zA-Z0-9_-]+\.js/g) || [];
  console.log("Found scripts:", scripts.slice(0, 5));

  for (const script of scripts.slice(0, 5)) {
    const sRes = await fetch("https://gocoupon.io/" + script);
    const sText = await sRes.text();
    if (sText.includes("Bank Cards") || sText.includes("EXTRA 5%")) {
      console.log("MATCH in script:", script, "-> Bank Cards found!");
      return;
    }
  }
  console.log("Bank Cards not yet in top scripts (deployment may still be in progress or cached)");
}
testLive();
