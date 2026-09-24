export type Template = "classic" | "modern" | "minimal" | "elegant";
export type PaymentMethod = "transferencia" | "efectivo" | "tarjeta" | "otra";
export type QuoteStatus = "borrador" | "enviado" | "aceptado" | "rechazado";
export type QuoteUnit = "unidad" | "hora" | "día" | "mes" | "servicio" | "kg" | "metro" | "otra";

export interface Party {
  name: string;
  taxId: string;
  address: string;
  postalCode: string;
  city: string;
  province?: string;
  email: string;
  phone: string;
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unit?: QuoteUnit;
  customUnit?: string;
  unitPrice: number;
  discount: number;
  vatRate: number;
  customVat?: boolean;
}

export interface QuoteSettings {
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  color: string;
  template: Template;
}

export interface Quote {
  id: string;
  issuer: Party;
  client: Party & { isPrivate: boolean };
  number: string;
  date: string;
  validUntil: string;
  status: QuoteStatus;
  currency: "EUR";
  lines: QuoteLine[];
  paymentMethod: PaymentMethod;
  paymentOther: string;
  conditions: string;
  notes: string;
  settings: QuoteSettings;
  logoDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedConcept {
  id: string;
  description: string;
  unit?: QuoteUnit;
  customUnit?: string;
  unitPrice: number;
  vatRate: number;
  customVat?: boolean;
}

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  taxableBase: number;
  vat: number;
  total: number;
}
