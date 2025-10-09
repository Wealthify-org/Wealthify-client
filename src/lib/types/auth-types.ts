import { SetStateAction } from "react"
import z from "zod"

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(6, 'Username must be at least 6 characters')
})

export type SignInSchema = z.infer<typeof signInSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>

export type AuthProps = {
  variant: 'page' | 'modal';
  setErrorMessage: React.Dispatch<SetStateAction<string>>
}