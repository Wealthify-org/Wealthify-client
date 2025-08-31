import type { ComponentType } from "react";

import Start from "../pages/Start/Start";
import About from "../pages/About";
import Home from "../pages/Home";

export type RouteComponent = ComponentType<Record<string, unknown>>

export type RouteItem = {
  path: string
  component: RouteComponent
}

export const privateRoutes: RouteItem[] = [
  { path: '/home', component: Home }
]

export const publicRoutes: RouteItem[] = [
  { path: '/start', component: Start },
  { path: '/about', component: About }
]

export function getPathByComponent(
  component: RouteComponent,
  isPublic: boolean
): string {
  const routes = isPublic ? publicRoutes : privateRoutes
  const foundRoute = routes.find((el) => el.component === component)

  if (!foundRoute) {
    throw new Error('Route for provided component is not found')
  }

  return foundRoute.path
}