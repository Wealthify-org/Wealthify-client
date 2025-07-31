import React from 'react'
import './styles/App.css'
import './styles/Start.css'
import './styles/Unknown.css'
import './styles/Home.css'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './components/AppRouter'

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
