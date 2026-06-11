import { z } from "zod";

export const generateSchema = z.object({
  generationId: z.string().uuid().optional(),
  templateId: z.string().min(1),
  assetIds: z.array(z.string()).min(1),
  projectId: z.string().uuid().optional(),
  inputImageUrl: z.string().url().optional(),
  inputVideoUrl: z.string().url().optional(),
  inputText: z.string().max(300).optional(),
  voiceId: z.string().max(80).optional(),
  quantity: z.number().int().positive().max(9).optional(),
  platformTargets: z.array(z.string().min(1)).optional(),
  prompt: z.string().max(1200).optional(),
  applyBrandLogo: z.boolean().optional(),
  brandLogoUrl: z.string().url().optional(),
  brandAssetId: z.string().uuid().optional(),
  mode: z.enum(["image", "video", "outfit", "lip-sync", "batch"]),
});

export const uploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
});

export const templateSchema = z.object({
  title: z.string().min(1),
  industry: z.string().min(1),
  description: z.string().min(1),
  creditCost: z.number().int().positive(),
});

export const templateQuerySchema = z.object({
  category: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
});

export const generationStatusQuerySchema = z.object({
  generationId: z.string().uuid(),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(120),
  templateId: z.string().min(1).optional(),
});

export const projectQuerySchema = z.object({
  status: z.enum(["pending", "queued", "generating", "post_processing", "completed", "failed"]).optional(),
});
