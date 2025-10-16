"use server"

import { SignInSchema, SignUpSchema } from "@/lib/types/auth-types"
import { toErrorMessage } from "@/lib/errors"
import { setAuthCookiesFromResponse } from "@/lib/auth-cookies"
import { API_ENDPOINTS } from "../lib/apiEndpoints"
import { tokenStore } from "../stores/tokenStore/TokenStore"
import { currentUserStore } from "@/stores/currentUser/CurrentUserStore"
import { use } from "react"
import { toUserPublic, UserPublic } from "@/lib/types/user"

type ActionState = { ok: boolean; error?: string | null }

export async function signInAction(
  userData: SignInSchema
): Promise<ActionState> {
  try {
      const response = await fetch(API_ENDPOINTS.SIGN_IN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        cache: "no-store"
      })

      if (!response.ok) {
        const err = await safeJson(response)
        return { ok: false, error: err?.message ?? "Login failed" }
      }

      const { accessToken, user } = await response.json() as { accessToken: string; user: any };
      tokenStore.setFromLogin(accessToken);

      const publicUser = toUserPublic(user)
      currentUserStore.setUser(publicUser)

      await setAuthCookiesFromResponse(response);

      return { ok: true}
    } catch (e: unknown) {
      return { ok: false, error: toErrorMessage(e) }
    }
}

export async function signUpAction(userData: SignUpSchema): Promise<ActionState> {
  try {
    const response = await fetch(API_ENDPOINTS.SIGN_UP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
      cache: "no-store",
    })

    if (!response.ok) {
      const err = await safeJson(response)
      return { ok: false, error: err?.message ?? "Registration failed" }
    }

    const { accessToken, user } = await response.json() as { accessToken: string; user: any };
    tokenStore.setFromLogin(accessToken);

    const publicUser = toUserPublic(user)
    currentUserStore.setUser(publicUser)

    await setAuthCookiesFromResponse(response);

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
