import Start from "../pages/Start";
import About from "../pages/About";
import Home from "../pages/Home";

export const privateRoutes = [
  {path: '/home', component: Home, exact: true}
]

export const publicRoutes = [
  {path: '/start', component: Start, exact: true},
  {path: '/about', component: About, exact: true},
]

export const getPathByComponent = (component, isPublic) => {
  if (isPublic) {
    const route = publicRoutes.find((el) => el.component === component)
    console.log(route.path)
    return route.path
  }
  const route = privateRoutes.find((el) => el.component === component)
  console.log(route.path)
  return route.path
}