import React from "react";
import { motion } from "motion/react";
import { LogOut, Settings as SettingsIcon, ChevronRight, User, Shield, Bell, Volume2, VolumeX } from "lucide-react";
import { gumroadService } from "../services/gumroadService";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = React.useState(localStorage.getItem('soundEnabled') !== 'false');

  const handleLogout = async () => {
    gumroadService.clearToken();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout request failed', e);
    }
    window.location.href = "/";
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('soundEnabled', newState.toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-3xl font-headline font-bold mb-2 neon-text-glow">Settings</h2>
        <p className="text-on-surface-variant text-sm">Manage your account and preferences.</p>
      </header>

      <div className="space-y-4">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div onClick={() => navigate('/profile')} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Account Details</h3>
                <p className="text-xs text-on-surface-variant">Manage your profile</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>

          <div className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Sound Effects</h3>
                <p className="text-xs text-on-surface-variant">Toggle sounds on/off</p>
              </div>
            </div>
            <button onClick={toggleSound} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              {soundEnabled ? <Volume2 className="text-primary w-5 h-5" /> : <VolumeX className="text-red-400 w-5 h-5" />}
            </button>
          </div>

          <div className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Security</h3>
                <p className="text-xs text-on-surface-variant">Password and 2FA</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Notifications</h3>
                <p className="text-xs text-on-surface-variant">Alert preferences</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden mt-8">
          <button 
            onClick={handleLogout}
            className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-red-400">Log Out</h3>
                <p className="text-xs text-red-400/70">Sign out of your Gumroad account</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
