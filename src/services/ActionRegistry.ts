import { gumroadService } from "../services/gumroadService";

export type ImpactLevel = "low" | "high";

export interface RegistryAction {
  id: string;
  name: string;
  impact: ImpactLevel;
  execute: (...args: any[]) => Promise<any>;
}

export const ActionRegistry = new Map<string, RegistryAction>();

// Initialize Actions
ActionRegistry.set("refund", {
  id: "refund",
  name: "Refund Sale",
  impact: "high",
  execute: (saleId: string, amountCents?: number) => gumroadService.refundSale(saleId, amountCents),
});

ActionRegistry.set("resendReceipt", {
  id: "resendReceipt",
  name: "Resend Receipt",
  impact: "low",
  execute: (saleId: string) => gumroadService.resendReceipt(saleId),
});

ActionRegistry.set("verifyLicense", {
  id: "verifyLicense",
  name: "Verify License",
  impact: "low",
  execute: (productId: string, licenseKey: string, incrementUses: boolean) => 
    gumroadService.verifyLicense(productId, licenseKey, incrementUses),
});

ActionRegistry.set("enableLicense", {
  id: "enableLicense",
  name: "Enable License",
  impact: "high",
  execute: (productId: string, licenseKey: string) => 
    gumroadService.enableLicense(productId, licenseKey),
});

ActionRegistry.set("disableLicense", {
  id: "disableLicense",
  name: "Disable/Revoke License",
  impact: "high",
  execute: (productId: string, licenseKey: string) => 
    gumroadService.disableLicense(productId, licenseKey),
});

ActionRegistry.set("rotateLicense", {
  id: "rotateLicense",
  name: "Rotate License",
  impact: "high",
  execute: (productId: string, licenseKey: string) => 
    gumroadService.rotateLicense(productId, licenseKey),
});

export async function executeAction(id: string, ...args: any[]) {
  const action = ActionRegistry.get(id);
  if (!action) throw new Error(`Action ${id} not found`);
  
  // Potential HITL check logic will be added here
  return await action.execute(...args);
}
