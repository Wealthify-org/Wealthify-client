import z from "zod"

type Credentials = {
  email: string
  password: string
}

export type AuthProps = {
  variant: 'page' | 'modal'
}

type SubmitHandler<TArgs> = (args: TArgs) => Promise<void>

export type SIStartButtonOnClickArgs = Credentials
export type SUStartButtonOnClickArgs = Credentials & { username: string }

export type AuthFormProps<TArgs> = {
  startButtonOnClick: SubmitHandler<TArgs>
  handleChangeAuthorizationType: () => void
}

export type SIErrorState = {
  emailValue?: string
  passwordValue?: string
}

export type SUErrorState = {
  emailValue?: string
  passwordValue?: string
  usernameValue?: string
}

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
