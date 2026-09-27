import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"

const root = document.getElementById("root")
const params = new URLSearchParams(window.location.search)
const turmaId = params.get("turmaId")

const sessionUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
const professorId = sessionUser.id || null

let categoriasAvaliacao = []
let isModalOpen = false

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

carregarCategoriasAvaliacao().then(() => console.log("[DEBUG] Categorias carregadas:", categoriasAvaliacao.length))

async function carregarAlunos() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return

    if (!turmaId) {
        contentDiv.innerHTML = `<div class="alert alert-danger">Turma não especificada.</div>`
        return
    }

    try {
        const resposta = await fetch(`/turmas/${turmaId}/alunos`)
        const alunos = await resposta.json()

        if (alunos.length === 0) {
            contentDiv.innerHTML = `<div class="alert alert-info">Nenhum aluno cadastrado nesta turma ainda.</div>`
            return
        }

        contentDiv.innerHTML = alunos.map(aluno => `
            <div class="card card--hover" data-id="${aluno.id}" style="cursor:pointer;">
                <div class="card__header-row">
                    <div class="card__icon card__icon--green">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="card__body">
                        <strong class="card__title">${aluno.aluno_nome}</strong>
                        <small class="card__meta">Responsável: ${aluno.responsavel_nome}</small>
                    </div>
                    <div class="card__arrow card__arrow--green">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `).join('')

        document.querySelectorAll(".card--hover[data-id]").forEach(card => {
            card.addEventListener("click", () => {
                const alunoId = card.getAttribute("data-id")
                console.log("[AVAL] Card clicado — alunoId:", alunoId)
                abrirModalAluno(alunoId)
            })
        })
        console.log("[AVAL] Cards renderizados:", document.querySelectorAll(".card--hover").length)
    } catch (erro) {
        console.error("Erro ao carregar alunos:", erro)
        contentDiv.innerHTML = `<div class="alert alert-danger">Erro ao carregar os alunos do servidor.</div>`
    }
}

async function abrirModalAluno(alunoId, estadoDesejado) {
    console.log("[AVAL] abrirModalAluno chamado — alunoId:", alunoId, "estado:", estadoDesejado || 'none');
    try {
        const sessionUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
        const pId = sessionUser.id || professorId
        console.log("[AVAL] Fetch avaliacoes — alunoId:", alunoId, "professorId:", pId)
        const alunos = await fetch(`/turmas/${turmaId}/alunos`).then(r => r.json())
        const aluno = alunos.find(a => a.id == alunoId)
        if (!aluno) { isModalOpen = false; return }

        const avaliacoes = await fetch(`/avaliacoes/${alunoId}?professorId=${pId}`).then(r => r.json())
        console.log("[AVAL] Avaliacoes fetchadas:", avaliacoes.length, avaliacoes)

        // Normaliza campo data para YYYY-MM-DD (a API pode retornar Date ou ISO string)
        avaliacoes.forEach(av => {
            if (av.data instanceof Date) {
                av.data = av.data.toISOString().split('T')[0]
            } else if (typeof av.data === 'string' && av.data.includes('T')) {
                av.data = av.data.split('T')[0]
            }
        })

        // Calcula "hoje" no fuso horário local do browser (não UTC)
function getDataHojeLocal() {
    const agora = new Date()
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).formatToParts(agora)
    const y = parts.find(p => p.type === 'year').value
    const m = parts.find(p => p.type === 'month').value
    const d = parts.find(p => p.type === 'day').value
    return `${y}-${m}-${d}`
}

const hoje = getDataHojeLocal()
        const hojeAvaliacoes = avaliacoes.filter(av => {
            const avData = typeof av.data === 'string' ? av.data.split('T')[0] : av.data
            return avData === hoje
        })
        const historicoAvaliacoes = avaliacoes.filter(av => {
            const avData = typeof av.data === 'string' ? av.data.split('T')[0] : av.data
            return avData !== hoje
        })

        const gruposHistorico = {}
        historicoAvaliacoes.forEach(av => {
            if (!gruposHistorico[av.data]) gruposHistorico[av.data] = []
            gruposHistorico[av.data].push(av)
        })
        const chavesHistorico = Object.keys(gruposHistorico).sort((a, b) => b > a ? 1 : -1)

        let capsulaEstadoAtual = estadoDesejado || 'hoje'

        function capsulaHTML(estado) {
            const botoes = [
                { key: 'hoje', label: '📋 Hoje', bg: estado === 'hoje' ? '#0f172a' : 'transparent', fg: estado === 'hoje' ? '#fff' : '#0f172a' },
                { key: 'historico', label: '🕓 Histórico', bg: estado === 'historico' ? '#0f172a' : 'transparent', fg: estado === 'historico' ? '#fff' : '#0f172a' },
                { key: 'novo', label: '✏️ Nova ocorrência', bg: estado === 'novo' ? '#0f172a' : 'transparent', fg: estado === 'novo' ? '#fff' : '#0f172a' },
            ]
            return `
                <div class="capsula-top" style="display:flex; gap:6px; margin-bottom:12px;">
                    ${botoes.map(b => `
                        <button data-capsula-estado="${b.key}"
                            style="flex:1; padding:8px 12px; border:none; border-radius:8px; background:${b.bg}; color:${b.fg};
                                   font-size:12px; font-weight:600; cursor:pointer; transition:opacity 0.15s; text-align:center;"
                            onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                            ${b.label}
                        </button>
                    `).join('')}
                </div>
            `
        }

        function renderAvaliacaoItem(av) {
            return `<div class="av-list-item" style="border-left-color:${getCorByValor(av.categoria, av.valor)};">
                <strong>${capitalizar(av.categoria)}:</strong> ${av.valor}
                ${av.pontos !== undefined ? ` <span class="pts-badge">${av.pontos}p</span>` : ""}
                ${av.observacao ? `<br/><small class="text-muted">📝 ${av.observacao}</small>` : ""}
                <small class="text-muted text-xs" style="display:block; margin-top:4px;">🕐 ${av.hora}</small>
            </div>`
        }

        function renderHistoricoHTML() {
            if (chavesHistorico.length === 0) return '<p class="text-muted">Nenhum registro no histórico.</p>'
            const totalAvaliacoes = historicoAvaliacoes.length
            const totalPontos = historicoAvaliacoes.reduce((s, av) => s + (av.pontos || 0), 0)
            return `<div class="modal-historico-resumo" style="margin-bottom:12px; padding:8px 12px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0;">
                <small class="text-muted">📊 Total: <strong>${totalAvaliacoes}</strong> avaliação(ões) &nbsp;|&nbsp; 📈 <strong>${totalPontos}</strong> pts</small>
            </div>` + chavesHistorico.map(data => {
                const itens = gruposHistorico[data]
                return `
                    <details style="margin-bottom:8px; border-left:3px solid #64748B; padding-left:8px;">
                        <summary style="cursor:pointer; font-weight:600; color:#0f172a; font-size:12px; padding:4px 0;">
                            📅 ${data} — ${itens.length} avaliação(ões)
                        </summary>
                        ${itens.map(renderAvaliacaoItem).join('')}
                    </details>
                `
            }).join('')
        }

        const modalHtml = `
            <div id="modal-overlay" class="modal-overlay" onclick="if(event.target===this)fecharModal()">
                <div id="modal-content" class="modal-content" style="max-width:520px;">
                    <div class="modal-header">
                        <div>
                            <h2 class="modal-title">${aluno.aluno_nome}</h2>
                            <small class="modal-subtitle">Responsável: ${aluno.responsavel_nome}</small>
                        </div>
                        <button id="modal-fechar" class="btn btn-secondary btn--sm">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body">
                        ${capsulaHTML(capsulaEstadoAtual)}

                        ${capsulaEstadoAtual === 'historico' ? `
                            <div class="modal-section">
                                <h3 class="modal-section-title">🕓 Histórico do aluno</h3>
                                ${renderHistoricoHTML()}
                            </div>
                        ` : ''}

                        ${capsulaEstadoAtual === 'hoje' ? `
                            <div class="modal-section">
                                <h3 class="modal-section-title">📋 Avaliações de hoje (${hojeAvaliacoes.length})</h3>
                                ${hojeAvaliacoes.length === 0
                                    ? '<p class="text-muted">Nenhuma avaliação registrada hoje.</p>'
                                    : hojeAvaliacoes.map(renderAvaliacaoItem).join('')}
                            </div>
                        ` : ''}

                        ${capsulaEstadoAtual === 'novo' ? `
                            <div class="modal-section">
                                <h3 class="modal-section-title">✏️ Nova avaliação</h3>
                                <div class="modal-categorias">
                                    ${categoriasAvaliacao.map(cat => `
                                        <div class="modal-cat-group">
                                            <small class="modal-cat-label">${cat.nome}</small>
                                            <div class="modal-cat-buttons">
                                                ${cat.opcoes.map(op => `
                                                    <button data-categoria="${cat.nome.toLowerCase()}" data-valor="${op.valor}" data-pontos="${op.pontos}"
                                                        class="btn-avaliacao-modal" style="background-color:${op.cor};"
                                                        data-professor-id="${professorId || ""}">
                                                        ${op.label} (${op.pontos}p)
                                                    </button>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="modal-obs-form">
                                    <small class="modal-obs-label">Observação</small>
                                    <div class="modal-obs-row">
                                        <input id="obs-input" type="text" placeholder="ex: chegou atrasado..."
                                            class="form-input" />
                                        <input id="pts-input" type="number" min="0" max="50" placeholder="0-50"
                                            class="form-input form-input--sm" />
                                        <small class="text-muted text-xs">pts (max 50)</small>
                                    </div>
                                    <p id="obs-aviso" class="alert alert-danger alert--sm" style="display:none;">Preencha a observação.</p>
                                    <p id="data-auto" class="text-muted text-xs"></p>
                                    <button id="btn-registrar-obs" class="btn btn-primary btn--sm">
                                        <i class="fas fa-save"></i>
                                        Registrar
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `

        root.insertAdjacentHTML("beforeend", modalHtml)
        const dataAutoEl = document.getElementById("data-auto")
        if (dataAutoEl) dataAutoEl.textContent = `Data/hora automática: ${new Date().toLocaleString("pt-BR")}`

        window.fecharModal = function() {
            const overlay = document.getElementById("modal-overlay")
            if (overlay) overlay.remove()
            isModalOpen = false
        }

        const btnFechar = document.getElementById("modal-fechar")
        if (btnFechar) btnFechar.addEventListener("click", window.fecharModal)

        document.querySelectorAll("[data-capsula-estado]").forEach(btn => {
            btn.addEventListener("click", () => {
                const estado = btn.getAttribute("data-capsula-estado")
                window.fecharModal()
                setTimeout(() => abrirModalAluno(alunoId, estado), 50)
            })
        })

        document.querySelectorAll("#modal-content button[data-categoria]").forEach(btn => {
            btn.addEventListener("click", async () => {
                console.log("[AVAL] Clique no botão de avaliação");
                console.log("[AVAL] professorId (variável):", professorId);
                console.log("[AVAL] professorId (btn attr):", btn.getAttribute("data-professor-id"));
                if (!professorId) { console.log("[AVAL] professorId é null — abortando"); alert("Professor não logado."); return }
                const categoria = btn.getAttribute("data-categoria");
                const valor = btn.getAttribute("data-valor");
                const pid = btn.getAttribute("data-professor-id") || professorId;
                console.log("[AVAL] categoria:", categoria, "valor:", valor, "pid:", pid, "alunoId:", alunoId);

                try {
                    console.log("[AVAL] Enviando POST para /avaliacoes...");
                    const res = await fetch("/avaliacoes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ alunoId, professorId: pid, categoria, valor, pontos: parseInt(btn.getAttribute("data-pontos")), observacao: "" }),
                    });
                    const data = await res.json();
                    console.log("[AVAL] Resposta:", res.status, data);
                    if (res.ok) {
                        console.log("[AVAL] OK — fechando modal e recarregando");
                        alert(`Registrado: ${capitalizar(categoria)} → ${btn.textContent}`);
                        window.fecharModal();
                        abrirModalAluno(alunoId);
                    } else {
                        console.log("[AVAL] ERRO do servidor:", data.error);
                        alert(data.error || "Erro ao registrar.");
                    }
                } catch (erro) {
                    console.error("[AVAL] Exceção:", erro);
                    alert("Erro de conexão.");
                }
            });
        })

        const btnObs = document.getElementById("btn-registrar-obs")
        if (btnObs) {
            btnObs.addEventListener("click", async () => {
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
                    const res = await fetch("/avaliacoes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ alunoId, professorId, categoria: "observacao", valor: obs, pontos: pts, observacao: `${obs} — ${data} ${hora}` }),
                    })
                    const dataRes = await res.json()
                    if (res.ok) {
                        alert(`Observação registrada! ${pts} pts`)
                        document.getElementById("obs-input").value = ""
                        document.getElementById("pts-input").value = ""
                        window.fecharModal()
                        abrirModalAluno(alunoId)
                    } else {
                        alert(dataRes.error || "Erro ao registrar.")
                    }
                } catch (erro) {
                    alert("Erro de conexão.")
                }
            })
        }
    } catch (erro) {
        console.error("Erro:", erro)
        isModalOpen = false
    }
}

function capitalizar(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1) }

function getCorByValor(cat, val) {
    for (const c of categoriasAvaliacao) {
        const op = c.opcoes.find(o => o.valor === val)
        if (op) return op.cor
    }
    return "#3B82F6"
}

async function mostrarTodasOcorrencias() {
    if (!turmaId) return

    try {
        const resposta = await fetch(`/turmas/${turmaId}/avaliacoes`)
        const avaliacoes = await resposta.json()

        if (avaliacoes.length === 0) {
            alert("Nenhuma ocorrência registrada nesta turma.")
            return
        }

        // Agrupa por aluno
        const grupos = {}
        avaliacoes.forEach(av => {
            if (!grupos[av.aluno_nome]) grupos[av.aluno_nome] = []
            grupos[av.aluno_nome].push(av)
        })

        let html = `
            <div class="card" style="background:#F8FAFC; border:1px solid #E2E8F0;">
                <div class="card__header-row">
                    <div class="card__icon card__icon--blue">
                        <i class="fas fa-list-ul"></i>
                    </div>
                    <div class="card__body">
                        <strong class="card__title">Todas as Ocorrências da Turma</strong>
                        <small class="card__meta">${avaliacoes.length} avaliação(ões) &middot; ${Object.keys(grupos).length} aluno(s)</small>
                    </div>
                </div>
                <div class="card__body" style="border-top:1px solid #e2e8f0; padding-top:12px;">
                    ${Object.entries(grupos).map(([nome, avs]) => {
                        const totalPts = avs.reduce((s, av) => s + (av.pontos || 0), 0)
                        return `
                            <div style="margin-bottom:16px;">
                                <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">
                                    <i class="fas fa-user-graduate" style="color:#3B82F6; margin-right:6px;"></i>${nome}
                                    <span class="text-muted" style="font-weight:400; font-size:12px; margin-left:8px;">${avs.length} av &middot; ${totalPts} pts</span>
                                </div>
                                ${avs.map(av => `
                                    <div class="av-list-item" style="border-left-color:${getCorByValor(av.categoria, av.valor)}; margin-bottom:4px;">
                                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                                            <strong>${capitalizar(av.categoria)}:</strong> ${av.valor}
                                            ${av.pontos !== undefined ? `<span class="pts-badge">${av.pontos}p</span>` : ""}
                                        </div>
                                        ${av.observacao ? `<small class="text-muted" style="display:block; margin-top:2px;">📝 ${av.observacao}</small>` : ""}
                                        <small class="text-muted text-xs" style="display:block; margin-top:2px;">
                                            <i class="fas fa-chalkboard-teacher" style="margin-right:4px;"></i>${capitalizar(av.professor_nome)} &middot; 
                                            <i class="far fa-calendar-alt" style="margin-right:4px;"></i>${av.data} ${av.hora}
                                        </small>
                                    </div>
                                `).join('')}
                            </div>
                        `
                    }).join('')}
                </div>
            </div>
        `

        const contentDiv = document.getElementById("dashboard-content")
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="margin-bottom:12px;">
                    <button id="btn-voltar-alunos" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> Voltar para lista de alunos
                    </button>
                </div>
            ` + html
            document.getElementById("btn-voltar-alunos").addEventListener("click", () => {
                carregarAlunos()
            })
        }
    } catch (erro) {
        console.error("Erro ao carregar todas as ocorrências:", erro)
        alert("Erro ao carregar as ocorrências da turma.")
    }
}

function Render() {
    root.innerHTML = `
        ${Header({ 'Turmas': ['/app/professor/Turmas/index.html'] })}

        <div class="back-link" style="margin-top:10px;">
            <a href="/app/professor/Turmas/index.html">
                <i class="fas fa-arrow-left"></i>
                Voltar para Turmas
            </a>
        </div>

        <main class="polocoin-main">
            <div class="polocoin-main__header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
                <div>
                    <h1 class="polocoin-main__title">Alunos da Turma</h1>
                    <p class="polocoin-main__subtitle">Clique no aluno para ver ou registrar ocorrências</p>
                </div>
                <button id="btn-ver-todas-ocorrencias" class="btn btn-secondary">
                    <i class="fas fa-list"></i> Ver todas as ocorrências da turma
                </button>
            </div>

            <div class="polocoin-main__layout">
                <div class="polocoin-main__section polocoin-main__section--main">
                    ${DashBoard("Alunos da Turma", false, false)}
                </div>
            </div>

            <div id="dashboard-content" class="card-grid stagger-children"></div>
        </main>
    `

    carregarAlunos()
    document.getElementById("btn-ver-todas-ocorrencias").addEventListener("click", mostrarTodasOcorrencias)
}

window.addEventListener("DOMContentLoaded", Render)
