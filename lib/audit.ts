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

// ----------------------------------
// Tool Entry
// ----------------------------------
export interface ToolEntry {
  id: string;
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
}

// ----------------------------------
// Recommendation
// ----------------------------------
export interface Recommendation {
  tool: ToolName;
  currentSpend: number;
  recommendedAction: string;
  potentialSavings: number;
  reason: string;
}

// ----------------------------------
// Final Audit Result
// ----------------------------------
export interface AuditResult {
  recommendations: Recommendation[];
  totalMonthly: number;
  totalAnnual: number;
}

// ----------------------------------
// Pricing Database
// ----------------------------------
function getExpectedCost(
  tool: ToolName,
  plan: string,
  seats: number
): number | null {

  const costs: Record<string, number> = {

    // Cursor
    "cursor:Hobby": 0,
    "cursor:Pro": 20,
    "cursor:Business": 40,
    "cursor:Enterprise": 60,

    // Copilot
    "copilot:Individual": 10,
    "copilot:Business": 19,
    "copilot:Enterprise": 39,

    // Claude
    "claude:Free": 0,
    "claude:Pro": 20,
    "claude:Max": 100,
    "claude:Team": 25,
    "claude:Enterprise": 60,

    // ChatGPT
    "chatgpt:Plus": 20,
    "chatgpt:Team": 25,
    "chatgpt:Enterprise": 60,

    // Gemini
    "gemini:Pro": 20,
    "gemini:Ultra": 50,
    "gemini:API": 30,

    // Windsurf
    "windsurf:Free": 0,
    "windsurf:Pro": 10,
    "windsurf:Enterprise": 30,

  };

  const key = `${tool}:${plan}`;

  const perSeat = costs[key];

  if (perSeat === undefined) {
    return null;
  }

  return perSeat * seats;
}

// ----------------------------------
// Main Audit Function
// ----------------------------------
export function runAudit(
  tools: ToolEntry[],
  teamSize: number,
  primaryUseCase: string
): AuditResult {

  const recommendations: Recommendation[] = [];

  // ----------------------------------
  // Loop through tools
  // ----------------------------------
  for (const entry of tools) {

    const {
      tool,
      plan,
      monthlySpend,
      seats,
    } = entry;

    let recommendedAction = "";

    let potentialSavings = 0;

    let reason = "";

    // ----------------------------------
    // Rule 1
    // Cursor Business -> Pro
    // ----------------------------------
    if (
      tool === "cursor" &&
      plan === "Business" &&
      seats <= 2
    ) {

      const proCost = getExpectedCost(
        "cursor",
        "Pro",
        seats
      );

      if (
        proCost !== null &&
        proCost < monthlySpend
      ) {

        potentialSavings =
          monthlySpend - proCost;

        recommendedAction =
          "Downgrade to Cursor Pro";

        reason =
          "Small teams usually do not require Cursor Business features.";

      }

    }

    // ----------------------------------
    // Rule 2
    // ChatGPT Team -> Plus
    // ----------------------------------
    if (
      tool === "chatgpt" &&
      plan === "Team" &&
      seats === 1
    ) {

      const plusCost = getExpectedCost(
        "chatgpt",
        "Plus",
        seats
      );

      if (
        plusCost !== null &&
        plusCost < monthlySpend
      ) {

        potentialSavings =
          monthlySpend - plusCost;

        recommendedAction =
          "Switch to ChatGPT Plus";

        reason =
          "Single-user workflows rarely need ChatGPT Team.";

      }

    }

    // ----------------------------------
    // Rule 3
    // Claude Team -> Pro
    // ----------------------------------
    if (
      tool === "claude" &&
      plan === "Team" &&
      seats <= 2
    ) {

      const proCost = getExpectedCost(
        "claude",
        "Pro",
        seats
      );

      if (
        proCost !== null &&
        proCost < monthlySpend
      ) {

        potentialSavings =
          monthlySpend - proCost;

        recommendedAction =
          "Downgrade to Claude Pro";

        reason =
          `Claude Team is expensive for ${seats} seat(s).`;

      }

    }

    // ----------------------------------
    // Rule 4
    // Copilot Individual -> Cursor Pro
    // ----------------------------------
    if (
      primaryUseCase === "coding" &&
      tool === "copilot" &&
      plan === "Individual"
    ) {

      const cursorCost = getExpectedCost(
        "cursor",
        "Pro",
        seats
      );

      if (
        cursorCost !== null &&
        cursorCost < monthlySpend
      ) {

        potentialSavings =
          monthlySpend - cursorCost;

        recommendedAction =
          "Switch to Cursor Pro";

        reason =
          "Cursor Pro may provide better coding workflows and pricing.";

      }

    }

    // ----------------------------------
    // Rule 5
    // Unused Seats
    // ----------------------------------
    if (seats > teamSize) {

      const optimalCost = getExpectedCost(
        tool,
        plan,
        teamSize
      );

      if (
        optimalCost !== null &&
        optimalCost < monthlySpend
      ) {

        const seatSavings =
          monthlySpend - optimalCost;

        if (
          seatSavings > potentialSavings
        ) {

          potentialSavings =
            seatSavings;

          recommendedAction =
            `Reduce seats to ${teamSize}`;

          reason =
            `You are paying for ${seats} seats but only have ${teamSize} active team members.`;

        }

      }

    }

    // ----------------------------------
    // Rule 6
    // Expensive Enterprise Plans
    // ----------------------------------
    if (
      plan === "Enterprise" &&
      seats <= 5 &&
      monthlySpend > 100
    ) {

      const businessCost = getExpectedCost(
        tool,
        "Business",
        seats
      );

      if (
        businessCost !== null &&
        businessCost < monthlySpend
      ) {

        const savings =
          monthlySpend - businessCost;

        if (
          savings > potentialSavings
        ) {

          potentialSavings = savings;

          recommendedAction =
            "Downgrade from Enterprise plan";

          reason =
            "Small teams may not need enterprise-level features.";

        }

      }

    }

    // ----------------------------------
    // Generic fallback
    // ----------------------------------
    if (
      potentialSavings === 0 &&
      monthlySpend >= 50
    ) {

      potentialSavings = Math.floor(
        monthlySpend * 0.1
      );

      recommendedAction =
        "Optimize current subscription";

      reason =
        "Review seat usage and active subscriptions to reduce unnecessary spending.";

    }

    // ----------------------------------
    // Push recommendation
    // ----------------------------------
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

  // ----------------------------------
  // Totals
  // ----------------------------------
  const totalMonthly =
    recommendations.reduce(
      (sum, r) =>
        sum + r.potentialSavings,
      0
    );

  const totalAnnual =
    totalMonthly * 12;

  // ----------------------------------
  // Return
  // ----------------------------------
  return {

    recommendations,

    totalMonthly,

    totalAnnual,

  };

}