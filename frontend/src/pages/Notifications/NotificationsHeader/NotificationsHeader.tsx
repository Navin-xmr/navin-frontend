import { Bell, Settings, UserCircle } from "lucide-react";

const NotificationsHeader = () => (
  <div className="bg-[#111418] w-full border-b border-[#283039] px-8 py-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <img src="/plan.svg" alt="Plan Icon" className="w-8 h-8" />
      <p className="text-lg font-semibold m-0 tracking-[0.5px]">NAVIN</p>
    </div>
    <div className="flex items-center gap-8">
      <nav className="flex gap-8">
        {[
          "Dashboard",
          "Shipments",
          "Settlements",
          "Contracts",
          "Network",
        ].map((item) => (
          <span
            key={item}
            className="cursor-pointer text-sm text-text-secondary hover:text-white transition-colors"
          >
            {item}
          </span>
        ))}
      </nav>
      <div className="flex gap-3">
        {[
          {
            icon: <Bell size={20} />,
            active: true,
            label: "Notifications",
          },
          { icon: <Settings size={20} />, label: "Settings" },
          { icon: <UserCircle size={20} />, label: "Profile" },
        ].map(({ icon, active, label }) => (
          <button
            key={label}
            aria-label={label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors border-none ${active ? "bg-[#2563eb] text-white" : "bg-[#1f2937] text-text-secondary hover:bg-[#374151]"}`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default NotificationsHeader;
