import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

function Login() {
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')

    try {
      setEntrando(true)

      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      })

      if (!resposta.ok) {
        setErro('Usuário ou senha inválidos.')
        return
      }

      const dados = await resposta.json()
      localStorage.setItem('token', dados.token)
      navigate('/')
    } catch (err) {
      console.error(err)
      setErro('Não foi possível conectar ao backend.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <span>🍰</span>
          <h1>Kenia Cake's</h1>
          <p>Gestão inteligente</p>
        </div>

        <form onSubmit={entrar}>
          <label>👤 Usuário</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Seu usuário"
            required
            autoFocus
          />

          <label>🔒 Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            required
          />

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" className="login-botao" disabled={entrando}>
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
