export type CalculateResponse = {
  expression: string;
  result: string;
};

const normalizeApiBase = (value?: string) => {
  const base = (value || "/api").replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
};

const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
);

export async function calculateExpression(expression: string): Promise<CalculateResponse> {
  const response = await fetch(`${API_BASE}/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expression }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.detail || "The calculator could not solve that expression.";
    throw new Error(message);
  }

  return payload as CalculateResponse;
}
