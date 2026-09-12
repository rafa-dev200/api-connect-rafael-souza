import { useState, useEffect } from 'react'
import { apiFetch } from '../config/api'

// Página de Produtos
// Cada produto pode ter vários sabores (relacionamento feito no backend pela entidade Sabor)
// Aqui buscamos /produtos e /sabores juntos pra mostrar os sabores de cada produto na lista
function Produtos() {

  const [produtos, setProdutos] = useState([])
  const [sabores, setSabores] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [busca, setBusca] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null) // null = criando novo

  const [form, setForm] = useState({
    nome: ''
  })

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null)

  // useEffect busca produtos e sabores assim que a página abre
  useEffect(() => {
    carregarDados()
  }, [])

  // Promise.all busca as duas listas ao mesmo tempo, em vez de uma depois da outra
  async function carregarDados() {
    try {
      setCarregando(true)

      const [respostaProdutos, respostaSabores] = await Promise.all([
        apiFetch(`/produtos`),
        apiFetch(`/sabores`)
      ])

      if (!respostaProdutos.ok) throw new Error('Erro ao buscar produtos')
      if (!respostaSabores.ok) throw new Error('Erro ao buscar sabores')

      const dadosProdutos = await respostaProdutos.json()
      const dadosSabores = await respostaSabores.json()

      setProdutos(dadosProdutos)
      setSabores(dadosSabores)
      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar os produtos. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNovo() {
    setProdutoEditando(null)
    setForm({ nome: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(produto) {
    setProdutoEditando(produto)
    setForm({ nome: produto.nome || '' })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setProdutoEditando(null)
  }

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function salvarProduto(e) {
    e.preventDefault()

    if (!form.nome.trim()) {
      alert('O nome do produto é obrigatório.')
      return
    }

    try {
      const url = produtoEditando
        ? `/produtos/${produtoEditando.id}`
        : `/produtos`

      const metodo = produtoEditando ? 'PUT' : 'POST'

      const resposta = await apiFetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!resposta.ok) throw new Error('Erro ao salvar produto')

      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error(err)
      alert('Não foi possível salvar o produto.')
    }
  }

  function pedirConfirmacaoExclusao(produto) {
    setConfirmandoExclusao(produto)
  }

  function cancelarExclusao() {
    setConfirmandoExclusao(null)
  }

  async function confirmarExclusao() {
    try {
      const resposta = await apiFetch(`/produtos/${confirmandoExclusao.id}`, {
        method: 'DELETE'
      })

      if (!resposta.ok) throw new Error('Erro ao excluir produto')

      await carregarDados()
      setConfirmandoExclusao(null)
    } catch (err) {
      console.error(err)
      alert('Não foi possível excluir o produto. Verifique se ele não possui sabores cadastrados.')
    }
  }

  // Retorna a lista de sabores que pertencem a um produto específico
  function saboresDoProduto(produtoId) {
    return sabores.filter(sabor => sabor.produto?.id === produtoId)
  }

  // Filtra os produtos pela busca (só por nome)
  const produtosFiltrados = produtos.filter(produto =>
    produto.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  // Cards de resumo
  const totalProdutos = produtos.length
  const totalSabores = sabores.length

  return (
    <div className="produtos-container">

      {/* CABEÇALHO */}
      <div className="produtos-header">
        <div>
          <p className="produtos-subtitulo">Gerencie seus produtos</p>
          <h1>🍰 Produtos</h1>
          <p className="produtos-descricao">Cadastre e acompanhe todos os produtos da Kenia Cake's</p>
        </div>
        <button className="btn-novo-produto" onClick={abrirModalNovo}>
          + Novo Produto
        </button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="produtos-resumo">
        <div className="resumo-card">
          <span className="resumo-icone">🍰</span>
          <div>
            <p className="resumo-valor">{totalProdutos}</p>
            <p className="resumo-label">Total de produtos</p>
          </div>
        </div>

        <div className="resumo-card">
          <span className="resumo-icone">🧁</span>
          <div>
            <p className="resumo-valor">{totalSabores}</p>
            <p className="resumo-label">Sabores cadastrados</p>
          </div>
        </div>
      </div>

      {/* BUSCA */}
      <div className="produtos-busca">
        <input
          type="text"
          placeholder="🔍 Buscar por nome do produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* LISTA DE PRODUTOS */}
      <div className="produtos-lista">
        {carregando && <p className="produtos-mensagem">Carregando produtos...</p>}

        {erro && <p className="produtos-mensagem produtos-erro">{erro}</p>}

        {!carregando && !erro && produtosFiltrados.length === 0 && (
          <p className="produtos-mensagem">Nenhum produto encontrado.</p>
        )}

        {!carregando && !erro && produtosFiltrados.map(produto => {
          const saboresDesteProduto = saboresDoProduto(produto.id)

          return (
            <div className="produto-card" key={produto.id}>
              <div className="produto-card-topo">
                <div className="produto-card-info">
                  <h3>{produto.nome}</h3>
                  <span className="produto-card-qtd-sabores">
                    {saboresDesteProduto.length} {saboresDesteProduto.length === 1 ? 'sabor' : 'sabores'}
                  </span>
                </div>

                <div className="produtos-acoes">
                  <button className="btn-icone editar" onClick={() => abrirModalEditar(produto)} title="Editar">
                    ✏️
                  </button>
                  <button className="btn-icone excluir" onClick={() => pedirConfirmacaoExclusao(produto)} title="Excluir">
                    🗑️
                  </button>
                </div>
              </div>

              {saboresDesteProduto.length > 0 && (
                <div className="produto-sabores-lista">
                  {saboresDesteProduto.map(sabor => (
                    <span className="sabor-badge" key={sabor.id}>
                      {sabor.nome}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL - NOVO / EDITAR PRODUTO */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-produto" onClick={(e) => e.stopPropagation()}>
            <h2>{produtoEditando ? 'Editar Produto' : 'Novo Produto'}</h2>

            <form onSubmit={salvarProduto}>
              <label>🍰 Nome do produto</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                placeholder="Ex: Bolo de Pote"
                required
              />

              <div className="modal-botoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  ✓ Salvar Produto
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
            <h3>Excluir produto?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{confirmandoExclusao.nome}</strong>?
              {saboresDoProduto(confirmandoExclusao.id).length > 0 && (
                <> Esse produto possui sabores cadastrados que também podem ser afetados.</>
              )}
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

export default Produtos
