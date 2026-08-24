"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { VerifyCheck } from "@/lib/kickstart/types";

export type LogKind = "info" | "ok" | "warn" | "error";
export interface LogLine {
  kind: LogKind;
  text: string;
}

export interface GenerationState {
  running: boolean;
  finished: boolean;
  failed: boolean;
  log: LogLine[];
  liveText: string;
  partTitle: string;
  part: number;
  totalParts: number;
  verifyChecks: VerifyCheck[] | null;
  projectId: string | null;
  projectMd: string | null;
  elapsedSeconds: number;
}

const INITIAL: GenerationState = {
  running: false,
  finished: false,
  failed: false,
  log: [],
  liveText: "",
  partTitle: "",
  part: 0,
  totalParts: 12,
  verifyChecks: null,
  projectId: null,
  projectMd: null,
  elapsedSeconds: 0,
};

/**
 * Én SSE-løkke for hele 12-dels-genereringen, delt mellom wizarden og
 * prosjektsiden. Lå tidligere duplisert i begge — to kopier som allerede hadde
 * begynt å oppføre seg ulikt ved feil.
 */
export function useSpecGeneration() {
  const [state, setState] = useState<GenerationState>(INITIAL);
  const runningRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);

  const patch = useCallback((p: Partial<GenerationState>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  const push = useCallback((kind: LogKind, text: string) => {
    setState((prev) => ({ ...prev, log: [...prev.log, { kind, text }] }));
  }, []);

  // Tikkende medgått tid: en generering tar 10–20 minutter, og da er forskjellen
  // på «henger» og «jobber» hele forskjellen for den som sitter og venter.
  useEffect(() => {
    if (!state.running) return;
    const timer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedSeconds: startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : 0,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.running]);

  // Lukker man fanen midt i, mister man ikke arbeidet (delene er lagret), men
  // genereringen stopper — så det skal koste en bekreftelse.
  useEffect(() => {
    if (!state.running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state.running]);

  const reset = useCallback(() => {
    setState(INITIAL);
  }, []);

  const start = useCallback(
    async (initialBody: object) => {
      if (runningRef.current) return;
      runningRef.current = true;
      startedAtRef.current = Date.now();
      setState({ ...INITIAL, running: true });
      push("info", "Starter generering…");

      let projectId: string | null = null;
      let nextPart = 2;
      let outcome: "done" | "continue" | "error" = "continue";
      let body: object = initialBody;

      /** Leser én del. Returnerer om vi skal fortsette, er ferdige, eller feilet. */
      async function readOne(requestBody: object): Promise<"done" | "continue" | "error"> {
        let res: Response;
        try {
          res = await fetch("/api/kickstart/stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
        } catch (e) {
          push("error", `Nettverksfeil: ${(e as Error).message}`);
          return "error";
        }
        if (res.status === 401) {
          push("error", "Sesjonen er utløpt — logg inn på nytt.");
          return "error";
        }
        if (!res.ok || !res.body) {
          push("error", `Serverfeil: ${res.status} ${res.statusText}`);
          return "error";
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
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

            switch (event.type) {
              case "project_id":
                projectId = event.id as string;
                patch({ projectId });
                break;
              case "start_part":
                patch({
                  partTitle: event.title as string,
                  part: event.part as number,
                  totalParts: (event.total as number) ?? 12,
                  liveText: "",
                });
                push("info", `Del ${event.part} av ${event.total ?? 12}`);
                break;
              case "restart_part":
                patch({ liveText: "" });
                push("warn", `Del ${event.part} startes på nytt (forsøk ${event.attempt}): ${event.reason}`);
                break;
              case "delta":
                setState((prev) => ({ ...prev, liveText: prev.liveText + (event.text as string) }));
                break;
              case "part":
                setState((prev) => {
                  const log = [...prev.log];
                  for (let i = log.length - 1; i >= 0; i--) {
                    if (log[i].kind === "info" && log[i].text.startsWith(`Del ${event.part} `)) {
                      log[i] = { kind: "ok", text: `Del ${event.part} av ${event.total ?? 12} ferdig` };
                      break;
                    }
                  }
                  return { ...prev, log, liveText: "", partTitle: "" };
                });
                break;
              case "continue":
                projectId = event.project_id as string;
                nextPart = (event.next_part as number) ?? nextPart + 1;
                patch({ projectId });
                return "continue";
              case "verify": {
                const checks = event.checks as VerifyCheck[];
                patch({ verifyChecks: checks });
                const failed = checks.filter((c) => !c.ok);
                if (failed.length) {
                  push("warn", `Verifisering: ${failed.map((c) => c.label).join(", ")} mangler`);
                } else {
                  push("ok", "Verifisering: alt innhold bekreftet");
                }
                break;
              }
              case "github_updated":
                push("ok", "PROJECT.md pushet til GitHub");
                break;
              case "warning":
                push("warn", event.message as string);
                break;
              case "done":
                patch({ projectMd: event.project_md as string });
                push("ok", "PROJECT.md er generert og lagret");
                return "done";
              case "error":
                push("error", event.message as string);
                return "error";
            }
          }
        }
        // Strømmen tok slutt uten done/continue — typisk et avbrutt mobilnett.
        return "continue";
      }

      try {
        let guard = 0;
        while (guard++ < 40) {
          outcome = await readOne(body);
          if (outcome !== "continue") break;
          if (!projectId) break;
          body = { project_id: projectId, part: nextPart };
        }

        if (outcome === "done") {
          patch({ running: false, finished: true });
        } else if (outcome === "error") {
          patch({ running: false, failed: true });
        } else {
          push(
            "warn",
            `Avbrutt etter del ${nextPart - 1}. Alt som er generert er lagret — bruk «Fortsett generering» for å ta resten.`,
          );
          patch({ running: false, failed: true });
        }
      } finally {
        runningRef.current = false;
      }
    },
    [patch, push],
  );

  return { state, start, reset };
}
