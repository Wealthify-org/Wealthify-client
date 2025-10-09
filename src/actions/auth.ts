'use server'

import { SignInSchema, SignUpSchema } from "@/lib/types/auth-types"
import { redirect } from "next/navigation"
import { toErrorMessage } from "@/lib/errors"

type ActionState = { error?: string | null }

export async function signInAction(
  userData: SignInSchema
): Promise<ActionState> {
  try {
      const response = await fetch('http://localhost:5001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token
        localStorage.setItem('token', token)

        redirect('/home')
      } else {
        const errorData = await response.json()
        return { error: errorData.message || 'Login failed'}
      }
    } catch (e: unknown) {
      return { error: toErrorMessage(e) }
    }
}

export async function signUpAction(userData: SignUpSchema): Promise<ActionState> {
  const { email, password, username } = userData

  try {
      const response = await fetch('http://localhost:5001/auth/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password, username})
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token
        localStorage.setItem('token', token)

        redirect('/home')
      } else {
        const errorData = await response.json()
        return { error: errorData.message || 'Login failed'}
      }
    } catch (e: unknown) {
      return { error: toErrorMessage(e) }
    }
}