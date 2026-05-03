import { NEXT_API } from "@/lib/apiEndpoints";

export async function logoutClient(): Promise<void> {
  try {
    await fetch(NEXT_API.LOGOUT, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    // ignore — front state cleanup is the caller's responsibility
  }
}
