import Anthropic from "@anthropic-ai/sdk";
import { KickstartProject, PriceEstimate } from "./types";
import { z } from "zod";
import { CLAUDE_MODEL } from "./model";

const priceEstimateSchema = z.object({
  total_min: z.number().nonnegative(),
  total_max: z.number().nonnegative(),
  currency: z.string(),
  hourly_rate: z.number().nonnegative(),
  breakdown: z
    .array(
      z.object({
        label: z.string(),
        hours_min: z.number().nonnegative(),
        hours_max: z.number().nonnegative(),
        description: z.string(),
      }),
    )
    .min(1),
  notes: z.string(),
});

let cachedClient: Anthropic | null = null;

function client(): Anthropic {
  if (!cachedClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY mangler — kjør via Doppler (se AGENTS.md)");
    }
    cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cachedClient;
}

const estimateTool: Anthropic.Tool = {
  name: "set_price_estimate",
  description: "Sett prisestimat for prosjektet basert på scope og kompleksitet",
  input_schema: {
    type: "object",
    properties: {
      total_min: { type: "number", description: "Minimum totalsum i NOK" },
      total_max: { type: "number", description: "Maksimum totalsum i NOK" },
      currency: { type: "string", enum: ["NOK"] },
      hourly_rate: { type: "number", description: "Timepris i NOK" },
      breakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            hours_min: { type: "number" },
            hours_max: { type: "number" },
            description: { type: "string" },
          },
          required: ["label", "hours_min", "hours_max", "description"],
        },
      },
      notes: { type: "string" },
    },
    required: ["total_min", "total_max", "currency", "hourly_rate", "breakdown", "notes"],
  },
};

export async function estimateProjectPrice(project: KickstartProject): Promise<PriceEstimate> {
  const response = await client().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    tools: [estimateTool],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: `Estimer prisen for dette IT-prosjektet for Myrvoll-Lunde IT Drift (timepris 1200-1500 NOK):

Kunde: ${project.client_name}
Prosjekt: ${project.project_name}
Type: ${project.project_type}
Teknologier: ${project.tech_stack.join(", ")}
Beskrivelse: ${project.short_description}

${project.project_md ? `PROJECT.md (utdrag):\n${project.project_md.slice(0, 12_000)}` : ""}

Gi en realistisk time- og prisestimering fordelt på faser.`,
      },
    ],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Fikk ikke prisestimat fra Claude");
  }

  // Verktøy-input er modellgenerert JSON — valider før det lagres og vises som
  // et pristilbud.
  const parsed = priceEstimateSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(
      `Prisestimatet fra Claude hadde ugyldig form: ${parsed.error.issues
        .map((i) => `${i.path.join(".")} ${i.message}`)
        .join(", ")}`,
    );
  }
  return parsed.data as PriceEstimate;
}
