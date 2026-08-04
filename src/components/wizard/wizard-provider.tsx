"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  clampStep,
  specFromParams,
  specToParams,
  STEP_COUNT,
  type WizardSpec,
} from "@/lib/wizard/spec";

type WizardValue = {
  spec: WizardSpec;
  step: number;
  fromLanding: boolean;
  set: <K extends keyof WizardSpec>(key: K, value: WizardSpec[K]) => void;
  setRoute: (origin: WizardSpec["origin"], destination: WizardSpec["destination"]) => void;
  goStep: (step: number) => void;
};

const WizardContext = createContext<WizardValue | null>(null);

export function useWizard() {
  const value = useContext(WizardContext);
  if (!value) throw new Error("useWizard must be used inside <WizardProvider>");
  return value;
}

type State = { spec: WizardSpec; step: number };

export function WizardProvider({
  initialSpec,
  initialStep,
  fromLanding,
  children,
}: {
  initialSpec: WizardSpec;
  initialStep: number;
  fromLanding: boolean;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<State>({ spec: initialSpec, step: initialStep });
  // Steps push so the browser Back button walks the wizard; field edits replace.
  const historyMode = useRef<"push" | "replace">("replace");
  const mounted = useRef(false);

  // The URL is a mirror, not the source of truth. Writing it through the history
  // API keeps a refresh and a shared link honest without a server round trip on
  // every keystroke — step 4 recalculates as the user types.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const params = specToParams(state.spec, { step: String(state.step) });
    if (fromLanding) params.set("from", "landing");
    const url = `${window.location.pathname}?${params}`;
    if (historyMode.current === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, [state, fromLanding]);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      historyMode.current = "replace";
      setState({
        spec: specFromParams(params),
        step: clampStep(params.get("step") ?? undefined),
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const set = useCallback<WizardValue["set"]>((key, value) => {
    historyMode.current = "replace";
    setState((current) => ({ ...current, spec: { ...current.spec, [key]: value } }));
  }, []);

  const setRoute = useCallback<WizardValue["setRoute"]>((origin, destination) => {
    historyMode.current = "replace";
    setState((current) => ({ ...current, spec: { ...current.spec, origin, destination } }));
  }, []);

  const goStep = useCallback<WizardValue["goStep"]>((step) => {
    historyMode.current = "push";
    setState((current) => ({ ...current, step: Math.min(STEP_COUNT, Math.max(1, step)) }));
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(
    () => ({ ...state, fromLanding, set, setRoute, goStep }),
    [state, fromLanding, set, setRoute, goStep]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
