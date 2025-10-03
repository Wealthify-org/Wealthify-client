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