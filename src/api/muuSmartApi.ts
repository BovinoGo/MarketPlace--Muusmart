import type {
  ApiRecord,
  CreateRanchRequest,
  LoginRequest,
  PublishBovineRequest,
  PurchaseRequestPayload,
  RegisterBovineRequest,
  RegisterBuyerRequest,
  RegisterRancherRequest,
  SanitaryDocumentRequest,
  Session,
  SessionRole,
} from "../types";
import { findStringDeep, isRecord, normalizeCollection, readRecord, readString } from "../utils/records";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const MUUSMART_ENDPOINTS = {
  login: "/api/v1/auth/login",
  registerRancher: "/api/v1/auth/register/rancher",
  registerBuyer: "/api/v1/auth/register/buyer",
  ranches: "/api/v1/ranches",
  bovines: "/api/v1/bovines",
  bovinesByRanch: (ranchId: string) => `/api/v1/bovines/by-ranch/${ranchId}`,
  publications: "/api/v1/marketplace/publications",
  myPublications: "/api/v1/marketplace/publications/mine",
  purchaseRequests: (publicationId: string) =>
    `/api/v1/marketplace/publications/${publicationId}/purchase-requests`,
  createPurchaseRequest: (publicationId: string) =>
    `/api/v1/marketplace/publications/${publicationId}/purchase-request`,
  confirmSale: (publicationId: string) =>
    `/api/v1/marketplace/publications/${publicationId}/confirm-sale`,
  rejectPurchaseRequest: (requestId: string) =>
    `/api/v1/marketplace/purchase-requests/${requestId}/reject`,
  cancelPublication: (publicationId: string) =>
    `/api/v1/marketplace/publications/${publicationId}/cancel`,
  sanitaryDocuments: (publicationId: string) =>
    `/api/v1/marketplace/publications/${publicationId}/sanitary-documents`,
};

export function authHeaders(session: Session): HeadersInit {
  return session.token ? { Authorization: `Bearer ${session.token}` } : {};
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const target = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(target, { ...options, headers });
  const text = await response.text();
  let payload: unknown = text;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const errors = isRecord(payload) ? readRecord(payload, ["errors"]) : undefined;
    const message =
      (isRecord(payload) &&
        (readString(payload, ["message", "title", "error"]) ||
          readString(errors, ["message"]))) ||
      `Error ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function extractSession(payload: unknown, fallback: Session): Session {
  const token = findStringDeep(payload, [
    "token",
    "accessToken",
    "access_token",
    "jwt",
    "idToken",
  ]);
  const userId = findStringDeep(payload, [
    "userId",
    "id",
    "sub",
    "nameid",
    "nameIdentifier",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid",
    "buyerId",
    "sellerId",
    "rancherId",
    "ownerId",
  ]);
  const fullName = findStringDeep(payload, ["fullName", "name", "displayName"]);
  const phone = findStringDeep(payload, ["phone", "phoneNumber"]);
  const responseRole = normalizeRole(
    findStringDeep(payload, ["role", "accountType", "userType", "type"]),
  );
  const tokenPayload = token ? readTokenPayload(token) : undefined;
  const tokenRole = tokenPayload
    ? normalizeRole(
        findStringDeep(tokenPayload, [
          "role",
          "roles",
          "accountType",
          "userType",
          "type",
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
        ]),
      )
    : undefined;
  const tokenUserId = tokenPayload
    ? findStringDeep(tokenPayload, [
        "userId",
        "id",
        "sub",
        "nameid",
        "nameIdentifier",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid",
      ])
    : undefined;

  return {
    ...fallback,
    token: token ?? fallback.token,
    userId: userId ?? tokenUserId ?? fallback.userId,
    fullName: fullName ?? fallback.fullName,
    phone: phone ?? fallback.phone,
    role: responseRole ?? tokenRole ?? fallback.role,
  };
}

function normalizeRole(value: string | undefined): SessionRole | undefined {
  if (!value) return undefined;

  const role = value.toLowerCase();
  if (role.includes("buyer") || role.includes("comprador")) return "Comprador";
  if (role.includes("empresa")) return "Empresa ganadera";
  if (
    role.includes("rancher") ||
    role.includes("ganadero") ||
    role.includes("seller") ||
    role.includes("company")
  ) {
    return "Ganadero";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function readTokenPayload(token: string): unknown {
  const [, payload] = token.split(".");
  if (!payload) return undefined;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(json) as unknown;
  } catch {
    return undefined;
  }
}

export const muuSmartApi = {
  async login(payload: LoginRequest, role: SessionRole): Promise<Session> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.login, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return extractSession(response, {
      email: payload.email,
      role,
    });
  },

  async registerRancher(payload: RegisterRancherRequest): Promise<Session> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.registerRancher, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return extractSession(response, {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      role: "rancher",
    });
  },

  async registerBuyer(payload: RegisterBuyerRequest): Promise<Session> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.registerBuyer, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return extractSession(response, {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      role: "buyer",
    });
  },

  async getRanches(session: Session): Promise<ApiRecord[]> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.ranches, {
      headers: authHeaders(session),
    });
    return normalizeCollection(response);
  },

  async createRanch(payload: CreateRanchRequest, session: Session): Promise<ApiRecord> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.ranches, {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(payload),
    });
    return isRecord(response) ? response : {};
  },

  async getBovinesByRanch(ranchId: string, session: Session): Promise<ApiRecord[]> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.bovinesByRanch(ranchId), {
      headers: authHeaders(session),
    });
    return normalizeCollection(response);
  },

  async createBovine(payload: RegisterBovineRequest, session: Session): Promise<ApiRecord> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.bovines, {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(payload),
    });
    return isRecord(response) ? response : {};
  },

  async getPublications(): Promise<ApiRecord[]> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.publications);
    return normalizeCollection(response);
  },

  async publishBovine(payload: PublishBovineRequest, session: Session): Promise<unknown> {
    return apiFetch(MUUSMART_ENDPOINTS.publications, {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(payload),
    });
  },

  async getMyPublications(session: Session): Promise<ApiRecord[]> {
    const response = await apiFetch<unknown>(MUUSMART_ENDPOINTS.myPublications, {
      headers: authHeaders(session),
    });
    return normalizeCollection(response);
  },

  async getPurchaseRequests(publicationId: string, session: Session): Promise<ApiRecord[]> {
    const response = await apiFetch<unknown>(
      MUUSMART_ENDPOINTS.purchaseRequests(publicationId),
      { headers: authHeaders(session) },
    );
    return normalizeCollection(response);
  },

  async createPurchaseRequest(
    publicationId: string,
    payload: PurchaseRequestPayload,
    session: Session,
  ): Promise<unknown> {
    return apiFetch(MUUSMART_ENDPOINTS.createPurchaseRequest(publicationId), {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(payload),
    });
  },

  async confirmSale(publicationId: string, sellerId: string, session: Session): Promise<unknown> {
    return apiFetch(MUUSMART_ENDPOINTS.confirmSale(publicationId), {
      method: "PATCH",
      headers: authHeaders(session),
      body: JSON.stringify({ publicationId, sellerId }),
    });
  },

  async rejectPurchaseRequest(requestId: string, session: Session): Promise<unknown> {
    return apiFetch(MUUSMART_ENDPOINTS.rejectPurchaseRequest(requestId), {
      method: "PATCH",
      headers: authHeaders(session),
    });
  },

  async cancelPublication(publicationId: string, session: Session): Promise<unknown> {
    return apiFetch(MUUSMART_ENDPOINTS.cancelPublication(publicationId), {
      method: "PATCH",
      headers: authHeaders(session),
    });
  },

  async getSanitaryDocuments(publicationId: string, session: Session): Promise<ApiRecord[]> {
    const response = await apiFetch<unknown>(
      MUUSMART_ENDPOINTS.sanitaryDocuments(publicationId),
      { headers: authHeaders(session) },
    );
    return normalizeCollection(response);
  },

  async createSanitaryDocument(
    publicationId: string,
    payload: SanitaryDocumentRequest,
    session: Session,
  ): Promise<unknown> {
    return apiFetch(MUUSMART_ENDPOINTS.sanitaryDocuments(publicationId), {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify(payload),
    });
  },
};