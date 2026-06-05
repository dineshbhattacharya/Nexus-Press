import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { action, text = "", prompt = "" } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    let suggestion = "";

    // Realistic context-aware AI text generation simulator
    switch (action) {
      case "continue":
        suggestion = `
          Furthermore, when we analyze the long-term impact of this shift, it becomes evident that the traditional paradigms are no longer sustainable. We must prepare for a system that values agility over rigid structures, allowing authors to establish a direct relationship with their readers. The primary driver of this transformation lies in user engagement metrics, where micro-feedback channels bypass standard editing layers entirely.
        `.trim();
        break;

      case "summarize":
        suggestion = `
          • Key Idea: The democratization of independent publishing.
          • Core Shift: Transitioning from centralized editorial bodies to direct creator-to-audience models.
          • Tech Drivers: Low-latency communication feeds, subscription frameworks, and AI editorial co-writers.
          • Action Item: Writers must cultivate specialized niches to thrive in high-volatility content ecosystems.
        `.trim();
        break;

      case "rephrase":
        suggestion = `In essence, this development represents a profound realignment of creative control. Rather than relying on traditional distribution nodes, writers are establishing direct pipelines to their readers, restructuring both the economics and the creative liberties of modern authorship.`;
        break;

      case "headlines":
        const subject = text.slice(0, 40) || "Modern Writing Platforms";
        suggestion = `
          1. The Silent Revolution: How Micro-Publishing is Realignment of Creative Control
          2. Beyond the Newsletter: The Structural Shift in Creative Economics
          3. Direct Pipelines: Why Specialized Niches Are the Ultimate Author Hedge
        `.trim();
        break;

      case "custom":
        suggestion = `Here is a custom draft answering: "${prompt}"\n\nTo address this topic, it is crucial to first establish the baseline context. We see that the core issue revolves around optimization. By addressing this through the prism of clean interface design and transparent reader-first business models, we build sustainable, high-trust publishing networks that naturally filter out lower-value noise.`;
        break;

      default:
        suggestion = "Ready to assist. Please specify a valid copilot action.";
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    console.error("AI Copilot error:", error);
    return NextResponse.json({ error: "Failed to generate AI writing suggestion." }, { status: 500 });
  }
}
