"use client";

import { useEffect } from "react";

export default function GoogleTranslateLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as unknown as {
      googleTranslateElementInit?: () => void;
      google?: unknown;
      __gh_translate_loaded__?: boolean;
    };

    if (w.__gh_translate_loaded__) return;
    w.__gh_translate_loaded__ = true;

    w.googleTranslateElementInit = () => {
      try {
        type TranslateElementInlineLayout = { SIMPLE: unknown };
        type TranslateElementCtor = new (
          opts: {
            pageLanguage: string;
            includedLanguages: string;
            layout: unknown;
            autoDisplay: boolean;
          },
          containerId: string
        ) => unknown;

        type GoogleTranslateApi = {
          translate?: {
            TranslateElement?: TranslateElementCtor & { InlineLayout?: TranslateElementInlineLayout };
          };
        };

        const googleApi = w.google as GoogleTranslateApi;
        const TranslateElement = googleApi.translate?.TranslateElement;
        const layout = TranslateElement?.InlineLayout?.SIMPLE;

        if (!TranslateElement || !layout) return;

        new TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,af,zu,xh,st,nso,tn,ts,ss,ve,nr",
            layout,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      } catch {
        // ignore
      }
    };

    if (document.getElementById("google-translate-script")) return;

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // keep script across navigations
    };
  }, []);

  return null;
}
