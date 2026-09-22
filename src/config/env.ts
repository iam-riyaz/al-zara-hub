import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().default("postgresql://alzara:alzara_password@localhost:5432/alzara_db?schema=public"),
  JWT_SECRET: z.string().min(16).default("alzara_development_jwt_secret_must_be_at_least_32_chars_long"),
  SESSION_SECRET: z.string().min(16).default("alzara_development_session_secret_32_chars_minimum_length"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  STORAGE_PROVIDER: z.enum(["local", "s3", "mock"]).default("local"),
  PAYMENT_PROVIDER: z.enum(["mock", "stripe", "razorpay"]).default("mock"),
  EMAIL_PROVIDER: z.enum(["mock", "smtp", "resend"]).default("mock"),
  MOCK_PAYMENT_ENABLED: z.enum(["true", "false"]).default("true"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const _env = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  MOCK_PAYMENT_ENABLED: process.env.MOCK_PAYMENT_ENABLED,
  NODE_ENV: process.env.NODE_ENV,
});

if (!_env.success) {
  console.error("❌ Invalid environment configuration:", _env.error.format());
  throw new Error("Invalid environment variables. Check your .env file.");
}

export const env = _env.data;
