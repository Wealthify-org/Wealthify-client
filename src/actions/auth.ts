"use server"

import { SignInSchema, SignUpSchema } from "@/lib/types/auth-types"
import { toErrorMessage } from "@/lib/errors"
import { setAuthCookiesFromResponse } from "@/lib/auth/auth-cookies"
import { API_ENDPOINTS } from "../lib/apiEndpoints"
import { toUserPublic, UserPublic } from "@/lib/types/user"

type Ok = {
  ok: true;
  user: UserPublic;
  accessToken?: string;
}
type Fail = {
  ok: false;
  error: string;
}
type ActionState = Ok | Fail

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

      const { user } = await response.json() as { user: any };

      const authHeader = response.headers.get("Authorization") ?? response.headers.get("authorization");

      if (!authHeader) {
        throw new Error("No Authorization header in refresh response");
      }

      const [scheme, token] = authHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new Error("Invalid Authorization header format");
      }

      const accessToken = token;

      const publicUser = toUserPublic(user)
      await setAuthCookiesFromResponse(response);
      
      return { ok: true, user: publicUser, accessToken}
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

    const { user } = await response.json() as { user: any };
    const accessToken = getAccessTokenFromHeaders(response);
    
    const publicUser = toUserPublic(user)

    await setAuthCookiesFromResponse(response);

    return { ok: true, user: publicUser, accessToken }
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

function getAccessTokenFromHeaders(res: Response): string | undefined {
  const auth = res.headers.get('Authorization');
  if (!auth) return undefined;
  return auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
}
