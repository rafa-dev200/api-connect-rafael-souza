import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.jpg'
import { apiFetch } from '../config/api'

function Sidebar() {
  const navigate = useNavigate()

  async function sair() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error(err)
    } finally {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const menuItems = [
    { nome: 'Dashboard', icone: '📊', caminho: '/' },
    { nome: 'Vendas', icone: '🛒', caminho: '/vendas' },
    { nome: 'Clientes', icone: '👥', caminho: '/clientes' },
    { nome: 'Produtos', icone: '🍰', caminho: '/produtos' },
    { nome: 'Sabores', icone: '🧁', caminho: '/sabores' },
    { nome: 'Ingredientes', icone: '🥫', caminho: '/ingredientes' },
    { nome: 'Receitas', icone: '📋', caminho: '/receitas' },
    { nome: 'Caixa', icone: '💰', caminho: '/caixa' },
    { nome: 'Relatórios', icone: '📈', caminho: '/relatorios' },
  ]

  return (
    <aside className="sidebar">

      <div className="logo">
        <img
          src={logo}
          alt="Logo Kenia Cake's"
          className="logo-image"
        />

        <div className="logo-text">
          <h2>Kenia Cake's</h2>
          <span>Gestão inteligente</span>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.caminho}
            to={item.caminho}
            className={({ isActive }) =>
              isActive ? 'menu-item active' : 'menu-item'
            }
          >
            <span className="menu-icon">
              {item.icone}
            </span>

            <span className="menu-name">
              {item.nome}
            </span>
          </NavLink>
        ))}
      </nav>

      <button className="menu-item logout-button" onClick={sair}>
        <span className="menu-icon">🚪</span>
        <span className="menu-name">Sair</span>
      </button>

      <div className="sidebar-footer">
        <p>Versão 1.0</p>
        <span>Kenia Cake's</span>
      </div>

    </aside>
  )
}

export default Sidebar