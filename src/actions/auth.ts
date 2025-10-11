'use server'

import { SignInSchema, SignUpSchema } from "@/lib/types/auth-types"
import { redirect } from "next/navigation"
import { toErrorMessage } from "@/lib/errors"
import { setAuthCookiesFromResponse } from "@/lib/auth-cookies"

type ActionState = { ok: boolean; error?: string | null }

const API = 'http://localhost:5001'

export async function signInAction(
  userData: SignInSchema
): Promise<ActionState> {
  try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        cache: 'no-store'
      })

      if (!response.ok) {
        const err = await safeJson(response)
        return { ok: false, error: err?.message ?? 'Login failed' }
      }

      await setAuthCookiesFromResponse(response)
      return { ok: true}
    } catch (e: unknown) {
      return { ok: false, error: toErrorMessage(e) }
    }
}

export async function signUpAction(userData: SignUpSchema): Promise<ActionState> {
  try {
    const response = await fetch(`${API}/auth/registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
      cache: 'no-store',
    })

    if (!response.ok) {
      const err = await safeJson(response)
      return { ok: false, error: err?.message ?? 'Registration failed' }
    }

    await setAuthCookiesFromResponse(response)

    return { ok: true }
    } catch (e: unknown) {
      return { ok: false, error: toErrorMessage(e) }
    }
}

const safeJson = async (res: Response) => {
  try {
    return await res.json()
  } catch {
    return null
  }
}
