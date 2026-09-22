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
            { valor: "produtivo",      label: "Produtivo",    cor: "#10B981" },
            { valor: "bagunça",        label: "Bagunça",      cor: "#EF4444" },
            { valor: "calmo",          label: "Calm",         cor: "#3B82F6" },
            { valor: "agitado",        label: "Agitado",      cor: "#F59E0B" },
            { valor: "participativo",  label: "Participativo",cor: "#8B5CF6" },
            { valor: "desmotivado",    label: "Desmotivado",  cor: "#6B7280" },
        ],
    },
    {
        nome: "Comprometimento",
        opcoes: [
            { valor: "comprometido",   label: "Comprometido", cor: "#10B981" },
            { valor: "desinteressado", label: "Desinteressado", cor: "#EF4444" },
            { valor: "proativo",       label: "Proativo",    cor: "#3B82F6" },
            { valor: "indiferente",    label: "Indiferente", cor: "#F59E0B" },
        ],
    },
    {
        nome: "Social",
        opcoes: [
            { valor: "colaborador",    label: "Colaborador",  cor: "#10B981" },
            { valor: "isolado",        label: "Isolado",      cor: "#6B7280" },
            { valor: "líder",          label: "Líder",        cor: "#8B5CF6" },
            { valor: "conflituante",   label: "Conflituante",cor: "#EF4444" },
        ],
    },
    {
        nome: "Entrega",
        opcoes: [
            { valor: "no prazo",       label: "No prazo",     cor: "#10B981" },
            { valor: "atrasado",       label: "Atrasado",     cor: "#F59E0B" },
            { valor: "não entregou",   label: "Não entregou", cor: "#EF4444" },
            { valor: "antecipou",      label: "Antecipou",    cor: "#3B82F6" },
        ],
    },
]

let avaliacoes = []

async function carregarDadosDoAluno() {
    const contentDiv = document.getElementById("painel-conteudo")
    if (!contentDiv || !alunoId) return

    try {
        // Busca a turma informada e os alunos dela
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
            contentDiv.innerHTML = `<p style="color: #ef4444;">Aluno não encontrado.</p>`
            return
        }

        // Carrega avaliações existentes
        avaliacoes = await fetch(`http://localhost:3333/avaliacoes/${alunoId}`).then(r => r.json())

        contentDiv.innerHTML = `
            <div style="background-color: #fff; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px;">
                <h2 style="margin-top: 0; color: #1e293b;">Painel do Aluno</h2>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
                <div style="display: grid; gap: 8px; margin-bottom: 20px;">
                    <div><strong>Nome:</strong> ${alunoEncontrado.aluno_nome}</div>
                    <div><strong>Responsável:</strong> ${alunoEncontrado.responsavel_nome}</div>
                    <div><strong>Turma:</strong> ${turmaEncontrada ? `${turmaEncontrada.serie}º ${turmaEncontrada.turma}` : "N/A"}</div>
                </div>

                <!-- Avaliações existentes -->
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 16px; color: #3d3d3d; margin-bottom: 10px;">Registros anteriores</h3>
                    ${avaliacoes.length === 0
                        ? '<p style="color: #94a3b8; font-size: 13px;">Nenhuma avaliação ainda.</p>'
                        : avaliacoes.map(av => `
                            <div style="background: #F8FAFC; padding: 10px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; border-left: 3px solid ${getCorByValor(av.categoria, av.valor)};">
                                <strong style="color: #1e293b;">${capitalizar(av.categoria)}:</strong> ${av.valor}
                                ${av.observacao ? `<br/><small style="color: #64748b;">📝 ${av.observacao}</small>` : ""}
                                <small style="color: #94a3b8; display: block; margin-top: 3px;">${av.data} ${av.hora}</small>
                            </div>
                        `).join('')
                    }
                </div>

                <!-- Nova avaliação -->
                <h3 style="font-size: 16px; color: #3d3d3d; margin-bottom: 10px;">Nova avaliação</h3>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px;">
                    ${categoriasAvaliacao.map(cat => `
                        <div>
                            <small style="color: #64748b; font-weight: bold; display: block; margin-bottom: 5px;">${cat.nome}</small>
                            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                ${cat.opcoes.map(op => `
                                    <button data-categoria="${cat.nome.toLowerCase()}" data-valor="${op.valor}"
                                        style="background-color: ${op.cor}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
                                        ${op.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Observação com data/hora automática -->
                <div style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    <small style="color: #64748b; font-weight: bold; display: block; margin-bottom: 5px;">Observação (ex: "chegou atrasado", "não trouxe material")</small>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input id="obs-input" type="text" placeholder="Digite a observação..."
                            style="flex: 1; padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px;" />
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                            <input id="data-input" type="date" style="padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;" />
                            <input id="hora-input" type="time" style="padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;" />
                        </div>
                    </div>
                    <p id="obs-aviso" style="color: #EF4444; font-size: 12px; margin-top: 5px; display: none;">Preencha a observação para registrar.</p>
                    <button id="btn-registrar-obs" style="margin-top: 8px; background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
                        Registrar observação
                    </button>
                </div>
            </div>
        `

        // Preenche data/hora atuais
        const agora = new Date()
        document.getElementById("data-input").value = agora.toISOString().split("T")[0]
        document.getElementById("hora-input").value = agora.toTimeString().slice(0, 5)

        // Botões de avaliação rápida
        document.querySelectorAll("button[data-categoria]").forEach(btn => {
            btn.addEventListener("click", async () => {
                const categoria = btn.getAttribute("data-categoria")
                const valor = btn.getAttribute("data-valor")

                if (!professorId) { alert("Professor não logado."); return }

                try {
                    const res = await fetch("http://localhost:3333/avaliacoes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ alunoId, professorId, categoria, valor, observacao: "" }),
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

        // Registrar observação
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
        contentDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar os dados do aluno.</p>`
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

        <div style="padding: 15px 20px 0 20px;">
            <a href="/app/professor/Turmas/alunos.html?turmaId=${turmaId || ""}" style="text-decoration: none; color: #3b82f6; font-weight: bold; font-size: 14px;">← Voltar para Alunos</a>
        </div>

        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; flex: 1; align-items: center; justify-content: center;">
            <div id="painel-conteudo" style="flex: 1; min-width: 300px;"></div>
        </main>
    `

    carregarDadosDoAluno()
}

window.addEventListener("DOMContentLoaded", Render)
