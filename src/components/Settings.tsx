import React from "react";
import { motion } from "motion/react";
import { LogOut, Settings as SettingsIcon, ChevronRight, User, History, Sparkles, Terminal } from "lucide-react";
import { useDeveloper } from "../context/DeveloperContext";
import { NumberPad } from "./NumberPad";
import { gumroadService } from "../services/gumroadService";
import { useNavigate } from "react-router-dom";
import { playSound } from "../lib/audio";
import { cn } from "../lib/utils";

export default function Settings() {
  const navigate = useNavigate();
  const { isDevMode, setDevMode, isMockData, setMockData } = useDeveloper();
  const [showNumberPad, setShowNumberPad] = React.useState(false);
  const [isPro, setIsPro] = React.useState(document.body.classList.contains('pro-theme'));
  const [showLicenseModal, setShowLicenseModal] = React.useState(false);
  const [licenseKey, setLicenseKey] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  
  const PRO_PRODUCT_ID = "lTlApI5Eg1p01aTMXcRMqg==";

  const toggleDevMode = () => {
    if (isDevMode) {
        setDevMode(false);
    } else {
        setShowNumberPad(true);
    }
  };
  const togglePro = () => {
    const pro = !isPro;
    setIsPro(pro);
    if (pro) {
      document.body.classList.add('pro-theme');
      localStorage.setItem('theme', 'pro');
      playSound('premium_activate');
    } else {
      document.body.classList.remove('pro-theme');
      localStorage.setItem('theme', 'default');
      playSound('button');
    }
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { isPro: pro } }));
  };

  const verifyLicense = async () => {
    setIsVerifying(true);
    try {
        const response = await gumroadService.verifyLicense(PRO_PRODUCT_ID, licenseKey, false);
        if (response.success) {
            alert("Pro activated!");
            setShowLicenseModal(false);
            if (!isPro) togglePro();
        } else {
            console.error("Gumroad License Verify Error:", response);
            alert("Invalid License Key");
        }
    } catch (error) {
        console.error("Gumroad License Verify Error (Exception):", error);
        alert("Verification failed. Please check your key");
    } finally {
        setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    gumroadService.clearToken();
    window.location.href = "/";
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
        {!isPro && (
          <button 
            onClick={() => setShowLicenseModal(true)} 
            className="w-full relative glass-card rounded-2xl p-4 text-center font-bold text-[#a69a7c] hover:bg-[#a69a7c]/10 transition-colors animate-pulse shadow-[0_0_15px_rgba(166,154,124,0.3)] hover:shadow-[0_0_25px_rgba(166,154,124,0.5)] border border-[#a69a7c]/30"
          >
            ACTIVATE PRO
          </button>
        )}

        {/* Luxury Pro Toggle Card */}
        <div className={cn(
          "rounded-3xl overflow-hidden transition-all duration-700 relative group cursor-pointer",
          isPro 
            ? "glass-card border border-[#a69a7c]/30" 
            : "glass-card border border-white/5"
        )} onClick={togglePro}>
            {isPro && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#a69a7c]/10 via-[#a69a7c]/5 to-[#a69a7c]/10 animate-pulse pointer-events-none"></div>
            )}
            <div className="p-6 relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg", 
                      isPro 
                        ? "bg-gradient-to-br from-[#c4ba9c] to-[#8c8166] text-black shadow-[#a69a7c]/30" 
                        : "bg-surface-container-highest text-primary border border-white/10"
                    )}
                  >
                    <Sparkles className={cn("w-6 h-6", isPro && "animate-pulse")} />
                  </div>
                  <div>
                    <h3 className={cn(
                        "font-bold text-lg transition-colors duration-500 font-headline",
                        isPro ? "text-[#a69a7c]" : "text-on-surface"
                    )}>
                        PRO Subscriber Theme
                    </h3>
                    <p className="text-sm text-on-surface-variant transition-colors group-hover:text-[#a69a7c]/60">
                        {isPro ? "Luxury experience activated" : "Unlock the glowing gold theme"}
                    </p>
                  </div>
                </div>
                <div className={cn(
                    "w-16 h-8 rounded-full p-1 transition-all duration-500 flex items-center shadow-inner relative overflow-hidden", 
                    isPro 
                        ? "bg-[#a69a7c]/20 border border-[#a69a7c]/50 justify-end" 
                        : "bg-black/50 border border-white/10 justify-start"
                )}>
                    {isPro && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a69a7c]/20 to-transparent w-[200%] animate-[scan_2s_linear_infinite]"></div>}
                    <div className={cn(
                        "w-6 h-6 rounded-full shadow-md transition-all duration-500 z-10 relative",
                        isPro ? "bg-gradient-to-br from-[#e1dccc] to-[#a69a7c]" : "bg-white/70"
                    )}></div>
                </div>
            </div>
            
            <style>{`
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(50%); }
                }
            `}</style>
        </div>
        
        {showNumberPad && (
            <NumberPad onConfirm={() => { setDevMode(true); setShowNumberPad(false) }} onClose={() => setShowNumberPad(false)} />
        )}

        <div className="glass-card rounded-3xl overflow-hidden neuro-panel">
          <div onClick={toggleDevMode} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Developer Mode</h3>
                <p className="text-xs text-on-surface-variant">{isDevMode ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <div className={cn(
                "w-12 h-6 rounded-full p-1 transition-all flex items-center shadow-inner", 
                isDevMode ? "bg-orange-500/50 justify-end" : "bg-black/50 justify-start"
            )}>
                <div className="w-4 h-4 rounded-full bg-white"></div>
            </div>
          </div>
          {isDevMode && (
          <div onClick={() => setMockData(!isMockData)} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Mock Data</h3>
                <p className="text-xs text-on-surface-variant">{isMockData ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <div className={cn(
                "w-12 h-6 rounded-full p-1 transition-all flex items-center shadow-inner", 
                isMockData ? "bg-blue-500/50 justify-end" : "bg-black/50 justify-start"
            )}>
                <div className="w-4 h-4 rounded-full bg-white"></div>
            </div>
          </div>
          )}
          <div onClick={() => navigate("/profile")} className="p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
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
        </div>

        <div className="glass-card rounded-2xl overflow-hidden mt-8">
           <button 
             onClick={() => alert(JSON.stringify(JSON.parse(localStorage.getItem("chat_logs_archive") || "[]"), null, 2))}
             className="w-full p-4 flex items-center justify-between hover:bg-primary/10 cursor-pointer transition-colors group border-b border-white/5"
           >
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                 <History className="w-5 h-5" />
               </div>
               <div className="text-left">
                 <h3 className="font-bold text-on-surface">Chat Archive</h3>
                 <p className="text-xs text-on-surface-variant">View cleared chat logs</p>
               </div>
             </div>
           </button>
           
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
