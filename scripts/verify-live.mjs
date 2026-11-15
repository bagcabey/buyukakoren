const routes = [
  "/",
  "/koyumuz",
  "/dernek",
  "/iletisim",
  "/kvkk",
  "/gizlilik",
  "/robots.txt",
  "/sitemap.xml",
];

const base = "https://buyukakoren.vercel.app";

console.log("===============================================================");
console.log(" Vercel Live Deployment HTTP Verification ");
console.log(` Target Base: ${base}`);
console.log("===============================================================\n");

async function checkRoute(r) {
  const url = base + r;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    const is200 = res.status === 200;
    const hsts = res.headers.get("strict-transport-security") ? "Present" : "Missing";
    const csp = res.headers.get("content-security-policy") ? "Present" : "Missing";
    const coop = res.headers.get("cross-origin-opener-policy") ? "Present" : "Missing";
    
    // Check key content
    let contentCheck = "OK";
    if (r === "/koyumuz") {
      contentCheck = (text.includes("1907") || text.includes("Ağören") || text.includes("Büyükakören")) ? "OK" : "Stale";
    } else if (r === "/dernek") {
      contentCheck = (text.includes("Mustafa Tanju Çetiner") || text.includes("Dernek")) ? "OK" : "Stale";
    } else if (r === "/kvkk") {
      contentCheck = (text.includes("6698") || text.includes("KVKK")) ? "OK" : "Stale";
    } else if (r === "/gizlilik") {
      contentCheck = (text.includes("Gizlilik") || text.includes("Çerez")) ? "OK" : "Stale";
    } else if (r === "/robots.txt") {
      contentCheck = text.includes("User-Agent") ? "OK" : "Stale";
    } else if (r === "/sitemap.xml") {
      contentCheck = text.includes("<urlset") ? "OK" : "Stale";
    }

    console.log(`[${is200 ? "PASS" : "FAIL"}] Route: ${r.padEnd(16)} | Status: ${res.status} | Content: ${contentCheck.padEnd(6)} | HSTS: ${hsts.padEnd(7)} | Size: ${text.length} bytes`);
    return { route: r, status: res.status, ok: is200 && contentCheck === "OK" };
  } catch (err) {
    console.error(`[ERROR] Route: ${r} | Exception: ${err.message}`);
    return { route: r, status: 0, ok: false, error: err.message };
  }
}

async function verifyAll() {
  const results = [];
  for (const r of routes) {
    results.push(await checkRoute(r));
  }

  const allPassed = results.every((r) => r.ok);
  console.log("\n===============================================================");
  console.log(` Live Verification Summary: ${results.filter((r) => r.ok).length} / ${results.length} routes healthy.`);
  console.log("===============================================================");

  if (!allPassed) {
    console.log("Some routes did not pass or Vercel build is still deploying in the background.");
  }
}

verifyAll();
