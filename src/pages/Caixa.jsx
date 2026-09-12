import { useState, useEffect } from 'react'

// Página de Caixa
// O backend já calcula um resumo financeiro completo em /caixa/resumo (saldo, a receber, despesas...).
// Aqui só listamos as movimentações (/caixa) e permitimos lançar novas entradas/saídas manuais,
// como despesas e sangrias — pagamentos de vendas já entram automaticamente pelo backend.
function Caixa() {

  const [movimentacoes, setMovimentacoes] = useState([])
  const [resumo, setResumo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    valor: '',
    tipo: 'DESPESA',
    descricao: '',
    formaPagamento: 'PIX'
  })

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setCarregando(true)

      const [respostaMovimentacoes, respostaResumo] = await Promise.all([
        fetch('http://localhost:8080/caixa'),
        fetch('http://localhost:8080/caixa/resumo')
      ])

      if (!respostaMovimentacoes.ok) throw new Error('Erro ao buscar movimentações')
      if (!respostaResumo.ok) throw new Error('Erro ao buscar resumo do caixa')

      const dadosMovimentacoes = await respostaMovimentacoes.json()
      const dadosResumo = await respostaResumo.json()

      // Mais recente primeiro
      dadosMovimentacoes.sort((a, b) =>
        new Date(b.dataMovimentacao) - new Date(a.dataMovimentacao)
      )

      setMovimentacoes(dadosMovimentacoes)
      setResumo(dadosResumo)
      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar o caixa. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNovo() {
    setForm({ valor: '', tipo: 'DESPESA', descricao: '', formaPagamento: 'PIX' })
    setModalAberto(true)
  }

  function fecharModal() {
    if (!salvando) {
      setModalAberto(false)
    }
  }

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
  }

  async function salvarMovimentacao(e) {
    e.preventDefault()

    if (!form.valor || Number(form.valor) <= 0) {
      alert('Informe um valor válido.')
      return
    }

    if (!form.descricao.trim()) {
      alert('Informe uma descrição para a movimentação.')
      return
    }

    try {
      setSalvando(true)

      const payload = {
        valor: Number(form.valor),
        tipo: form.tipo,
        descricao: form.descricao,
        formaPagamento: form.formaPagamento
      }

      const resposta = await fetch('http://localhost:8080/caixa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!resposta.ok) throw new Error('Erro ao salvar movimentação')

      await carregarDados()
      setModalAberto(false)
    } catch (err) {
      console.error(err)
      alert('Não foi possível salvar a movimentação.')
    } finally {
      setSalvando(false)
    }
  }

  function pedirConfirmacaoExclusao(movimentacao) {
    setConfirmandoExclusao(movimentacao)
  }

  function cancelarExclusao() {
    setConfirmandoExclusao(null)
  }

  async function confirmarExclusao() {
    try {
      const resposta = await fetch(`http://localhost:8080/caixa/${confirmandoExclusao.id}`, {
        method: 'DELETE'
      })

      if (!resposta.ok) throw new Error('Erro ao excluir movimentação')

      await carregarDados()
      setConfirmandoExclusao(null)
    } catch (err) {
      console.error(err)
      alert('Não foi possível excluir a movimentação.')
    }
  }

  function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return '-'
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
  }

  function formatarData(data) {
    if (!data) return '-'
    try {
      return new Date(data).toLocaleString('pt-BR')
    } catch {
      return data
    }
  }

  function classeTipo(tipo) {
    if (tipo === 'ENTRADA') return 'entrada'
    if (tipo === 'DESPESA') return 'despesa'
    return 'sangria'
  }

  function rotuloTipo(tipo) {
    if (tipo === 'ENTRADA') return '↑ Entrada'
    if (tipo === 'DESPESA') return '↓ Despesa'
    return '↓ Sangria'
  }

  return (
    <div className="caixa-container">

      {/* CABEÇALHO */}
      <div className="caixa-header">
        <div>
          <p className="caixa-subtitulo">Acompanhe o fluxo financeiro</p>
          <h1>💰 Caixa</h1>
          <p className="caixa-descricao">Entradas, saídas e o saldo real da Kenia Cake's</p>
        </div>
        <button className="btn-nova-movimentacao" onClick={abrirModalNovo}>
          + Nova Movimentação
        </button>
      </div>

      {carregando && <p className="caixa-mensagem">Carregando caixa...</p>}

      {erro && <p className="caixa-mensagem caixa-erro">{erro}</p>}

      {!carregando && !erro && resumo && (
        <>
          {/* CARDS DE RESUMO */}
          <div className="caixa-resumo">
            <div className="resumo-card destaque-saldo">
              <span className="resumo-icone">💰</span>
              <div>
                <p className="resumo-valor">{formatarMoeda(resumo.saldoAtual)}</p>
                <p className="resumo-label">Saldo atual</p>
              </div>
            </div>

            <div className="resumo-card">
              <span className="resumo-icone">💵</span>
              <div>
                <p className="resumo-valor">{formatarMoeda(resumo.recebido)}</p>
                <p className="resumo-label">Recebido</p>
              </div>
            </div>

            <div className="resumo-card">
              <span className="resumo-icone">⏳</span>
              <div>
                <p className="resumo-valor">{formatarMoeda(resumo.aReceber)}</p>
                <p className="resumo-label">A receber</p>
              </div>
            </div>

            <div className="resumo-card">
              <span className="resumo-icone">🛒</span>
              <div>
                <p className="resumo-valor">{formatarMoeda(resumo.totalVendido)}</p>
                <p className="resumo-label">Total vendido</p>
              </div>
            </div>

            <div className="resumo-card">
              <span className="resumo-icone">📤</span>
              <div>
                <p className="resumo-valor">{formatarMoeda(resumo.despesas)}</p>
                <p className="resumo-label">Despesas</p>
              </div>
            </div>

            <div className="resumo-card">
              <span className="resumo-icone">🏧</span>
              <div>
                <p className="resumo-valor">{formatarMoeda(resumo.sangrias)}</p>
                <p className="resumo-label">Sangrias</p>
              </div>
            </div>
          </div>

          {/* HISTÓRICO */}
          <div className="caixa-historico">
            <div className="box-header">
              <div>
                <h2>Movimentações</h2>
                <p>Todas as entradas e saídas registradas</p>
              </div>
              <button className="refresh-button" onClick={carregarDados}>
                🔄 Atualizar
              </button>
            </div>

            {movimentacoes.length === 0 ? (
              <div className="empty-state">
                <span>💰</span>
                <h2>Nenhuma movimentação encontrada</h2>
                <p>Clique em Nova Movimentação para registrar uma despesa ou sangria.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="caixa-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Forma de pagamento</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoes.map(movimentacao => (
                      <tr key={movimentacao.id}>
                        <td>
                          <span className={`tipo-badge ${classeTipo(movimentacao.tipo)}`}>
                            {rotuloTipo(movimentacao.tipo)}
                          </span>
                        </td>
                        <td>{movimentacao.descricao || '-'}</td>
                        <td>{movimentacao.formaPagamento || '-'}</td>
                        <td className="valor-cell">
                          <strong>{formatarMoeda(movimentacao.valor)}</strong>
                        </td>
                        <td>{formatarData(movimentacao.dataMovimentacao)}</td>
                        <td>
                          <button
                            className="btn-icone excluir"
                            onClick={() => pedirConfirmacaoExclusao(movimentacao)}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL - NOVA MOVIMENTAÇÃO */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-caixa" onClick={(e) => e.stopPropagation()}>
            <h2>💰 Nova Movimentação</h2>

            <form onSubmit={salvarMovimentacao}>
              <label>📋 Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => atualizarCampo('tipo', e.target.value)}
              >
                <option value="DESPESA">Despesa</option>
                <option value="SANGRIA">Sangria (retirada)</option>
                <option value="ENTRADA">Entrada</option>
              </select>

              <label>📝 Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
                placeholder="Ex: Compra de embalagens"
                required
              />

              <div className="modal-caixa-linha">
                <div>
                  <label>💰 Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.valor}
                    onChange={(e) => atualizarCampo('valor', e.target.value)}
                    placeholder="Ex: 30.00"
                    required
                  />
                </div>

                <div>
                  <label>💳 Forma de pagamento</label>
                  <select
                    value={form.formaPagamento}
                    onChange={(e) => atualizarCampo('formaPagamento', e.target.value)}
                  >
                    <option value="PIX">PIX</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CARTAO">Cartão</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                  </select>
                </div>
              </div>

              <div className="modal-botoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal} disabled={salvando}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar" disabled={salvando}>
                  {salvando ? 'Salvando...' : '✓ Salvar Movimentação'}
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
            <h3>Excluir movimentação?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{confirmandoExclusao.descricao}</strong>?
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

export default Caixa
