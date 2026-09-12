import { useState, useEffect } from 'react'
import { apiFetch } from '../config/api'

// Página de Receitas (Ficha Técnica)
// Cada receita tem uma lista de itens (ingrediente + quantidade usada) e um rendimento.
// O backend já calcula custoTotal, custoPorUnidade, precoSugerido, lucroPorUnidade e lucroTotal —
// aqui no frontend só exibimos esses valores prontos na listagem.
// No modal de criar/editar, fazemos um preview local (estimado) enquanto o usuário digita,
// porque o valor "oficial" só existe depois de salvar.
function Receitas() {

  const [receitas, setReceitas] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [sabores, setSabores] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [busca, setBusca] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [receitaEditando, setReceitaEditando] = useState(null) // null = criando nova

  const [form, setForm] = useState({
    saborId: '',
    rendimento: '',
    margemLucro: '',
    precoVenda: '',
    itens: [] // cada item: { ingredienteId, quantidadeUsada }
  })

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setCarregando(true)

      const [respostaReceitas, respostaIngredientes, respostaSabores] = await Promise.all([
        apiFetch(`/receitas`),
        apiFetch(`/ingredientes`),
        apiFetch(`/sabores`)
      ])

      if (!respostaReceitas.ok) throw new Error('Erro ao buscar receitas')
      if (!respostaIngredientes.ok) throw new Error('Erro ao buscar ingredientes')
      if (!respostaSabores.ok) throw new Error('Erro ao buscar sabores')

      const dadosReceitas = await respostaReceitas.json()
      const dadosIngredientes = await respostaIngredientes.json()
      const dadosSabores = await respostaSabores.json()

      setReceitas(dadosReceitas)
      setIngredientes(dadosIngredientes)
      setSabores(dadosSabores)
      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar as receitas. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNovo() {
    setReceitaEditando(null)
    setForm({
      saborId: '',
      rendimento: '',
      margemLucro: '',
      precoVenda: '',
      itens: []
    })
    setModalAberto(true)
  }

  function abrirModalEditar(receita) {
    setReceitaEditando(receita)
    setForm({
      saborId: receita.sabor?.id || '',
      rendimento: receita.rendimento || '',
      margemLucro: receita.margemLucro || '',
      precoVenda: receita.precoVenda || '',
      itens: (receita.itens || []).map(item => ({
        ingredienteId: item.ingrediente?.id || '',
        quantidadeUsada: item.quantidadeUsada || ''
      }))
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setReceitaEditando(null)
  }

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  function adicionarItem() {
    setForm(prev => ({
      ...prev,
      itens: [...prev.itens, { ingredienteId: '', quantidadeUsada: '' }]
    }))
  }

  function removerItem(index) {
    setForm(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }))
  }

  function atualizarItem(index, campo, valor) {
    setForm(prev => ({
      ...prev,
      itens: prev.itens.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      )
    }))
  }

  async function salvarReceita(e) {
    e.preventDefault()

    if (!form.saborId) {
      alert('Selecione o sabor desta receita.')
      return
    }

    if (!form.rendimento || Number(form.rendimento) <= 0) {
      alert('Informe o rendimento da receita (quantas unidades ela produz).')
      return
    }

    if (form.itens.length === 0) {
      alert('Adicione pelo menos um ingrediente na receita.')
      return
    }

    const itemIncompleto = form.itens.some(item => !item.ingredienteId || !item.quantidadeUsada)
    if (itemIncompleto) {
      alert('Preencha o ingrediente e a quantidade em todos os itens da receita.')
      return
    }

    try {
      const url = receitaEditando
        ? `/receitas/${receitaEditando.id}`
        : `/receitas`

      const metodo = receitaEditando ? 'PUT' : 'POST'

      const saborEscolhido = sabores.find(s => s.id === Number(form.saborId))

      const payload = {
        nome: saborEscolhido?.nome || '',
        sabor: { id: Number(form.saborId) },
        rendimento: Number(form.rendimento),
        margemLucro: form.margemLucro ? Number(form.margemLucro) : null,
        precoVenda: form.precoVenda ? Number(form.precoVenda) : null,
        itens: form.itens.map(item => ({
          ingrediente: { id: Number(item.ingredienteId) },
          quantidadeUsada: Number(item.quantidadeUsada)
        }))
      }

      const resposta = await apiFetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!resposta.ok) throw new Error('Erro ao salvar receita')

      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error(err)
      alert('Não foi possível salvar a receita.')
    }
  }

  function pedirConfirmacaoExclusao(receita) {
    setConfirmandoExclusao(receita)
  }

  function cancelarExclusao() {
    setConfirmandoExclusao(null)
  }

  async function confirmarExclusao() {
    try {
      const resposta = await apiFetch(`/receitas/${confirmandoExclusao.id}`, {
        method: 'DELETE'
      })

      if (!resposta.ok) throw new Error('Erro ao excluir receita')

      await carregarDados()
      setConfirmandoExclusao(null)
    } catch (err) {
      console.error(err)
      alert('Não foi possível excluir a receita.')
    }
  }

  function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return '-'
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
  }

  // Encontra o objeto completo do ingrediente a partir do id (usado no preview do modal)
  function buscarIngrediente(id) {
    return ingredientes.find(i => i.id === Number(id))
  }

  // Calcula o custo estimado de um item, do mesmo jeito que o backend calcula
  function calcularCustoItemPreview(item) {
    const ingrediente = buscarIngrediente(item.ingredienteId)
    if (!ingrediente || !item.quantidadeUsada) return 0

    const custoPorUnidade = ingrediente.precoEmbalagem / ingrediente.quantidadeEmbalagem
    return custoPorUnidade * Number(item.quantidadeUsada)
  }

  const custoTotalPreview = form.itens.reduce((soma, item) => soma + calcularCustoItemPreview(item), 0)
  const custoPorUnidadePreview = form.rendimento > 0 ? custoTotalPreview / Number(form.rendimento) : 0

  const receitasFiltradas = receitas.filter(receita =>
    receita.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  const totalReceitas = receitas.length
  const custoMedioPorUnidade = receitas.length > 0
    ? receitas.reduce((soma, r) => soma + (r.custoPorUnidade || 0), 0) / receitas.length
    : 0

  return (
    <div className="receitas-container">

      {/* CABEÇALHO */}
      <div className="receitas-header">
        <div>
          <p className="receitas-subtitulo">Gerencie suas fichas técnicas</p>
          <h1>📋 Receitas</h1>
          <p className="receitas-descricao">Monte a receita de cada sabor e veja o custo calculado automaticamente</p>
        </div>
        <button className="btn-nova-receita" onClick={abrirModalNovo}>
          + Nova Receita
        </button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="receitas-resumo">
        <div className="resumo-card">
          <span className="resumo-icone">📋</span>
          <div>
            <p className="resumo-valor">{totalReceitas}</p>
            <p className="resumo-label">Total de receitas</p>
          </div>
        </div>

        <div className="resumo-card">
          <span className="resumo-icone">💰</span>
          <div>
            <p className="resumo-valor">{formatarMoeda(custoMedioPorUnidade)}</p>
            <p className="resumo-label">Custo médio por unidade</p>
          </div>
        </div>
      </div>

      {/* BUSCA */}
      <div className="receitas-busca">
        <input
          type="text"
          placeholder="🔍 Buscar por nome da receita..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* LISTA DE RECEITAS */}
      <div className="receitas-lista">
        {carregando && <p className="receitas-mensagem">Carregando receitas...</p>}

        {erro && <p className="receitas-mensagem receitas-erro">{erro}</p>}

        {!carregando && !erro && receitasFiltradas.length === 0 && (
          <p className="receitas-mensagem">Nenhuma receita encontrada.</p>
        )}

        {!carregando && !erro && receitasFiltradas.map(receita => (
          <div className="receita-card" key={receita.id}>

            <div className="receita-card-topo">
              <div className="receita-card-info">
                <h3>
                  {receita.sabor
                    ? `${receita.sabor.produto?.nome ? receita.sabor.produto.nome + ' — ' : ''}${receita.sabor.nome}`
                    : receita.nome}
                </h3>
                <span className="receita-rendimento-badge">
                  Rende {receita.rendimento} {receita.rendimento === 1 ? 'unidade' : 'unidades'}
                </span>
              </div>

              <div className="receitas-acoes">
                <button className="btn-icone editar" onClick={() => abrirModalEditar(receita)} title="Editar">
                  ✏️
                </button>
                <button className="btn-icone excluir" onClick={() => pedirConfirmacaoExclusao(receita)} title="Excluir">
                  🗑️
                </button>
              </div>
            </div>

            {/* ITENS DA RECEITA */}
            {receita.itens?.length > 0 && (
              <table className="receita-itens-tabela">
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th>Qtd. usada</th>
                    <th>Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {receita.itens.map(item => (
                    <tr key={item.id}>
                      <td>{item.ingrediente?.nome}</td>
                      <td>{item.quantidadeUsada} {item.ingrediente?.unidade}</td>
                      <td>{formatarMoeda(item.custo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* RESULTADO DO CÁLCULO */}
            <div className="receita-resultado">
              <div className="receita-resultado-item">
                <span>Custo total</span>
                <strong>{formatarMoeda(receita.custoTotal)}</strong>
              </div>

              <div className="receita-resultado-item destaque">
                <span>Custo por unidade</span>
                <strong>{formatarMoeda(receita.custoPorUnidade)}</strong>
              </div>

              <div className="receita-resultado-item">
                <span>Preço sugerido</span>
                <strong>{formatarMoeda(receita.precoSugerido)}</strong>
              </div>

              {receita.precoVenda != null && (
                <>
                  <div className="receita-resultado-item">
                    <span>Preço de venda</span>
                    <strong>{formatarMoeda(receita.precoVenda)}</strong>
                  </div>

                  <div className="receita-resultado-item lucro">
                    <span>Lucro por unidade</span>
                    <strong>{formatarMoeda(receita.lucroPorUnidade)}</strong>
                  </div>
                </>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* MODAL - NOVA / EDITAR RECEITA */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-receita" onClick={(e) => e.stopPropagation()}>
            <h2>{receitaEditando ? 'Editar Receita' : 'Nova Receita'}</h2>

            <form onSubmit={salvarReceita}>
              <label>🍰 Sabor</label>
              <select
                value={form.saborId}
                onChange={(e) => atualizarCampo('saborId', e.target.value)}
                required
              >
                <option value="">Selecione um sabor</option>
                {sabores.map(sabor => (
                  <option key={sabor.id} value={sabor.id}>
                    {sabor.produto?.nome ? `${sabor.produto.nome} — ` : ''}{sabor.nome}
                  </option>
                ))}
              </select>

              <div className="modal-receita-linha">
                <div>
                  <label>📦 Rendimento (quantas unidades produz)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.rendimento}
                    onChange={(e) => atualizarCampo('rendimento', e.target.value)}
                    placeholder="Ex: 10"
                    required
                  />
                </div>

                <div>
                  <label>📈 Margem de lucro % (opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.margemLucro}
                    onChange={(e) => atualizarCampo('margemLucro', e.target.value)}
                    placeholder="Ex: 100"
                  />
                </div>
              </div>

              <label>💰 Preço de venda (opcional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.precoVenda}
                onChange={(e) => atualizarCampo('precoVenda', e.target.value)}
                placeholder="Ex: 15.00"
              />

              {/* ITENS DA RECEITA - tabela igual à Ficha Técnica da planilha */}
              <div className="modal-receita-itens">
                <div className="modal-receita-itens-header">
                  <label>🥫 Ingredientes usados</label>
                  <button type="button" className="btn-adicionar-item" onClick={adicionarItem}>
                    + Adicionar ingrediente
                  </button>
                </div>

                {form.itens.length === 0 && (
                  <p className="modal-receita-itens-vazio">Nenhum ingrediente adicionado ainda.</p>
                )}

                {form.itens.length > 0 && (
                  <div className="modal-receita-itens-tabela-wrapper">
                    <table className="modal-receita-itens-tabela">
                      <thead>
                        <tr>
                          <th>Ingrediente</th>
                          <th>Qtd. na embalagem</th>
                          <th>Custo da embalagem</th>
                          <th>Qtd. na receita</th>
                          <th>Custo na receita</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.itens.map((item, index) => {
                          const ingrediente = buscarIngrediente(item.ingredienteId)

                          return (
                            <tr key={index}>
                              <td>
                                <select
                                  value={item.ingredienteId}
                                  onChange={(e) => atualizarItem(index, 'ingredienteId', e.target.value)}
                                  required
                                >
                                  <option value="">Selecione</option>
                                  {ingredientes.map(ing => (
                                    <option key={ing.id} value={ing.id}>
                                      {ing.nome}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Esses dois campos são só referência (vêm do cadastro de Ingredientes) */}
                              <td className="modal-receita-item-referencia">
                                {ingrediente
                                  ? `${ingrediente.quantidadeEmbalagem} ${ingrediente.unidade}`
                                  : '-'}
                              </td>

                              <td className="modal-receita-item-referencia">
                                {ingrediente ? formatarMoeda(ingrediente.precoEmbalagem) : '-'}
                              </td>

                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={item.quantidadeUsada}
                                  onChange={(e) => atualizarItem(index, 'quantidadeUsada', e.target.value)}
                                  placeholder={ingrediente?.unidade || 'Qtd.'}
                                  required
                                />
                              </td>

                              <td className="modal-receita-item-custo">
                                {formatarMoeda(calcularCustoItemPreview(item))}
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="btn-remover-item"
                                  onClick={() => removerItem(index)}
                                  title="Remover"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* PREVIEW DO CÁLCULO */}
              {form.itens.length > 0 && (
                <div className="preview-custo-receita">
                  <div>
                    <span>Custo total estimado</span>
                    <strong>{formatarMoeda(custoTotalPreview)}</strong>
                  </div>
                  <div>
                    <span>Custo por unidade estimado</span>
                    <strong>{formatarMoeda(custoPorUnidadePreview)}</strong>
                  </div>
                </div>
              )}

              <div className="modal-botoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  ✓ Salvar Receita
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
            <h3>Excluir receita?</h3>
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

export default Receitas
