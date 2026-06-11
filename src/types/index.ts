export type AssetType = "image" | "video";

export type GenerationMode =
  | "image"
  | "video"
  | "outfit"
  | "lip-sync"
  | "batch";

export type GenerationStatus =
  | "pending"
  | "queued"
  | "generating"
  | "post_processing"
  | "completed"
  | "failed";

export type TemplateCategory =
  | "style_transfer"
  | "photo_style"
  | "portrait"
  | "creative"
  | "utility"
  | "video"
  | "virtual_tryon"
  | "lip_sync";

export type TemplateKind = "image" | "video" | "virtual_tryon" | "lip_sync";

export type Template = {
  id: string;
  title: string;
  titleEn?: string;
  industry: string;
  mode: GenerationMode;
  category: TemplateCategory;
  kind: TemplateKind;
  description: string;
  descriptionEn?: string;
  previewImage: string;
  tags: string[];
  creditCost: number;
  isPremium?: boolean;
  sortOrder?: number;
  estimatedSeconds?: number;
  outputNote?: string;
};

export type Project = {
  id: string;
  title: string;
  status: GenerationStatus;
  templateId?: string;
  createdAt: string;
};

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
};

export type PlatformSize = {
  id: string;
  label: string;
  width: number;
  height: number | null;
  ratio: string;
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};
