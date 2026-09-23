import DashBoard from "../../components/DashBoard/index.js"
import Header from "../../components/Header/index.js"
import { gerenciarConsentimento } from "../../components/OcorrenciaConsentimento/index.js"
import TelaResponsavel from "../../components/TelaResponsavel/index.js"

const root = document.getElementById("root")
const user = JSON.parse(sessionStorage.getItem("poloUser") || "{}")

/**
 * Busca ocorrências negativas do responsável via API.
 */
async function verificarOcorrenciasNegativas() {
    if (!user.id) return null
    try {
        const resposta = await fetch(`/responsavel/ocorrencias?id=${user.id}`)
        const ocorrencias = await resposta.json()
        return ocorrencias || []
    } catch (erro) {
        console.error("Erro ao verificar ocorrências:", erro)
        return []
    }
}

/**
 * Carrega a lista de alunos do responsável.
 */
async function carregarAlunos() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return

    if (!user.id) {
        contentDiv.innerHTML = `<p style="color: #ef4444;">Não autenticado. Faça login novamente.</p>`
        return
    }

    try {
        const resposta = await fetch(`/responsavel/alunos?id=${user.id}`)
        const alunos = await resposta.json()

        if (alunos.length === 0) {
            contentDiv.innerHTML = `<p style="color: #64748b;">Nenhum aluno associado a você.</p>`
            return
        }

        contentDiv.innerHTML = alunos.map(aluno => `
            <div style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 10px;">
                <strong>Aluno:</strong> ${aluno.aluno_nome}<br/>
                <small style="color: #64748b;">
                    Turma: ${aluno.serie}º${aluno.turma}<br/>
                    Senha do aluno: ${aluno.aluno_senha}
                </small>
            </div>
        `).join('')
    } catch (erro) {
        console.error("Erro ao carregar alunos:", erro)
        contentDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar os alunos.</p>`
    }
}

/**
 * Renderiza o dashboard principal do responsável.
 */
function Render() {
    root.innerHTML = `
        ${Header({ 'Sair': ['/index.html'] })}

        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; flex: 1; align-items: flex-start; justify-content: center;">
            <div style="flex: 2; min-width: 300px; width: 100%;">
                ${DashBoard("Meus Filhos", false, false)}
            </div>
        </main>
    `

    carregarAlunos()
    // Carrega o painel de filhos e desejos
    TelaResponsavel(root)
}

/**
 * Entrada do sistema: verifica ocorrências e decide o fluxo.
 */
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
