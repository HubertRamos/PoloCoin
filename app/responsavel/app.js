import { gerenciarConsentimento } from "../../components/OcorrenciaConsentimento/index.js"
import { renderDashboard } from "../../components/TelaResponsavel/index.js"
import TelaOcorrencias from "../../components/TelaOcorrencias/index.js"
import TelaSenha from "../../components/TelaSenha/index.js"

const root = document.getElementById("root")
const user = JSON.parse(sessionStorage.getItem("poloUser") || "{}")

const menuItens = [
    { key: 'dashboard', nome: 'Painel do Responsável', icone: '👨‍👧‍👦' },
    { key: 'ocorrencias', nome: 'Ocorrências', icone: '📋' },
    { key: 'senha', nome: 'Alterar Senha', icone: '🔒' },
]

function renderSidebar() {
    const botoes = menuItens.map(item => `
        <button
            onclick="window.navegarPara('${item.key}')"
            class="polocoin-sidebar__btn"
        >
            <span class="polocoin-sidebar__btn-icon">${item.icone}</span>
            <span class="polocoin-sidebar__btn-label">${item.nome}</span>
        </button>
    `).join('')

    return `
        <div class="polocoin-layout">
            <div id="sidebar-overlay" class="polocoin-sidebar-overlay polocoin-sidebar-overlay--hidden" onclick="closeMobileSidebar()"></div>

            <button class="polocoin-sidebar-toggle" id="sidebar-toggle" onclick="toggleMobileSidebar()">
                <span class="polocoin-sidebar-toggle__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </span>
            </button>

            <aside class="polocoin-sidebar" id="sidebar">
                <div class="polocoin-sidebar__header">
                    <div class="polocoin-sidebar__avatar">
                        <span>👨‍👧‍👦</span>
                    </div>
                    <div class="polocoin-sidebar__user-name">Responsável</div>
                </div>
                <h1 style="font-size: 18px; text-align: center; margin: -15px 0 -5px 0">PoloCoin</h1>
                <div class="polocoin-sidebar__divider"></div>

                <nav class="polocoin-sidebar__nav">
                    ${botoes}
                </nav>

                <div class="polocoin-sidebar__divider"></div>

                <button
                    onclick="window.sair()"
                    class="polocoin-sidebar__btn polocoin-sidebar__btn-danger"
                >
                    <span class="polocoin-sidebar__btn-icon">🚪</span>
                    <span class="polocoin-sidebar__btn-label">Sair</span>
                </button>
            </aside>

            <main id="conteudo-principal" class="polocoin-main">
                <div class="empty-state">
                    <div class="empty-state__icon">👋</div>
                    <h2 class="empty-state__text">Selecione uma opção</h2>
                    <p style="font-size: 14px; color: #94a3b8;">Use o menu à esquerda para navegar.</p>
                </div>
            </main>
        </div>
    `
}

window.navegarPara = async function(tela) {
    const conteudo = document.getElementById('conteudo-principal')
    if (!conteudo) return

    conteudo.innerHTML = `
        <div class="loading-state">
            <div class="loading-state__icon">⏳</div>
            <p>Carregando...</p>
        </div>
    `

    try {
        switch (tela) {
            case 'dashboard':
                await renderDashboard(conteudo)
                break
            case 'ocorrencias':
                await TelaOcorrencias(conteudo, user.id)
                break
            case 'senha':
                await TelaSenha(conteudo, user.id)
                break
        }
    } catch (erro) {
        console.error('Erro ao carregar tela:', erro)
        conteudo.innerHTML = `
            <div class="alert alert-danger">
                <span>⚠️</span>
                <p>Erro ao carregar. Tente novamente.</p>
            </div>
        `
    }

    closeMobileSidebar()
}

window.sair = function() {
    sessionStorage.removeItem('poloUser')
    window.location.href = '/index.html'
}

window.toggleMobileSidebar = function() {
    const sidebar = document.querySelector('.polocoin-sidebar')
    const overlay = document.getElementById('sidebar-overlay')
    if (sidebar) sidebar.classList.toggle('polocoin-sidebar--open')
    if (overlay) overlay.classList.toggle('polocoin-sidebar-overlay--visible')
}

window.closeMobileSidebar = function() {
    const sidebar = document.querySelector('.polocoin-sidebar')
    const overlay = document.getElementById('sidebar-overlay')
    if (sidebar) sidebar.classList.remove('polocoin-sidebar--open')
    if (overlay) overlay.classList.remove('polocoin-sidebar-overlay--visible')
}

// Funções globais para os cards de filho/desejo
window.liberarCompra = async function(alunoId) {
    try {
        const resposta = await fetch('/aluno/pode-comprar', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, pode_comprar: true }),
        })
        if (resposta.ok) {
            alert('✅ Compra liberada para este aluno!')
            window.location.reload()
        } else {
            alert('Erro ao liberar compra.')
        }
    } catch (erro) {
        console.error('Erro ao liberar compra:', erro)
        alert('Erro de conexão.')
    }
}

window.bloquearCompra = async function(alunoId) {
    try {
        const resposta = await fetch('/aluno/pode-comprar', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, pode_comprar: false }),
        })
        if (resposta.ok) {
            alert('🔒 Compra bloqueada para este aluno!')
            window.location.reload()
        } else {
            alert('Erro ao bloquear compra.')
        }
    } catch (erro) {
        console.error('Erro ao bloquear compra:', erro)
        alert('Erro de conexão.')
    }
}

window.autorizarCompra = async function(alunoId, produtoId, nomeProduto, custoPontos) {
    if (!confirm(`Autorizar a compra de "${nomeProduto}" (🪙 ${custoPontos} pontos) para o aluno?`)) {
        return
    }
    try {
        const resposta = await fetch('/responsavel/comprar-desejo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, produto_id: produtoId }),
        })
        const resultado = await resposta.json()
        if (resposta.ok) {
            alert(`✅ Compra autorizada!\n\n"${resultado.produto?.nome}" por 🪙 ${resultado.produto?.custo_pontos} pontos.\nSaldo restante do aluno: 🪙 ${resultado.saldo_restante}`)
            window.location.reload()
        } else {
            if (resultado.error && resultado.error.includes('Saldo insuficiente')) {
                alert('❌ O aluno não tem pontos suficientes para esta compra.')
            } else {
                alert('❌ Erro ao autorizar compra: ' + (resultado.error || 'Desconhecido'))
            }
        }
    } catch (erro) {
        console.error('Erro ao autorizar compra:', erro)
        alert('Erro de conexão.')
    }
}

/** Verifica ocorrências negativas pendentes */
async function verificarOcorrenciasNegativas() {
    if (!user.id) return []
    try {
        const resposta = await fetch(`/responsavel/ocorrencias?id=${user.id}`)
        const ocorrencias = await resposta.json()
        return ocorrencias || []
    } catch (erro) {
        console.error("Erro ao verificar ocorrências:", erro)
        return []
    }
}

/** Renderiza o dashboard principal */
function Render() {
    root.innerHTML = renderSidebar()

    setTimeout(() => {
        window.navegarPara('dashboard')
    }, 0)
}

/** Entrada do sistema */
window.addEventListener("DOMContentLoaded", async () => {
    if (!user.id) {
        window.location.href = '/index.html'
        return
    }

    const ocorrencias = await verificarOcorrenciasNegativas()
    if (ocorrencias.length > 0) {
        gerenciarConsentimento(root, ocorrencias, () => {
            Render()
        })
    } else {
        Render()
    }
})
