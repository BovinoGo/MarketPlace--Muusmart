export type ApiRecord = Record<string, unknown>;

export type ViewMode = "market" | "sell" | "mine";
export type SortMode = "recent" | "priceAsc" | "priceDesc";
export type SessionRole = "rancher" | "buyer";

export type Session = {
  token?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: SessionRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRancherRequest = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

export type RegisterBuyerRequest = RegisterRancherRequest;

export type PublishBovineRequest = {
  bovineId: string;
  ranchId: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  salePurpose: number;
  contactPreference: number;
  negotiablePrice: boolean;
  includesTransport: boolean;
  requiresSanitaryDocumentation: boolean;
  healthSummaryVisible: boolean;
  vaccinationHistoryVisible: boolean;
};

export type PublishFormState = Omit<PublishBovineRequest, "price" | "salePurpose" | "contactPreference"> & {
  price: string;
  salePurpose: string;
  contactPreference: string;
};

export type PurchaseRequestPayload = {
  publicationId: string;
  buyerId: string;
  message: string;
};

export type CartItem = {
  publication: ApiRecord;
};

export type CheckoutDraft = {
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: "card" | "yape" | "transfer";
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  deliveryNotes: string;
};

export type SanitaryDocumentRequest = {
  publicationId: string;
  documentType: string;
  documentNumber: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string | null;
  notes: string;
};

export type DocumentDraft = {
  documentType: string;
  documentNumber: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  notes: string;
};
