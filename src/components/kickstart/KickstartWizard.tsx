"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wizardSchema, WizardSchema } from "@/lib/kickstart/validation";
import {
  TECH_OPTIONS,
  INTEGRATION_OPTIONS,
  DESIGN_DIRECTIONS,
  MOTION_OPTIONS,
  AUTH_OPTIONS,
  PROJECT_TYPES,
} from "@/lib/kickstart/tech-options";
import ChipSelector from "./ChipSelector";
import ColorPicker from "./ColorPicker";

const STEPS = [
  "Kundeinfo",
  "Prosjekttype",
  "Teknologier",
  "Integrasjoner",
  "Designretning",
  "Designdetaljer",
  "Features",
  "Beskrivelse",
  "Bekreft",
];

export default function KickstartWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [genLog, setGenLog] = useState<string[]>([]);
  const [liveText, setLiveText] = useState("");
  const [currentPartTitle, setCurrentPartTitle] = useState("");
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const liveRef = useRef<HTMLPreElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.scrollTop = liveRef.current.scrollHeight;
    }
  }, [liveText]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [genLog]);

  const form = useForm<WizardSchema>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      client_name:       "",
      project_name:      "",
      contact_person:    "",
      new_domain:        "",
      existing_url:      "",
      project_type:      "",
      auth_type:         "supabase-auth",
      sprint_estimate:   6,
      requires_scrape:   false,
      tech_stack:        ["nextjs", "typescript", "tailwind", "shadcn", "supabase", "supabase-auth", "vercel", "resend"],
      integrations:      [],
      design_direction:  "",
      primary_color:     "#3B82F6",
      secondary_color:   "",
      motion_preference: "subtil",
      features:          "",
      extra_notes:       "",
      short_description: "",
      long_description:  "",
    },
  });

  const { register, watch, setValue, getValues, trigger, formState: { errors } } = form;
  const values = watch();

  const fieldsByStep: (keyof WizardSchema)[][] = [
    ["client_name", "project_name"],
    ["project_type"],
    ["tech_stack"],
    ["integrations"],
    ["design_direction"],
    ["primary_color"],
    ["features"],
    ["short_description", "long_description"],
    [],
  ];

  async function nextStep() {
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setGenLog(["Starter generering av PROJECT.md..."]);
    setLiveText("");
    setCurrentPartTitle("");

    let gotError = false;
    try {
      const res = await fetch("/api/kickstart/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getValues()),
      });

      if (!res.ok || !res.body) {
        setGenLog((p) => [...p, `Serverfeil: ${res.status} ${res.statusText}`]);
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
            let event: Record<string, unknown>;
            try {
              event = JSON.parse(line.slice(5).trim());
            } catch {
              continue;
            }

            if (event.type === "project_id") {
              setCreatedId(event.id as string);
            } else if (event.type === "start_part") {
              setCurrentPartTitle(event.title as string);
              setLiveText("");
              setGenLog((p) => [...p, `Genererer: ${event.title as string}`]);
            } else if (event.type === "delta") {
              setLiveText((p) => p + (event.text as string));
            } else if (event.type === "part") {
              setGenLog((p) => {
                const next = [...p];
                let idx = -1;
                for (let j = next.length - 1; j >= 0; j--) {
                  if (next[j].startsWith("Genererer:")) { idx = j; break; }
                }
                if (idx !== -1) next[idx] = `✓ ${event.title as string}`;
                return next;
              });
              setLiveText("");
              setCurrentPartTitle("");
            } else if (event.type === "done") {
              setGenLog((p) => [...p, "PROJECT.md generert og lagret!"]);
              setLiveText("");
              setCurrentPartTitle("");
              setDone(true);
            } else if (event.type === "error") {
              setGenLog((p) => [...p, `Feil: ${event.message as string}`]);
              gotError = true;
            }
          }
        }
      }
    } catch (e) {
      setGenLog((p) => [...p, `Nettverksfeil: ${(e as Error).message}`]);
      gotError = true;
    }

    if (!gotError) setSubmitting(false);
  }

  if (done && createdId) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4 font-mono text-green-500">✓</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Prosjekt opprettet!</h2>
        <p className="text-gray-500 mb-6">PROJECT.md er generert og lagret i databasen.</p>
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
    const hasFailed = genLog.some((l) => l.startsWith("Feil:") || l.startsWith("Nettverksfeil:") || l.startsWith("Serverfeil:"));
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {hasFailed ? "Generering feilet" : "Genererer PROJECT.md..."}
          </h2>
          {currentPartTitle && (
            <span className="text-xs text-gray-400 font-mono truncate max-w-sm">{currentPartTitle}</span>
          )}
        </div>

        {/* Logg — fullførte deler */}
        <div
          ref={logRef}
          className="bg-gray-950 px-4 py-3 font-mono text-xs space-y-0.5 max-h-32 overflow-y-auto"
        >
          {genLog.map((l, i) => (
            <div
              key={i}
              className={
                l.startsWith("✓")
                  ? "text-green-400"
                  : l.startsWith("Feil:") || l.startsWith("Nettverksfeil:") || l.startsWith("Serverfeil:")
                  ? "text-red-400"
                  : l.startsWith("PROJECT.md")
                  ? "text-green-300 font-bold"
                  : "text-gray-400"
              }
            >
              {l.startsWith("✓") || l.startsWith("PROJECT.md") ? l : l.startsWith("Genererer:") ? `▶ ${l.replace("Genererer: ", "")}` : l}
            </div>
          ))}
          {!hasFailed && !done && <div className="text-blue-400 animate-pulse">▋</div>}
        </div>

        {/* Live tekst — strømmer inn */}
        {liveText && (
          <pre
            ref={liveRef}
            className="bg-gray-900 px-4 py-3 font-mono text-xs text-green-300 leading-relaxed overflow-y-auto max-h-80 whitespace-pre-wrap break-words"
          >
            {liveText}
          </pre>
        )}

        {hasFailed && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => { setSubmitting(false); setGenLog([]); setLiveText(""); setCurrentPartTitle(""); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Prøv igjen
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Step indicator */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-1 flex-wrap">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-100 text-blue-700 ring-2 ring-blue-600" : "bg-gray-100 text-gray-400"}`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-3 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-gray-700">{STEPS[step]}</p>
      </div>

      {/* Step content */}
      <div className="p-6 space-y-4">

        {/* Steg 0: Kundeinfo */}
        {step === 0 && (
          <>
            <Row2>
              <Field label="Kundenavn" error={errors.client_name?.message}>
                <input {...register("client_name")} className={inp()} placeholder="Acme AS" />
              </Field>
              <Field label="Prosjektnavn" error={errors.project_name?.message}>
                <input {...register("project_name")} className={inp()} placeholder="Acme Kundeportal" />
              </Field>
            </Row2>
            <Field label="Kontaktperson (navn + e-post)">
              <input {...register("contact_person")} className={inp()} placeholder="Kari Nordmann — kari@acme.no" />
            </Field>
            <Row2>
              <Field label="Nytt domene">
                <input {...register("new_domain")} className={inp()} placeholder="acme.no" />
              </Field>
              <Field label="Eksisterende nettsted (migrering)">
                <input {...register("existing_url")} className={inp()} placeholder="https://gammel.acme.no" />
              </Field>
            </Row2>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requires_scrape"
                checked={values.requires_scrape}
                onChange={(e) => setValue("requires_scrape", e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="requires_scrape" className="text-sm text-gray-700">
                Scrape eksisterende nettsted og importer innhold
              </label>
            </div>
          </>
        )}

        {/* Steg 1: Prosjekttype */}
        {step === 1 && (
          <>
            <Field label="Prosjekttype" error={errors.project_type?.message}>
              <div className="grid grid-cols-3 gap-2">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setValue("project_type", t.id)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm
                      ${values.project_type === t.id
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>
            <Row2>
              <Field label="Autentisering">
                <select
                  value={values.auth_type}
                  onChange={(e) => setValue("auth_type", e.target.value)}
                  className={inp()}
                >
                  {AUTH_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label} — {o.description}</option>
                  ))}
                </select>
              </Field>
              <Field label="Estimert antall sprinter">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={values.sprint_estimate}
                  onChange={(e) => setValue("sprint_estimate", parseInt(e.target.value) || 6)}
                  className={inp()}
                />
              </Field>
            </Row2>
          </>
        )}

        {/* Steg 2: Teknologier */}
        {step === 2 && (
          <Field label="Teknologier" error={errors.tech_stack?.message}>
            <ChipSelector
              options={TECH_OPTIONS}
              selected={values.tech_stack}
              onChange={(v) => setValue("tech_stack", v)}
            />
          </Field>
        )}

        {/* Steg 3: Integrasjoner */}
        {step === 3 && (
          <Field label="Integrasjoner (velg det som er relevant)">
            <ChipSelector
              options={INTEGRATION_OPTIONS}
              selected={values.integrations}
              onChange={(v) => setValue("integrations", v)}
            />
          </Field>
        )}

        {/* Steg 4: Designretning */}
        {step === 4 && (
          <Field label="Designretning (2026)" error={errors.design_direction?.message}>
            <div className="grid grid-cols-1 gap-3">
              {DESIGN_DIRECTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setValue("design_direction", d.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all
                    ${values.design_direction === d.id
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                      : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm font-semibold ${values.design_direction === d.id ? "text-blue-700" : "text-gray-900"}`}>
                        {d.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{d.signature}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{d.suitedFor}</span>
                  </div>
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Steg 5: Designdetaljer */}
        {step === 5 && (
          <>
            <Row2>
              <ColorPicker
                value={values.primary_color}
                onChange={(v) => setValue("primary_color", v)}
              />
              <Field label="Sekundærfarge (valgfri)">
                <input
                  type="text"
                  value={values.secondary_color}
                  onChange={(e) => setValue("secondary_color", e.target.value)}
                  className={inp()}
                  placeholder="#10B981"
                />
              </Field>
            </Row2>
            <Field label="Bevegelse / motion">
              <div className="grid grid-cols-3 gap-2">
                {MOTION_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setValue("motion_preference", o.id)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm
                      ${values.motion_preference === o.id
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                  >
                    <p className="font-medium">{o.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{o.description}</p>
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {/* Steg 6: Features */}
        {step === 6 && (
          <>
            <Field label="Features og krav (ett per linje)">
              <textarea
                {...register("features")}
                rows={7}
                className={inp()}
                placeholder={`- Brukerpålogging med e-post\n- Dashbord med oversikt over bestillinger\n- Admin-panel for å redigere innhold\n- Kontaktskjema med e-postvarsling\n- Priskalkulatoren på forsiden`}
              />
            </Field>
            <Field label="Ekstra notater til Claude">
              <textarea
                {...register("extra_notes")}
                rows={3}
                className={inp()}
                placeholder="Spesielle hensyn, ting å unngå, ønsker om tone/stil, eksisterende brandmateriale, o.l."
              />
            </Field>
          </>
        )}

        {/* Steg 7: Beskrivelse */}
        {step === 7 && (
          <>
            <Field label="Kort beskrivelse (1 setning)" error={errors.short_description?.message}>
              <input
                {...register("short_description")}
                className={inp()}
                placeholder="En B2B-portal der Acmes kunder bestiller, sporer og fakturerer leveranser"
              />
            </Field>
            <Field label="Detaljert beskrivelse" error={errors.long_description?.message}>
              <textarea
                {...register("long_description")}
                rows={7}
                className={inp()}
                placeholder="Beskriv formål, målgruppe, kjerneflyt, konkurransefortrinn, spesielle krav, integrasjoner, geografi, forventet trafikk, o.l. Jo mer desto bedre — Claude bruker alt dette."
              />
            </Field>
          </>
        )}

        {/* Steg 8: Bekreft */}
        {step === 8 && (
          <div className="space-y-2 text-sm">
            <SummaryRow label="Kunde" value={values.client_name} />
            <SummaryRow label="Prosjekt" value={values.project_name} />
            {values.new_domain && <SummaryRow label="Domene" value={values.new_domain} />}
            <SummaryRow label="Type" value={PROJECT_TYPES.find(t => t.id === values.project_type)?.label ?? values.project_type} />
            <SummaryRow label="Designretning" value={DESIGN_DIRECTIONS.find(d => d.id === values.design_direction)?.label ?? values.design_direction} />
            <SummaryRow label="Teknologier" value={values.tech_stack.join(", ")} />
            {values.integrations.length > 0 && <SummaryRow label="Integrasjoner" value={values.integrations.join(", ")} />}
            <SummaryRow label="Motion" value={MOTION_OPTIONS.find(o => o.id === values.motion_preference)?.label ?? values.motion_preference} />
            <SummaryRow label="Primærfarge" value={values.primary_color} color={values.primary_color} />
            <SummaryRow label="Sprinter" value={`${values.sprint_estimate} sprinter`} />
            <SummaryRow label="Beskrivelse" value={values.short_description} />
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              Claude vil generere en komplett PROJECT.md med alle 20+ seksjoner basert på MLIT-standardene (42 regler, 10/10-kvalitet). Dette tar 2–5 minutter.
            </div>
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
        {step < STEPS.length - 1 ? (
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

function inp() {
  return "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Row2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-right flex items-center gap-1.5">
        {color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />}
        {value}
      </span>
    </div>
  );
}
