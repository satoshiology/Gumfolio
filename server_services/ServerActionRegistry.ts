import axios from "axios";
import { z } from "zod";

const GUMROAD_API_BASE = "https://api.gumroad.com/v2";

export interface RegistryAction {
  execute: (accessToken: string, ...args: any[]) => Promise<any>;
  description: string;
  parameters: z.ZodObject<any>;
  riskLevel: 'low' | 'medium' | 'high'; // Technical Augmentation: Execution gating
}

export const ServerActionRegistry = new Map<string, RegistryAction>();

ServerActionRegistry.set("refund", {
  description: 'Refund a sale on Gumroad.',
  parameters: z.object({ saleId: z.string(), amountCents: z.number().optional() }),
  riskLevel: 'high',
  execute: async (accessToken: string, saleId: string, amountCents?: number) => {
    const data: any = { access_token: accessToken };
    if (amountCents) data.amount_cents = amountCents;
    const response = await axios.put(`${GUMROAD_API_BASE}/sales/${saleId}/refund`, data);
    return response.data;
  }
});

ServerActionRegistry.set("resendReceipt", {
  description: 'Resend a receipt for a sale on Gumroad.',
  parameters: z.object({ saleId: z.string() }),
  riskLevel: 'low',
  execute: async (accessToken: string, saleId: string) => {
    const response = await axios.post(`${GUMROAD_API_BASE}/sales/${saleId}/resend_receipt`, { access_token: accessToken });
    return response.data;
  }
});

ServerActionRegistry.set("verifyLicense", {
  description: 'Verify a license key on Gumroad.',
  parameters: z.object({ productId: z.string(), licenseKey: z.string(), incrementUses: z.boolean() }),
  riskLevel: 'low',
  execute: async (accessToken: string, productId: string, licenseKey: string, incrementUses: boolean) => {
    const response = await axios.post(`${GUMROAD_API_BASE}/licenses/verify`, {
      product_id: productId,
      license_key: licenseKey,
      increment_uses: incrementUses
    }, { params: { access_token: accessToken } });
    return response.data;
  }
});

ServerActionRegistry.set("enableLicense", {
  description: 'Enable a license key on Gumroad.',
  parameters: z.object({ productId: z.string(), licenseKey: z.string() }),
  riskLevel: 'medium',
  execute: async (accessToken: string, productId: string, licenseKey: string) => {
    const response = await axios.post(`${GUMROAD_API_BASE}/licenses/enable`, {
      access_token: accessToken,
      license_key: licenseKey,
      product_id: productId
    });
    return response.data;
  }
});

ServerActionRegistry.set("disableLicense", {
  description: 'Disable/Revoke a license key on Gumroad.',
  parameters: z.object({ productId: z.string(), licenseKey: z.string() }),
  riskLevel: 'high',
  execute: async (accessToken: string, productId: string, licenseKey: string) => {
    const response = await axios.post(`${GUMROAD_API_BASE}/licenses/disable`, {
      access_token: accessToken,
      license_key: licenseKey,
      product_id: productId
    });
    return response.data;
  }
});

ServerActionRegistry.set("rotateLicense", {
  description: 'Rotate a license key for a product on Gumroad.',
  parameters: z.object({ productId: z.string(), licenseKey: z.string() }),
  riskLevel: 'high',
  execute: async (accessToken: string, productId: string, licenseKey: string) => {
    const response = await axios.post(`${GUMROAD_API_BASE}/licenses/rotate`, {
      access_token: accessToken,
      license_key: licenseKey,
      product_id: productId
    });
    return response.data;
  }
});

ServerActionRegistry.set("incrementLicenseUses", {
  description: 'Increase the usage limit or count for a license key on Gumroad.',
  parameters: z.object({ productId: z.string(), licenseKey: z.string() }),
  riskLevel: 'medium',
  execute: async (accessToken: string, productId: string, licenseKey: string) => {
    const response = await axios.post(`${GUMROAD_API_BASE}/licenses/verify`, {
      product_id: productId,
      license_key: licenseKey,
      increment_uses: true
    }, { params: { access_token: accessToken } });
    return response.data;
  }
});

// New AI-Driven Feature Tool: Draft Customer Support Reply
ServerActionRegistry.set("generateConciseSupportDraft", {
  description: 'Drafts an ultra-concise, professional customer support reply resolving licensing or refund inquiries.',
  parameters: z.object({ inquiryContent: z.string(), resolutionType: z.string() }),
  riskLevel: 'low',
  execute: async (accessToken: string, inquiryContent: string, resolutionType: string) => {
    // In a real system, this would trigger an internal specialized Support Content AI agent
    // Here we generate an engineered response placeholder that the main AI Agent can provide back to the user.
    return {
      success: true,
      draft: `Hello! We've processed your ${resolutionType} request as discussed. Let us know if anything else is needed. Thank you!`
    };
  }
});
