import { Navigate, Route, Routes } from "react-router-dom"
import Unknown from "../pages/Unknown"
import { publicRoutes, privateRoutes, type RouteItem } from "../router/routes"

const AppRouter = () => {
  return (
    <Routes>
      {/* редирект с корня на старт */}
      <Route path="/" element={<Navigate to='/start' replace />} />

      {/* приватные руты */}
      {privateRoutes.map(({ path, component: Component }: RouteItem) => (
        <Route key={path} path={path} element={<Component />} />
      ))}

      {/* публичные руты */}
      {publicRoutes.map(({ path, component: Component }: RouteItem) => (
        <Route key={path} path={path} element={<Component />} />
      ))}

      {/* 404 */}
      <Route path="*" element={<Unknown />} />
    </Routes>
  )
}

export default AppRouter