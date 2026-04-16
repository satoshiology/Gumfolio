import axios from "axios";
import { Product, Sale, LicenseVerificationResponse, User, Payout } from "../types";

export const gumroadService = {
  getToken(): boolean {
    return localStorage.getItem("gumroad_authenticated") === "true";
  },

  setToken() {
    localStorage.setItem("gumroad_authenticated", "true");
  },

  clearToken() {
    localStorage.removeItem("gumroad_authenticated");
  },

  getHeaders() {
    // We no longer need to send the Authorization header manually,
    // as it is sent securely via HttpOnly cookie
    return {};
  },

  async getProducts(): Promise<{ products: Product[] }> {
    const response = await axios.get("/api/products", { headers: this.getHeaders() });
    return response.data;
  },

  async getSales(): Promise<{ sales: Sale[] }> {
    const response = await axios.get("/api/sales", { headers: this.getHeaders() });
    return response.data;
  },

  async getUser(): Promise<{ user: User }> {
    const response = await axios.get("/api/user", { headers: this.getHeaders() });
    return response.data;
  },

  async getPayouts(): Promise<{ payouts: Payout[] }> {
    const response = await axios.get("/api/payouts", { headers: this.getHeaders() });
    return response.data;
  },

  async verifyLicense(productId: string, licenseKey: string, incrementUses: boolean = false): Promise<LicenseVerificationResponse> {
    const response = await axios.post("/api/verify-license", {
      product_id: productId,
      license_key: licenseKey,
      increment_uses: incrementUses
    }, { headers: this.getHeaders() });
    return response.data;
  },

  async enableLicense(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.post(`/api/licenses/${licenseKey}/enable`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async disableLicense(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.post(`/api/licenses/${licenseKey}/disable`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async decrementLicenseUses(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.post(`/api/licenses/${licenseKey}/decrement-uses`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async rotateLicense(productId: string, licenseKey: string): Promise<any> {
    const response = await axios.post(`/api/licenses/${licenseKey}/rotate`, { product_id: productId }, { headers: this.getHeaders() });
    return response.data;
  },

  async disableProduct(productId: string): Promise<any> {
    const response = await axios.put(`/api/products/${productId}`, {
      shown_on_profile: false
    }, { headers: this.getHeaders() });
    return response.data;
  },

  async enableProduct(productId: string): Promise<any> {
    const response = await axios.put(`/api/products/${productId}`, {
      shown_on_profile: true
    }, { headers: this.getHeaders() });
    return response.data;
  },

  async refundSale(saleId: string, amountCents?: number): Promise<any> {
    const response = await axios.put(`/api/sales/${saleId}/refund`, { amount_cents: amountCents }, { headers: this.getHeaders() });
    return response.data;
  },

  async resendReceipt(saleId: string): Promise<any> {
    const response = await axios.post(`/api/sales/${saleId}/resend_receipt`, {}, { headers: this.getHeaders() });
    return response.data;
  },
};
