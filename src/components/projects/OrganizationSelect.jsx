
import { Building2, LoaderCircle, ChevronDown } from "lucide-react";

export default function OrganizationSelect({
  organizations,
  selectedOrganization,
  onChange,
  loading,
}) {
  return (
    <div className="mt-8 max-w-md">
      <label
        htmlFor="organization"
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        Organization
      </label>

      <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
        <Building2 size={19} className="shrink-0 text-slate-400" />

        <select
          id="organization"
          value={selectedOrganization}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading}
          className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-slate-800 outline-none disabled:opacity-60"
        >
          <option value="">
            {loading ? "Loading organizations..." : "Select organization"}
          </option>

          {organizations.map((organization) => (
            <option
              key={organization.id ?? organization._id}
              value={organization.id ?? organization._id}
            >
              {organization.name}
            </option>
          ))}
        </select>

        {loading ? (
          <LoaderCircle size={17} className="animate-spin text-slate-400" />
        ) : (
          <ChevronDown size={17} className="text-slate-400" />
        )}
      </div>
    </div>
  );
}
