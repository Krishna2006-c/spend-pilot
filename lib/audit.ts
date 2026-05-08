// lib/audit.ts

export type ToolName =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  id: string;
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface Recommendation {
  tool: ToolName;
  currentSpend: number;
  recommendedAction: string;
  potentialSavings: number;
  reason: string;
}

export interface AuditResult {
  recommendations: Recommendation[];
  totalMonthly: number;
  totalAnnual: number;
}

// Helper: get expected cost per month (hardcoded pricing)
function getExpectedCost(tool: ToolName, plan: string, seats: number): number | null {
  const costs: Record<string, number> = {
    "cursor:Pro": 20,
    "cursor:Business": 40,
    "cursor:Enterprise": 60,
    "copilot:Individual": 10,
    "copilot:Business": 19,
    "copilot:Enterprise": 39,
    "claude:Pro": 20,
    "claude:Team": 25,
    "chatgpt:Plus": 20,
    "chatgpt:Team": 25,
    "windsurf:Pro": 10,
    "windsurf:Enterprise": 30,
  };
  const key = `${tool}:${plan}`;
  const perSeat = costs[key];
  if (perSeat === undefined) return null;
  return perSeat * seats;
}

// Main audit function (matches the logic from page.tsx)
export function runAudit(
  tools: ToolEntry[],
  teamSize: number,
  primaryUseCase: string
): AuditResult {
  const recommendations: Recommendation[] = [];

  for (const entry of tools) {
    const { tool, plan, monthlySpend, seats } = entry;
    let recommendedAction = "";
    let potentialSavings = 0;
    let reason = "";

    // Rule 1: Cursor Business with ≤2 seats → Pro
    if (tool === "cursor" && plan === "Business" && seats <= 2) {
      const proCost = getExpectedCost("cursor", "Pro", seats);
      if (proCost !== null && proCost < monthlySpend) {
        potentialSavings = monthlySpend - proCost;
        recommendedAction = "Downgrade to Cursor Pro";
        reason = "Small teams usually do not need Business features.";
      }
    }

    // Rule 2: ChatGPT Team with 1 seat → Plus
    if (tool === "chatgpt" && plan === "Team" && seats === 1) {
      const plusCost = getExpectedCost("chatgpt", "Plus", seats);
      if (plusCost !== null && plusCost < monthlySpend) {
        potentialSavings = monthlySpend - plusCost;
        recommendedAction = "Switch to ChatGPT Plus";
        reason = "Single-user workflows rarely need Team features.";
      }
    }

    // Rule 3: Claude Team with ≤2 seats → Pro
    if (tool === "claude" && plan === "Team" && seats <= 2) {
      const proCost = getExpectedCost("claude", "Pro", seats);
      if (proCost !== null && proCost < monthlySpend) {
        potentialSavings = monthlySpend - proCost;
        recommendedAction = "Downgrade to Claude Pro";
        reason = `Claude Team requires at least 2 users (you have ${seats}). Pro is cheaper.`;
      }
    }

    // Rule 4: Coding + Copilot Individual → Cursor Pro (if saves money)
    if (primaryUseCase === "coding" && tool === "copilot" && plan === "Individual") {
      const cursorCost = getExpectedCost("cursor", "Pro", seats);
      if (cursorCost !== null && cursorCost < monthlySpend) {
        potentialSavings = monthlySpend - cursorCost;
        recommendedAction = "Switch to Cursor Pro";
        reason = "Cursor Pro offers deeper IDE integration and can be cheaper.";
      }
    }

    // Rule 5: Unused seats (seats > teamSize)
    if (seats > teamSize) {
      const optimalCost = getExpectedCost(tool, plan, teamSize);
      if (optimalCost !== null && optimalCost < monthlySpend) {
        const seatSavings = monthlySpend - optimalCost;
        if (seatSavings > potentialSavings) {
          potentialSavings = seatSavings;
          recommendedAction = `Reduce seats to ${teamSize}`;
          reason = `You have ${seats} seats but only ${teamSize} team members.`;
        }
      }
    }

    if (potentialSavings > 0) {
      recommendations.push({
        tool,
        currentSpend: monthlySpend,
        recommendedAction,
        potentialSavings,
        reason,
      });
    }
  }

  const totalMonthly = recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);
  const totalAnnual = totalMonthly * 12;

  return { recommendations, totalMonthly, totalAnnual };
}
