
import { useAuthStore } from "../stores/authStore";

export default function Topbar() {
  const user = useAuthStore((state) => state.user);

  const username = user?.userName ?? user?.username ?? "My Account";

  return (
    <header className="flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <p className="text-[10px] font-bold tracking-[1.5px] text-slate-400">
          WORKSPACE
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-800">
          My Workspace
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-slate-700">
          {username}
        </span>
      </div>
    </header>
  );
}
