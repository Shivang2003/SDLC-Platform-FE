
import { FolderKanban } from "lucide-react";

export default function ProjectsEmptyState({
  title,
  description,
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 px-5 text-center">
      <div className="mb-4 rounded-xl bg-slate-100 p-4 text-slate-500">
        <FolderKanban size={28} />
      </div>

      <h3 className="text-base font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
