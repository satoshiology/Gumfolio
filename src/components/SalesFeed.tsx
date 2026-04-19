import * as React from "react";
import { ShoppingBag, Sparkles, Palette, ArrowDown, Loader2, AlertCircle, CheckCircle, Search } from "lucide-react";
import { performSemanticSearch } from "../services/semanticSearchService";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { gumroadService } from "../services/gumroadService";
import { ActionRegistry } from "../services/ActionRegistry";
import { Sale } from "../types";
import { HoldButton } from "./HoldButton";

export default function SalesFeed() {
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSemanticMode, setIsSemanticMode] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [searching, setSearching] = React.useState(false);
  const [semanticMatches, setSemanticMatches] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{name: string, fn: () => Promise<any>} | null>(null);

  React.useEffect(() => {
    async function fetchSales() {
      try {
        const res = await gumroadService.getSales();
        setSales(res.sales);
      } catch (err: any) {
        console.error("Sales Fetch Error:", err);
        setError(err.response?.data?.error || "Failed to fetch sales feed.");
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  const handleAction = async (actionName: string, actionFn: () => Promise<any>) => {
    setConfirmAction(null);
    setLoadingAction(actionName);
    setError(null);
    setSuccessMsg(null);
    try {
      await actionFn();
      setSuccessMsg(`Successfully performed: ${actionName}`);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to perform ${actionName}.`);
    } finally {
      setLoadingAction(null);
    }
  };

  const todayRevenue = sales
    .filter(s => new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.price / 100, 0);

  React.useEffect(() => {
    async function runSearch() {
        if (!isSemanticMode || searchQuery.length < 3) {
            setSemanticMatches([]);
            return;
        }
        setSearching(true);
        const matches = await performSemanticSearch(searchQuery, sales);
        setSemanticMatches(matches);
        setSearching(false);
    }
    runSearch();
  }, [searchQuery, isSemanticMode, sales]);

  const filteredSales = isSemanticMode 
    ? sales.filter(s => semanticMatches.includes(s.id))
    : sales.filter(s => 
      s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const lastHourSales = sales.filter(s => {
    const saleDate = new Date(s.created_at);
    const now = new Date();
    const diffInHours = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 1;
  }).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-label uppercase tracking-widest text-xs">Accessing Transaction Ledger...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Global Search */}
      <section className="px-2">
        <div className="w-full max-w-2xl mx-auto">
            <div className="relative w-full shadow-2xl">
              <Search className="absolute left-4 top-4 w-6 h-6 text-zinc-500" />
              <input 
                  type="text" 
                  placeholder={isSemanticMode ? "Describe what you're looking for (e.g. 'high value customers')" : "Search all sales by product or email..."} 
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 pl-14 text-lg focus:border-primary transition-colors outline-none focus:ring-2 focus:ring-primary/50 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
                onClick={() => setIsSemanticMode(!isSemanticMode)}
                className={cn("mt-3 px-4 py-1.5 text-xs rounded-full border flex ml-auto", isSemanticMode ? "bg-primary text-black border-primary" : "bg-zinc-800 text-zinc-400 border-zinc-700")}
            >
                {isSemanticMode ? "Semantic Active" : "Semantic Off"}
            </button>
        </div>
        {searching && <p className="text-center text-primary text-sm mt-2 animate-pulse">AI Analyzing Sales...</p>}
      </section>

      <section>
        <p className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-2">Live Activity</p>
        <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-8">Sales Feed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Today's Revenue" value={`$${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subValue="Real-time tracking active" color="text-secondary" />
          <StatCard label="Total Transactions" value={sales.length.toLocaleString()} subValue="Lifetime sales" color="text-white" />
          <div className="mesh-gradient-bg p-6 rounded-xl relative overflow-hidden shadow-[0_0_20px_rgba(132,85,239,0.2)]">
            <div className="absolute inset-0 noise-overlay pointer-events-none"></div>
            <div className="relative z-10">
              <span className="font-label text-[10px] uppercase tracking-widest text-black/70">Performance</span>
              <div className="text-3xl font-headline font-bold text-black mt-1">Velocity</div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-black/80 font-bold">{lastHourSales} sales in the last hour</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="font-label text-sm font-semibold text-on-surface-variant">Recent Transactions</h3>
          <span className="text-[10px] font-label text-zinc-500 uppercase tracking-widest">Auto-updating</span>
        </div>
        
        {filteredSales.map((sale) => (
          <TransactionItem 
            key={sale.id}
            saleId={sale.id}
            title={sale.product_name} 
            email={sale.email} 
            time={new Date(sale.created_at).toLocaleString()} 
            price={`${sale.currency_symbol || '$'}${(sale.price / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            icon={ShoppingBag} 
            iconColor="text-violet-400" 
            bgColor="bg-violet-500/10" 
            refunded={sale.refunded}
            partiallyRefunded={sale.partially_refunded}
            onAction={setConfirmAction}
          />
        ))}

        {filteredSales.length === 0 && !error && (
          <p className="text-on-surface-variant text-center py-12 italic">No transactions match your search.</p>
        )}
      </section>

      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-surface-container border border-white/10 rounded-3xl p-6 text-center"
            >
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="font-headline text-xl font-bold mb-2">Confirm Action</h3>
              <p className="text-sm text-on-surface-variant mb-8">
                You are about to perform: <strong className="text-white">{confirmAction.name}</strong>.
              </p>
              
              <HoldButton 
                actionText="confirm"
                onComplete={() => handleAction(confirmAction.name, confirmAction.fn)}
                className="w-full py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-headline font-bold text-lg hover:bg-red-500/30 transition-colors"
              >
                Hold 3s to Confirm
              </HoldButton>

              <button 
                onClick={() => setConfirmAction(null)}
                className="mt-4 text-sm font-label uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex justify-center">
        <button className="text-xs font-label font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-white transition-colors flex items-center gap-2">
          View All History
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, subValue, color }: any) {
  return (
    <div className="bg-surface-container/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay pointer-events-none"></div>
      <div className="relative z-10">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</span>
        <div className={cn("text-3xl font-headline font-bold mt-1", color)}>{value}</div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-on-surface-variant/80">{subValue}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ saleId, title, email, time, price, icon: Icon, iconColor, bgColor, refunded, partiallyRefunded, onAction }: any) {
  return (
    <div className={cn(
      "bg-surface-container/40 backdrop-blur-xl p-6 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-zinc-800/20 group",
      refunded && "opacity-50 grayscale"
    )}>
      <div className="flex items-center gap-5">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", bgColor, iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className={cn("font-headline font-bold text-lg", refunded ? "text-on-surface-variant line-through" : "text-white")}>{title}</h4>
          <p className="text-sm font-body text-on-surface-variant">{email}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-label text-zinc-600 uppercase tracking-widest">{time}</p>
            {refunded && <span className="text-[10px] font-label text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded">Refunded</span>}
            {partiallyRefunded && !refunded && <span className="text-[10px] font-label text-orange-400 uppercase tracking-widest bg-orange-400/10 px-2 py-0.5 rounded">Partial Refund</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col md:items-end gap-4">
        <div className={cn("text-2xl font-headline font-bold", refunded ? "text-on-surface-variant" : "text-secondary")}>{price}</div>
        <div className="flex items-center gap-3">
          {!refunded && (
            <button 
              onClick={() => onAction({ 
                name: 'Refund Sale', 
                fn: () => ActionRegistry.get("refund")!.execute(saleId) 
              })}
              className="px-4 py-2 rounded-lg text-xs font-label font-bold uppercase tracking-wider text-red-400 hover:bg-red-400/10 transition-colors border border-red-400/20"
            >
              Refund
            </button>
          )}
          <button 
            onClick={() => onAction({ 
              name: 'Resend Receipt', 
              fn: () => ActionRegistry.get("resendReceipt")!.execute(saleId) 
            })}
            className="px-4 py-2 rounded-lg text-xs font-label font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors border border-primary/20"
          >
            Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
