import Header from '../../../components/Header/index.js'
import { linksHeader } from '../constLinks.js'

const root = document.getElementById('root')

let compras = []
let produtosFiltro = []
let categoriasFiltro = []
let turmasFiltro = []
let filtroProduto = null
let filtroCategoria = null
let filtroTurmaId = null
let filtroTurmaNome = null

function formatarData(dateStr) {
    if (!dateStr) return '—'
    try {
        const d = new Date(dateStr)
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
        return dateStr
    }
}

async function carregarCompras() {
    try {
        const params = new URLSearchParams()
        if (filtroProduto) params.set('produto', filtroProduto)
        if (filtroCategoria) params.set('categoria', filtroCategoria)
        if (filtroTurmaId) params.set('turma_id', filtroTurmaId)

        const res = await fetch(`/admin/entregas-pendentes${params.toString() ? '?' + params : ''}`)
        if (!res.ok) throw new Error('Erro ao buscar')
        compras = await res.json()
    } catch (e) {
        console.error('Erro ao carregar compras:', e)
        compras = []
    }
}

async function carregarFiltros() {
    try {
        const [p, c, t] = await Promise.all([
            fetch('/admin/entregas-pendentes/produtos').then(r => r.json()),
            fetch('/admin/entregas-pendentes/categorias').then(r => r.json()),
            fetch('/admin/entregas-pendentes/turmas').then(r => r.json()),
        ])
        produtosFiltro = p || []
        categoriasFiltro = c || []
        turmasFiltro = t || []
    } catch (e) {
        console.error('Erro ao carregar filtros:', e)
    }
}

function abrirModalFiltro(tipo) {
    root.innerHTML = `
        ${Header(linksHeader)}
        <main class="polocoin-main" style="max-width: 420px;">
            <div style="margin-bottom: 20px; text-align: center;">
                <button id="btn-voltar" class="btn btn-ghost">
                    <i class="fa-solid fa-xmark"></i> Fechar
                </button>
            </div>
            <h2 style="font-size: 16px; color: #0f172a; margin-bottom: 16px;">Filtrar por ${tipo === 'produto' ? 'Produto' : tipo === 'categoria' ? 'Categoria' : 'Turma'}</h2>
            <div id="opcoes-filtro"></div>
        </main>
    `

    const btnVoltar = document.getElementById('btn-voltar')
    if (btnVoltar) btnVoltar.addEventListener('click', () => Render())

    const container = document.getElementById('opcoes-filtro')
    if (!container) return

    if (tipo === 'produto') {
        container.innerHTML = produtosFiltro.length === 0
            ? '<p style="color:#94a3b8; font-size:13px;">Nenhum produto com entrega pendente.</p>'
            : produtosFiltro.map(p => `
                <label style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:6px; cursor:pointer;">
                    <input type="radio" name="filtro" value="produto" style="accent-color:#3b82f6;" onchange="window.aplicarFiltro('produto', '${p.produto_nome.replace(/'/g, "\\'")}')">
                    <div>
                        <strong style="font-size:13px; color:#0f172a;">${p.produto_nome}</strong>
                        <small style="color:#94a3b8; font-size:11px;">🪙 ${p.custo_pontos} pts</small>
                    </div>
                </label>
            `).join('')
    }

    if (tipo === 'categoria') {
        container.innerHTML = categoriasFiltro.length === 0
            ? '<p style="color:#94a3b8; font-size:13px;">Nenhuma categoria com entrega pendente.</p>'
            : categoriasFiltro.map(c => `
                <label style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:6px; cursor:pointer;">
                    <input type="radio" name="filtro" value="categoria" style="accent-color:#3b82f6;" onchange="window.aplicarFiltro('categoria', '${c.categoria_nome.replace(/'/g, "\\'")}')">
                    <strong style="font-size:13px; color:#0f172a;">${c.categoria_nome}</strong>
                </label>
            `).join('')
    }

    if (tipo === 'turma') {
        container.innerHTML = turmasFiltro.length === 0
            ? '<p style="color:#94a3b8; font-size:13px;">Nenhuma turma com entrega pendente.</p>'
            : turmasFiltro.map(t => `
                <label style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:6px; cursor:pointer;">
                    <input type="radio" name="filtro" value="turma" style="accent-color:#3b82f6;" onchange="window.aplicarFiltro('turma', ${t.id})">
                    <strong style="font-size:13px; color:#0f172a;">${t.turma_nome}</strong>
                </label>
            `).join('')
    }

    // Adicionar 선택지를 modal에 추가
    container.innerHTML += `
        <label style="display:flex; align-items:center; gap:8px; padding:8px; border:1px solid #e2e8f0; border-radius:6px; margin-top:12px; cursor:pointer; background:#f8fafc;">
            <input type="radio" name="filtro" value="limpar" onchange="window.aplicarFiltro('limpar')">
            <strong style="font-size:13px; color:#64748b;">✕ Sem filtro (mostrar todos)</strong>
        </label>
    `
}

window.aplicarFiltro = async (tipo, valor) => {
    if (tipo === 'produto') {
        filtroProduto = valor
        filtroCategoria = null
        filtroTurmaId = null
        filtroTurmaNome = null
    } else if (tipo === 'categoria') {
        filtroCategoria = valor
        filtroProduto = null
        filtroTurmaId = null
        filtroTurmaNome = null
    } else if (tipo === 'turma') {
        filtroTurmaId = valor
        const t = turmasFiltro.find(t => t.id === valor)
        filtroTurmaNome = t ? t.turma_nome : null
        filtroProduto = null
        filtroCategoria = null
    } else if (tipo === 'limpar') {
        filtroProduto = null
        filtroCategoria = null
        filtroTurmaId = null
        filtroTurmaNome = null
    }
    await carregarCompras()
    Render()
}

async function confirmarEntrega(compraId) {
    try {
        const res = await fetch(`/admin/compras/${compraId}/entregar`, { method: 'PATCH' })
        const data = await res.json()
        if (!res.ok) {
            alert(data.error || 'Erro ao confirmar entrega.')
            return
        }
        alert('✓ Entrega confirmada!')
        await carregarCompras()
        await carregarFiltros()
        setTimeout(() => Render(), 300)
    } catch (e) {
        alert('Erro de conexão. Tente novamente.')
    }
}


function imprimirPendentes() {

    if (compras.length === 0) {
        alert('Não existem entregas pendentes para imprimir.')
        return
    }

    const printArea = document.getElementById('print-area')

    const filtros = []

    if (filtroProduto)
        filtros.push(`Produto: ${filtroProduto}`)

    if (filtroCategoria)
        filtros.push(`Categoria: ${filtroCategoria}`)

    if (filtroTurmaNome)
        filtros.push(`Turma: ${filtroTurmaNome}`)

    printArea.innerHTML = `
        <div class="print-wrapper">

            <h1>PoloCoin - Entregas Pendentes</h1>

            <p>
                <strong>Data:</strong>
                ${new Date().toLocaleString('pt-BR')}
            </p>

            <p>
                <strong>Filtros:</strong>
                ${filtros.length ? filtros.join(' | ') : 'Nenhum'}
            </p>

            <p>
                <strong>Total:</strong>
                ${compras.length} entrega(s)
            </p>

            <table>
                <thead>
                    <tr>
                        <th>Aluno</th>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Turma</th>
                        <th>Pontos</th>
                        <th>Data</th>
                    </tr>
                </thead>

                <tbody>
                    ${compras.map(c => `
                        <tr>
                            <td>${c.aluno_nome || '-'}</td>
                            <td>${c.produto_nome || '-'}</td>
                            <td>${c.categoria_nome || '-'}</td>
                            <td>${c.turma_nome || '-'}</td>
                            <td>${c.custo_pontos || 0}</td>
                            <td>${formatarData(c.criado_em)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `

    setTimeout(() => {
    window.print()
}, 100)
}


async function Render() {
    await carregarCompras()
    await carregarFiltros()

    root.innerHTML = `
        ${Header(linksHeader)}

        <main class="polocoin-main" style="max-width: 720px;">
            <div class="polocoin-main__header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="
                        width: 36px;
                        height: 36px;
                        background: linear-gradient(135deg, #F59E0B, #D97706);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <i class="fa-solid fa-truck" style="color: white; font-size: 14px;"></i>
                    </div>
                    <div>
                        <h1 class="polocoin-main__title">Entregas Pendentes</h1>
                        <p class="polocoin-main__subtitle">Produtos comprados que ainda não foram entregues</p>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button id="btn-imprimir" class="btn btn-primary" style="font-size:12px;">
                        <i class="fa-solid fa-print"></i> Imprimir Pendentes
                    </button>
                    <button id="btn-filtro-produto" class="btn btn-secondary" style="font-size:12px;">
                        <i class="fa-solid fa-filter"></i> Filtrar por Produto
                    </button>
                    <button id="btn-filtro-categoria" class="btn btn-secondary" style="font-size:12px;">
                        <i class="fa-solid fa-filter"></i> Filtrar por Categoria
                    </button>
                    <button id="btn-filtro-turma" class="btn btn-secondary" style="font-size:12px;">
                        <i class="fa-solid fa-filter"></i> Filtrar por Turma
                    </button>
                </div>
            </div>

            <div id="dashboard-content"></div>
            <div id="print-area" style="display:none;"></div>
        </main>

        <style>
            #btn-filtro-produto:hover,
            #btn-filtro-categoria:hover,
            #btn-filtro-turma:hover {
                background: #f1f5f9;
            }

@media print {

    body * {
        visibility: hidden;
    }

    #print-area,
    #print-area * {
        visibility: visible;
    }

    #print-area {
        display: block !important;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
        padding: 20px;
    }

    #print-area h1 {
        margin-bottom: 16px;
    }

    #print-area table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
    }

    #print-area th,
    #print-area td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
    }

    #print-area tr {
        break-inside: avoid;
        page-break-inside: avoid;
    }

    .btn,
    header,
    nav {
        display: none !important;
    }
}

@page {
    margin: 15mm;
}

        </style>
    `

    renderizarCompras()

    document.getElementById('btn-filtro-produto')?.addEventListener('click', () => abrirModalFiltro('produto'))
    document.getElementById('btn-filtro-categoria')?.addEventListener('click', () => abrirModalFiltro('categoria'))
    document.getElementById('btn-filtro-turma')?.addEventListener('click', () => abrirModalFiltro('turma'))
    document.getElementById('btn-imprimir')?.addEventListener('click', imprimirPendentes)
}

function renderizarCompras() {
    const content = document.getElementById('dashboard-content')
    if (!content) return

    const filtroAtivo = filtroProduto || filtroCategoria || filtroTurmaId
    const tituloFiltro = filtroAtivo ? `
        <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button id="btn-limpar-filtros" class="btn btn-ghost" style="font-size:12px; color:#94a3b8;">
                <i class="fa-solid fa-eraser"></i> Limpar filtros
            </button>
            ${filtroProduto ? `<span style="font-size:12px; color:#3b82f6;">🔍 Produto: <strong>${filtroProduto}</strong></span>` : ''}
            ${filtroCategoria ? `<span style="font-size:12px; color:#3b82f6;">🔍 Categoria: <strong>${filtroCategoria}</strong></span>` : ''}
            ${filtroTurmaNome ? `<span style="font-size:12px; color:#3b82f6;">🔍 Turma: <strong>${filtroTurmaNome}</strong></span>` : ''}
        </div>
    ` : ''

    if (compras.length === 0) {
        content.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state__icon">📦</div>
                <p class="empty-state__text">Nenhuma entrega pendente${filtroAtivo ? ' com este filtro' : ''}.</p>
            </div>
        `
        return
    }

    content.innerHTML = `
        ${tituloFiltro}
        <div class="card-grid">
            ${compras.map(c => `
                <div class="card" style="border-left: 4px solid #F59E0B;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                        <div>
                            <strong style="font-size: 14px; color: #1e293b;">${c.produto_nome}</strong>
                            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                                Aluno: ${c.aluno_nome} · 🪙 ${c.custo_pontos} pontos
                            </div>
                            ${c.categoria_nome ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">📁 ${c.categoria_nome}</div>` : ''}
                            ${c.turma_nome ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">🏫 ${c.turma_nome}</div>` : ''}
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                            <div style="font-size: 11px; color: #64748b; text-align: right;">
                                ${formatarData(c.criado_em)}
                            </div>
                            <button onclick="confirmarEntrega(${c.id})" class="btn btn-success" style="padding: 4px 12px; font-size: 11px;">
                                ✓ Entregar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `

    const btnLimpar = document.getElementById('btn-limpar-filtros')
    if (btnLimpar) btnLimpar.addEventListener('click', () => {
        filtroProduto = null
        filtroCategoria = null
        filtroTurmaId = null
        filtroTurmaNome = null
        carregarCompras().then(() => Render())
    })
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', Render)
} else {
    Render()
}

window.confirmarEntrega = confirmarEntrega
window.aplicarFiltro = aplicarFiltro
window.Render = Render
window.abrirModalFiltro = abrirModalFiltro
