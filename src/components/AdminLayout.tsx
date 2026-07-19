import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Network,
  TrendingDown,
  Users,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { useAsnAuth } from "../context/AsnAuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type MenuItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: Array<"staf_opd" | "bagian_hukum" | "inspektorat">;
};

const menuItems: MenuItem[] = [
  {
    to: "/admin",
    label: "Dasbor",
    icon: LayoutDashboard,
    allowedRoles: ["staf_opd", "bagian_hukum", "inspektorat"],
  },
  {
    to: "/admin/regulasi",
    label: "Manajemen Regulasi",
    icon: FileText,
    allowedRoles: ["bagian_hukum"],
  },
  {
    to: "/admin/graf",
    label: "Graf Regulasi",
    icon: Network,
    allowedRoles: ["staf_opd", "bagian_hukum"],
  },
  {
    to: "/admin/decay",
    label: "Decay Tracker",
    icon: TrendingDown,
    allowedRoles: ["staf_opd", "bagian_hukum"],
  },
  {
    to: "/admin/suara-warga",
    label: "Suara Warga",
    icon: Users,
    allowedRoles: ["staf_opd", "bagian_hukum"],
  },
  {
    to: "/admin/inspektorat",
    label: "Dasbor Inspektorat",
    icon: ShieldAlert,
    allowedRoles: ["inspektorat"],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAsnAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredMenuItems = menuItems.filter((item) =>
    user ? item.allowedRoles.includes(user.role) : false
  );

  const handleLogout = async () => {
    await logout();
    navigate("/portal-asn/login");
  };

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-ink-200 bg-white flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-ink-200">
          <Link to="/admin" className="flex items-center gap-3">
            <img 
              src="/logoregsida.png" 
              alt="Logo REGSIDA Kabupaten Sidoarjo" 
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink-900 text-white"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-200 mt-auto">
          <div className="mb-3 rounded-lg border border-ink-100 bg-ink-50 p-3">
            <div className="text-sm font-medium text-ink-900">{user?.name}</div>
            <div className="text-xs text-ink-500">{user?.role === "staf_opd" ? "Staf OPD" : user?.role === "bagian_hukum" ? "Bagian Hukum Setda" : "Inspektorat"}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
