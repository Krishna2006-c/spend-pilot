"use client"

import { useState } from "react"
import { calculateAudit } from "@/lib/audit"

export default function Home() {

  const [tool, setTool] = useState("Cursor")
  const [plan, setPlan] = useState("Business")
  const [spend, setSpend] = useState(80)
  const [seats, setSeats] = useState(2)

  const [result, setResult] = useState<any>(null)

  const handleAudit = () => {

    const audit = calculateAudit({
      tool,
      plan,
      spend,
      seats
    })

    setResult(audit)
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="max-w-2xl mx-auto">

        <h1 className="text-5xl font-bold mb-4">
          AI Spend Audit
        </h1>

        <p className="text-zinc-400 mb-8">
          Find hidden savings in your AI stack.
        </p>

        <div className="space-y-4 bg-zinc-900 p-6 rounded-2xl">

          <select
            className="w-full p-3 rounded bg-zinc-800"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
          >
            <option>Cursor</option>
            <option>ChatGPT</option>
            <option>Claude</option>
            <option>GitHub Copilot</option>
          </select>

          <input
            className="w-full p-3 rounded bg-zinc-800"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Plan"
          />

          <input
            type="number"
            className="w-full p-3 rounded bg-zinc-800"
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            placeholder="Monthly Spend"
          />

          <input
            type="number"
            className="w-full p-3 rounded bg-zinc-800"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            placeholder="Seats"
          />

          <button
            onClick={handleAudit}
            className="w-full bg-white text-black p-3 rounded font-bold"
          >
            Audit My Spend
          </button>

        </div>

        {result && (

          <div className="mt-10 bg-zinc-900 p-6 rounded-2xl">

            <h2 className="text-3xl font-bold mb-4">
              Audit Result
            </h2>

            <p>
              Recommendation:
              {" "}
              {result.recommendation}
            </p>

            <p>
              Monthly Savings:
              {" "}
              ${result.monthlySavings}
            </p>

            <p>
              Annual Savings:
              {" "}
              ${result.annualSavings}
            </p>

            <p>
              Reason:
              {" "}
              {result.reason}
            </p>

          </div>
        )}

      </div>

    </main>
  )
}