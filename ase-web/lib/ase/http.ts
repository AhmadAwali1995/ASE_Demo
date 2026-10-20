export const ASE_ORIGIN = "https://www.ase.com.jo";

export function aseHeaders(): HeadersInit {
  return {
    "User-Agent": "ASE-Demo/1.0",
    Accept: "*/*",
  };
}

export async function fetchText(url: string, label = "ASE file"): Promise<string> {
  const response = await fetch(url, { headers: aseHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error(`${label} returned ${response.status}`);
  return response.text();
}

export async function fetchBuffer(url: string, label = "ASE file"): Promise<Buffer> {
  const response = await fetch(url, { headers: aseHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error(`${label} returned ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export function aseUrl(path: string): string {
  if (path.startsWith("http")) return path.replace(/&amp;/g, "&");
  return `${ASE_ORIGIN}${path.replace(/&amp;/g, "&")}`;
}
