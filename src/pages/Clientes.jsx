import { useState, useEffect } from 'react'

// Componente da página de Clientes
// Segue o mesmo padrão visual e de conexão com o backend usado em Vendas.jsx
// Campos usados: nome e telefone (os únicos que existem em Cliente.java)
function Clientes() {

  // useState guarda informações que podem mudar na tela
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [busca, setBusca] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null) // null = está criando um novo cliente

  const [form, setForm] = useState({
    nome: '',
    telefone: ''
  })

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null) // guarda o cliente que será excluído

  // useEffect executa a busca de clientes assim que a página abre
  useEffect(() => {
    buscarClientes()
  }, [])

  // fetch é usado para conectar o frontend ao backend (API REST)
  async function buscarClientes() {
    try {
      setCarregando(true)
      const resposta = await fetch('http://localhost:8080/clientes')
      if (!resposta.ok) throw new Error('Erro ao buscar clientes')
      const dados = await resposta.json()
      setClientes(dados)
      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar os clientes. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNovo() {
    setClienteEditando(null)
    setForm({ nome: '', telefone: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(cliente) {
    setClienteEditando(cliente)
    setForm({
      nome: cliente.nome || '',
      telefone: cliente.telefone || ''
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setClienteEditando(null)
  }

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function salvarCliente(e) {
    e.preventDefault()

    if (!form.nome.trim()) {
      alert('O nome do cliente é obrigatório.')
      return
    }

    try {
      // Se estiver editando, usa PUT no cliente específico. Se for novo, usa POST.
      const url = clienteEditando
        ? `http://localhost:8080/clientes/${clienteEditando.id}`
        : 'http://localhost:8080/clientes'

      const metodo = clienteEditando ? 'PUT' : 'POST'

      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!resposta.ok) throw new Error('Erro ao salvar cliente')

      await buscarClientes() // atualiza a lista depois de salvar
      fecharModal()
    } catch (err) {
      console.error(err)
      alert('Não foi possível salvar o cliente.')
    }
  }

  function pedirConfirmacaoExclusao(cliente) {
    setConfirmandoExclusao(cliente)
  }

  function cancelarExclusao() {
    setConfirmandoExclusao(null)
  }

  async function confirmarExclusao() {
    try {
      const resposta = await fetch(`http://localhost:8080/clientes/${confirmandoExclusao.id}`, {
        method: 'DELETE'
      })

      if (!resposta.ok) throw new Error('Erro ao excluir cliente')

      await buscarClientes()
      setConfirmandoExclusao(null)
    } catch (err) {
      console.error(err)
      alert('Não foi possível excluir o cliente.')
    }
  }

  // Filtra os clientes pela busca (nome ou telefone)
  const clientesFiltrados = clientes.filter(cliente => {
    const termo = busca.toLowerCase()
    return (
      cliente.nome?.toLowerCase().includes(termo) ||
      cliente.telefone?.toLowerCase().includes(termo)
    )
  })

  // Valores usados nos cards de resumo
  const totalClientes = clientes.length
  const totalComTelefone = clientes.filter(c => c.telefone && c.telefone.trim() !== '').length

  function iniciais(nome) {
    if (!nome) return '?'
    return nome.trim().charAt(0).toUpperCase()
  }

  return (
    <div className="clientes-container">

      {/* CABEÇALHO */}
      <div className="clientes-header">
        <div>
          <p className="clientes-subtitulo">Gerencie seus clientes</p>
          <h1>👤 Clientes</h1>
          <p className="clientes-descricao">Cadastre e acompanhe todos os clientes da Kenia Cake's</p>
        </div>
        <button className="btn-novo-cliente" onClick={abrirModalNovo}>
          + Novo Cliente
        </button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="clientes-resumo">
        <div className="resumo-card">
          <span className="resumo-icone">👥</span>
          <div>
            <p className="resumo-valor">{totalClientes}</p>
            <p className="resumo-label">Total de clientes</p>
          </div>
        </div>

        <div className="resumo-card">
          <span className="resumo-icone">📱</span>
          <div>
            <p className="resumo-valor">{totalComTelefone}</p>
            <p className="resumo-label">Com telefone</p>
          </div>
        </div>
      </div>

      {/* BUSCA */}
      <div className="clientes-busca">
        <input
          type="text"
          placeholder="🔍 Buscar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA DE CLIENTES */}
      <div className="clientes-tabela-wrapper">
        {carregando && <p className="clientes-mensagem">Carregando clientes...</p>}

        {erro && <p className="clientes-mensagem clientes-erro">{erro}</p>}

        {!carregando && !erro && clientesFiltrados.length === 0 && (
          <p className="clientes-mensagem">Nenhum cliente encontrado.</p>
        )}

        {!carregando && !erro && clientesFiltrados.length > 0 && (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>
                    <div className="cliente-nome-avatar">
                      <span className="avatar">{iniciais(cliente.nome)}</span>
                      <span>{cliente.nome}</span>
                    </div>
                  </td>
                  <td>{cliente.telefone || '-'}</td>
                  <td>
                    <div className="clientes-acoes">
                      <button className="btn-icone editar" onClick={() => abrirModalEditar(cliente)} title="Editar">
                        ✏️
                      </button>
                      <button className="btn-icone excluir" onClick={() => pedirConfirmacaoExclusao(cliente)} title="Excluir">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL - NOVO / EDITAR CLIENTE */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-cliente" onClick={(e) => e.stopPropagation()}>
            <h2>{clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}</h2>

            <form onSubmit={salvarCliente}>
              <label>👤 Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                placeholder="Nome completo"
                required
              />

              <label>📱 Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => atualizarCampo('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />

              <div className="modal-botoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  ✓ Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - CONFIRMAR EXCLUSÃO */}
      {confirmandoExclusao && (
        <div className="modal-overlay" onClick={cancelarExclusao}>
          <div className="modal-confirmacao" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir cliente?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{confirmandoExclusao.nome}</strong>?
              Essa ação não pode ser desfeita.
            </p>
            <div className="modal-botoes">
              <button className="btn-cancelar" onClick={cancelarExclusao}>Cancelar</button>
              <button className="btn-excluir-confirmar" onClick={confirmarExclusao}>Excluir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Clientes