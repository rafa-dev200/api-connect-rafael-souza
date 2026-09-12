import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  const vendasRecentes = [
    {
      id: 3,
      cliente: 'João',
      produto: 'Bolo de Pote - Chocolate',
      valor: 'R$ 34,00',
      status: 'Pago',
    },
    {
      id: 2,
      cliente: 'João',
      produto: 'Bolo de Pote - Chocolate',
      valor: 'R$ 34,00',
      status: 'Pago',
    },
    {
      id: 1,
      cliente: 'João',
      produto: 'Bolo de Pote - Chocolate',
      valor: 'R$ 49,00',
      status: 'Pago',
    },
  ]

  return (
    <div className="page dashboard-page">

      <div className="page-header dashboard-header">
        <div>
          <p className="welcome">Bem-vindo de volta 👋</p>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            Acompanhe tudo o que acontece na Kenia Cake's
          </p>
        </div>

        <button className="period-button">
          📅 Hoje
        </button>
      </div>

      {/* CARDS */}

      <section className="cards">

        <div className="card sales-card">
          <div className="card-icon">
            💰
          </div>

          <div className="card-content">
            <span>Total vendido</span>
            <h2>R$ 117,00</h2>
            <p>🛒 3 vendas realizadas</p>
          </div>
        </div>

        <div className="card received-card">
          <div className="card-icon">
            💳
          </div>

          <div className="card-content">
            <span>Total recebido</span>
            <h2>R$ 123,00</h2>
            <p>✨ Incluindo R$ 6,00 de caixinha</p>
          </div>
        </div>

        <div className="card cash-card">
          <div className="card-icon">
            🏦
          </div>

          <div className="card-content">
            <span>Saldo atual</span>
            <h2>R$ 43,00</h2>
            <p>💸 Após despesas e sangrias</p>
          </div>
        </div>

        <div className="card orders-card">
          <div className="card-icon">
            🛒
          </div>

          <div className="card-content">
            <span>Quantidade de vendas</span>
            <h2>3</h2>
            <p>✅ Todas as vendas pagas</p>
          </div>
        </div>

      </section>

      {/* CONTEÚDO PRINCIPAL */}

      <section className="content-grid">

        {/* VENDAS RECENTES */}

        <div className="recent-sales">

          <div className="box-header">
            <div>
              <h2>Vendas recentes</h2>
              <p>Últimas vendas realizadas</p>
            </div>

            <button className="view-all">
              Ver todas →
            </button>
          </div>

          <div className="sales-list">

            {vendasRecentes.map((venda) => (
              <div className="sale-item" key={venda.id}>

                <div className="sale-icon">
                  🧁
                </div>

                <div className="sale-info">
                  <strong>{venda.produto}</strong>

                  <span>
                    Cliente: {venda.cliente} • Venda #{venda.id}
                  </span>
                </div>

                <div className="sale-value">
                  <strong>{venda.valor}</strong>

                  <span className="status paid">
                    ✓ {venda.status}
                  </span>
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* AÇÕES RÁPIDAS */}

        <div className="quick-actions">

          <div className="box-header">
            <div>
              <h2>Ações rápidas</h2>
              <p>O que você deseja fazer?</p>
            </div>
          </div>

          <div className="actions-grid">

            <button className="action-button" onClick={() => navigate('/vendas')}>
              <span>➕</span>
              <strong>Nova venda</strong>
              <small>Registrar pedido</small>
            </button>

            <button className="action-button" onClick={() => navigate('/clientes')}>
              <span>👤</span>
              <strong>Novo cliente</strong>
              <small>Cadastrar cliente</small>
            </button>

            <button className="action-button" onClick={() => navigate('/produtos')}>
              <span>📦</span>
              <strong>Produto</strong>
              <small>Cadastrar produto</small>
            </button>

            <button className="action-button" onClick={() => navigate('/caixa')}>
              <span>💸</span>
              <strong>Despesa</strong>
              <small>Registrar gasto</small>
            </button>

          </div>

        </div>

      </section>

      {/* RESUMOS */}

      <section className="summary-section">

        <div className="summary-box">

          <div className="summary-content">

            <span className="summary-label">
              🍰 Produto mais vendido
            </span>

            <h2>Bolo de Pote</h2>

            <p>7 unidades vendidas</p>

          </div>

          <div className="summary-number">
            7
          </div>

        </div>

        <div className="summary-box">

          <div className="summary-content">

            <span className="summary-label">
              👑 Cliente que mais compra
            </span>

            <h2>João</h2>

            <p>3 compras • R$ 117,00 gastos</p>

          </div>

          <div className="summary-number">
            👑
          </div>

        </div>

      </section>

      {/* SUGESTÕES */}

      <section className="suggestions-section">

        <div className="suggestions-header">

          <div>
            <h2>💡 Sugestões para sua confeitaria</h2>
            <p>
              Algumas ideias para ajudar você a organizar o negócio.
            </p>
          </div>

        </div>

        <div className="suggestions-grid">

          <div className="suggestion-card">

            <div className="suggestion-icon">
              🧁
            </div>

            <div>
              <h3>Cadastre mais sabores</h3>

              <p>
                Você possui apenas alguns sabores cadastrados.
                Adicione mais opções para aumentar seu catálogo.
              </p>

              <button onClick={() => navigate('/sabores')}>
                Ver sabores →
              </button>
            </div>

          </div>

          <div className="suggestion-card">

            <div className="suggestion-icon">
              📋
            </div>

            <div>
              <h3>Crie suas receitas</h3>

              <p>
                Cadastre receitas e ingredientes para acompanhar
                o custo e o lucro dos seus produtos.
              </p>

              <button onClick={() => navigate('/receitas')}>
                Criar receita →
              </button>
            </div>

          </div>

          <div className="suggestion-card">

            <div className="suggestion-icon">
              👥
            </div>

            <div>
              <h3>Aumente sua base de clientes</h3>

              <p>
                Cadastre seus clientes para acompanhar quem
                mais compra na Kenia Cake's.
              </p>

              <button onClick={() => navigate('/clientes')}>
                Ver clientes →
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* ÁREA FINAL */}

      <section className="dashboard-tip">

        <div className="tip-icon">
          🚀
        </div>

        <div>
          <h2>Sua confeitaria está organizada!</h2>

          <p>
            Continue registrando suas vendas e o sistema mostrará
            informações importantes sobre o crescimento da Kenia Cake's.
          </p>
        </div>

      </section>

    </div>
  )
}

export default Dashboard