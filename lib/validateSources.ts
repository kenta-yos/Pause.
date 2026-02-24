// Trusted domains: Japanese government institutions and international organizations
export const TRUSTED_DOMAINS = [
  // Japanese government
  "e-stat.go.jp",
  "stat.go.jp",
  "mhlw.go.jp",
  "moj.go.jp",
  "npa.go.jp",
  "cao.go.jp",
  "mext.go.jp",
  "mof.go.jp",
  "mofa.go.jp",
  "ndl.go.jp",
  "jil.go.jp",
  "niph.go.jp",
  "nli-research.co.jp",
  "gender.go.jp",
  "digital.go.jp",
  "soumu.go.jp",
  "env.go.jp",
  "maff.go.jp",
  "meti.go.jp",
  "kantei.go.jp",
  // International organizations
  "un.org",
  "who.int",
  "worldbank.org",
  "oecd.org",
  "imf.org",
  "ilo.org",
  "unhcr.org",
  "unicef.org",
  "undp.org",
  "ohchr.org",
  "data.worldbank.org",
  // Academic
  "pubmed.ncbi.nlm.nih.gov",
  "doi.org",
  "ncbi.nlm.nih.gov",
];

export function isTrustedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return TRUSTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

export async function verifyUrl(url: string): Promise<boolean> {
  if (!isTrustedDomain(url)) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
