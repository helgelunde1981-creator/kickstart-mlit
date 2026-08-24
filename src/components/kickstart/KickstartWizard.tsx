"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wizardSchema, WizardSchema, DEFAULT_TECH_STACK } from "@/lib/kickstart/validation";
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
import DesignDirectionPreview from "./DesignDirectionPreview";
import GenerationPanel from "./GenerationPanel";
import { useSpecGeneration } from "./useSpecGeneration";

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

const FIELDS_BY_STEP: (keyof WizardSchema)[][] = [
  ["client_name", "project_name", "existing_url"],
  ["project_type", "sprint_estimate"],
  ["tech_stack"],
  ["integrations"],
  ["design_direction"],
  ["primary_color", "secondary_color"],
  ["features"],
  ["short_description", "long_description"],
  [],
];

export default function KickstartWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const { state, start, reset } = useSpecGeneration();

  const form = useForm<WizardSchema>({
    resolver: zodResolver(wizardSchema),
    mode: "onTouched",
    defaultValues: {
      client_name: "",
      project_name: "",
      contact_person: "",
      new_domain: "",
      existing_url: "",
      project_type: "",
      auth_type: "supabase-auth",
      sprint_estimate: 6,
      requires_scrape: false,
      tech_stack: DEFAULT_TECH_STACK,
      integrations: [],
      design_direction: "",
      primary_color: "#3B82F6",
      secondary_color: "",
      motion_preference: "subtil",
      features: "",
      extra_notes: "",
      short_description: "",
      long_description: "",
    },
  });

  const { register, watch, setValue, getValues, trigger, formState: { errors } } = form;
  const values = watch();
  const started = state.running || state.finished || state.failed;

  async function goNext() {
    const valid = await trigger(FIELDS_BY_STEP[step]);
    if (!valid) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setMaxStepReached((m) => Math.max(m, next));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    // Enter i et felt skal føre videre i stegene, ikke sende av gårde en
    // 15-minutters generering ved et uhell.
    e.preventDefault();
    if (step < STEPS.length - 1) {
      await goNext();
      return;
    }
    await start(getValues());
  }

  // === Ferdig ===
  if (state.finished && state.projectId) {
    return (
      <div className="space-y-4">
        <GenerationPanel state={state} />
        <div className="card p-6 text-center">
          <p className="mb-1 font-medium">Prosjektet er opprettet</p>
          <p className="mb-5 text-sm text-muted">
            PROJECT.md er generert i {state.totalParts} deler og lagret.
          </p>
          <button
            onClick={() => router.push(`/admin/kickstart/${state.projectId}`)}
            className="btn btn-primary"
          >
            Åpne prosjektet
          </button>
        </div>
      </div>
    );
  }

  // === Under generering / feilet ===
  if (started) {
    return (
      <div className="space-y-4">
        <GenerationPanel state={state} />
        {state.failed && (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-muted">
              {state.projectId
                ? "Delene som ble ferdige er lagret. Fortsett fra prosjektsiden."
                : "Ingenting ble lagret — prøv igjen."}
            </p>
            <div className="flex gap-2">
              {state.projectId && (
                <button
                  onClick={() => router.push(`/admin/kickstart/${state.projectId}`)}
                  className="btn btn-primary"
                >
                  Åpne prosjektet
                </button>
              )}
              <button onClick={reset} className="btn btn-secondary">
                Tilbake til skjemaet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === Skjemaet ===
  return (
    <form onSubmit={handleFormSubmit} className="card overflow-hidden" noValidate>
      <div className="border-b border-line px-4 py-4 sm:px-6">
        <ol className="flex flex-wrap items-center gap-1.5">
          {STEPS.map((label, i) => {
            const reachable = i <= maxStepReached;
            return (
              <li key={label} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => reachable && setStep(i)}
                  disabled={!reachable}
                  aria-current={i === step ? "step" : undefined}
                  title={label}
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-medium transition-colors
                    ${
                      i < step
                        ? "bg-accent text-on-accent"
                        : i === step
                          ? "bg-accent-soft text-accent ring-2 ring-accent"
                          : "bg-surface-2 text-faint"
                    } ${reachable ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <span className="sr-only">{label}</span>
                  <span aria-hidden>{i < step ? "✓" : i + 1}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span aria-hidden className={`h-px w-3 ${i < step ? "bg-accent" : "bg-line"}`} />
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-2.5 text-sm font-medium">
          Steg {step + 1} av {STEPS.length} — {STEPS[step]}
        </p>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        {/* Steg 0: Kundeinfo */}
        {step === 0 && (
          <>
            <Row2>
              <Field id="client_name" label="Kundenavn" error={errors.client_name?.message}>
                <input id="client_name" {...register("client_name")} className="input" placeholder="Acme AS" autoFocus />
              </Field>
              <Field id="project_name" label="Prosjektnavn" error={errors.project_name?.message}>
                <input id="project_name" {...register("project_name")} className="input" placeholder="Acme Kundeportal" />
              </Field>
            </Row2>
            <Field id="contact_person" label="Kontaktperson (navn + e-post)" hint="Brukes i §7.2 Kontaktinfo i specen.">
              <input id="contact_person" {...register("contact_person")} className="input" placeholder="Kari Nordmann — kari@acme.no" />
            </Field>
            <Field id="new_domain" label="Nytt domene">
              <input id="new_domain" {...register("new_domain")} className="input" placeholder="acme.no" />
            </Field>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requires_scrape"
                  checked={values.requires_scrape}
                  onChange={(e) => setValue("requires_scrape", e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <label htmlFor="requires_scrape" className="text-sm">
                  Scrape eksisterende nettsted og importer innhold
                </label>
              </div>
              {values.requires_scrape && (
                <Field id="existing_url" label="URL som skal scrapes" error={errors.existing_url?.message}>
                  <input id="existing_url" {...register("existing_url")} className="input" placeholder="https://gammel.acme.no" autoFocus />
                </Field>
              )}
            </div>
          </>
        )}

        {/* Steg 1: Prosjekttype */}
        {step === 1 && (
          <>
            <fieldset>
              <legend className="field-label">Prosjekttype</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setValue("project_type", t.id, { shouldValidate: true })}
                    aria-pressed={values.project_type === t.id}
                    className="choice px-3 py-2 text-sm"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {errors.project_type?.message && (
                <p className="mt-1.5 text-xs text-danger">{errors.project_type.message}</p>
              )}
            </fieldset>
            <Row2>
              <Field id="auth_type" label="Autentisering">
                <select
                  id="auth_type"
                  value={values.auth_type}
                  onChange={(e) => setValue("auth_type", e.target.value)}
                  className="input"
                >
                  {AUTH_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label} — {o.description}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="sprint_estimate"
                label="Estimert antall sprinter"
                error={errors.sprint_estimate?.message}
                hint="Styrer hvor mange sprinter sprintplanen i §20 deles opp i."
              >
                <input
                  id="sprint_estimate"
                  type="number"
                  min={1}
                  max={20}
                  value={values.sprint_estimate}
                  onChange={(e) => setValue("sprint_estimate", parseInt(e.target.value) || 6, { shouldValidate: true })}
                  className="input"
                />
              </Field>
            </Row2>
          </>
        )}

        {/* Steg 2: Teknologier */}
        {step === 2 && (
          <fieldset>
            <legend className="field-label">Teknologier</legend>
            <p className="mb-3 text-xs text-muted">
              Standard-stacken er forhåndsvalgt. Avvik fra den må begrunnes i specen (§8.1).
            </p>
            <ChipSelector
              options={TECH_OPTIONS}
              selected={values.tech_stack}
              onChange={(v) => setValue("tech_stack", v, { shouldValidate: true })}
            />
            {errors.tech_stack?.message && (
              <p className="mt-2 text-xs text-danger">{errors.tech_stack.message}</p>
            )}
          </fieldset>
        )}

        {/* Steg 3: Integrasjoner */}
        {step === 3 && (
          <fieldset>
            <legend className="field-label">Integrasjoner</legend>
            <p className="mb-3 text-xs text-muted">Velg det som er relevant — hopp over hvis ingen.</p>
            <ChipSelector
              options={INTEGRATION_OPTIONS}
              selected={values.integrations}
              onChange={(v) => setValue("integrations", v)}
            />
          </fieldset>
        )}

        {/* Steg 4: Designretning */}
        {step === 4 && (
          <fieldset>
            <legend className="field-label">Designretning (2026)</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DESIGN_DIRECTIONS.map((d) => {
                const sel = values.design_direction === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setValue("design_direction", d.id, { shouldValidate: true })}
                    aria-pressed={sel}
                    className="choice overflow-hidden p-0"
                  >
                    <DesignDirectionPreview id={d.id} selected={sel} />
                    <div className="px-3 py-2">
                      <p className={`text-xs font-semibold leading-tight ${sel ? "text-accent" : ""}`}>
                        {d.label}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">{d.suitedFor}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.design_direction?.message && (
              <p className="mt-2 text-xs text-danger">{errors.design_direction.message}</p>
            )}
          </fieldset>
        )}

        {/* Steg 5: Designdetaljer */}
        {step === 5 && (
          <>
            <Row2>
              <ColorPicker value={values.primary_color} onChange={(v) => setValue("primary_color", v, { shouldValidate: true })} />
              <ColorPicker
                value={values.secondary_color}
                onChange={(v) => setValue("secondary_color", v, { shouldValidate: true })}
                label="Sekundærfarge (valgfri)"
                loadPriorColors={false}
              />
            </Row2>
            {(errors.primary_color?.message || errors.secondary_color?.message) && (
              <p className="text-xs text-danger">
                {errors.primary_color?.message ?? errors.secondary_color?.message}
              </p>
            )}
            <fieldset>
              <legend className="field-label">Bevegelse / motion</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {MOTION_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setValue("motion_preference", o.id)}
                    aria-pressed={values.motion_preference === o.id}
                    className="choice px-3 py-2 text-sm"
                  >
                    <span className="block font-medium">{o.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{o.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {/* Steg 6: Features */}
        {step === 6 && (
          <>
            <Field
              id="features"
              label="Features og krav (ett per linje)"
              hint="Alt som står her blir til deep-dives i §10. Er lista tom, stiller Claude spørsmål i stedet."
              error={errors.features?.message}
            >
              <textarea
                id="features"
                {...register("features")}
                rows={8}
                className="input"
                placeholder={`- Brukerpålogging med e-post\n- Dashbord med oversikt over bestillinger\n- Admin-panel for å redigere innhold\n- Kontaktskjema med e-postvarsling\n- Priskalkulator på forsiden`}
              />
            </Field>
            <Field id="extra_notes" label="Ekstra notater til Claude">
              <textarea
                id="extra_notes"
                {...register("extra_notes")}
                rows={3}
                className="input"
                placeholder="Spesielle hensyn, ting å unngå, ønsker om tone/stil, eksisterende brandmateriale, o.l."
              />
            </Field>
          </>
        )}

        {/* Steg 7: Beskrivelse */}
        {step === 7 && (
          <>
            <Field id="short_description" label="Kort beskrivelse (1 setning)" error={errors.short_description?.message}>
              <input
                id="short_description"
                {...register("short_description")}
                className="input"
                placeholder="En B2B-portal der Acmes kunder bestiller, sporer og fakturerer leveranser"
              />
            </Field>
            <Field
              id="long_description"
              label="Detaljert beskrivelse"
              hint={`${values.long_description.length} tegn — jo mer kontekst, desto bedre spec.`}
              error={errors.long_description?.message}
            >
              <textarea
                id="long_description"
                {...register("long_description")}
                rows={8}
                className="input"
                placeholder="Formål, målgruppe, kjerneflyt, konkurransefortrinn, spesielle krav, integrasjoner, geografi, forventet trafikk…"
              />
            </Field>
          </>
        )}

        {/* Steg 8: Bekreft */}
        {step === 8 && (
          <div className="space-y-1.5 text-sm">
            <SummaryRow label="Kunde" value={values.client_name} />
            <SummaryRow label="Prosjekt" value={values.project_name} />
            {values.new_domain && <SummaryRow label="Domene" value={values.new_domain} />}
            <SummaryRow label="Type" value={labelOf(values.project_type, PROJECT_TYPES)} />
            <SummaryRow label="Auth" value={labelOf(values.auth_type, AUTH_OPTIONS)} />
            <SummaryRow label="Designretning" value={labelOf(values.design_direction, DESIGN_DIRECTIONS)} />
            <SummaryRow label="Teknologier" value={values.tech_stack.map((t) => labelOf(t, TECH_OPTIONS)).join(", ")} />
            {values.integrations.length > 0 && (
              <SummaryRow label="Integrasjoner" value={values.integrations.map((t) => labelOf(t, INTEGRATION_OPTIONS)).join(", ")} />
            )}
            <SummaryRow label="Motion" value={labelOf(values.motion_preference, MOTION_OPTIONS)} />
            <SummaryRow label="Primærfarge" value={values.primary_color} color={values.primary_color} />
            <SummaryRow label="Sprinter" value={`${values.sprint_estimate}`} />
            {values.requires_scrape && <SummaryRow label="Scrape" value={values.existing_url} />}
            <SummaryRow label="Beskrivelse" value={values.short_description} />

            <div className="mt-4 rounded-xl bg-accent-soft p-3 text-xs text-accent">
              Claude genererer PROJECT.md i 12 deler etter MLIT-standardene. Det tar
              10–20 minutter og koster penger i API-bruk. La fanen stå åpen — hver del
              lagres underveis, så et avbrudd kan gjenopptas fra prosjektsiden.
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-4 sm:px-6">
        <button type="button" onClick={goBack} disabled={step === 0} className="btn btn-ghost">
          ← Tilbake
        </button>
        {step < STEPS.length - 1 ? (
          <button type="submit" className="btn btn-primary">
            Neste →
          </button>
        ) : (
          <button type="submit" className="btn btn-primary">
            Generer PROJECT.md
          </button>
        )}
      </div>
    </form>
  );
}

function labelOf(id: string, options: { id: string; label: string }[]): string {
  return options.find((o) => o.id === id)?.label ?? id;
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-faint">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Row2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1.5 last:border-0">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-right font-medium">
        {color && (
          <span aria-hidden className="h-3 w-3 shrink-0 rounded-full ring-1 ring-line" style={{ backgroundColor: color }} />
        )}
        {value}
      </span>
    </div>
  );
}
