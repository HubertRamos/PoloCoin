import Form from '../../../components/Form/index.js'
import DashBoard from '../../../components/DashBoard/index.js'
import Header from '../../../components/Header/index.js'
import { linksHeader } from '../constLinks.js'

const root = document.getElementById('root')

let produtos = []
let categorias = []
let compras = []
let historico = []

const coresCategoria = {
    'Alimentação':  '#10B981',
    'Beleza':       '#EC4899',
    'Vestuário':    '#3B82F6',
    'Limpeza':      '#F59E0B',
    'Eletrônicos':  '#8B5CF6',
    'Brinquedos':   '#F97316',
}

function getCor(nome) {
    return coresCategoria[nome] || '#64748B'
}

function formatarPreco(valor) {
    if (valor == null) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(valor))
}

function formatarData(dateStr) {
    if (!dateStr) return '—'
    try {
        const d = new Date(dateStr)
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
        return dateStr
    }
}

async function carregarDados() {
    try {
        const [p, c, comp] = await Promise.all([
            fetch('/produtos').then(r => r.json()),
            fetch('/categorias/produtos').then(r => r.json()),
            fetch('/admin/compras').then(r => r.json()),
        ])
        produtos = p || []
        categorias = c || []
        compras = comp || []
    } catch (e) {
        console.error('Erro ao carregar dados:', e)
    }
}

function renderizarCards() {
    const content = document.getElementById('dashboard-content')
    if (!content) return

    console.log('[Ver Produtos] produtos carregados:', produtos.length, '| compras:', compras.length)

    if (produtos.length === 0) {
        content.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state__icon">🛒</div>
                <p class="empty-state__text">Nenhum produto cadastrado. Clique em "+ Adicionar" para criar o primeiro.</p>
            </div>
        `
        return
    }

    content.innerHTML = produtos.map(prod => {
        const preco = parseFloat(prod.custo_pontos) || 0
        const cor = getCor(prod.categoria_nome) || '#64748B'
        const cat = prod.categoria_nome || 'Sem categoria'

        return `
            <div class="card" style="border-left: 4px solid ${cor};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <strong style="font-size: 15px; color: #1e293b;">${prod.nome}</strong>
                        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${cat}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 18px; font-weight: 700; color: #0f172a;">${formatarPreco(preco)}</div>
                        <div style="font-size: 11px; color: #94a3b8;">ID: ${prod.id}</div>
                    </div>
                </div>
            </div>
        `
    }).join('') + `
            <div style="margin-top: 20px; text-align: center;">
                <button id="btn-voltar-compras" class="btn btn-ghost">
                    <i class="fa-solid fa-arrow-left" style="font-size: 11px; margin-right: 4px;"></i>
                    Voltar às Compras
                </button>
            </div>
        `
    const btnVoltar = document.getElementById('btn-voltar-compras')
    if (btnVoltar) btnVoltar.addEventListener('click', () => Render())
}

function renderizarCompras() {
    const content = document.getElementById('dashboard-content')
    if (!content) return

    const comprasNaoEntregues = compras.filter(c => !c.entregue)

    if (comprasNaoEntregues.length === 0) {
        content.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state__icon">🛒</div>
                <p class="empty-state__text">Nenhuma compra pendente.</p>
            </div>
        `
        return
    }

    content.innerHTML = comprasNaoEntregues.map(compra => {
        const responsavel = compra.responsavel_nome || '— (compra direta)'
        return `
            <div class="card" style="border-left: 4px solid #3b82f6;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <strong style="font-size: 14px; color: #1e293b;">${compra.produto_nome}</strong>
                        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                            Aluno: ${compra.aluno_nome} · 🪙 ${compra.custo_pontos} pontos
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">
                            ${formatarData(compra.criado_em)}
                        </div>
                        <div style="font-size: 12px; color: #3b82f6;">
                            Autorizado por: ${responsavel}
                        </div>
                    </div>
                </div>
            </div>
        `
    }).join('')
}

function abrirModalAdd() {
    const categoriaOptions = categorias.map(c => ({ id: c.id, nome: c.nome }))

    root.innerHTML = `
        ${Header(linksHeader)}

        <main class="polocoin-main" style="max-width: 480px;">
            <div style="margin-bottom: 20px; text-align: center;">
                <button id="btn-voltar" class="btn btn-ghost">
                    <i class="fa-solid fa-arrow-left" style="font-size: 11px; margin-right: 4px;"></i>
                    Voltar aos Produtos
                </button>
            </div>

            ${Form(
                'Novo Produto',
                [
                    { label: 'Nome do Produto', placeholder: 'Ex: Chocolate Amargo 50g', type: 'text', id: 'prod-nome', required: true },
                    { label: 'Preço (R$)', placeholder: '0,00', type: 'number', id: 'prod-preco', required: true },
                ],
                categoriaOptions
            )}

            <p id="msg" style="text-align: center; font-size: 12px; min-height: 18px; margin: 8px 0 0;"></p>
        </main>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            input[type="number"] {
                -moz-appearance: textfield;
            }
            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        </style>
    `

    const btnVoltar = document.getElementById('btn-voltar')
    if (btnVoltar) btnVoltar.addEventListener('click', () => Render())

    const form = document.getElementById('meu-form')
    const msg = document.getElementById('msg')

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault()

            const nome = document.getElementById('prod-nome').value.trim()
            const preco = parseFloat(document.getElementById('prod-preco').value)
            const catSelect = document.getElementById('categoria-select')
            let categoria = catSelect ? catSelect.value : ''

            if (!nome || !preco || preco <= 0) {
                msg.textContent = 'Preencha nome e preço corretamente.'
                msg.style.color = '#ef4444'
                return
            }

            msg.textContent = 'Cadastrando...'
            msg.style.color = '#3b82f6'

            try {
                const resposta = await fetch('/produtos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, preco, categoria }),
                })

                const dados = await resposta.json()

                if (resposta.ok) {
                    msg.textContent = '✓ Produto cadastrado com sucesso!'
                    msg.style.color = '#10B981'
                    form.reset()
                    await carregarDados()
                    setTimeout(() => Render(), 600)
                } else {
                    msg.textContent = dados.error || 'Erro ao cadastrar.'
                    msg.style.color = '#ef4444'
                }
            } catch (erro) {
                msg.textContent = 'Erro de conexão. Tente novamente.'
                msg.style.color = '#ef4444'
                console.error(erro)
            }
        })
    }
}

async function Render() {
    await carregarDados()
    await carregarHistorico()

    // Separa compras por tipo (só as não entregues)
    const comprasAutorizadas = compras.filter(c => c.autorizado_por !== null && c.autorizado_por !== '' && !c.entregue)
    const comprasDiretas = compras.filter(c => (!c.autorizado_por || c.autorizado_por === '') && !c.entregue)

    root.innerHTML = `
        ${Header(linksHeader)}

        <main class="polocoin-main">
            <!-- Cabeçalho da Página -->
            <div class="polocoin-main__header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 36px;
                            height: 36px;
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <i class="fa-solid fa-cart-shopping" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div>
                            <h1 class="polocoin-main__title">Produtos</h1>
                            <p class="polocoin-main__subtitle">Gerencie os produtos da lojinha do PoloCoin.</p>
                        </div>
                    </div>
                </div>

                <div class="polocoin-main__actions">
                    <button id="btn-ver-produtos" class="btn btn-secondary">
                        <i class="fa-solid fa-box" style="font-size: 12px;"></i>
                        Ver Produtos
                    </button>
                    <button id="btn-ver-historico" class="btn btn-ghost" style="color: #8B5CF6;">
                        <i class="fa-solid fa-clock-rotate-left" style="font-size: 12px;"></i>
                        Histórico (7 dias)
                    </button>
                    <button id="btn-adicionar" class="btn btn-primary">
                        <i class="fa-solid fa-plus" style="font-size: 10px;"></i>
                        Adicionar Produto
                    </button>
                </div>
            </div>

            <!-- Compras Realizadas -->
            <div style="margin-top: 24px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #8B5CF6, #7C3AED);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fa-solid fa-receipt" style="color: white; font-size: 13px;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 16px; color: #0f172a; font-weight: 700;">Compras Realizadas</h2>
                        <p style="color: #64748b; font-size: 12px; margin: 0;">Histórico de pedidos dos alunos</p>
                    </div>
                </div>

                ${compras.length === 0 ? `
                    <div class="alert alert-neutral" style="text-align: center; padding: 20px;">
                        Nenhuma compra realizada ainda.
                    </div>
                ` : `
                    ${comprasAutorizadas.length > 0 ? `
                        <div style="margin-bottom: 16px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <span style="color: #10B981;">●</span> Autorizadas pelo Responsável (${comprasAutorizadas.length})
                            </h3>
                            <div class="card-grid">
                                ${comprasAutorizadas.map(c => `
                                    <div class="card" style="border-left: 3px solid ${c.entregue ? '#94a3b8' : '#10B981'};">
                                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                                            <div>
                                                <strong style="font-size: 13px; color: #1e293b;">${c.produto_nome}</strong>
                                                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                                                    ${c.aluno_nome} · 🪙 ${c.custo_pontos} pontos
                                                </div>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <div style="text-align: right; font-size: 11px; color: #64748b; min-width: 70px;">
                                                    ${formatarData(c.criado_em)}
                                                </div>
                                                ${c.entregue ? `
                                                    <span class="badge badge-success">Entregue</span>
                                                ` : `
                                                    <button onclick="confirmarEntrega(${c.id})" class="btn btn-success" style="padding: 4px 10px; font-size: 11px;">
                                                        ✓ Confirmar
                                                    </button>
                                                `}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${comprasDiretas.length > 0 ? `
                        <div>
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <span style="color: #F59E0B;">●</span> Compras Diretas (${comprasDiretas.length})
                            </h3>
                            <div class="card-grid">
                                ${comprasDiretas.map(c => `
                                    <div class="card" style="border-left: 3px solid ${c.entregue ? '#94a3b8' : '#F59E0B'};">
                                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                                            <div>
                                                <strong style="font-size: 13px; color: #1e293b;">${c.produto_nome}</strong>
                                                <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                                                    ${c.aluno_nome} · 🪙 ${c.custo_pontos} pontos
                                                </div>
                                            </div>
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <div style="text-align: right; font-size: 11px; color: #64748b; min-width: 80px;">
                                                    ${formatarData(c.criado_em)}
                                                </div>
                                                ${c.entregue ? `
                                                    <span class="badge badge-success">Entregue</span>
                                                ` : `
                                                    <button onclick="confirmarEntrega(${c.id})" class="btn" style="background: #F59E0B; color: white; padding: 4px 10px; font-size: 11px;">
                                                        ✓ Confirmar
                                                    </button>
                                                `}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                `}
            </div>

            <!-- Histórico de Vendas (7 dias) -->
            <div id="historico-section" style="margin-top: 24px; display: none;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #06B6D4, #3B82F6);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fa-solid fa-chart-line" style="color: white; font-size: 13px;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 16px; color: #0f172a; font-weight: 700;">Histórico de Vendas</h2>
                        <p style="color: #64748b; font-size: 12px; margin: 0;">Últimos 7 dias · Limpeza automática a cada 7 dias</p>
                    </div>
                </div>
                <div id="historico-content"></div>
            </div>
        </main>

        <div id="dashboard-content"></div>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            #btn-ver-produtos:hover { background: #f1f5f9; }
            #btn-adicionar:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
        </style>
    `

    const btnVerProdutos = document.getElementById('btn-ver-produtos')
    if (btnVerProdutos) btnVerProdutos.addEventListener('click', () => {
        console.log('[Ver Produtos] clicado')
        renderizarCards()
    })

    const btnVerHistorico = document.getElementById('btn-ver-historico')
    if (btnVerHistorico) btnVerHistorico.addEventListener('click', () => {
        renderizarHistorico()
    })

    const btnAdd = document.getElementById('btn-adicionar')
    if (btnAdd) btnAdd.addEventListener('click', abrirModalAdd)
}

// Nova função para mostrar as compras no dashboard do adm
async function RenderCompras() {
    await carregarDados()

    const comprasAutorizadas = compras.filter(c => c.autorizado_por !== null && c.autorizado_por !== '')
    const comprasDiretas = compras.filter(c => !c.autorizado_por || c.autorizado_por === '')

    root.innerHTML = `
        ${Header(linksHeader)}

        <main class="polocoin-main">
            <!-- Cabeçalho -->
            <div class="polocoin-main__header">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 36px;
                            height: 36px;
                            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <i class="fa-solid fa-receipt" style="color: white; font-size: 14px;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h1 class="polocoin-main__title">Compras Realizadas</h1>
                            <p class="polocoin-main__subtitle">Histórico de compras dos alunos</p>
                        </div>
                    </div>
                </div>

                <button id="btn-voltar-compras" class="btn btn-ghost">
                    <i class="fa-solid fa-chevron-left" style="font-size: 11px; margin-right: 4px;"></i>
                    Voltar
                </button>
            </div>

            ${compras.length === 0 ? `
                <div class="alert alert-neutral" style="text-align: center; padding: 40px;">
                    Nenhuma compra realizada ainda.
                </div>
            ` : `
                <!-- Stats -->
                <div style="margin-bottom: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <div class="stat-card stat-card--success">
                        <div class="stat-card__label">TOTAL DE COMPRAS</div>
                        <div class="stat-card__value">${compras.length}</div>
                    </div>
                    <div class="stat-card stat-card--info">
                        <div class="stat-card__label">AUTORIZADAS PELO PAI</div>
                        <div class="stat-card__value">${comprasAutorizadas.length}</div>
                    </div>
                    <div class="stat-card stat-card--warning">
                        <div class="stat-card__label">COMPRAS DIRETAS</div>
                        <div class="stat-card__value">${comprasDiretas.length}</div>
                    </div>
                </div>

                ${comprasAutorizadas.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                            ✅ Autorizadas pelo Responsável (${comprasAutorizadas.length})
                        </h3>
                        <div class="card-grid">
                            ${comprasAutorizadas.map(compra => `
                                <div class="card" style="border-left: 4px solid #10B981;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 10px;">
                                    <div>
                                    <strong style="font-size: 14px; color: #1e293b;">${compra.produto_nome}</strong>
                                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                                        Aluno: ${compra.aluno_nome} · 🪙 ${compra.custo_pontos} pontos
                                    </div>
                                    </div>
                                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                                    <div style="font-size: 11px; color: #64748b;">
                                        ${formatarData(compra.criado_em)}
                                    </div>
                                    <div style="font-size: 12px; color: #3b82f6;">
                                        👨‍👧 Responsável: ${compra.responsavel_nome}
                                    </div>
                                    ${compra.entregue ? `
                                        <span class="badge badge-success">✓ Entregue</span>
                                    ` : `
                                        <button onclick="confirmarEntrega(${compra.id})" class="btn btn-success" style="padding: 4px 10px; font-size: 11px;">
                                            ✓ Confirmar
                                        </button>
                                    `}
                                    </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${comprasDiretas.length > 0 ? `
                    <div>
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                            🔓 Compras Diretas (${comprasDiretas.length})
                        </h3>
                        <div class="card-grid">
                            ${comprasDiretas.map(compra => `
                                <div class="card" style="border-left: 4px solid #F59E0B;">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 10px;">
                                    <div>
                                    <strong style="font-size: 14px; color: #1e293b;">${compra.produto_nome}</strong>
                                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                                        Aluno: ${compra.aluno_nome} · 🪙 ${compra.custo_pontos} pontos
                                    </div>
                                    </div>
                                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                                    <div style="font-size: 11px; color: #64748b;">
                                        ${formatarData(compra.criado_em)}
                                    </div>
                                    <div style="font-size: 12px; color: #dc2626;">
                                        ⚠️ Compra sem autorização do responsável
                                    </div>
                                    ${compra.entregue ? `
                                        <span class="badge badge-success">✓ Entregue</span>
                                    ` : `
                                        <button onclick="confirmarEntrega(${compra.id})" class="btn" style="background: #F59E0B; color: white; padding: 4px 10px; font-size: 11px;">
                                            ✓ Confirmar
                                        </button>
                                    `}
                                    </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `}
        </main>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            #btn-voltar-compras:hover { color: #0f172a; }
        </style>
    `

    const btnVoltar = document.getElementById('btn-voltar-compras')
    if (btnVoltar) btnVoltar.addEventListener('click', () => Render())
}

// Garante execução mesmo se o DOM já estiver pronto quando o módulo carregar
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', Render)
} else {
    Render()
}

window.confirmarEntrega = confirmarEntrega
window.Render = Render
window.renderizarCards = renderizarCards
window.renderizarHistorico = renderizarHistorico
window.limparHistorico = limparHistorico

async function carregarHistorico() {
    try {
        const res = await fetch('/admin/historico-vendas')
        if (!res.ok) throw new Error('Erro ao buscar histórico')
        historico = await res.json()
        const lastCleanup = localStorage.getItem('historicoLastCleanup')
        const now = Date.now()
        if (!lastCleanup || now - Number(lastCleanup) > 7 * 24 * 60 * 60 * 1000) {
            try {
                const r = await fetch('/admin/historico-vendas/limpar', { method: 'DELETE' })
                if (!r.ok) throw new Error('Erro ao limpar')
            } catch (e) { console.error('Limpeza automática falhou:', e) }
            localStorage.setItem('historicoLastCleanup', now.toString())
        }
        renderizarHistorico()
    } catch (err) {
        console.error('Erro ao carregar histórico:', err)
        historico = []
    }
}

async function renderizarHistorico() {
    const section = document.getElementById('historico-section')
    const content = document.getElementById('historico-content')
    if (!section || !content) return
    const isHidden = section.style.display === 'none' || !section.style.display
    section.style.display = isHidden ? 'block' : 'none'
    if (isHidden && historico.length === 0) {
        await carregarHistorico()
        return
    }
    if (historico.length === 0) {
        content.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state__icon">📋</div><p class="empty-state__text">Nenhuma venda nos últimos 7 dias.</p></div>`
        return
    }
    const hoje = new Date()
    const cleanupHtml = `<button id="btn-limpar-historico" onclick="limparHistorico()" class="btn btn-ghost" style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">🗑 Limpar histórico</button>`
    content.innerHTML = cleanupHtml + historico.map(c => {
        const data = new Date(c.criado_em)
        const diffDays = Math.floor((hoje - data) / (1000 * 60 * 60 * 24))
        const diffStr = diffDays === 0 ? 'Hoje' : diffDays === 1 ? 'Ontem' : diffDays + 'd atrás'
        const resp = c.responsavel_nome || '— (compra direta)'
        return `<div class="card" style="border-left: 3px solid #06B6D4;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <div>
                    <strong style="font-size: 13px; color: #1e293b;">${c.produto_nome}</strong>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${c.aluno_nome} · 🪙 ${c.custo_pontos} pontos</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${diffStr} · ${formatarData(c.criado_em)}</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <span class="badge" style="background: ${c.entregue ? '#dcfce7' : '#fef3c7'}; color: ${c.entregue ? '#166534' : '#92400e'}; font-size: 10px; padding: 2px 8px; border-radius: 10px;">${c.entregue ? 'Entregue' : 'Pendente'}</span>
                    <div style="font-size: 11px; color: #3b82f6;">${c.autorizado_por ? '✅ ' + resp : '⚡ Compra direta'}</div>
                </div>
            </div>
        </div>`
    }).join('')
    const btnLimpar = document.getElementById('btn-limpar-historico')
    if (btnLimpar) btnLimpar.addEventListener('click', limparHistorico)
}

async function limparHistorico() {
    try {
        const res = await fetch('/admin/historico-vendas/limpar', { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) { alert(data.error || 'Erro ao limpar histórico.'); return }
        alert(data.message)
        historico = []
        localStorage.setItem('historicoLastCleanup', Date.now().toString())
        renderizarHistorico()
    } catch (err) {
        alert('Erro de conexão. Tente novamente.')
        console.error(err)
    }
}

async function confirmarEntrega(compraId) {
    try {
        const res = await fetch(`/admin/compras/${compraId}/entregar`, { method: 'PATCH' })
        const data = await res.json()
        if (!res.ok) {
            alert(data.error || 'Erro ao confirmar entrega.')
            return
        }
        alert('Entrega confirmada!')
        Render()
    } catch (err) {
        alert('Erro de conexão. Tente novamente.')
    }
}
