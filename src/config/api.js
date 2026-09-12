// URL base da API do backend.
// Em desenvolvimento, vem do .env (VITE_API_URL=http://localhost:8080).
// Em produção (Vercel), é configurada como variável de ambiente do projeto,
// apontando para o backend hospedado (ex: Render).
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Wrapper em volta do fetch nativo: adiciona o token de login em toda
// chamada à API, e desloga automaticamente se o backend responder 401
// (token ausente, inválido ou expirado).
export async function apiFetch(caminho, opcoes = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...(opcoes.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers })

  if (resposta.status === 401) {
    localStorage.removeItem('token')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return resposta
}
