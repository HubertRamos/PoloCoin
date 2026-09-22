import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"

const root = document.getElementById("root")

async function carregarTurmas() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return

    try {
        const resposta = await fetch("http://localhost:3333/turmas")
        const turmas = await resposta.json()

        if (turmas.length === 0) {
            contentDiv.innerHTML = `<p style="color: #64748b;">Nenhuma turma cadastrada ainda.</p>`
            return
        }

        contentDiv.innerHTML = turmas.map(turma => `
            <div class="card-turma" data-id="${turma.id}" style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; margin-bottom: 10px;">
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
