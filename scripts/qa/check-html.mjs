async function main() {
  const res = await fetch('https://gocoupon.io/stores');
  const html = await res.text();
  const lines = html.split('\n');
  lines.slice(470, 540).forEach((l, idx) => {
    console.log(`${idx + 471}: ${l}`);
  });
}
main().catch(console.error);
