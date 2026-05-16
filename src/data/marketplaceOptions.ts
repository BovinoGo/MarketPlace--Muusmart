import type { DocumentDraft, PublishFormState } from "../types";

export const salePurposeOptions = [
  { value: "0", label: "Carne" },
  { value: "1", label: "Leche" },
  { value: "2", label: "Reproduccion" },
  { value: "3", label: "Doble proposito" },
];

export const contactOptions = [
  { value: "0", label: "Chat interno" },
  { value: "1", label: "Llamada" },
  { value: "2", label: "Correo" },
];

export const defaultPublishForm = (sellerId = ""): PublishFormState => ({
  bovineId: "",
  ranchId: "",
  sellerId,
  title: "",
  description: "",
  price: "",
  currency: "PEN",
  salePurpose: "0",
  contactPreference: "0",
  negotiablePrice: true,
  includesTransport: false,
  requiresSanitaryDocumentation: true,
  healthSummaryVisible: true,
  vaccinationHistoryVisible: true,
});

export const defaultDocumentDraft: DocumentDraft = {
  documentType: "Certificado sanitario",
  documentNumber: "",
  issuedBy: "",
  issuedAt: new Date().toISOString().slice(0, 10),
  expiresAt: "",
  notes: "",
};
