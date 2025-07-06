import { z } from "zod";

export const homeownerSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  createdAt: z.date(),
  qrUrl: z.string(),
  pitchUrl: z.string(),
});

export const pitchSchema = z.object({
  id: z.string(),
  homeownerId: z.string(),
  visitorName: z.string().min(1, "Visitor name is required"),
  company: z.string().optional(),
  offer: z.string().min(1, "Offer is required"),
  reason: z.string().min(1, "Reason is required"),
  visitorEmail: z.string().email().optional().or(z.literal("")),
  visitorPhone: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  createdAt: z.date(),
});

export const insertHomeownerSchema = homeownerSchema.pick({
  fullName: true,
  email: true,
});

export const insertPitchSchema = pitchSchema.pick({
  homeownerId: true,
  visitorName: true,
  company: true,
  offer: true,
  reason: true,
  visitorEmail: true,
  visitorPhone: true,
  fileName: true,
});

export type Homeowner = z.infer<typeof homeownerSchema>;
export type Pitch = z.infer<typeof pitchSchema>;
export type InsertHomeowner = z.infer<typeof insertHomeownerSchema>;
export type InsertPitch = z.infer<typeof insertPitchSchema>;
