import { useState, useEffect } from 'react'

// Página de Ingredientes
// O backend só guarda o que foi comprado (quantidade, unidade, preço da embalagem).
// O custo por unidade (ex: R$ 0,02 por grama) é calculado aqui no frontend,
// dividindo o preço pago pela quantidade da embalagem.
function Ingredientes() {

  const [ingredientes, setIngredientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [busca, setBusca] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [ingredienteEditando, setIngredienteEditando] = useState(null) // null = criando novo

  const [form, setForm] = useState({
    nome: '',
    quantidadeEmbalagem: '',
    unidade: 'g',
    precoEmbalagem: ''
  })

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null)

  useEffect(() => {
    buscarIngredientes()
  }, [])

  async function buscarIngredientes() {
    try {
      setCarregando(true)
      const resposta = await fetch('http://localhost:8080/ingredientes')
      if (!resposta.ok) throw new Error('Erro ao buscar ingredientes')
      const dados = await resposta.json()
      setIngredientes(dados)
      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar os ingredientes. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNovo() {
    setIngredienteEditando(null)
    setForm({ nome: '', quantidadeEmbalagem: '', unidade: 'g', precoEmbalagem: '' })
    setModalAberto(true)
  }

  function abrirModalEditar(ingrediente) {
    setIngredienteEditando(ingrediente)
    setForm({
      nome: ingrediente.nome || '',
      quantidadeEmbalagem: ingrediente.quantidadeEmbalagem || '',
      unidade: ingrediente.unidade || 'g',
      precoEmbalagem: ingrediente.precoEmbalagem || ''
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setIngredienteEditando(null)
  }

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function salvarIngrediente(e) {
    e.preventDefault()

    if (!form.nome.trim()) {
      alert('O nome do ingrediente é obrigatório.')
      return
    }

    if (!form.quantidadeEmbalagem || Number(form.quantidadeEmbalagem) <= 0) {
      alert('Informe uma quantidade válida.')
      return
    }

    if (!form.precoEmbalagem || Number(form.precoEmbalagem) <= 0) {
      alert('Informe um preço válido.')
      return
    }

    try {
      const url = ingredienteEditando
        ? `http://localhost:8080/ingredientes/${ingredienteEditando.id}`
        : 'http://localhost:8080/ingredientes'

      const metodo = ingredienteEditando ? 'PUT' : 'POST'

      const payload = {
        nome: form.nome,
        quantidadeEmbalagem: Number(form.quantidadeEmbalagem),
        unidade: form.unidade,
        precoEmbalagem: Number(form.precoEmbalagem)
      }

      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!resposta.ok) throw new Error('Erro ao salvar ingrediente')

      await buscarIngredientes()
      fecharModal()
    } catch (err) {
      console.error(err)
      alert('Não foi possível salvar o ingrediente.')
    }
  }

  function pedirConfirmacaoExclusao(ingrediente) {
    setConfirmandoExclusao(ingrediente)
  }

  function cancelarExclusao() {
    setConfirmandoExclusao(null)
  }

  async function confirmarExclusao() {
    try {
      const resposta = await fetch(`http://localhost:8080/ingredientes/${confirmandoExclusao.id}`, {
        method: 'DELETE'
      })

      if (!resposta.ok) throw new Error('Erro ao excluir ingrediente')

      await buscarIngredientes()
      setConfirmandoExclusao(null)
    } catch (err) {
      console.error(err)
      alert('Não foi possível excluir o ingrediente.')
    }
  }

  // Calcula quanto custa 1 unidade (grama, ml, etc) desse ingrediente
  function calcularCustoPorUnidade(ingrediente) {
    if (!ingrediente.precoEmbalagem || !ingrediente.quantidadeEmbalagem) return 0
    return ingrediente.precoEmbalagem / ingrediente.quantidadeEmbalagem
  }

  function formatarMoeda(valor) {
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
  }

  function formatarCustoUnitario(ingrediente) {
    const custo = calcularCustoPorUnidade(ingrediente)
    // Preço por grama/ml costuma ser bem pequeno, então usamos 3 casas decimais
    return `${custo.toFixed(3).replace('.', ',')} / ${ingrediente.unidade}`
  }

  const ingredientesFiltrados = ingredientes.filter(ingrediente =>
    ingrediente.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  const totalIngredientes = ingredientes.length
  const totalInvestido = ingredientes.reduce((soma, i) => soma + (i.precoEmbalagem || 0), 0)

  return (
    <div className="ingredientes-container">

      {/* CABEÇALHO */}
      <div className="ingredientes-header">
        <div>
          <p className="ingredientes-subtitulo">Gerencie seus ingredientes</p>
          <h1>🥫 Ingredientes</h1>
          <p className="ingredientes-descricao">Cadastre os ingredientes usados na produção da Kenia Cake's</p>
        </div>
        <button className="btn-novo-ingrediente" onClick={abrirModalNovo}>
          + Novo Ingrediente
        </button>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="ingredientes-resumo">
        <div className="resumo-card">
          <span className="resumo-icone">🥫</span>
          <div>
            <p className="resumo-valor">{totalIngredientes}</p>
            <p className="resumo-label">Total de ingredientes</p>
          </div>
        </div>

        <div className="resumo-card">
          <span className="resumo-icone">💰</span>
          <div>
            <p className="resumo-valor">{formatarMoeda(totalInvestido)}</p>
            <p className="resumo-label">Total investido em compras</p>
          </div>
        </div>
      </div>

      {/* BUSCA */}
      <div className="ingredientes-busca">
        <input
          type="text"
          placeholder="🔍 Buscar por nome do ingrediente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* TABELA DE INGREDIENTES */}
      <div className="ingredientes-tabela-wrapper">
        {carregando && <p className="ingredientes-mensagem">Carregando ingredientes...</p>}

        {erro && <p className="ingredientes-mensagem ingredientes-erro">{erro}</p>}

        {!carregando && !erro && ingredientesFiltrados.length === 0 && (
          <p className="ingredientes-mensagem">Nenhum ingrediente encontrado.</p>
        )}

        {!carregando && !erro && ingredientesFiltrados.length > 0 && (
          <table className="ingredientes-table">
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Comprado</th>
                <th>Valor pago</th>
                <th>Custo por unidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ingredientesFiltrados.map(ingrediente => (
                <tr key={ingrediente.id}>
                  <td>
                    <strong>{ingrediente.nome}</strong>
                  </td>
                  <td>
                    {ingrediente.quantidadeEmbalagem} {ingrediente.unidade}
                  </td>
                  <td>{formatarMoeda(ingrediente.precoEmbalagem)}</td>
                  <td>
                    <span className="custo-unitario-badge">
                      {formatarCustoUnitario(ingrediente)}
                    </span>
                  </td>
                  <td>
                    <div className="ingredientes-acoes">
                      <button className="btn-icone editar" onClick={() => abrirModalEditar(ingrediente)} title="Editar">
                        ✏️
                      </button>
                      <button className="btn-icone excluir" onClick={() => pedirConfirmacaoExclusao(ingrediente)} title="Excluir">
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

      {/* MODAL - NOVO / EDITAR INGREDIENTE */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-ingrediente" onClick={(e) => e.stopPropagation()}>
            <h2>{ingredienteEditando ? 'Editar Ingrediente' : 'Novo Ingrediente'}</h2>

            <form onSubmit={salvarIngrediente}>
              <label>🥫 Nome do ingrediente</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                placeholder="Ex: Leite condensado"
                required
              />

              <div className="modal-ingrediente-linha">
                <div>
                  <label>📦 Quantidade comprada</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.quantidadeEmbalagem}
                    onChange={(e) => atualizarCampo('quantidadeEmbalagem', e.target.value)}
                    placeholder="Ex: 395"
                    required
                  />
                </div>

                <div>
                  <label>📏 Unidade</label>
                  <select
                    value={form.unidade}
                    onChange={(e) => atualizarCampo('unidade', e.target.value)}
                  >
                    <option value="g">g (gramas)</option>
                    <option value="kg">kg (quilos)</option>
                    <option value="ml">ml (mililitros)</option>
                    <option value="l">l (litros)</option>
                    <option value="unidade">unidade</option>
                  </select>
                </div>
              </div>

              <label>💰 Valor pago</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.precoEmbalagem}
                onChange={(e) => atualizarCampo('precoEmbalagem', e.target.value)}
                placeholder="Ex: 8.00"
                required
              />

              {/* Preview do custo por unidade, calculado em tempo real */}
              {form.quantidadeEmbalagem > 0 && form.precoEmbalagem > 0 && (
                <div className="preview-custo-unitario">
                  Custo por {form.unidade}:{' '}
                  <strong>
                    {formatarMoeda(Number(form.precoEmbalagem) / Number(form.quantidadeEmbalagem))}
                  </strong>
                </div>
              )}

              <div className="modal-botoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  ✓ Salvar Ingrediente
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
            <h3>Excluir ingrediente?</h3>
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

export default Ingredientes
