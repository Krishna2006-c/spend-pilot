"use client";

import { useState, useEffect } from "react";
import { runAudit } from "@/lib/audit";
import { supabase } from "@/lib/supabase";

// -------------------------------
// Types
// -------------------------------
type ToolName =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

interface ToolEntry {
  id: string;
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
}

interface Recommendation {
  tool: ToolName;
  currentSpend: number;
  recommendedAction: string;
  potentialSavings: number;
  reason: string;
}

// -------------------------------
// Labels and plans
// -------------------------------
const TOOL_LABELS: Record<ToolName, string> = {
  cursor: "Cursor",
  copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  "anthropic-api": "Anthropic API",
  "openai-api": "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

const TOOL_PLANS: Record<ToolName, string[]> = {
  cursor: ["Hobby", "Pro", "Business", "Enterprise"],
  copilot: ["Individual", "Business", "Enterprise"],
  claude: ["Free", "Pro", "Max", "Team", "Enterprise"],
  chatgpt: ["Plus", "Team", "Enterprise"],
  "anthropic-api": ["Pay as you go"],
  "openai-api": ["Pay as you go"],
  gemini: ["Pro", "Ultra", "API"],
  windsurf: ["Free", "Pro", "Enterprise"],
};

// -------------------------------
// Main Component
// -------------------------------
export default function Home() {
  const [tools, setTools] = useState<ToolEntry[]>([]);
  const [teamSize, setTeamSize] = useState(5);

  const [primaryUseCase, setPrimaryUseCase] =
    useState<"coding" | "writing" | "data" | "research" | "mixed">(
      "coding"
    );

  const [loading, setLoading] = useState(false);

  const [auditResult, setAuditResult] = useState<any>(null);

  const [showLeadModal, setShowLeadModal] = useState(false);

  const [leadEmail, setLeadEmail] = useState("");

  const [leadCompany, setLeadCompany] = useState("");

  const [leadRole, setLeadRole] = useState("");

  const [honeypot, setHoneypot] = useState("");

  // -------------------------------
  // Helpers
  // -------------------------------
  const generateId = () => crypto.randomUUID();

  // -------------------------------
  // Load localStorage
  // -------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("auditForm");

    if (saved) {
      const parsed = JSON.parse(saved);

      setTools(parsed.tools || []);

      setTeamSize(parsed.teamSize || 5);

      setPrimaryUseCase(parsed.primaryUseCase || "coding");
    } else {
      setTools([
        {
          id: generateId(),
          tool: "cursor",
          plan: "Pro",
          monthlySpend: 80,
          seats: 2,
        },
      ]);
    }
  }, []);

  // -------------------------------
  // Save localStorage
  // -------------------------------
  useEffect(() => {
    if (tools.length === 0) return;

    localStorage.setItem(
      "auditForm",
      JSON.stringify({
        tools,
        teamSize,
        primaryUseCase,
      })
    );
  }, [tools, teamSize, primaryUseCase]);

  // -------------------------------
  // Tool handlers
  // -------------------------------
  const addTool = () => {
    setTools([
      ...tools,
      {
        id: generateId(),
        tool: "cursor",
        plan: "Pro",
        monthlySpend: 0,
        seats: 1,
      },
    ]);
  };

  const removeTool = (id: string) => {
    if (tools.length === 1) return;

    setTools(tools.filter((t) => t.id !== id));
  };

  const updateTool = (
    id: string,
    field: keyof ToolEntry,
    value: string | number
  ) => {
    setTools(
      tools.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  // -------------------------------
  // Audit
  // -------------------------------
  const handleAudit = () => {
    setLoading(true);

    setTimeout(() => {
      const result = runAudit(
        tools,
        teamSize,
        primaryUseCase
      );

      setAuditResult(result);

      setLoading(false);

      setShowLeadModal(true);
    }, 500);
  };

  // -------------------------------
  // Lead submit
  // -------------------------------
  const handleLeadSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (honeypot) return;

    await supabase.from("leads").insert([
      {
        email: leadEmail,
        company: leadCompany,
        role: leadRole,
      },
    ]);

    alert(`Report saved for ${leadEmail}`);

    setShowLeadModal(false);

    setLeadEmail("");

    setLeadCompany("");

    setLeadRole("");
  };

  // -------------------------------
  // Shareable URL
  // -------------------------------
  const shareableUrl = auditResult
    ? `${window.location.origin}/audit/${generateId()}`
    : "";

  // -------------------------------
  // Prevent hydration mismatch
  // -------------------------------
  if (tools.length === 0) {
    return null;
  }

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-10">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-4 text-center">
          AI Spend Audit
        </h1>

        <p className="text-zinc-400 mb-8 text-center">
          Find hidden savings in your AI stack.
        </p>

        {/* FORM */}
        <div className="bg-zinc-900 p-6 rounded-2xl mb-8">

          <h2 className="text-2xl font-semibold mb-4">
            Your AI Stack
          </h2>

          {tools.map((toolEntry) => (
            <div
              key={toolEntry.id}
              className="border border-zinc-700 p-4 rounded-lg mb-4"
            >
              <div className="flex gap-2 flex-wrap mb-2">

                <select
                  className="flex-1 p-2 rounded bg-zinc-800"
                  value={toolEntry.tool}
                  onChange={(e) =>
                    updateTool(
                      toolEntry.id,
                      "tool",
                      e.target.value as ToolName
                    )
                  }
                >
                  {Object.entries(TOOL_LABELS).map(
                    ([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    )
                  )}
                </select>

                <select
                  className="flex-1 p-2 rounded bg-zinc-800"
                  value={toolEntry.plan}
                  onChange={(e) =>
                    updateTool(
                      toolEntry.id,
                      "plan",
                      e.target.value
                    )
                  }
                >
                  {TOOL_PLANS[toolEntry.tool].map(
                    (plan) => (
                      <option key={plan}>
                        {plan}
                      </option>
                    )
                  )}
                </select>

                <button
                  onClick={() =>
                    removeTool(toolEntry.id)
                  }
                  className="bg-red-600 px-3 rounded"
                >
                  ✕
                </button>

              </div>

              <div className="flex gap-2 flex-wrap">

                <input
                  type="number"
                  placeholder="Monthly spend"
                  className="flex-1 p-2 rounded bg-zinc-800"
                  value={toolEntry.monthlySpend}
                  onChange={(e) =>
                    updateTool(
                      toolEntry.id,
                      "monthlySpend",
                      Number(e.target.value)
                    )
                  }
                />

                <input
                  type="number"
                  placeholder="Seats"
                  className="flex-1 p-2 rounded bg-zinc-800"
                  value={toolEntry.seats}
                  onChange={(e) =>
                    updateTool(
                      toolEntry.id,
                      "seats",
                      Number(e.target.value)
                    )
                  }
                />

              </div>
            </div>
          ))}

          <button
            onClick={addTool}
            className="text-blue-400 mb-4"
          >
            + Add another tool
          </button>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="block text-zinc-400 mb-1">
                Team size
              </label>

              <input
                type="number"
                className="w-full p-2 rounded bg-zinc-800"
                value={teamSize}
                onChange={(e) =>
                  setTeamSize(Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">
                Primary use case
              </label>

              <select
                className="w-full p-2 rounded bg-zinc-800"
                value={primaryUseCase}
                onChange={(e) =>
                  setPrimaryUseCase(
                    e.target.value as any
                  )
                }
              >
                <option value="coding">
                  Coding
                </option>

                <option value="writing">
                  Writing
                </option>

                <option value="data">
                  Data
                </option>

                <option value="research">
                  Research
                </option>

                <option value="mixed">
                  Mixed
                </option>

              </select>
            </div>

          </div>

          <button
            onClick={handleAudit}
            disabled={loading}
            className="w-full mt-6 bg-white text-black p-3 rounded font-bold"
          >
            {loading
              ? "Auditing..."
              : "Audit My Spend"}
          </button>

        </div>

        {/* RESULTS */}
        {auditResult && (
          <div className="bg-zinc-900 p-6 rounded-2xl">

            <h2 className="text-3xl font-bold mb-4">
              Audit Report
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">

              <div className="bg-green-900/30 p-4 rounded-lg text-center">
                <div className="text-2xl text-green-400">
                  ${auditResult.totalMonthly}
                </div>

                <div>
                  Monthly savings
                </div>
              </div>

              <div className="bg-green-900/30 p-4 rounded-lg text-center">
                <div className="text-2xl text-green-400">
                  ${auditResult.totalAnnual}
                </div>

                <div>
                  Annual savings
                </div>
              </div>

            </div>

            {auditResult.recommendations.map(
              (rec: Recommendation, idx: number) => (
                <div
                  key={idx}
                  className="border-l-4 border-blue-500 pl-4 mb-4"
                >
                  <div className="font-bold">
                    {TOOL_LABELS[rec.tool]}
                  </div>

                  <div>
                    {rec.recommendedAction}
                  </div>

                  <div className="text-green-400">
                    Save $
                    {rec.potentialSavings}
                    /month
                  </div>

                  <div className="text-zinc-400 text-sm">
                    {rec.reason}
                  </div>
                </div>
              )
            )}

            <p className="text-xs text-zinc-500 mt-6">
              Shareable URL:
              {" "}
              {shareableUrl}
            </p>

          </div>
        )}

        {/* LEAD MODAL */}
        {showLeadModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

            <div className="bg-zinc-900 rounded-2xl max-w-md w-full p-6">

              <h3 className="text-2xl font-bold mb-2">
                Get your report
              </h3>

              <form onSubmit={handleLeadSubmit}>

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2 rounded bg-zinc-800 mb-3"
                  required
                  value={leadEmail}
                  onChange={(e) =>
                    setLeadEmail(e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Company"
                  className="w-full p-2 rounded bg-zinc-800 mb-3"
                  value={leadCompany}
                  onChange={(e) =>
                    setLeadCompany(e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Role"
                  className="w-full p-2 rounded bg-zinc-800 mb-3"
                  value={leadRole}
                  onChange={(e) =>
                    setLeadRole(e.target.value)
                  }
                />

                <input
                  type="text"
                  className="hidden"
                  value={honeypot}
                  onChange={(e) =>
                    setHoneypot(e.target.value)
                  }
                />

                <button
                  type="submit"
                  className="w-full bg-white text-black p-2 rounded font-bold"
                >
                  Send my report
                </button>

              </form>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}