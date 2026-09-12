import { useEffect, useState } from 'react'

function Vendas() {

  const [vendas, setVendas] = useState([])
  const [clientes, setClientes] = useState([])
  const [sabores, setSabores] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [formulario, setFormulario] = useState({
    clienteId: '',
    saborId: '',
    quantidade: 1,
    desconto: 0,
    formaPagamento: 'PIX',
    status: 'PAGO'
  })


  // =========================
  // CARREGAR DADOS
  // =========================

  const carregarDados = async () => {

    try {

      setCarregando(true)
      setErro(false)

      const [
        respostaVendas,
        respostaClientes,
        respostaSabores
      ] = await Promise.all([

        fetch('http://localhost:8080/vendas'),

        fetch('http://localhost:8080/clientes'),

        fetch('http://localhost:8080/sabores')

      ])


      if (!respostaVendas.ok) {
        throw new Error(
          'Erro ao carregar vendas'
        )
      }

      if (!respostaClientes.ok) {
        throw new Error(
          'Erro ao carregar clientes'
        )
      }

      if (!respostaSabores.ok) {
        throw new Error(
          'Erro ao carregar sabores'
        )
      }


      const dadosVendas =
        await respostaVendas.json()

      const dadosClientes =
        await respostaClientes.json()

      const dadosSabores =
        await respostaSabores.json()


      console.log(
        'Vendas:',
        dadosVendas
      )

      console.log(
        'Clientes:',
        dadosClientes
      )

      console.log(
        'Sabores:',
        dadosSabores
      )


      setVendas(dadosVendas)
      setClientes(dadosClientes)
      setSabores(dadosSabores)

    } catch (error) {

      console.error(
        'Erro ao carregar dados:',
        error
      )

      setErro(true)

    } finally {

      setCarregando(false)

    }

  }


  // =========================
  // CARREGAR AO ABRIR PÁGINA
  // =========================

  useEffect(() => {

    carregarDados()

  }, [])


  // =========================
  // ALTERAR FORMULÁRIO
  // =========================

  const alterarFormulario = (event) => {

    const { name, value } = event.target

    setFormulario({
      ...formulario,
      [name]: value
    })

  }


  // =========================
  // ABRIR NOVA VENDA
  // =========================

  const abrirNovaVenda = () => {

    setFormulario({
      clienteId: '',
      saborId: '',
      quantidade: 1,
      desconto: 0,
      formaPagamento: 'PIX',
      status: 'PAGO'
    })

    setModalAberto(true)

  }


  // =========================
  // FECHAR MODAL
  // =========================

  const fecharModal = () => {

    if (!salvando) {

      setModalAberto(false)

    }

  }


  // =========================
  // SALVAR VENDA
  // =========================

  const salvarVenda = async (event) => {

    event.preventDefault()


    if (
      !formulario.clienteId ||
      !formulario.saborId
    ) {

      alert(
        'Selecione o cliente e o produto.'
      )

      return

    }


    try {

      setSalvando(true)


      const novaVenda = {

        cliente: {
          id: Number(
            formulario.clienteId
          )
        },

        saborProduto: {
          id: Number(
            formulario.saborId
          )
        },

        quantidade: Number(
          formulario.quantidade
        ),

        desconto: Number(
          formulario.desconto || 0
        ),

        formaPagamento:
          formulario.formaPagamento,

        status:
          formulario.status

      }


      console.log(
        'Enviando venda:',
        novaVenda
      )


      const resposta = await fetch(
        'http://localhost:8080/vendas',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(novaVenda)
        }
      )


      if (!resposta.ok) {

        const erroBackend =
          await resposta.text()

        console.error(
          'Erro do backend:',
          erroBackend
        )

        throw new Error(
          'Não foi possível salvar a venda.'
        )

      }


      await carregarDados()

      setModalAberto(false)


      alert(
        'Venda cadastrada com sucesso! 🎉'
      )


    } catch (error) {

      console.error(
        'Erro ao salvar venda:',
        error
      )


      alert(
        'Erro ao salvar a venda. Verifique o backend.'
      )

    } finally {

      setSalvando(false)

    }

  }


  // =========================
  // PRODUTO SELECIONADO
  // =========================

  const saborSelecionado =
    sabores.find(
      sabor =>
        sabor.id ===
        Number(formulario.saborId)
    )


  const precoUnitario =
    saborSelecionado
      ? Number(
          saborSelecionado.precoVenda || 0
        )
      : 0


  const valorTotal =
    precoUnitario *
    Number(
      formulario.quantidade || 0
    )


  const desconto =
    Number(
      formulario.desconto || 0
    )


  const valorFinal =
    Math.max(
      valorTotal - desconto,
      0
    )


  // =========================
  // CALCULAR VALOR DA VENDA
  // =========================

  const calcularValorVenda = (venda) => {

    const preco =
      Number(
        venda.saborProduto
          ?.precoVenda || 0
      )

    const quantidade =
      Number(
        venda.quantidade || 0
      )

    const desconto =
      Number(
        venda.desconto || 0
      )

    return Math.max(
      (preco * quantidade) - desconto,
      0
    )

  }


  // =========================
  // RESUMOS
  // =========================

  const totalVendido =
    vendas.reduce(
      (total, venda) => {

        return (
          total +
          calcularValorVenda(venda)
        )

      },
      0
    )


  const totalRecebido =
    vendas.reduce(
      (total, venda) => {

        if (
          venda.status === 'PAGO'
        ) {

          return (
            total +
            calcularValorVenda(venda)
          )

        }

        return total

      },
      0
    )


  // =========================
  // FORMATAR MOEDA
  // =========================

  const formatarMoeda = (valor) => {

    return Number(
      valor || 0
    ).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    )

  }


  // =========================
  // FORMATAR DATA
  // =========================

  const formatarData = (data) => {

    if (!data) {

      return '-'

    }

    try {

      return new Date(
        data
      ).toLocaleString(
        'pt-BR'
      )

    } catch {

      return data

    }

  }


  // =========================
  // LOADING
  // =========================

  if (carregando) {

    return (

      <div className="page">

        <div className="loading">

          <div className="loading-spinner"></div>

          <p>
            Carregando vendas...
          </p>

        </div>

      </div>

    )

  }


  // =========================
  // ERRO
  // =========================

  if (erro) {

    return (

      <div className="page">

        <div className="error-message">

          <span>
            ⚠️
          </span>

          <p>
            Não foi possível conectar
            ao backend.
          </p>

          <button
            onClick={carregarDados}
          >
            Tentar novamente
          </button>

        </div>

      </div>

    )

  }


  // =========================
  // PÁGINA
  // =========================

  return (

    <div className="page">


      {/* CABEÇALHO */}

      <div className="page-header vendas-header">

        <div>

          <p className="welcome">
            Gerencie todas as vendas
          </p>

          <h1>
            🛒 Vendas
          </h1>

          <p className="page-subtitle">
            Acompanhe as vendas
            da Kenia Cake's
          </p>

        </div>


        <button
          className="new-sale-button"
          onClick={abrirNovaVenda}
        >
          + Nova Venda
        </button>

      </div>


      {/* RESUMO */}

      <div className="vendas-resumo">


        <div className="resumo-card">

          <span>
            📦
          </span>

          <div>

            <p>
              Total de vendas
            </p>

            <h2>
              {vendas.length}
            </h2>

          </div>

        </div>


        <div className="resumo-card">

          <span>
            💰
          </span>

          <div>

            <p>
              Total vendido
            </p>

            <h2>
              {formatarMoeda(
                totalVendido
              )}
            </h2>

          </div>

        </div>


        <div className="resumo-card">

          <span>
            💵
          </span>

          <div>

            <p>
              Recebido
            </p>

            <h2>
              {formatarMoeda(
                totalRecebido
              )}
            </h2>

          </div>

        </div>


      </div>


      {/* HISTÓRICO */}

      <div className="vendas-container">


        <div className="box-header">

          <div>

            <h2>
              Histórico de vendas
            </h2>

            <p>
              Todas as vendas
              registradas no sistema
            </p>

          </div>


          <button
            className="refresh-button"
            onClick={carregarDados}
          >
            🔄 Atualizar
          </button>

        </div>


        {vendas.length === 0 ? (

          <div className="empty-state">

            <span>
              🛒
            </span>

            <h2>
              Nenhuma venda encontrada
            </h2>

            <p>
              Clique em Nova Venda
              para cadastrar sua primeira venda.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="vendas-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>
                    Cliente
                  </th>

                  <th>
                    Produto
                  </th>

                  <th>
                    Quantidade
                  </th>

                  <th>
                    Valor
                  </th>

                  <th>
                    Lucro
                  </th>

                  <th>
                    Pagamento
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Data
                  </th>

                </tr>

              </thead>


              <tbody>

                {vendas.map(
                  venda => (

                    <tr
                      key={venda.id}
                    >

                      <td>
                        #{venda.id}
                      </td>


                      <td>

                        <div className="cliente-cell">

                          <div className="cliente-avatar">

                            {
                              venda.cliente?.nome
                                ?.charAt(0)
                                ?.toUpperCase() || '?'
                            }

                          </div>


                          <div>

                            <strong>

                              {
                                venda.cliente
                                  ?.nome ||
                                'Cliente'
                              }

                            </strong>


                            <span>

                              {
                                venda.cliente
                                  ?.telefone ||
                                '-'
                              }

                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        <div className="produto-cell">

                          <strong>

                            {
                              venda
                                .saborProduto
                                ?.nome ||
                              '-'
                            }

                          </strong>


                          <span>

                            {
                              venda
                                .saborProduto
                                ?.produto
                                ?.nome ||
                              'Produto'
                            }

                          </span>

                        </div>

                      </td>


                      <td>

                        {
                          venda.quantidade
                        }

                      </td>


                      <td
                        className="valor-cell"
                      >

                        <strong>

                          {
                            formatarMoeda(
                              calcularValorVenda(venda)
                            )
                          }

                        </strong>

                      </td>


                      <td
                        className="lucro-cell"
                      >

                        {
                          venda.lucroBruto != null
                            ? formatarMoeda(venda.lucroBruto)
                            : '-'
                        }

                      </td>


                      <td>

                        <span
                          className="pagamento-badge"
                        >

                          {
                            venda
                              .formaPagamento ||
                            '-'
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={`status-badge ${
                            venda.status === 'PAGO'
                              ? 'pago'
                              : 'pendente'
                          }`}
                        >

                          {
                            venda.status === 'PAGO'
                              ? '✓ Pago'
                              : 'Pendente'
                          }

                        </span>

                      </td>


                      <td>

                        {
                          formatarData(
                            venda.dataVenda
                          )
                        }

                      </td>


                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


      </div>


      {/* MODAL */}

      {modalAberto && (

        <div className="modal-overlay">


          <div className="modal-venda">


            <div className="modal-header">

              <div>

                <h2>
                  🛒 Nova Venda
                </h2>

                <p>
                  Preencha os dados
                  da venda
                </p>

              </div>


              <button
                className="modal-close"
                onClick={fecharModal}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={salvarVenda}
            >


              <div className="form-group">

                <label>
                  👤 Cliente
                </label>

                <select
                  name="clienteId"
                  value={
                    formulario.clienteId
                  }
                  onChange={
                    alterarFormulario
                  }
                  required
                >

                  <option value="">
                    Selecione um cliente
                  </option>


                  {clientes.map(
                    cliente => (

                      <option
                        key={cliente.id}
                        value={cliente.id}
                      >

                        {cliente.nome}

                        {cliente.telefone
                          ? ` - ${cliente.telefone}`
                          : ''
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="form-group">

                <label>
                  🍰 Produto / Sabor
                </label>

                <select
                  name="saborId"
                  value={
                    formulario.saborId
                  }
                  onChange={
                    alterarFormulario
                  }
                  required
                >

                  <option value="">
                    Selecione um produto
                  </option>


                  {sabores.map(
                    sabor => (

                      <option
                        key={sabor.id}
                        value={sabor.id}
                      >

                        {
                          sabor.produto?.nome ||
                          'Produto'
                        }

                        {' - '}

                        {
                          sabor.nome
                        }

                        {' - '}

                        {
                          formatarMoeda(
                            sabor.precoVenda
                          )
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="form-row">


                <div className="form-group">

                  <label>
                    🔢 Quantidade
                  </label>

                  <input
                    type="number"
                    name="quantidade"
                    min="1"
                    value={
                      formulario.quantidade
                    }
                    onChange={
                      alterarFormulario
                    }
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    💸 Desconto
                  </label>

                  <input
                    type="number"
                    name="desconto"
                    min="0"
                    step="0.01"
                    value={
                      formulario.desconto
                    }
                    onChange={
                      alterarFormulario
                    }
                  />

                </div>

              </div>


              <div className="form-group">

                <label>
                  💳 Forma de pagamento
                </label>

                <select
                  name="formaPagamento"
                  value={
                    formulario.formaPagamento
                  }
                  onChange={
                    alterarFormulario
                  }
                >

                  <option value="PIX">
                    PIX
                  </option>

                  <option value="DINHEIRO">
                    Dinheiro
                  </option>

                  <option value="CARTAO">
                    Cartão
                  </option>

                  <option value="TRANSFERENCIA">
                    Transferência
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>
                  📋 Status
                </label>

                <select
                  name="status"
                  value={
                    formulario.status
                  }
                  onChange={
                    alterarFormulario
                  }
                >

                  <option value="PAGO">
                    Pago
                  </option>

                  <option value="PENDENTE">
                    Pendente
                  </option>

                </select>

              </div>


              <div className="venda-preview">


                <div>

                  <span>
                    Valor unitário
                  </span>

                  <strong>

                    {
                      formatarMoeda(
                        precoUnitario
                      )
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Quantidade
                  </span>

                  <strong>

                    {
                      formulario.quantidade
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Desconto
                  </span>

                  <strong>

                    -
                    {
                      formatarMoeda(
                        desconto
                      )
                    }

                  </strong>

                </div>


                <div className="preview-total">

                  <span>
                    Total da venda
                  </span>

                  <strong>

                    {
                      formatarMoeda(
                        valorFinal
                      )
                    }

                  </strong>

                </div>


              </div>


              <div className="modal-actions">


                <button
                  type="button"
                  className="cancel-button"
                  onClick={fecharModal}
                  disabled={salvando}
                >

                  Cancelar

                </button>


                <button
                  type="submit"
                  className="save-sale-button"
                  disabled={salvando}
                >

                  {
                    salvando
                      ? 'Salvando...'
                      : '✓ Salvar Venda'
                  }

                </button>


              </div>


            </form>


          </div>


        </div>

      )}


    </div>

  )

}

export default Vendas