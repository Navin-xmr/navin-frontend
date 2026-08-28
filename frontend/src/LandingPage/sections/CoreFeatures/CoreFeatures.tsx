import React from "react";
import { useTranslation } from "react-i18next";

interface CoreFeature {
  key: string;
}

const CORE_FEATURES: CoreFeature[] = [
  { key: "tokenizedAssets" },
  { key: "iotMilestones" },
  { key: "smartSettlements" },
  { key: "parityDashboards" },
];

const BAR_COUNT = 32;
const HIGHLIGHTED_BARS = new Set([5, 13, 21, 27]);
const INDENT_CLASSES = ["", "md:ml-8", "md:ml-16", "md:ml-24"];

const CoreFeatures: React.FC = () => {
  const { t } = useTranslation("landing");

  const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
    heightPct: 22 + (Math.sin(i * 0.55) * 0.5 + 0.5) * 68,
    highlighted: HIGHLIGHTED_BARS.has(i),
  }));

  return (
    <section className="relative py-20 px-4 md:py-28 lg:py-32 bg-background overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-accent-teal/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary">
            {t("coreFeatures.heading")} <span className="text-primary">{t("coreFeatures.headingHighlight")}</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t("coreFeatures.subtitle")}
          </p>
        </div>

        {/* Bar-chart visualization */}
        <div
          className="flex items-end justify-center gap-[3px] h-36 md:h-52 mb-20"
          role="img"
          aria-label={t("coreFeatures.chartAriaLabel")}
        >
          {bars.map((bar, i) => (
            <div
              key={i}
              className={`flex-1 max-w-[14px] rounded-t-sm transition-all duration-700 ${
                bar.highlighted
                  ? "bg-gradient-to-t from-primary to-accent-teal shadow-glow-blue"
                  : "bg-gradient-to-t from-primary/15 to-accent-teal/35"
              }`}
              style={{ height: `${bar.heightPct}%` }}
            />
          ))}
        </div>

        {/* Staggered callouts with dashed connectors */}
        <div className="flex flex-col gap-10 md:gap-12">
          {CORE_FEATURES.map((feature, index) => (
            <div
              key={feature.key}
              className={`flex items-start gap-5 ${INDENT_CLASSES[index]}`}
            >
              <div className="flex flex-col items-center pt-1.5 shrink-0" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-glow-blue" />
                {index < CORE_FEATURES.length - 1 && (
                  <span className="w-px flex-1 min-h-[3rem] mt-1.5 border-l-[1.5px] border-dashed border-[rgba(0,180,160,0.4)]" />
                )}
              </div>
              <div className="max-w-md">
                <h3 className="font-display text-lg md:text-xl font-semibold text-primary mb-2">
                  {t(`coreFeatures.${feature.key}.label`)}
                </h3>
                <p className="font-sans text-sm md:text-base leading-relaxed text-text-secondary">
                  {t(`coreFeatures.${feature.key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-0 mt-20 w-full justify-center">
          <span
            className="flex-1 max-w-[200px] sm:max-w-[60px] h-px border-t-[1.5px] border-dashed border-[rgba(0,180,160,0.5)]"
            aria-hidden="true"
          />
          <a
            href="#track"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:px-6 sm:py-3 bg-[rgba(8,40,50,0.75)] text-white text-base sm:text-[0.9rem] font-medium no-underline border-[1.5px] border-[rgba(0,180,160,0.6)] rounded-full cursor-pointer backdrop-blur-[8px] whitespace-nowrap transition-all duration-[250ms] hover:bg-[rgba(0,120,110,0.35)] hover:border-[#00d4c8] hover:shadow-[0_0_24px_rgba(0,212,200,0.3),inset_0_0_12px_rgba(0,212,200,0.08)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#00d4c8] focus-visible:outline-offset-4"
          >
            {t("coreFeatures.cta")}
            <svg
              className="shrink-0 text-[#00d4c8]"
              width="22"
              height="16"
              viewBox="0 0 22 16"
              fill="none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="4" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <path d="M13 6h4l3 4v3h-7V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="4" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="17" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
          <span
            className="flex-1 max-w-[200px] sm:max-w-[60px] h-px border-t-[1.5px] border-dashed border-[rgba(0,180,160,0.5)]"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
