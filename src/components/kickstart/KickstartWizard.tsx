"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wizardSchema, WizardSchema } from "@/lib/kickstart/validation";
import { TECH_OPTIONS, PROJECT_TYPES } from "@/lib/kickstart/tech-options";
import ChipSelector from "./ChipSelector";
import ColorPicker from "./ColorPicker";

const STEPS = [
  "Kundeinfo",
  "Prosjekttype",
  "Teknologier",
  "Design",
  "Beskrivelse",
  "Bekreft",
];

export default function KickstartWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [genLog, setGenLog] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const form = useForm<WizardSchema>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      client_name: "",
      project_name: "",
      project_type: "",
      tech_stack: ["nextjs", "typescript", "tailwind", "shadcn", "supabase", "supabase-auth", "vercel", "resend"],
      primary_color: "#3B82F6",
      short_description: "",
      long_description: "",
    },
  });

  const { register, watch, setValue, getValues, trigger, formState: { errors } } = form;
  const values = watch();

  async function nextStep() {
    const fieldsByStep: (keyof WizardSchema)[][] = [
      ["client_name", "project_name"],
      ["project_type"],
      ["tech_stack"],
      ["primary_color"],
      ["short_description", "long_description"],
      [],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, 5));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setGenLog(["Starter generering av PROJECT.md..."]);

    let gotError = false;
    try {
      const res = await fetch("/api/kickstart/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getValues()),
      });

      if (!res.ok || !res.body) {
        setGenLog((p) => [...p, `❌ Serverfeil: ${res.status} ${res.statusText}`]);
        gotError = true;
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done: rdone, value } = await reader.read();
          if (rdone) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const event = JSON.parse(line.slice(5).trim());
            if (event.type === "project_id") setCreatedId(event.id);
            else if (event.type === "part") setGenLog((p) => [...p, `✓ ${event.title}`]);
            else if (event.type === "done") {
              setGenLog((p) => [...p, "✅ PROJECT.md generert og lagret!"]);
              setDone(true);
            } else if (event.type === "error") {
              setGenLog((p) => [...p, `❌ ${event.message}`]);
              gotError = true;
            }
          }
        }
      }
    } catch (e) {
      setGenLog((p) => [...p, `❌ Nettverksfeil: ${(e as Error).message}`]);
      gotError = true;
    }

    if (!gotError) setSubmitting(false);
  }

  if (done && createdId) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Prosjekt opprettet!</h2>
        <p className="text-gray-500 mb-6">PROJECT.md er generert og lagret.</p>
        <button
          onClick={() => router.push(`/admin/kickstart/${createdId}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Se prosjektet →
        </button>
      </div>
    );
  }

  if (submitting) {
    const hasFailed = genLog.some((l) => l.startsWith("❌"));
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {hasFailed ? "Generering feilet" : "Genererer PROJECT.md..."}
        </h2>
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 space-y-1 min-h-32">
          {genLog.map((l, i) => (
            <div key={i} className={l.startsWith("❌") ? "text-red-400" : undefined}>{l}</div>
          ))}
          {!hasFailed && <div className="animate-pulse">▋</div>}
        </div>
        {hasFailed && (
          <button
            onClick={() => { setSubmitting(false); setGenLog([]); }}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Prøv igjen
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Step indicator */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-100 text-blue-700 ring-2 ring-blue-600" : "bg-gray-100 text-gray-400"}`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-gray-700">{STEPS[step]}</p>
      </div>

      {/* Step content */}
      <div className="p-6 space-y-4">
        {step === 0 && (
          <>
            <Field label="Kundenavn" error={errors.client_name?.message}>
              <input {...register("client_name")} className={input()} placeholder="Acme AS" />
            </Field>
            <Field label="Prosjektnavn" error={errors.project_name?.message}>
              <input {...register("project_name")} className={input()} placeholder="Acme Kundeportal" />
            </Field>
          </>
        )}

        {step === 1 && (
          <Field label="Prosjekttype" error={errors.project_type?.message}>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setValue("project_type", t.id)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm
                    ${values.project_type === t.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
        )}

        {step === 2 && (
          <Field label="Teknologier" error={errors.tech_stack?.message}>
            <ChipSelector
              options={TECH_OPTIONS}
              selected={values.tech_stack}
              onChange={(v) => setValue("tech_stack", v)}
            />
          </Field>
        )}

        {step === 3 && (
          <ColorPicker
            value={values.primary_color}
            onChange={(v) => setValue("primary_color", v)}
          />
        )}

        {step === 4 && (
          <>
            <Field label="Kort beskrivelse (1 setning)" error={errors.short_description?.message}>
              <input
                {...register("short_description")}
                className={input()}
                placeholder="En portal for Acme-kunder til å se fakturaer og bestillinger"
              />
            </Field>
            <Field label="Detaljert beskrivelse" error={errors.long_description?.message}>
              <textarea
                {...register("long_description")}
                rows={6}
                className={input()}
                placeholder="Beskriv funksjonalitet, målgruppe, spesielle krav, integrasjoner, o.l."
              />
            </Field>
          </>
        )}

        {step === 5 && (
          <div className="space-y-3 text-sm">
            <Row label="Kunde" value={values.client_name} />
            <Row label="Prosjekt" value={values.project_name} />
            <Row label="Type" value={PROJECT_TYPES.find(t => t.id === values.project_type)?.label ?? values.project_type} />
            <Row label="Teknologier" value={values.tech_stack.join(", ")} />
            <Row label="Farge" value={values.primary_color} color={values.primary_color} />
            <Row label="Beskrivelse" value={values.short_description} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
        >
          ← Tilbake
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={nextStep}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Neste →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Generer PROJECT.md
          </button>
        )}
      </div>
    </div>
  );
}

function input() {
  return "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 flex items-center gap-1.5 font-medium">
        {color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />}
        {value}
      </span>
    </div>
  );
}
