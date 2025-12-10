import { z } from "zod";

/**
 * Auth
 */
export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court (min 6 caractères)"),
  workspaceName: z.string().min(2, "Nom du garage trop court"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

/**
 * Workspace / onboarding
 */
export const workspaceUpdateSchema = z.object({
  name: z.string().min(2),
  timezone: z.string().min(2),
  brandTone: z.string().optional(),
  openingHours: z
    .object({
      mon: z.string().optional(),
      tue: z.string().optional(),
      wed: z.string().optional(),
      thu: z.string().optional(),
      fri: z.string().optional(),
      sat: z.string().optional(),
      sun: z.string().optional(),
    })
    .partial()
    .optional(),
});

/**
 * Services
 */
export const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

/**
 * Leads (mini CRM)
 */
export const leadCreateSchema = z.object({
  workspaceId: z.string().cuid(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  consentWhatsapp: z.boolean().optional(),
  desiredService: z.string().optional(),
  problemSummary: z.string().optional(),
});

/**
 * RDV
 */
export const appointmentProposalSchema = z.object({
  leadId: z.string().cuid(),
  workspaceId: z.string().cuid(),
  proposedSlots: z
    .array(
      z.object({
        startsAt: z.string(), // ISO
        endsAt: z.string(), // ISO
      }),
    )
    .min(1),
});
