import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"

const root = document.getElementById("root")

const params = new URLSearchParams(window.location.search)
const turmaId = params.get("turmaId")

const sessionUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
const professorId = sessionUser.id || null

let categoriasAvaliacao = []

// Carrega as categorias de avaliação do arquivo externo
async function carregarCategoriasAvaliacao() {
    try {
        const resposta = await fetch("/const/categoriasAvaliacao.json")
        const dados = await resposta.json()
        categoriasAvaliacao = dados.categorias || []
    } catch (erro) {
        console.error("Erro ao carregar categorias de avaliação:", erro)
        categoriasAvaliacao = []
    }
}

let isModalOpen = false

// Inicializa as categorias de avaliação
carregarCategoriasAvaliacao().then(() => console.log("[DEBUG] Categorias carregadas:", categoriasAvaliacao.length))

async function carregarAlunos() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return

    if (!turmaId) {
        contentDiv.innerHTML = `<p style="color: #ef4444;">Turma não especificada.</p>`
        return
    }

    try {
        const resposta = await fetch(`http://localhost:3333/turmas/${turmaId}/alunos`)
        const alunos = await resposta.json()

        if (alunos.length === 0) {
            contentDiv.innerHTML = `<p style="color: #64748b;">Nenhum aluno cadastrado nesta turma ainda.</p>`
            return
        }

        contentDiv.innerHTML = alunos.map(aluno => `
            <div class="card-aluno" data-id="${aluno.id}" style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; margin-bottom: 10px;">
                <div>
                    <strong>Aluno:</strong> ${aluno.aluno_nome}<br/>
                    <small style="color: #64748b;">Responsável: ${aluno.responsavel_nome}</small>
                </div>
                <span style="font-size: 18px; color: #3b82f6; cursor: pointer;">➔</span>
            </div>
        `).join('')

        document.querySelectorAll(".card-aluno").forEach(card => {
            card.addEventListener("click", () => {
                const alunoId = card.getAttribute("data-id")
                abrirModalAluno(alunoId)
            })
        })
    } catch (erro) {
        console.error("Erro ao carregar alunos:", erro)
        contentDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar os alunos do servidor.</p>`
    }
}

async function abrirModalAluno(alunoId) {
    if (isModalOpen) return
    isModalOpen = true

    try {
        const alunos = await fetch(`http://localhost:3333/turmas/${turmaId}/alunos`).then(r => r.json())
        const aluno = alunos.find(a => a.id == alunoId)
        if (!aluno) { isModalOpen = false; return }

        const avaliacoes = await fetch(`http://localhost:3333/avaliacoes/${alunoId}?professorId=${professorId}`).then(r => r.json())

        const modalHtml = `
            <div id="modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2000;">
                <div id="modal-content" style="background: #fff; border-radius: 12px; width: 90%; max-width: 550px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
                        <div>
                            <h2 style="margin: 0; color: #1e293b; font-size: 18px;">${aluno.aluno_nome}</h2>
                            <small style="color: #64748b;">Responsável: ${aluno.responsavel_nome}</small>
                        </div>
                        <button id="modal-fechar" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 18px; color: #3d3d3d;">✕</button>
                    </div>

                    <div style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
                        <div style="display: grid; gap: 6px; font-size: 14px;">
                            <div><strong>ID:</strong> ${aluno.id}</div>
                            <div><strong>Turma:</strong> ${turmaId ? `Turma ${turmaId}` : "N/A"}</div>
                        </div>
                    </div>

                    <div style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
                        <h3 style="font-size: 14px; color: #3d3d3d; margin-bottom: 8px;">Registros anteriores</h3>
                        ${avaliacoes.length === 0
                            ? '<p style="color: #94a3b8; font-size: 12px;">Nenhuma avaliação ainda.</p>'
                            : avaliacoes.map(av => `
                                <div style="background: #F8FAFC; padding: 8px 10px; border-radius: 6px; margin-bottom: 5px; font-size: 12px; border-left: 3px solid ${getCorByValor(av.categoria, av.valor)};">
                                    <strong>${capitalizar(av.categoria)}:</strong> ${av.valor}
                                    ${av.pontos !== undefined ? `<span style="color: #3B82F6; font-weight: bold; margin-left: 6px;">(${av.pontos}p)</span>` : ""}
                                    ${av.observacao ? `<br/><small style="color: #64748b;">📝 ${av.observacao}</small>` : ""}
                                    <small style="color: #94a3b8; display: block; margin-top: 2px;">${av.data} ${av.hora}</small>
                                </div>
                            `).join('')}
                        }
                    </div>

                    <div style="padding: 15px 20px;">
                        <h3 style="font-size: 14px; color: #3d3d3d; margin-bottom: 10px;">Nova avaliação</h3>

                        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                            ${categoriasAvaliacao.map(cat => `
                                <div>
                                    <small style="color: #64748b; font-weight: bold; display: block; margin-bottom: 4px; font-size: 11px;">${cat.nome}</small>
                                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                        ${cat.opcoes.map(op => `
                                            <button data-categoria="${cat.nome.toLowerCase()}" data-valor="${op.valor}" data-pontos="${op.pontos}"
                                                style="background-color: ${op.cor}; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold;">
                                                ${op.label} (${op.pontos}p)
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div style="border-top: 1px solid #e2e8f0; padding-top: 10px;">
                            <small style="color: #64748b; font-weight: bold; display: block; margin-bottom: 4px; font-size: 11px;">Observação</small>
                            <div style="display: flex; gap: 6px; align-items: center;">
                                <input id="obs-input" type="text" placeholder="ex: chegou atrasado..."
                                    style="flex: 1; padding: 6px 8px; border: 1px solid #ccc; border-radius: 3px; font-size: 12px;" />
                                <input id="pts-input" type="number" min="0" max="50" placeholder="0-50"
                                    style="width: 60px; padding: 5px 6px; border: 1px solid #ccc; border-radius: 3px; font-size: 12px; text-align: center;" />
                                <span style="font-size: 10px; color: #94a3b8; white-space: nowrap;">pts (max 50)</span>
                            </div>
                            <p id="obs-aviso" style="color: #EF4444; font-size: 11px; margin-top: 3px; display: none;">Preencha a observação.</p>
                            <p id="data-auto" style="color: #64748b; font-size: 10px; margin-top: 4px;"></p>
                            <button id="btn-registrar-obs" style="margin-top: 6px; background: #3B82F6; color: white; border: none; padding: 6px 14px; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 12px;">
                                Registrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `

        root.insertAdjacentHTML("beforeend", modalHtml)
        document.getElementById("data-auto").textContent = `Data/hora automatica: ${new Date().toLocaleString("pt-BR")}`

        document.getElementById("modal-fechar").addEventListener("click", () => {
            document.getElementById("modal-overlay").remove()
            isModalOpen = false
        })

        document.querySelectorAll("#modal-content button[data-categoria]").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (!professorId) { alert("Professor não logado."); return }
                const categoria = btn.getAttribute("data-categoria")
                const valor = btn.getAttribute("data-valor")

                try {
                    const res = await fetch("http://localhost:3333/avaliacoes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ alunoId, professorId, categoria, valor, pontos: parseInt(btn.getAttribute("data-pontos")), observacao: "" }),
                    })
                    const data = await res.json()
                    if (res.ok) {
                        alert(`Registrado: ${capitalizar(categoria)} → ${btn.textContent}`)
                        document.getElementById("modal-overlay").remove()
                        isModalOpen = false
                        abrirModalAluno(alunoId)
                    } else {
                        alert(data.error || "Erro ao registrar.")
                    }
                } catch (erro) {
                    alert("Erro de conexão.")
                }
            })
        })

        document.getElementById("btn-registrar-obs").addEventListener("click", async () => {
            const obs = document.getElementById("obs-input").value.trim()
            const pts = parseInt(document.getElementById("pts-input").value) || 0
            const aviso = document.getElementById("obs-aviso")
            const agora = new Date()
            const data = agora.toISOString().split("T")[0]
            const hora = agora.toTimeString().slice(0, 5)

            if (!obs) { aviso.style.display = "block"; return }
            if (pts < 0 || pts > 50) { alert("Pontos devem ser entre 0 e 50."); return }
            aviso.style.display = "none"

            if (!professorId) { alert("Professor não logado."); return }

            try {
                const res = await fetch("http://localhost:3333/avaliacoes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ alunoId, professorId, categoria: "observacao", valor: obs, pontos: pts, observacao: `${obs} — ${data} ${hora}` }),
                })
                const dataRes = await res.json()
                if (res.ok) {
                    alert(`Observação registrada! ${pts} pts`)
                    document.getElementById("obs-input").value = ""
                    document.getElementById("pts-input").value = ""
                    document.getElementById("modal-overlay").remove()
                    isModalOpen = false
                    abrirModalAluno(alunoId)
                } else {
                    alert(dataRes.error || "Erro ao registrar.")
                }
            } catch (erro) {
                alert("Erro de conexão.")
            }
        })
    } catch (erro) {
        console.error("Erro:", erro)
        isModalOpen = false
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
            <a href="/app/professor/Turmas/index.html" style="text-decoration: none; color: #3b82f6; font-weight: bold; font-size: 14px;">← Voltar para Turmas</a>
        </div>

        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; flex: 1; align-items: center; justify-content: center;">
            <div style="flex: 2; min-width: 300px; width: 100%;">
                ${DashBoard("Alunos da Turma", false, false)}
            </div>
        </main>
    `

    carregarAlunos()
}

window.addEventListener("DOMContentLoaded", Render)
