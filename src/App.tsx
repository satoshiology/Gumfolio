import * as React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { TopAppBar, BottomNavBar } from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import SalesFeed from "./components/SalesFeed";
import Inventory from "./components/Inventory";
import Licenses from "./components/Licenses";
import Profile from "./components/Profile";
import AIAgent from "./components/AIAgent";
import AgentConsole from "./components/AgentConsole";
import Splash from "./components/Splash";
import LandingPage from "./components/LandingPage";
import Settings from "./components/Settings";
import { gumroadService } from "./services/gumroadService";
import { Smartphone } from "lucide-react";
import { ChatProvider } from "./context/ChatContext";
import { SidePanel } from "./components/SidePanel";
import { AlliesPanel } from "./components/AlliesPanel";

function MobileOnlyMessage() {
  return (
    <div className="fixed inset-0 bg-surface-dim flex items-center justify-center p-6 text-center z-[9999]">
      <div className="max-w-sm space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
          <Smartphone className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-on-surface">Mobile Only</h1>
        <p className="text-on-surface-variant text-lg">This platform is designed exclusively for mobile use. Please visit this app on your mobile device for the best experience.</p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<SalesFeed />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/ai" element={<AIAgent />} />
          <Route path="/agent-console" element={<AgentConsole />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </AnimatePresence>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(!!gumroadService.getToken());
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768);
  const [leftPanel, setLeftPanel] = React.useState(false);
  const [rightPanel, setRightPanel] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isDesktop) {
    return <MobileOnlyMessage />;
  }

  if (!isAuthenticated) {
    return <LandingPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const gripUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGNDEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1ncmlwLXZlcnRpY2FsLWljb24gbHVjaWRlLWdyaXAtdmVydGljYWwiPjxjaXJjbGUgY3g9IjkiIGN5PSIxMiIgcj0iMSIvPjxjaXJjbGUgY3g9IjkiIGN5PSI1IiByPSIxIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjE5IiByPSIxIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSIxMiIgcj0iMSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iNSIgcj0iMSIvPjxjaXJjbGUgY3g9IjE1IiBjeT0iMTkiIHI9IjEiLz48L3N2Zz4=";

  return (
    <ChatProvider>
      <Router>
        <div className="min-h-screen bg-surface-dim text-on-surface font-body selection:bg-primary/30 relative">
          
          {/* Grip Icons */}
          <button onClick={() => setLeftPanel(true)} className="fixed left-0 top-1/2 -translate-y-1/2 z-40 p-2 opacity-50">
            <img src={gripUrl} alt="Left Grip" />
          </button>
          <button onClick={() => setRightPanel(true)} className="fixed right-0 top-1/2 -translate-y-1/2 z-40 p-2 opacity-50">
            <img src={gripUrl} alt="Right Grip" />
          </button>

          <SidePanel isOpen={leftPanel} onClose={() => setLeftPanel(false)} side="left">
            <div className="p-6 text-xl">Left Panel (Placeholder)</div>
          </SidePanel>
          <SidePanel isOpen={rightPanel} onClose={() => setRightPanel(false)} side="right">
            <AlliesPanel />
          </SidePanel>

          <TopAppBar />
          <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
            <AnimatedRoutes />
          </main>
          <BottomNavBar />
        </div>
      </Router>
    </ChatProvider>
  );
}
