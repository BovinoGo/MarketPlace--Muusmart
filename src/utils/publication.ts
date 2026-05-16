import type { ApiRecord } from "../types";
import { readRecord, readString } from "./records";

export const cattleImages = [
  "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=82",
];

export function getPublicationId(publication: ApiRecord): string {
  return readString(publication, ["id", "publicationId"]);
}

export function getBovineId(publication: ApiRecord): string {
  return readString(publication, ["bovineId", "animalId"]);
}

export function getPublicationTitle(publication: ApiRecord): string {
  const bovine = readRecord(publication, ["bovine", "animal"]);
  return (
    readString(publication, ["title", "name"]) ||
    readString(bovine, ["name", "earTagCode"]) ||
    "Bovino en venta"
  );
}

export function getPublicationDescription(publication: ApiRecord): string {
  return (
    readString(publication, ["description", "summary"]) ||
    "Lote disponible en la feria MuuSmart con informacion sanitaria y comercial."
  );
}

export function getPublicationPurpose(publication: ApiRecord): string {
  return readString(publication, ["salePurpose", "purpose"], "Sin clasificar");
}

export function getPublicationDate(publication: ApiRecord): number {
  const date = readString(publication, ["publishedAt", "createdAt", "updatedAt"]);
  const time = Date.parse(date);
  return Number.isFinite(time) ? time : 0;
}

export function getImageFor(publication: ApiRecord, index: number): string {
  const bovine = readRecord(publication, ["bovine", "animal"]);
  const image =
    readString(publication, ["photoUrl", "imageUrl", "pictureUrl"]) ||
    readString(bovine, ["photoUrl", "imageUrl", "pictureUrl"]);

  return image || cattleImages[index % cattleImages.length];
}
