import Form from '../../../components/Form/index.js'
import DashBoard from '../../../components/DashBoard/index.js'
import Header from '../../../components/Header/index.js'
import { linksHeader } from '../constLinks.js'

const root = document.getElementById('root')

let produtos = []
let categorias = []
let compras = []

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

function formatarData(dateStr) {
    if (!dateStr) return '—'
    try {
        const d = new Date(dateStr)
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
        return dateStr
    }
}

function renderizarCards() {
    const content = document.getElementById('dashboard-content')
    if (!content) return

    if (produtos.length === 0) {
        content.innerHTML = `
            <p style="color: #94a3b8; text-align: center; padding: 20px;">
                Nenhum produto cadastrado. Clique em "+ Adicionar" para criar o primeiro.
            </p>
        `
        return
    }

    content.innerHTML = produtos.map(prod => {
        const preco = parseFloat(prod.preco) || 0
        const cor = getCor(prod.categoria_nome)
        const cat = prod.categoria_nome || 'Sem categoria'

        return `
            <div style="
                background: white;
                border-radius: 10px;
                padding: 16px;
                border-left: 4px solid ${cor};
                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                margin-bottom: 12px;
            ">
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
    }).join('')
}

function renderizarCompras() {
    const content = document.getElementById('dashboard-content')
    if (!content) return

    if (compras.length === 0) {
        content.innerHTML = `
            <p style="color: #94a3b8; text-align: center; padding: 20px;">
                Nenhuma compra realizada ainda.
            </p>
        `
        return
    }

    content.innerHTML = compras.map(compra => {
        const responsavel = compra.responsavel_nome || '— (compra direta)'
        return `
            <div style="
                background: white;
                border-radius: 10px;
                padding: 14px 16px;
                border-left: 4px solid #3b82f6;
                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                margin-bottom: 10px;
            ">
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
    const categoriaOptions = categorias.map(c => ({ value: c.nome, text: c.nome }))

    root.innerHTML = `
        ${Header(linksHeader)}

        <main style="
            padding: 90px 20px 20px;
            max-width: 480px;
            margin: 0 auto;
            animation: fadeIn 0.2s ease;
        ">
            <div style="text-align: center; margin-bottom: 20px;">
                <button id="btn-voltar"
                    style="
                        background: none;
                        border: none;
                        color: #64748b;
                        font-size: 13px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                    "
                >
                    <i class="fa-solid fa-arrow-left" style="font-size: 11px;"></i>
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

    // Separa compras por tipo
    const comprasAutorizadas = compras.filter(c => c.autorizado_por !== null && c.autorizado_por !== '')
    const comprasDiretas = compras.filter(c => !c.autorizado_por || c.autorizado_por === '')

    root.innerHTML = `
        ${Header(linksHeader)}

        <main style="padding: 90px 20px 20px; max-width: 900px; margin: 0 auto; animation: fadeIn 0.3s ease;">
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
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
                    <h1 style="margin: 0; font-size: 20px; color: #0f172a; font-weight: 700;">Produtos</h1>
                </div>
                <p style="color: #64748b; font-size: 13px; margin: 0;">Gerencie os produtos da lojinha do PoloCoin.</p>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                <button id="btn-ver-todos"
                    style="
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 18px;
                        background: white;
                        border: 1.5px solid #e2e8f0;
                        border-radius: 8px;
                        color: #0f172a;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    "
                >
                    <i class="fa-regular fa-eye" style="font-size: 12px;"></i>
                    Ver Todos
                </button>

                <button id="btn-adicionar"
                    style="
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        padding: 10px 18px;
                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                        transition: all 0.2s;
                    "
                >
                    <i class="fa-solid fa-plus" style="font-size: 10px;"></i>
                    Adicionar Produto
                </button>
            </div>
            <!-- Compras realizadas -->
            <div style="margin-top: 30px; margin-bottom: 30px;">
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
                    <p style="color: #94a3b8; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        Nenhuma compra realizada ainda.
                    </p>
                ` : `
                    ${comprasAutorizadas.length > 0 ? `
                        <div style="margin-bottom: 16px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <span style="color: #10B981;">●</span> Autorizadas pelo Responsável (${comprasAutorizadas.length})
                            </h3>
                            ${comprasAutorizadas.map(c => `
                                <div style="
                                    background: white;
                                    border-radius: 8px;
                                    padding: 10px 14px;
                                    border-left: 3px solid ${c.entregue ? '#94a3b8' : '#10B981'};
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                                    margin-bottom: 8px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    gap: 10px;
                                ">
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
                                            <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 600; white-space: nowrap;">Entregue</span>
                                        ` : `
                                            <button onclick="confirmarEntrega(${c.id})"
                                                style="background: #10B981; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                                                ✓ Confirmar
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${comprasDiretas.length > 0 ? `
                        <div>
                            <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                                <span style="color: #F59E0B;">●</span> Compras Diretas (${comprasDiretas.length})
                            </h3>
                            ${comprasDiretas.map(c => `
                                <div style="
                                    background: white;
                                    border-radius: 8px;
                                    padding: 10px 14px;
                                    border-left: 3px solid ${c.entregue ? '#94a3b8' : '#F59E0B'};
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                                    margin-bottom: 8px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    gap: 10px;
                                ">
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
                                            <span style="font-size: 10px; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 600; white-space: nowrap;">Entregue</span>
                                        ` : `
                                            <button onclick="confirmarEntrega(${c.id})"
                                                style="background: #F59E0B; color: white; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                                                ✓ Confirmar
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                `}
            </div>
        </main>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            #btn-ver-todos:hover { background: #f1f5f9; }
            #btn-adicionar:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
        </style>
    `

    const btnVer = document.getElementById('btn-ver-todos')
    if (btnVer) btnVer.addEventListener('click', () => renderizarCards())

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

        <main style="padding: 90px 20px 20px; max-width: 900px; margin: 0 auto; animation: fadeIn 0.3s ease;">
            <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
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
                    <h1 style="margin: 0; font-size: 20px; color: #0f172a; font-weight: 700;">Compras Realizadas</h1>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">Histórico de compras dos alunos</p>
                </div>
                <button id="btn-voltar-compras"
                    style="
                        background: none;
                        border: none;
                        color: #64748b;
                        font-size: 13px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                    "
                >
                    <i class="fa-solid fa-chevron-left" style="font-size: 11px;"></i>
                    Voltar
                </button>
            </div>

            ${compras.length === 0 ? `
                <p style="color: #94a3b8; text-align: center; padding: 40px;">Nenhuma compra realizada ainda.</p>
            ` : `
                <div style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <div style="background: #dcfce7; border-radius: 8px; padding: 10px 16px; flex: 1; min-width: 200px;">
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">TOTAL DE COMPRAS</div>
                        <div style="font-size: 22px; font-weight: 700; color: #166534;">${compras.length}</div>
                    </div>
                    <div style="background: #dbeafe; border-radius: 8px; padding: 10px 16px; flex: 1; min-width: 200px;">
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">AUTORIZADAS PELO PAI</div>
                        <div style="font-size: 22px; font-weight: 700; color: #1e40af;">${comprasAutorizadas.length}</div>
                    </div>
                    <div style="background: #fef3c7; border-radius: 8px; padding: 10px 16px; flex: 1; min-width: 200px;">
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">COMPRAS DIRETAS</div>
                        <div style="font-size: 22px; font-weight: 700; color: #92400e;">${comprasDiretas.length}</div>
                    </div>
                </div>

                ${comprasAutorizadas.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                            ✅ Autorizadas pelo Responsável (${comprasAutorizadas.length})
                        </h3>
                        ${comprasAutorizadas.map(compra => `
                            <div style="
                                background: white;
                                border-radius: 10px;
                                padding: 14px 16px;
                                border-left: 4px solid #10B981;
                                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                                margin-bottom: 10px;
                            ">
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
                                            <span style="font-size: 11px; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 600;">✓ Entregue</span>
                                        ` : `
                                            <button onclick="confirmarEntrega(${compra.id})"
                                                style="background: #10B981; color: white; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11px; cursor: pointer; font-weight: 600;">
                                                ✓ Confirmar Entrega
                                            </button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${comprasDiretas.length > 0 ? `
                    <div>
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a; font-weight: 600;">
                            🔓 Compras Diretas (${comprasDiretas.length})
                        </h3>
                        ${comprasDiretas.map(compra => `
                            <div style="
                                background: white;
                                border-radius: 10px;
                                padding: 14px 16px;
                                border-left: 4px solid #F59E0B;
                                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                                margin-bottom: 10px;
                            ">
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
                                            <span style="font-size: 11px; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 600;">✓ Entregue</span>
                                        ` : `
                                            <button onclick="confirmarEntrega(${compra.id})"
                                                style="background: #F59E0B; color: white; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11px; cursor: pointer; font-weight: 600;">
                                                ✓ Confirmar Entrega
                                            </button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `}

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

window.addEventListener('DOMContentLoaded', Render)

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
