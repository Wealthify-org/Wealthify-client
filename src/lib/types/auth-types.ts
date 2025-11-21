import { SetStateAction } from "react"
import z from "zod"

// разрешённые спецсимволы
export const ALLOWED_SYMBOLS = `!@#$%^&*()_-=,./?\\|~`;

// безопасно экранируем всё, что имеет спец. значение в символьном классе 
const escapeForCharClass = (s: string) =>
  s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");

// собираем классы
const specialsClass = escapeForCharClass(ALLOWED_SYMBOLS);

// усть хотя бы один разрешённый спецсимвол
export const HAS_ALLOWED_SYMBOL = new RegExp(`[${specialsClass}]`);

// строка состоит только из латиницы/цифр и разрешённых спецсимволов
export const ONLY_ALLOWED_CHARS = new RegExp(`^[A-Za-z0-9${specialsClass}]+$`);

const emailSchema = z
  .string()
  .toLowerCase()
  .email({ message: "Invalid email address" });

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  // только латиница, цифры и _.-
  .regex(/^[A-Za-z][A-Za-z0-9_.-]*$/, "Use letters, digits, '_', '.', '-' (must start with a letter)")
  // не заканчивается спецсимволом
  .regex(/^[\s\S]*[A-Za-z0-9]$/, "Cannot end with '_', '.' or '-'")
  // без двух спецсимволов подряд
  .refine((s) => !/[_.-]{2,}/.test(s), { message: "No consecutive special characters" })
  // не только цифры
  .refine((s) => !/^\d+$/.test(s), { message: "Username cannot be only digits" });

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters") 
  .max(72, "Password must be at most 72 characters") 
  .regex(ONLY_ALLOWED_CHARS, `Use letters, digits and only these symbols: ${ALLOWED_SYMBOLS}`)
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/\d/,    "Must include a number")
  .regex(HAS_ALLOWED_SYMBOL, `Must include at least one of: ${ALLOWED_SYMBOLS}`);

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema
})

export type SignInSchema = z.infer<typeof signInSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>

export type AuthProps = {
  variant: "page" | "modal";
  setErrorMessage: React.Dispatch<SetStateAction<string>>;
  // isAuthingFromHome?: boolean;
}