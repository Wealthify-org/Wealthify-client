'use server'

import { cookies } from "next/headers"
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE_TTL, REFRESH_TOKEN_COOKIE_TTL } from "./auth-cookie-constants"

const isProd = process.env.NODE_ENV === 'production'

export const setAuthCookiesFromResponse = async (res: Response) => {
  const setCookies = getSetCookieList(res)
  if (setCookies.length === 0) {
    return
  }

  const access = extractCookieValue(setCookies, ACCESS_TOKEN_COOKIE)
  const refresh = extractCookieValue(setCookies, REFRESH_TOKEN_COOKIE)

  const jar = await cookies()

  if (access) {
    jar.set(ACCESS_TOKEN_COOKIE, access,  {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd, 
      path: '/',
      maxAge: ACCESS_TOKEN_COOKIE_TTL, 
    })
  }

  if (refresh) {
    jar.set(REFRESH_TOKEN_COOKIE, refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/auth',
      maxAge: REFRESH_TOKEN_COOKIE_TTL,
    })
  }
}

export const clearAuthCookies = async () => {
  const jar = await cookies()
  jar.delete(ACCESS_TOKEN_COOKIE)

  jar.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/auth',
    maxAge: 0,
  })
}

export const getAccessTokenFromJar = async () => {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null
}
export const getRefreshTokenFromJar = async () => {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value ?? null
}


const getSetCookieList = (res: Response): string[] => {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] }
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie()
  }

  const list: string[] = []
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      list.push(value)
    }
  })

  if (list.length === 0) {
    const single = res.headers.get('set-cookie')
    if (single) {
      list.push(single)
    }
  }

  return list
}

const extractCookieValue = (cookieHeaderList: string[], targetCookieName: string): string | null => {
  const cookieValueRegex = new RegExp(`^${targetCookieName}=([^;]+)`, 'i')
  for (const cookieHeader of cookieHeaderList) {
    const match = cookieValueRegex.exec(cookieHeader.trim())
    if (match) return match[1]
  }
  return null
}