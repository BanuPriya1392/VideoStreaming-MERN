import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Video,
  Home,
  Compass,
  Radio,
  Clock,
  ThumbsUp,
  Gamepad2,
  GraduationCap,
  Music,
  Cpu,
  Film,
  Brain,
  ListVideo,
  Bookmark,
  Users,
  Sparkles,
  FlaskConical,
  Trophy,
  Camera,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex md:w-20 lg:w-64 border-r border-white/5 bg-[#0D1223]/50 backdrop-blur-xl flex-col p-4 h-screen sticky top-0 shrink-0">
      {/* UPDATED LOGO: Exactly like LoginPage */}
      <div
        className="flex items-center gap-4 px-2 mb-10 group cursor-pointer"
        onClick={() => navigate("/")}
      >
        {/* LOGO ICON BOX */}
        <div className="w-11 h-11 bg-gradient-to-tr from-[#00F0FF] to-[#7B68EE] rounded-xl shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shrink-0">
          <div className="relative">
            <Video size={20} className="text-white" strokeWidth={2.5} />
            <Radio size={14} className="absolute -top-2 -right-2 text-white" />
          </div>
        </div>

        {/* NEXUS TEXT LOGO */}
        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] via-white to-[#7B68EE] lg:block hidden">
          NEXUS
        </span>
      </div>

      {/* MAIN NAV */}
      <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <SidebarItem to="/home" icon={<Home size={20} />} label="Home" />
        <SidebarItem
          to="/explore"
          icon={<Compass size={20} />}
          label="Explore"
        />
        <SidebarItem to="/live" icon={<Radio size={20} />} label="Live" />

        <div className="my-6 border-t border-white/5 mx-2" />
        <p className="px-4 mb-3 text-[10px] font-black text-[#00F0FF]/50 uppercase tracking-[0.2em] hidden lg:block">
          Your Transmissions
        </p>

        <SidebarItem to="/history" icon={<Clock size={20} />} label="History" />
        <SidebarItem
          to="/playlists"
          icon={<ListVideo size={20} />}
          label="Playlists"
        />
        <SidebarItem
          to="/watchlist"
          icon={<Clock size={20} />}
          label="Watchlist"
        />
        <SidebarItem to="/liked" icon={<ThumbsUp size={20} />} label="Liked" />

        <div className="my-6 border-t border-white/5 mx-2" />
        <p className="px-4 mb-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hidden lg:block">
          Sectors
        </p>

        <SidebarItem
          to="/gaming"
          icon={<Gamepad2 size={20} />}
          label="Gaming"
        />
        <SidebarItem
          to="/education"
          icon={<GraduationCap size={20} />}
          label="Education"
        />
        <SidebarItem to="/music" icon={<Music size={20} />} label="Music" />
        <SidebarItem to="/tech" icon={<Cpu size={20} />} label="Tech" />
        <SidebarItem to="/cinema" icon={<Film size={20} />} label="Cinema" />
        <SidebarItem
          to="/lifestyle"
          icon={<Sparkles size={20} />}
          label="Lifestyle"
        />
        <SidebarItem to="/family" icon={<Users size={20} />} label="Family" />
        <SidebarItem
          to="/science"
          icon={<FlaskConical size={20} />}
          label="Science"
        />
        <SidebarItem to="/sports" icon={<Trophy size={20} />} label="Sports" />
        <SidebarItem to="/vlog" icon={<Camera size={20} />} label="Vlog" />
        <SidebarItem to="/ai" icon={<Brain size={20} />} label="AI" />
      </nav>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden
      ${
        isActive
          ? "bg-white/5 text-[#00F0FF] shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]"
          : "text-gray-500 hover:text-white hover:bg-white/5"
      }
    `}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00F0FF] rounded-r-full shadow-[0_0_15px_#00F0FF]" />
        )}
        <span className={`transition-all duration-500 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" : "group-hover:scale-110"}`}>
          {icon}
        </span>
        <span className={`text-[13px] font-bold lg:block hidden tracking-tight ${isActive ? "text-white" : ""}`}>
          {label}
        </span>
      </>
    )}
  </NavLink>
);

export default Sidebar;
