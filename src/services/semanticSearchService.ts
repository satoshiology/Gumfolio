import { GoogleGenAI, Type } from "@google/genai";
import { Sale } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function performSemanticSearch(query: string, sales: Sale[]): Promise<string[]> {
  // Limit data sent to model to avoid token limits, use subset or summary if needed
  const salesContext = sales.slice(0, 50).map(s => ({
    id: s.id,
    product: s.product_name,
    email: s.email,
    price: s.price,
    date: s.created_at
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Given this user query: "${query}", find the IDs of the sales that best match this intent.
    Here is the list of sales: ${JSON.stringify(salesContext)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of matching sale IDs."
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse semantic search", e);
    return [];
  }
}
