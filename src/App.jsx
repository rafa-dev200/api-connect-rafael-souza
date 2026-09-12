import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Vendas from './pages/Vendas'
import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Sabores from './pages/Sabores'
import Ingredientes from './pages/Ingredientes'
import Receitas from './pages/Receitas'
import Caixa from './pages/Caixa'
import Relatorios from './pages/Relatorios'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">

        <Sidebar />

        <main className="main-content">
          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/vendas"
              element={<Vendas />}
            />

            <Route
              path="/clientes"
              element={<Clientes />}
            />

            <Route
              path="/produtos"
              element={<Produtos />}
            />

            <Route
              path="/sabores"
              element={<Sabores />}
            />

            <Route
              path="/ingredientes"
              element={<Ingredientes />}
            />

            <Route
              path="/receitas"
              element={<Receitas />}
            />

            <Route
              path="/caixa"
              element={<Caixa />}
            />

            <Route
              path="/relatorios"
              element={<Relatorios />}
            />

          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

export default App
