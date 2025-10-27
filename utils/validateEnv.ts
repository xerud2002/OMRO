import { z } from "zod";

// Define what environment variables must exist
const EnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),

  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  NEXT_PUBLIC_EMAILJS_SERVICE_ID: z.string().min(1),
  NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: z.string().min(1),
  NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: z.string().min(1),
});

// Parse and validate on startup
export const validatedEnv = EnvSchema.parse(process.env);
