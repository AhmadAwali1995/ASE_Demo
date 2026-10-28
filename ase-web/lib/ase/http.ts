export const ASE_ORIGIN = "https://www.ase.com.jo";

const RETRIES = 4;

export function aseHeaders(): HeadersInit {
  return {
    "User-Agent": "ASE-Demo/1.0",
    Accept: "*/*",
  };
}

export async function fetchText(url: string, label = "ASE file"): Promise<string> {
  const response = await fetchRetry(url, label);
  return response.text();
}

export async function fetchBuffer(url: string, label = "ASE file"): Promise<Buffer> {
  const response = await fetchRetry(url, label);
  return Buffer.from(await response.arrayBuffer());
}

export function aseUrl(path: string): string {
  if (path.startsWith("http")) return path.replace(/&amp;/g, "&");
  return `${ASE_ORIGIN}${path.replace(/&amp;/g, "&")}`;
}

async function fetchRetry(url: string, label: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, { headers: aseHeaders(), cache: "no-store" });
      if (!response.ok) throw new Error(`${label} returned ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) await wait(attempt * 1500);
    }
  }
  throw lastError;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
