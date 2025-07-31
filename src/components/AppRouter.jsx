import React from "react";
import { Navigate, Route, Routes } from 'react-router-dom'
import Unknown from "../pages/Unknown";
import { publicRoutes, privateRoutes } from "../router/routes";

const AppRouter = () => {
  return (
    <Routes>

      <Route path="/" element={<Navigate to='/start' replace />} />

      {privateRoutes.map(route =>
        <Route
          path={route.path}
          element={<route.component />}
          exact={route.exact}
          key={route.path}
        />
      )}
      {publicRoutes.map(route => 
        <Route 
          path={route.path}
          element={<route.component />}
          exact={route.exact}
          key={route.path}
        />
      )}
      <Route path='*' element={<Unknown />} key='*' />
    </Routes>
  )
}

export default AppRouter