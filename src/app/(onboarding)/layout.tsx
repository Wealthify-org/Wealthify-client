/**
 * Раньше тут был @modal parallel-slot для перехвата `/auth/sign-in` и
 * `/auth/sign-up`. Слот переехал на корневой layout (`src/app/layout.tsx`)
 * + `src/app/@modal/`, чтобы intercepting routes работали с любой
 * страницы приложения, а не только с `/`, `/home`, `/favorites`.
 *
 * Сам route-group `(onboarding)` оставлен для возможной будущей
 * лейаут-логики (например общий хедер для landing'а и онбординг-флоу).
 */
export default function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
