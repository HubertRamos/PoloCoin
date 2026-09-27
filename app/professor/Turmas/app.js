import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"

const root = document.getElementById("root")

async function carregarTurmas() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return

    const usuario = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
    const professorId = usuario?.id

    if (!professorId) {
        contentDiv.innerHTML = `<div class="alert alert-danger">Não autenticado. Faça login novamente.</div>`
        return
    }

    try {
        const resposta = await fetch(`http://localhost:3333/professor/turmas?id=${professorId}&_=${Date.now()}`)
        const dados = await resposta.json()

        const turmasVinculadas = dados.vinculadas || []

        if (turmasVinculadas.length === 0) {
            contentDiv.innerHTML = `<div class="alert alert-info">Nenhuma turma vinculada a você.</div>`
            return
        }

        contentDiv.innerHTML = turmasVinculadas.map(turma => `
            <div class="card" data-id="${turma.turma_id}" style="cursor: pointer;">
                <div class="card__header-row">
                    <div class="card__icon card__icon--blue">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="card__body">
                        <strong class="card__title">Turma ${turma.serie}º ${turma.turma}</strong>
                        <small class="card__meta">Clique para ver os alunos</small>
                    </div>
                    <div class="card__arrow card__arrow--blue">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `).join('')

        document.querySelectorAll(".card[data-id]").forEach(card => {
            card.addEventListener("click", () => {
                const turmaId = card.getAttribute("data-id")
                window.location.href = `/app/professor/Turmas/alunos.html?turmaId=${turmaId}`
            })
        })
    } catch (erro) {
        console.error("Erro ao carregar turmas:", erro)
        contentDiv.innerHTML = `<div class="alert alert-danger">Erro ao carregar as turmas do servidor.</div>`
    }
}

function Render() {
    root.innerHTML = `
        ${Header({ 'Turmas': ['/app/professor/Turmas/index.html'], 'Meu Perfil': ['/app/professor/Perfil/index.html'], 'Sair':['/app/'] })}

        <main class="polocoin-main">
            <div class="polocoin-main__header">
                <div>
                    <h1 class="polocoin-main__title">Minhas Turmas</h1>
                    <p class="polocoin-main__subtitle">Gerencie as turmas vinculadas ao seu professor</p>
                </div>
            </div>

            <div class="polocoin-main__layout">
                <div class="polocoin-main__section polocoin-main__section--main">
                    ${DashBoard("Minhas Turmas", false, false)}
                </div>
            </div>

            <div id="dashboard-content" class="card-grid stagger-children"></div>
        </main>
    `

    carregarTurmas()
}

window.addEventListener("DOMContentLoaded", Render)
