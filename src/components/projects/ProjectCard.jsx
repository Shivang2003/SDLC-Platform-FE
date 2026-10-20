
import { FolderKanban, ArrowUpRight } from "lucide-react";

const iconColors = [
  "bg-blue-50 text-blue-600 ring-blue-100",
  "bg-emerald-50 text-emerald-600 ring-emerald-100",
  "bg-violet-50 text-violet-600 ring-violet-100",
  "bg-rose-50 text-rose-600 ring-rose-100",
  "bg-cyan-50 text-cyan-600 ring-cyan-100",
  "bg-amber-50 text-amber-600 ring-amber-100",
];

export default function ProjectCard({ project, index, onClick }) {
  const projectId = project.projectId ?? project.id ?? project._id;
  const projectName =
    project.name ?? project.projectName ?? "Untitled project";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-56 flex-col rounded-xl border border-slate-200 bg-white p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${
          iconColors[index % iconColors.length]
        }`}
      >
        <FolderKanban size={23} />
      </div>

      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
        <span className="break-words">{projectName}</span>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-slate-300 transition group-hover:text-blue-600"
        />
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
        {project.description || "No description provided."}
      </p>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <FolderKanban size={15} />
        <span className="break-all">{projectId}</span>
      </div>
    </button>
  );
}
