import { Check, Layers3 } from "lucide-react";

export default function ProjectFeaturePanel({
  features,
  selectedFeature,
  onSelectFeature,
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.5fr)]">
      <nav
        aria-label="Project features"
        className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3"
      >
        {features.map((feature) => {
          const isSelected =
            feature.featureId === selectedFeature?.featureId;

          return (
            <button
              key={feature.featureId}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectFeature(feature.featureId)}
              className={`flex items-start gap-3 rounded-lg p-4 text-left transition ${
                isSelected
                  ? "bg-blue-50 text-blue-900 ring-1 ring-blue-100"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isSelected ? <Check size={17} /> : <Layers3 size={17} />}
              </span>
              <span className="min-w-0">
                <span className="block break-words text-sm font-semibold">
                  {feature.name}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {feature.featureId}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <article className="min-h-64 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        {selectedFeature && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              {selectedFeature.featureId}
            </p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {selectedFeature.name}
            </h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {selectedFeature.description || "No description provided."}
            </p>
          </>
        )}
      </article>
    </div>
  );
}
