import { useState, useEffect } from 'react'
import { apiFetch } from '../config/api'

// Página de Relatórios
// Todo o cálculo já é feito no backend (/relatorios/*) — aqui só buscamos e exibimos.
function Relatorios() {

  const [saborMaisVendido, setSaborMaisVendido] = useState(null)
  const [produtoMaisVendido, setProdutoMaisVendido] = useState(null)
  const [clienteQueMaisCompra, setClienteQueMaisCompra] = useState(null)

  const [vendasPorSabor, setVendasPorSabor] = useState([])
  const [vendasPorProduto, setVendasPorProduto] = useState([])
  const [gastosPorCliente, setGastosPorCliente] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const hoje = new Date().toISOString().slice(0, 10)
  const primeiroDiaDoMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().slice(0, 10)

  const [periodo, setPeriodo] = useState({ inicio: primeiroDiaDoMes, fim: hoje })
  const [resumoPeriodo, setResumoPeriodo] = useState(null)
  const [carregandoPeriodo, setCarregandoPeriodo] = useState(false)

  useEffect(() => {
    carregarDados()
    buscarResumoPeriodo(periodo.inicio, periodo.fim)
  }, [])

  async function carregarDados() {
    try {
      setCarregando(true)

      const [
        respostaSaborMaisVendido,
        respostaProdutoMaisVendido,
        respostaClienteQueMaisCompra,
        respostaVendasPorSabor,
        respostaVendasPorProduto,
        respostaGastosPorCliente
      ] = await Promise.all([
        apiFetch(`/relatorios/sabor-mais-vendido`),
        apiFetch(`/relatorios/produto-mais-vendido`),
        apiFetch(`/relatorios/cliente-que-mais-compra`),
        apiFetch(`/relatorios/sabores`),
        apiFetch(`/relatorios/produtos`),
        apiFetch(`/relatorios/clientes`)
      ])

      if (!respostaSaborMaisVendido.ok) throw new Error('Erro ao buscar sabor mais vendido')
      if (!respostaProdutoMaisVendido.ok) throw new Error('Erro ao buscar produto mais vendido')
      if (!respostaClienteQueMaisCompra.ok) throw new Error('Erro ao buscar cliente que mais compra')
      if (!respostaVendasPorSabor.ok) throw new Error('Erro ao buscar vendas por sabor')
      if (!respostaVendasPorProduto.ok) throw new Error('Erro ao buscar vendas por produto')
      if (!respostaGastosPorCliente.ok) throw new Error('Erro ao buscar gastos por cliente')

      setSaborMaisVendido(await respostaSaborMaisVendido.json())
      setProdutoMaisVendido(await respostaProdutoMaisVendido.json())
      setClienteQueMaisCompra(await respostaClienteQueMaisCompra.json())
      setVendasPorSabor(await respostaVendasPorSabor.json())
      setVendasPorProduto(await respostaVendasPorProduto.json())
      setGastosPorCliente(await respostaGastosPorCliente.json())
      setErro(null)
    } catch (err) {
      console.error(err)
      setErro('Não foi possível carregar os relatórios. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  async function buscarResumoPeriodo(inicio, fim) {
    try {
      setCarregandoPeriodo(true)

      const resposta = await apiFetch(
        `/relatorios/periodo?inicio=${inicio}&fim=${fim}`
      )

      if (!resposta.ok) throw new Error('Erro ao buscar resumo do período')

      setResumoPeriodo(await resposta.json())
    } catch (err) {
      console.error(err)
      setResumoPeriodo(null)
    } finally {
      setCarregandoPeriodo(false)
    }
  }

  function pesquisarPeriodo(e) {
    e.preventDefault()

    if (!periodo.inicio || !periodo.fim) {
      alert('Selecione a data inicial e final.')
      return
    }

    buscarResumoPeriodo(periodo.inicio, periodo.fim)
  }

  function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return '-'
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
  }

  const temSaborMaisVendido = saborMaisVendido && saborMaisVendido.sabor
  const temProdutoMaisVendido = produtoMaisVendido && produtoMaisVendido.produto
  const temClienteQueMaisCompra = clienteQueMaisCompra && clienteQueMaisCompra.cliente

  return (
    <div className="relatorios-container">

      {/* CABEÇALHO */}
      <div className="relatorios-header">
        <div>
          <p className="relatorios-subtitulo">Analise o desempenho do negócio</p>
          <h1>📈 Relatórios</h1>
          <p className="relatorios-descricao">Vendas por período, sabores mais vendidos e clientes que mais compram</p>
        </div>
      </div>

      {carregando && <p className="relatorios-mensagem">Carregando relatórios...</p>}

      {erro && <p className="relatorios-mensagem relatorios-erro">{erro}</p>}

      {!carregando && !erro && (
        <>
          {/* DESTAQUES */}
          <div className="relatorios-destaques">
            <div className="destaque-card">
              <span className="destaque-icone">🍰</span>
              <div>
                <p className="destaque-label">Sabor mais vendido</p>
                <h3>{temSaborMaisVendido ? saborMaisVendido.sabor : 'Sem vendas ainda'}</h3>
                {temSaborMaisVendido && (
                  <p className="destaque-detalhe">
                    {saborMaisVendido.produto} · {saborMaisVendido.quantidadeVendida} unidades
                  </p>
                )}
              </div>
            </div>

            <div className="destaque-card">
              <span className="destaque-icone">🧁</span>
              <div>
                <p className="destaque-label">Produto mais vendido</p>
                <h3>{temProdutoMaisVendido ? produtoMaisVendido.produto : 'Sem vendas ainda'}</h3>
                {temProdutoMaisVendido && (
                  <p className="destaque-detalhe">{produtoMaisVendido.quantidadeVendida} unidades</p>
                )}
              </div>
            </div>

            <div className="destaque-card">
              <span className="destaque-icone">👑</span>
              <div>
                <p className="destaque-label">Cliente que mais compra</p>
                <h3>{temClienteQueMaisCompra ? clienteQueMaisCompra.cliente : 'Sem vendas ainda'}</h3>
                {temClienteQueMaisCompra && (
                  <p className="destaque-detalhe">
                    {clienteQueMaisCompra.quantidadeCompras} compras · {formatarMoeda(clienteQueMaisCompra.totalGasto)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FILTRO POR PERÍODO */}
          <div className="relatorios-secao">
            <div className="box-header">
              <div>
                <h2>Vendas por período</h2>
                <p>Escolha um intervalo de datas para ver o resumo</p>
              </div>
            </div>

            <form className="relatorios-periodo-form" onSubmit={pesquisarPeriodo}>
              <div>
                <label>De</label>
                <input
                  type="date"
                  value={periodo.inicio}
                  onChange={(e) => setPeriodo(prev => ({ ...prev, inicio: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label>Até</label>
                <input
                  type="date"
                  value={periodo.fim}
                  onChange={(e) => setPeriodo(prev => ({ ...prev, fim: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn-buscar-periodo">🔍 Buscar</button>
            </form>

            {carregandoPeriodo && <p className="relatorios-mensagem">Calculando...</p>}

            {!carregandoPeriodo && resumoPeriodo && (
              <div className="relatorios-periodo-resultado">
                <div>
                  <span>Vendas no período</span>
                  <strong>{resumoPeriodo.quantidadeVendas}</strong>
                </div>
                <div>
                  <span>Itens vendidos</span>
                  <strong>{resumoPeriodo.quantidadeItensVendidos}</strong>
                </div>
                <div>
                  <span>Total vendido</span>
                  <strong>{formatarMoeda(resumoPeriodo.totalVendido)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* VENDAS POR SABOR */}
          <div className="relatorios-secao">
            <div className="box-header">
              <div>
                <h2>Vendas por sabor</h2>
                <p>Ranking de sabores mais vendidos</p>
              </div>
            </div>

            {vendasPorSabor.length === 0 ? (
              <p className="relatorios-mensagem">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="table-wrapper">
                <table className="relatorios-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sabor</th>
                      <th>Produto</th>
                      <th>Quantidade vendida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendasPorSabor.map((item, index) => (
                      <tr key={item.saborId}>
                        <td>
                          <span className="ranking-badge">{index + 1}º</span>
                        </td>
                        <td><strong>{item.sabor}</strong></td>
                        <td>{item.produto || '-'}</td>
                        <td>{item.quantidadeVendida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* VENDAS POR PRODUTO */}
          <div className="relatorios-secao">
            <div className="box-header">
              <div>
                <h2>Vendas por produto</h2>
                <p>Ranking de produtos mais vendidos</p>
              </div>
            </div>

            {vendasPorProduto.length === 0 ? (
              <p className="relatorios-mensagem">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="table-wrapper">
                <table className="relatorios-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Produto</th>
                      <th>Quantidade vendida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendasPorProduto.map((item, index) => (
                      <tr key={item.produtoId}>
                        <td>
                          <span className="ranking-badge">{index + 1}º</span>
                        </td>
                        <td><strong>{item.produto}</strong></td>
                        <td>{item.quantidadeVendida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GASTOS POR CLIENTE */}
          <div className="relatorios-secao">
            <div className="box-header">
              <div>
                <h2>Gastos por cliente</h2>
                <p>Quem mais compra da Kenia Cake's</p>
              </div>
            </div>

            {gastosPorCliente.length === 0 ? (
              <p className="relatorios-mensagem">Nenhum cliente com compras ainda.</p>
            ) : (
              <div className="table-wrapper">
                <table className="relatorios-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Compras</th>
                      <th>Total gasto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastosPorCliente.map((item, index) => (
                      <tr key={item.clienteId}>
                        <td>
                          <span className="ranking-badge">{index + 1}º</span>
                        </td>
                        <td><strong>{item.cliente}</strong></td>
                        <td>{item.quantidadeCompras}</td>
                        <td>{formatarMoeda(item.totalGasto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}

export default Relatorios
