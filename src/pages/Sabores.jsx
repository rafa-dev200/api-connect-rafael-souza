import { useState, useEffect } from 'react'
import { apiFetch } from '../config/api'

// Página de Sabores
// Cada sabor pertence a um produto (relação @ManyToOne no backend)
// Por isso buscamos /sabores e /produtos juntos, e o modal tem um select de produto
function Sabores() {

  const [sabores, setSabores] = useState([])
  const [produtos, setProdutos] = useState([])
  const [receitas, setReceitas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [busca, setBusca] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [saborEditando, setSaborEditando] = useState(null) // null = criando novo

  const [form, setForm] = useState({
    nome: '',
    precoVenda: '',
    produtoId: ''
  })

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  // Busca sabores e produtos ao mesmo tempo com Promise.all
  async function carregarDados() {
    try {
      setCarregando(true)

      const [respostaSabores, respostaProdutos, respostaReceitas] = await Promise.all([
        apiFetch(`/sabores`),
        apiFetch(`/produtos`),
        apiFetch(`/receitas`)
      ])

      if (!respostaSabores.ok) throw new Error('Erro ao buscar sabores')
      if (!respostaProdutos.ok) throw new Error('Erro ao buscar produtos')
      if (!respostaReceitas.ok) throw new Error('Erro ao buscar receitas')

      const dadosSabores = await respostaSabores.json()
      const dadosProdutos = await respostaProdutos.json()
      const dadosReceitas = await respostaReceitas.json()

      setSabores(dadosSabores)
      setProdutos(dadosProdutos)
      setReceitas(dadosReceitas)
      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar os sabores. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNovo() {
    setSaborEditando(null)
    setForm({ nome: '', precoVenda: '', produtoId: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(sabor) {
    setSaborEditando(sabor)
    setForm({
      nome: sabor.nome || '',
      precoVenda: sabor.precoVenda || '',
      produtoId: sabor.produto?.id || ''
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setSaborEditando(null)
  }

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function salvarSabor(e) {
    e.preventDefault()

    if (!form.nome.trim()) {
      alert('O nome do sabor é obrigatório.')
      return
    }

    if (!form.precoVenda || Number(form.precoVenda) <= 0) {
      alert('Informe um preço de venda válido.')
      return
    }

    if (!form.produtoId) {
      alert('Selecione o produto deste sabor.')
      return
    }

    try {
      const url = saborEditando
        ? `/sabores/${saborEditando.id}`
        : `/sabores`

      const metodo = saborEditando ? 'PUT' : 'POST'

      // O backend espera o produto como objeto { id: X }, não como número solto
      const payload = {
        nome: form.nome,
        precoVenda: Number(form.precoVenda),
        produto: { id: Number(form.produtoId) }
      }

      const resposta = await apiFetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!resposta.ok) throw new Error('Erro ao salvar sabor')

      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error(err)
      alert('Não foi possível salvar o sabor.')
    }
  }

  function pedirConfirmacaoExclusao(sabor) {
    setConfirmandoExclusao(sabor)
  }

  function cancelarExclusao() {
    setConfirmandoExclusao(null)
  }

  async function confirmarExclusao() {
    try {
      const resposta = await apiFetch(`/sabores/${confirmandoExclusao.id}`, {
        method: 'DELETE'
      })

      if (!resposta.ok) throw new Error('Erro ao excluir sabor')

      await carregarDados()
      setConfirmandoExclusao(null)
    } catch (err) {
      console.error(err)
      alert('Não foi possível excluir o sabor.')
    }
  }

  function formatarPreco(valor) {
    if (valor === null || valor === undefined) return '-'
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
  }

  // Encontra a receita (ficha técnica) ligada a este sabor, se existir
  function buscarReceitaDoSabor(saborId) {
    return receitas.find(r => r.sabor?.id === saborId)
  }

  // Lucro = preço de venda do sabor - custo por unidade da receita
  function calcularLucro(sabor, receita) {
    if (!receita || receita.custoPorUnidade == null || sabor.precoVenda == null) return null
    return Number(sabor.precoVenda) - Number(receita.custoPorUnidade)
  }

  // Filtra pelo nome do sabor ou nome do produto
  const saboresFiltrados = sabores.filter(sabor => {
    const termo = busca.toLowerCase()
    return (
      sabor.nome?.toLowerCase().includes(termo) ||
      sabor.produto?.nome?.toLowerCase().includes(termo)
    )
  })

  // Cards de resumo
  const totalSabores = sabores.length
  const produtosComSabor = new Set(sabores.map(s => s.produto?.id)).size

  return (
    <div className="sabores-container">

      {/* CABEÇALHO */}
      <div className="sabores-header">
        <div>
          <p className="sabores-subtitulo">Gerencie os sabores dos produtos</p>
          <h1>🧁 Sabores</h1>
          <p className="sabores-descricao">Cadastre e acompanhe os sabores da Kenia Cake's</p>
        </div>
        <button className="btn-novo-sabor" onClick={abrirModalNovo}>
          + Novo Sabor
        </button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="sabores-resumo">
        <div className="resumo-card">
          <span className="resumo-icone">🧁</span>
          <div>
            <p className="resumo-valor">{totalSabores}</p>
            <p className="resumo-label">Total de sabores</p>
          </div>
        </div>

        <div className="resumo-card">
          <span className="resumo-icone">🍰</span>
          <div>
            <p className="resumo-valor">{produtosComSabor}</p>
            <p className="resumo-label">Produtos com sabor cadastrado</p>
          </div>
        </div>
      </div>

      {/* BUSCA */}
      <div className="sabores-busca">
        <input
          type="text"
          placeholder="🔍 Buscar por sabor ou produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA DE SABORES */}
      <div className="sabores-tabela-wrapper">
        {carregando && <p className="sabores-mensagem">Carregando sabores...</p>}

        {erro && <p className="sabores-mensagem sabores-erro">{erro}</p>}

        {!carregando && !erro && saboresFiltrados.length === 0 && (
          <p className="sabores-mensagem">Nenhum sabor encontrado.</p>
        )}

        {!carregando && !erro && saboresFiltrados.length > 0 && (
          <table className="sabores-table">
            <thead>
              <tr>
                <th>Sabor</th>
                <th>Produto</th>
                <th>Preço de venda</th>
                <th>Custo por unidade</th>
                <th>Lucro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {saboresFiltrados.map(sabor => {
                const receita = buscarReceitaDoSabor(sabor.id)
                const lucro = calcularLucro(sabor, receita)

                return (
                  <tr key={sabor.id}>
                    <td>
                      <strong>{sabor.nome}</strong>
                    </td>
                    <td>
                      <span className="produto-badge">{sabor.produto?.nome || '-'}</span>
                    </td>
                    <td>
                      <span className="preco-valor">{formatarPreco(sabor.precoVenda)}</span>
                    </td>
                    <td>
                      {receita ? formatarPreco(receita.custoPorUnidade) : '-'}
                    </td>
                    <td>
                      {lucro !== null ? formatarPreco(lucro) : '-'}
                    </td>
                    <td>
                      <div className="sabores-acoes">
                        <button className="btn-icone editar" onClick={() => abrirModalEditar(sabor)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icone excluir" onClick={() => pedirConfirmacaoExclusao(sabor)} title="Excluir">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL - NOVO / EDITAR SABOR */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-sabor" onClick={(e) => e.stopPropagation()}>
            <h2>{saborEditando ? 'Editar Sabor' : 'Novo Sabor'}</h2>

            <form onSubmit={salvarSabor}>
              <label>🧁 Nome do sabor</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                placeholder="Ex: Chocolate"
                required
              />

              <label>🍰 Produto</label>
              <select
                value={form.produtoId}
                onChange={(e) => atualizarCampo('produtoId', e.target.value)}
                required
              >
                <option value="">Selecione um produto</option>
                {produtos.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>

              <label>💰 Preço de venda</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.precoVenda}
                onChange={(e) => atualizarCampo('precoVenda', e.target.value)}
                placeholder="Ex: 17.00"
                required
              />

              <div className="modal-botoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  ✓ Salvar Sabor
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
            <h3>Excluir sabor?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{confirmandoExclusao.nome}</strong> do produto{' '}
              <strong>{confirmandoExclusao.produto?.nome}</strong>? Essa ação não pode ser desfeita.
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

export default Sabores
