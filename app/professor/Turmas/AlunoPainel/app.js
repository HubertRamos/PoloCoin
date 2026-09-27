import Header from "../../../components/Header/index.js"

const root = document.getElementById("root")

const params = new URLSearchParams(window.location.search)
const alunoId = params.get("alunoId")
const turmaId = params.get("turmaId")

const sessionUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
const professorId = sessionUser.id || null

const categoriasAvaliacao = [
    {
        nome: "Comportamento",
        opcoes: [
            { valor: "produtivo",      label: "Produtivo",     cor: "#10B981" },
            { valor: "bagunça",        label: "Bagunça",       cor: "#EF4444" },
            { valor: "calmo",          label: "Calmo",         cor: "#3B82F6" },
            { valor: "agitado",        label: "Agitado",       cor: "#F59E0B" },
            { valor: "participativo",  label: "Participativo",cor: "#8B5CF6" },
            { valor: "desmotivado",    label: "Desmotivado",   cor: "#6B7280" },
        ],
    },
    {
        nome: "Comprometimento",
        opcoes: [
            { valor: "comprometido",   label: "Comprometido",  cor: "#10B981" },
            { valor: "desinteressado", label: "Desinteressado",cor: "#EF4444" },
            { valor: "proativo",       label: "Proativo",     cor: "#3B82F6" },
            { valor: "indiferente",    label: "Indiferente",  cor: "#F59E0B" },
        ],
    },
    {
        nome: "Social",
        opcoes: [
            { valor: "colaborador",    label: "Colaborador",   cor: "#10B981" },
            { valor: "isolado",        label: "Isolado",       cor: "#6B7280" },
            { valor: "líder",          label: "Líder",         cor: "#8B5CF6" },
            { valor: "conflituante",   label: "Conflituante", cor: "#EF4444" },
        ],
    },
    {
        nome: "Entrega",
        opcoes: [
            { valor: "no prazo",       label: "No prazo",      cor: "#10B981" },
            { valor: "atrasado",       label: "Atrasado",      cor: "#F59E0B" },
            { valor: "não entregou",   label: "Não entregou", cor: "#EF4444" },
            { valor: "antecipou",      label: "Antecipou",     cor: "#3B82F6" },
        ],
    },
]

let avaliacoes = []

async function carregarDadosDoAluno() {
    const contentDiv = document.getElementById("painel-conteudo")
    if (!contentDiv || !alunoId) return

    try {
        let turmaEncontrada = null
        let alunoEncontrado = null

        if (turmaId) {
            const turmaResp = await fetch(`http://localhost:3333/turmas/${turmaId}`)
            if (turmaResp.ok) {
                turmaEncontrada = await turmaResp.json()
            }
        }

        if (!turmaEncontrada) {
            const turmas = await fetch("http://localhost:3333/turmas").then(r => r.json())
            for (const t of turmas) {
                const alunos = await fetch(`http://localhost:3333/turmas/${t.id}/alunos`).then(r => r.json())
                const a = alunos.find(al => al.id == alunoId)
                if (a) { alunoEncontrado = a; turmaEncontrada = t; break }
            }
        } else {
            const alunos = await fetch(`http://localhost:3333/turmas/${turmaId}/alunos`).then(r => r.json())
            alunoEncontrado = alunos.find(a => a.id == alunoId)
        }

        if (!alunoEncontrado) {
            contentDiv.innerHTML = `<div class="alert alert-danger">Aluno não encontrado.</div>`
            return
        }

        avaliacoes = await fetch(`http://localhost:3333/avaliacoes/${alunoId}`).then(r => r.json())

        contentDiv.innerHTML = `
            <div class="card card--lg">
                <div class="card__header">
                    <h2 class="card__title-lg">Painel do Aluno</h2>
                    <div class="card__badge">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                </div>
                <hr class="card__divider" />
                <div class="card__info-grid">
                    <div class="card__info-item">
                        <span class="card__info-label">Nome</span>
                        <span class="card__info-value">${alunoEncontrado.aluno_nome}</span>
                    </div>
                    <div class="card__info-item">
                        <span class="card__info-label">Responsável</span>
                        <span class="card__info-value">${alunoEncontrado.responsavel_nome}</span>
                    </div>
                    <div class="card__info-item">
                        <span class="card__info-label">Turma</span>
                        <span class="card__info-value">${turmaEncontrada ? `${turmaEncontrada.serie}º ${turmaEncontrada.turma}` : "N/A"}</span>
                    </div>
                </div>

                <div class="card__section">
                    <h3 class="card__section-title">
                        <i class="fas fa-history"></i>
                        Registros anteriores
                    </h3>
                    ${avaliacoes.length === 0
                        ? '<p class="card__empty">Nenhuma avaliação ainda.</p>'
                        : avaliacoes.map(av => `
                            <div class="avaliacao-item" style="border-left-color: ${getCorByValor(av.categoria, av.valor)};">
                                <div class="avaliacao-item__header">
                                    <span class="avaliacao-item__categoria">${capitalizar(av.categoria)}</span>
                                    <span class="avaliacao-item__valor">${av.valor}</span>
                                </div>
                                ${av.observacao ? `<p class="avaliacao-item__obs">📝 ${av.observacao}</p>` : ""}
                                <small class="avaliacao-item__data">${av.data} ${av.hora}</small>
                            </div>
                        `).join('')}
                </div>

                <div class="card__section">
                    <h3 class="card__section-title">
                        <i class="fas fa-plus-circle"></i>
                        Nova avaliação
                    </h3>

                    <div class="avaliacoes-grid">
                        ${categoriasAvaliacao.map(cat => `
                            <div class="avaliacao-cat">
                                <small class="avaliacao-cat__label">${cat.nome}</small>
                                <div class="avaliacao-cat__buttons">
                                    ${cat.opcoes.map(op => `
                                        <button data-categoria="${cat.nome.toLowerCase()}" data-valor="${op.valor}"
                                            class="btn-avaliacao" style="background-color: ${op.cor};"
                                            data-professor-id="${professorId || ""}">
                                            ${op.label}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="card__section card__section--obs">
                    <h3 class="card__section-title">
                        <i class="fas fa-pen"></i>
                        Observação
                    </h3>
                    <div class="obs-form">
                        <input id="obs-input" type="text" placeholder="ex: chegou atrasado, não trouxe material..."
                            class="form-input" />
                        <div class="obs-form__date-time">
                            <input id="data-input" type="date" class="form-input form-input--sm" />
                            <input id="hora-input" type="time" class="form-input form-input--sm" />
                        </div>
                        <p id="obs-aviso" class="alert alert-danger alert--sm" style="display: none;">
                            Preencha a observação para registrar.
                        </p>
                        <button id="btn-registrar-obs" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            Registrar observação
                        </button>
                    </div>
                </div>
            </div>
        `

        const agora = new Date()
        document.getElementById("data-input").value = agora.toISOString().split("T")[0]
        document.getElementById("hora-input").value = agora.toTimeString().slice(0, 5)

        document.querySelectorAll("button[data-categoria]").forEach(btn => {
            btn.addEventListener("click", async () => {
                const categoria = btn.getAttribute("data-categoria")
                const valor = btn.getAttribute("data-valor")
                const pid = btn.getAttribute("data-professor-id") || professorId

                if (!pid) { alert("Professor não logado."); return }

                try {
                    const res = await fetch("http://localhost:3333/avaliacoes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ alunoId, professorId: pid, categoria, valor, observacao: "" }),
                    })
                    const data = await res.json()
                    if (res.ok) {
                        alert(`Registrado: ${capitalizar(categoria)} → ${btn.textContent}`)
                        carregarDadosDoAluno()
                    } else {
                        alert(data.error || "Erro ao registrar.")
                    }
                } catch (erro) {
                    alert("Não foi possível conectar ao servidor.")
                }
            })
        })

        document.getElementById("btn-registrar-obs").addEventListener("click", async () => {
            const obs = document.getElementById("obs-input").value.trim()
            const data = document.getElementById("data-input").value
            const hora = document.getElementById("hora-input").value
            const aviso = document.getElementById("obs-aviso")

            if (!obs) { aviso.style.display = "block"; return }
            aviso.style.display = "none"

            if (!professorId) { alert("Professor não logado."); return }

            try {
                const res = await fetch("http://localhost:3333/avaliacoes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ alunoId, professorId, categoria: "observacao", valor: obs, observacao: `${obs} — ${data} ${hora}` }),
                })
                const dataRes = await res.json()
                if (res.ok) {
                    alert("Observação registrada!")
                    document.getElementById("obs-input").value = ""
                    carregarDadosDoAluno()
                } else {
                    alert(dataRes.error || "Erro ao registrar.")
                }
            } catch (erro) {
                alert("Não foi possível conectar ao servidor.")
            }
        })
    } catch (erro) {
        console.error("Erro:", erro)
        contentDiv.innerHTML = `<div class="alert alert-danger">Erro ao carregar os dados do aluno.</div>`
    }
}

function capitalizar(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

function getCorByValor(cat, val) {
    for (const c of categoriasAvaliacao) {
        const op = c.opcoes.find(o => o.valor === val)
        if (op) return op.cor
    }
    return "#3B82F6"
}

function Render() {
    root.innerHTML = `
        ${Header({ 'Turmas': ['/app/professor/Turmas/index.html'] })}

        <div class="back-link">
            <a href="/app/professor/Turmas/alunos.html?turmaId=${turmaId || ""}">
                <i class="fas fa-arrow-left"></i>
                Voltar para Alunos
            </a>
        </div>

        <main class="polocoin-main">
            <div class="polocoin-main__layout" style="justify-content: center;">
                <div class="polocoin-main__section polocoin-main__section--centered" style="flex: 1; min-width: 300px; max-width: 700px;">
                    <div id="painel-conteudo"></div>
                </div>
            </div>
        </main>
    `

    carregarDadosDoAluno()
}

window.addEventListener("DOMContentLoaded", Render)
