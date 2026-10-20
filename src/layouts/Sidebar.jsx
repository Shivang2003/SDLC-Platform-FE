
import { useEffect, useState } from "react";
import { Building2, Layers, LoaderCircle, LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getOrganizations } from "../services/organizationService";

export default function Sidebar() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { organizationId } = useParams();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    let active = true;

    getOrganizations()
      .then((data) => {
        if (active) setOrganizations(data);
      })
      .catch(() => {
        if (active) setOrganizations([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const getId = (organization) =>
    organization.organizationId ?? organization._id;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-slate-900 px-4 py-6 text-slate-200">
      <button
        onClick={() => navigate("/projects")}
        className="mb-9 flex items-center gap-3 px-2 text-left"
      >
        <Layers size={28} className="text-blue-400" />
        <span className="text-lg font-bold text-white">
          SDLC Platform
        </span>
      </button>

      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Your organizations
      </div>

      <nav className="flex flex-col gap-1">
        {loading && (
          <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-400">
            <LoaderCircle size={17} className="animate-spin" />
            Loading organizations...
          </div>
        )}

        {!loading && organizations.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-400">
            No organizations found.
          </p>
        )}

        {organizations.map((organization) => {
          const id = getId(organization);
          const isActive = organizationId === id;

          return (
            <button
              key={id}
              onClick={() => navigate(`/organizations/${id}/projects`)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                isActive
                  ? "bg-blue-600/20 text-white ring-1 ring-blue-400/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Building2
                size={18}
                className={isActive ? "text-blue-400" : ""}
              />
              <span className="truncate">{organization.name}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
