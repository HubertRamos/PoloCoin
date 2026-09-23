import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"

const root = document.getElementById("root")

async function carregarTurmas() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return

    // Pega o ID do professor logado
    const usuario = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
    const professorId = usuario?.id

    if (!professorId) {
        contentDiv.innerHTML = `<p style="color: #ef4444;">Não autenticado. Faça login novamente.</p>`
        return
    }

    try {
        // Usa o endpoint que retorna apenas as turmas vinculadas ao professor
        const resposta = await fetch(`http://localhost:3333/professor/turmas?id=${professorId}&_=${Date.now()}`)
        const dados = await resposta.json()

        const turmasVinculadas = dados.vinculadas || []
        const todasTurmas = dados.disponiveis || []

        if (turmasVinculadas.length === 0) {
            contentDiv.innerHTML = `<p style="color: #64748b;">Nenhuma turma vinculada a você.</p>`
            return
        }

        contentDiv.innerHTML = turmasVinculadas.map(turma => `
            <div class="card-turma" data-id="${turma.turma_id}" style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; margin-bottom: 10px;">
                <div>
                    <strong>Turma:</strong> ${turma.serie}º ${turma.turma} <br/>
                    <small style="color: #64748b;">Clique para ver alunos</small>
                </div>
                <span style="font-size: 18px; color: #3b82f6;">➔</span>
            </div>
        `).join('')

        document.querySelectorAll(".card-turma").forEach(card => {
            card.addEventListener("click", () => {
                const turmaId = card.getAttribute("data-id")
                window.location.href = `/app/professor/Turmas/alunos.html?turmaId=${turmaId}`
            })
        })
    } catch (erro) {
        console.error("Erro ao carregar turmas:", erro)
        contentDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar as turmas do servidor.</p>`
    }
}

function Render() {
    root.innerHTML = `
        ${Header({ 'Turmas': ['/app/professor/Turmas/index.html'], 'Meu Perfil': ['/app/professor/Perfil/index.html'] })}
        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; flex: 1; align-items: center; justify-content: center;">
            <div style="flex: 2; min-width: 300px; width: 100%;">
                ${DashBoard("Minhas Turmas", false, false)}
            </div>
        </main>
    `

    carregarTurmas()
}

window.addEventListener("DOMContentLoaded", Render)
