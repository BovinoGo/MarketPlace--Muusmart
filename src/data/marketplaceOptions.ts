import type { BovineFormState, DocumentDraft, PublishFormState, RanchFormState } from "../types";

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

export const productionTypeOptions = [
  { value: "0", label: "Carne" },
  { value: "1", label: "Leche" },
  { value: "2", label: "Doble proposito" },
  { value: "3", label: "Reproduccion" },
];

export const sexOptions = [
  { value: "0", label: "Macho" },
  { value: "1", label: "Hembra" },
];

export const bovineCategoryOptions = [
  { value: "0", label: "Ternero" },
  { value: "1", label: "Vaquilla" },
  { value: "2", label: "Novillo" },
  { value: "3", label: "Vaca" },
  { value: "4", label: "Toro" },
];

export const productivePurposeOptions = [
  { value: "0", label: "Carne" },
  { value: "1", label: "Leche" },
  { value: "2", label: "Reproduccion" },
  { value: "3", label: "Doble proposito" },
  { value: "4", label: "Engorde" },
];

export const defaultRanchForm = (ownerId = ""): RanchFormState => ({
  ownerId,
  name: "",
  country: "Peru",
  region: "",
  productionType: "0",
  description: "",
  province: "",
  district: "",
  address: "",
  totalAreaHectares: "",
  capacityBovines: "",
  contactPhone: "",
  contactEmail: "",
  sanitaryRegistrationCode: "",
});

export const defaultBovineForm = (ownerId = "", ranchId = ""): BovineFormState => ({
  earTagCode: "",
  name: "",
  breed: "",
  sex: "0",
  birthDate: "",
  category: "0",
  currentWeightKg: "",
  productivePurpose: "0",
  ranchId,
  ownerId,
  stableId: "",
  photoUrl: "",
});

export const defaultDocumentDraft: DocumentDraft = {
  documentType: "Certificado sanitario",
  documentNumber: "",
  issuedBy: "",
  issuedAt: new Date().toISOString().slice(0, 10),
  expiresAt: "",
  notes: "",
};