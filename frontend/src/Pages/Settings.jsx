import React, { useState } from "react";
import { Settings, Shield, Bell, Eye, Database, Monitor, Check, RotateCcw } from "lucide-react";

const SettingsPage = () => {
  const [config, setConfig] = useState({
    theme: "Dark / Cyber",
    notifications: true,
    neuralSync: true,
    analytics: false,
    resolution: "4K Quantum"
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setConfig({ ...config, [key]: !config[key] });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <Settings className="w-8 h-8 text-[#00F0FF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">
              System Configuration
            </h1>
            <p className="text-gray-500 text-sm font-bold">
              Calibrate your neural interface parameters
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          
          {/* INTERFACE SETTINGS */}
          <Section title="Interface Protocols">
            <SettingItem 
              icon={<Monitor size={20} />} 
              title="Visual Theme" 
              desc="Select the aesthetic layer for your terminal"
              value={config.theme}
            />
            <ToggleItem 
              icon={<Bell size={20} />}
              title="Signal Alerts"
              desc="Receive real-time notifications for intercepted signals"
              active={config.notifications}
              onToggle={() => toggle("notifications")}
            />
          </Section>

          {/* SECURITY & DATA */}
          <Section title="Data Sovereignty">
            <ToggleItem 
              icon={<Shield size={20} />}
              title="Neural Synchronization"
              desc="Backup your watch data to the central nexus cloud"
              active={config.neuralSync}
              onToggle={() => toggle("neuralSync")}
            />
            <ToggleItem 
              icon={<Eye size={20} />}
              title="Anonymous Uplink"
              desc="Hide your terminal identity during transmissions"
              active={config.analytics}
              onToggle={() => toggle("analytics")}
            />
          </Section>

          {/* SYSTEM PERFORMANCE */}
          <Section title="Core Performance">
            <SettingItem 
              icon={<RotateCcw size={20} />} 
              title="Stream Fidelity" 
              desc="Maximum resolution for visual decryption"
              value={config.resolution}
            />
          </Section>

          <div className="flex justify-end gap-4 mt-8">
            <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase hover:bg-white/10 transition-all">
              Revert to Factory Defaults
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-2.5 rounded-xl bg-[#00F0FF] text-black text-xs font-black uppercase shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:scale-105 transition-all flex items-center gap-2"
            >
              {saved ? <><Check size={16} /> Parameters Saved</> : "Apply Configuration"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-[#0D1223]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
    <div className="bg-white/5 px-6 py-3 border-b border-white/5">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F0FF]">{title}</h3>
    </div>
    <div className="p-2">{children}</div>
  </div>
);

const SettingItem = ({ icon, title, desc, value }) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group">
    <div className="flex items-center gap-4">
      <div className="text-gray-500 group-hover:text-[#00F0FF] transition-colors">{icon}</div>
      <div>
        <h4 className="text-sm font-bold uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-gray-500 font-bold">{desc}</p>
      </div>
    </div>
    <span className="text-xs font-black text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-lg border border-[#00F0FF]/20 uppercase">
      {value}
    </span>
  </div>
);

const ToggleItem = ({ icon, title, desc, active, onToggle }) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group">
    <div className="flex items-center gap-4">
      <div className="text-gray-500 group-hover:text-[#00F0FF] transition-colors">{icon}</div>
      <div>
        <h4 className="text-sm font-bold uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-gray-500 font-bold">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all ${active ? "bg-[#00F0FF]" : "bg-gray-800"}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? "right-1" : "left-1"}`}></div>
    </button>
  </div>
);

export default SettingsPage;
