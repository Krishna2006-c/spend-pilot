export function calculateAudit(form: any) {

  let recommendation = "Current plan is fine"

  let monthlySavings = 0

  let reason = "No major optimization found."

  if (
    form.tool === "Cursor" &&
    form.plan === "Business" &&
    form.seats <= 2
  ) {

    recommendation = "Downgrade to Cursor Pro"

    monthlySavings = 40

    reason =
      "Small teams usually do not need Business features."
  }

  if (
    form.tool === "ChatGPT" &&
    form.plan === "Team" &&
    form.seats === 1
  ) {

    recommendation = "Switch to ChatGPT Plus"

    monthlySavings = 30

    reason =
      "Single-user workflows rarely need Team features."
  }

  return {
    recommendation,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason
  }
}