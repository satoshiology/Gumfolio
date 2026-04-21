import * as React from "react";
import { motion } from "motion/react";
import { gumroadService } from "../services/gumroadService";
import { useChatContext } from "../context/ChatContext";
import { Product } from "../types";
import { cn } from "../lib/utils";

export function ChatSuggestions() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const { sendMessage } = useChatContext();

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await gumroadService.getProducts();
        setProducts(res.products);
      } catch (err) {
        console.error("Failed to fetch products for suggestions", err);
      }
    }
    fetchProducts();
  }, []);

  const getSuggestions = () => {
    const suggestions = ["What's the best strategy for growth?", "Analyze my top performing product."];
    if (products.length > 0) {
      const topProduct = products.sort((a, b) => b.sales_count - a.sales_count)[0];
      suggestions.push(`How is ${topProduct.name} performing?`);
      suggestions.push(`Suggest improvements for ${topProduct.name}.`);
    }
    return suggestions;
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide px-2">
      {getSuggestions().map((suggestion, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage(suggestion)}
          className="flex-shrink-0 bg-surface-container-high/50 border border-white/10 px-4 py-2 rounded-full text-xs text-[#00ff41] hover:bg-primary/20 hover:border-primary/50 transition-all whitespace-nowrap"
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
}
