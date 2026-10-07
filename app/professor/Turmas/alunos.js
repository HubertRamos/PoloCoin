import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"
import AlunoAvatar from "../../../components/AlunoAvatar/index.js"
import { abrirModalFiltroRelatorioAluno, abrirModalFiltroRelatorioTurma } from "./relatorios.js"
import { renderSeletorOcorrencias } from "../../../components/OcorrenciasPersonalizadas/index.js"

const root = document.getElementById("root")
const params = new URLSearchParams(window.location.search)
const turmaId = params.get("turmaId")

const sessionUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
const professorId = sessionUser.id || null

let categoriasAvaliacao = []
let isModalOpen = false
let currentModalRequestId = 0
let lastActiveElementBeforeModal = null
let activeModalKeydownHandler = null

function fecharModal() {
    currentModalRequestId++
    isModalOpen = false

    // Remove todos os overlays de modal da tela
    const overlays = document.querySelectorAll(".modal-overlay, #modal-overlay")
    overlays.forEach(overlay => overlay.remove())

    // Remove listener de teclado para evitar vazamento
    if (activeModalKeydownHandler) {
        document.removeEventListener("keydown", activeModalKeydownHandler)
        activeModalKeydownHandler = null
    }

    // Retorna o foco para o elemento ativo anterior à abertura do modal
    if (lastActiveElementBeforeModal && typeof lastActiveElementBeforeModal.focus === "function") {
        try {
            lastActiveElementBeforeModal.focus()
        } catch {
            // Ignora se o elemento não for mais focalizável
        }
    }
}
window.fecharModal = fecharModal

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

      const alunosComSaldo = await Promise.all(
          alunos.map(async (aluno) => {
              try {
                  const saldoRes = await fetch(`/aluno/saldo?id=${aluno.id}`)
                  const saldo = await saldoRes.json()

                  return {
                      ...aluno,
                      pontos: saldo.pontos || 0
                  }
              } catch {
                  return {
                      ...aluno,
                      pontos: 0
                  }
              }
          })
      )

        if (alunos.length === 0) {
            contentDiv.innerHTML = `<div class="alert alert-info">Nenhum aluno cadastrado nesta turma ainda.</div>`
            return
        }

        contentDiv.innerHTML = alunosComSaldo.map(aluno => `
            <div class="card card--hover" data-id="${aluno.id}" tabindex="0" role="button" aria-label="Ver ocorrências de ${aluno.aluno_nome}" style="cursor:pointer;">
                <div class="card__header-row">
                    ${AlunoAvatar({ aluno, tamanho: 'medio', formato: 'avatar-only' })}
                    <div class="card__body">
                        <strong class="card__title">${AlunoAvatar({ aluno, tamanho: 'pequeno', formato: 'inline' })}</strong>
                        <small class="card__meta">Responsável: ${aluno.responsavel_nome}</small>
                        <div style="
                            margin-top:8px;
                            font-weight:600;
                            color:#f59e0b;
                        ">
                            🪙 ${aluno.pontos} PoloCoins
                        </div>
                    </div>
                    <div class="card__arrow card__arrow--green">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `).join('')

        document.querySelectorAll(".card--hover[data-id]").forEach(card => {
            const acionar = () => {
                const alunoId = card.getAttribute("data-id")
                console.log("[AVAL] Card clicado — alunoId:", alunoId)
                abrirModalAluno(alunoId)
            }
            card.addEventListener("click", acionar)
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    acionar()
                }
            })
        })
        console.log("[AVAL] Cards renderizados:", document.querySelectorAll(".card--hover").length)
    } catch (erro) {
        console.error("Erro ao carregar alunos:", erro)
        contentDiv.innerHTML = `<div class="alert alert-danger">Erro ao carregar os alunos do servidor.</div>`
    }
}

async function abrirModalAluno(alunoId, estadoDesejado) {
    console.log("[AVAL] abrirModalAluno chamado — alunoId:", alunoId, "estado:", estadoDesejado || 'none')
    
    // Salva o elemento com foco atual para retornar após o fechamento
    if (!isModalOpen) {
        lastActiveElementBeforeModal = document.activeElement
    }

    // Sinaliza modal aberto e gera ID único para a requisição
    isModalOpen = true
    const thisRequestId = ++currentModalRequestId

    // Limpa quaisquer overlays residuais no DOM
    const staleOverlays = document.querySelectorAll(".modal-overlay, #modal-overlay")
    staleOverlays.forEach(o => o.remove())

    try {
        const sessionUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
        const pId = sessionUser.id || professorId

        console.log("[AVAL] Fetch dados do aluno e avaliações — alunoId:", alunoId)
        const [alunosRes, avaliacoesRes] = await Promise.all([
            fetch(`/turmas/${turmaId}/alunos`),
            fetch(`/avaliacoes/${alunoId}`)
        ])

        // Se o modal foi fechado enquanto aguardava a requisição, cancela
        if (thisRequestId !== currentModalRequestId) return

        const alunos = await alunosRes.json()
        const aluno = alunos.find(a => a.id == alunoId)
        if (!aluno) {
            fecharModal()
            return
        }

        let avaliacoes = await avaliacoesRes.json()
        if (thisRequestId !== currentModalRequestId) return

        // Normaliza campo data para YYYY-MM-DD
        avaliacoes.forEach(av => {
            if (av.data instanceof Date) {
                av.data = av.data.toISOString().split('T')[0]
            } else if (typeof av.data === 'string' && av.data.includes('T')) {
                av.data = av.data.split('T')[0]
            }
        })

        // Calcula "hoje" no fuso horário local do browser
        function getDataHojeLocal() {
            const agora = new Date()
            const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).formatToParts(agora)
            const y = parts.find(p => p.type === 'year').value
            const m = parts.find(p => p.type === 'month').value
            const d = parts.find(p => p.type === 'day').value
            return `${y}-${m}-${d}`
        }

        function formatarDataBR(dataStr) {
            if (!dataStr) return ''
            if (typeof dataStr === 'string' && dataStr.includes('-')) {
                const [y, m, d] = dataStr.split('T')[0].split('-')
                if (y && m && d) return `${d}/${m}/${y}`
            }
            try {
                return new Date(dataStr).toLocaleDateString('pt-BR')
            } catch {
                return dataStr
            }
        }

        function renderAvaliacaoItem(av) {
            const tipoLimpo = (av.tipo || (Number(av.pontos) < 0 ? 'negativa' : 'positiva')).toLowerCase().trim()
            const isNegativa = tipoLimpo === 'negativa'
            const tipoBadge = isNegativa ? '🔴 Ocorrência Negativa' : '🟢 Ocorrência Positiva'
            const pontos = Number(av.pontos) || 0
            const pontosTexto = (pontos > 0 ? `+${pontos}` : `${pontos}`) + ' PoloCoins'
            const corBorda = isNegativa ? '#ef4444' : '#10b981'
            const professorNome = av.professor_nome ? capitalizar(av.professor_nome) : 'Não informado'
            const dataFormatada = formatarDataBR(av.data)

            return `
                <div class="av-list-item" style="border-left-color:${corBorda}; margin-bottom:10px; padding:10px 12px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:12px; font-weight:600; color:#475569;">
                            📅 ${dataFormatada}${av.hora ? ` <span style="font-weight:400; color:#94a3b8;">${av.hora}</span>` : ''}
                        </span>
                        <span style="display:inline-block; padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:700; background:${isNegativa ? '#FEE2E2' : '#DCFCE7'}; color:${isNegativa ? '#DC2626' : '#16A34A'};">
                            ${tipoBadge}
                        </span>
                    </div>

                    <div style="font-size:13px; color:#334155; margin-bottom:4px;">
                        <strong>Professor:</strong> ${professorNome}
                    </div>

                    <div style="font-size:14px; font-weight:700; color:${isNegativa ? '#DC2626' : '#16A34A'}; margin-bottom:4px;">
                        ${pontosTexto}
                    </div>

                    <div style="font-size:13px; color:#0f172a; font-weight:500;">
                        ${av.categoria && av.categoria !== 'observacao' ? `<strong>${capitalizar(av.categoria)}:</strong> ` : ''}${av.valor || ''}
                    </div>

                    ${av.observacao && av.observacao !== av.valor ? `<div style="font-size:12px; color:#64748b; margin-top:4px;">📝 ${av.observacao}</div>` : ''}
                </div>
            `
        }

        function renderHistoricoHTML(historicoAvaliacoes) {
            const gruposHistorico = {}
            historicoAvaliacoes.forEach(av => {
                const dataKey = av.data || 'Sem data'
                if (!gruposHistorico[dataKey]) gruposHistorico[dataKey] = []
                gruposHistorico[dataKey].push(av)
            })
            const chavesHistorico = Object.keys(gruposHistorico).sort((a, b) => b > a ? 1 : -1)

            if (chavesHistorico.length === 0) return '<p class="text-muted">Nenhum registro no histórico.</p>'
            const totalAvaliacoes = historicoAvaliacoes.length
            const totalPontos = historicoAvaliacoes.reduce((s, av) => s + (av.pontos || 0), 0)
            return `<div class="modal-historico-resumo" style="margin-bottom:12px; padding:8px 12px; background:#F8FAFC; border-radius:8px; border:1px solid #E2E8F0;">
                <small class="text-muted">📊 Total: <strong>${totalAvaliacoes}</strong> ocorrência(s) &nbsp;|&nbsp; 📈 <strong>${totalPontos}</strong> PoloCoins</small>
            </div>` + chavesHistorico.map(data => {
                const itens = gruposHistorico[data]
                return `
                    <details style="margin-bottom:8px; border-left:3px solid #64748B; padding-left:8px;" open>
                        <summary style="cursor:pointer; font-weight:600; color:#0f172a; font-size:12px; padding:4px 0;">
                            📅 ${formatarDataBR(data)} — ${itens.length} ocorrência(s)
                        </summary>
                        <div style="margin-top:6px;">
                            ${itens.map(renderAvaliacaoItem).join('')}
                        </div>
                    </details>
                `
            }).join('')
        }

        let capsulaEstadoAtual = estadoDesejado || 'hoje'

        // Cria o elemento modal overlay diretamente
        const overlay = document.createElement("div")
        overlay.id = "modal-overlay"
        overlay.className = "modal-overlay"

        overlay.innerHTML = `
            <div id="modal-content" class="modal-content" style="max-width:520px;" role="dialog" aria-modal="true" aria-labelledby="modal-aluno-titulo">
                <div class="modal-header">
                    <div>
                        <h2 id="modal-aluno-titulo" class="modal-title">${AlunoAvatar({ aluno, tamanho: 'medio', formato: 'inline' })}</h2>
                        <small class="modal-subtitle">Responsável: ${aluno.responsavel_nome}</small>
                    </div>
                    <button id="modal-fechar" type="button" class="btn btn-secondary btn--sm" aria-label="Fechar modal" title="Fechar modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div id="modal-capsula-nav" class="capsula-top" style="display:flex; gap:6px; margin-bottom:12px;"></div>
                    <div id="modal-tab-content"></div>
                </div>

                <div class="modal-footer" style="padding: 12px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: flex-end; gap: 10px; border-radius: 0 0 14px 14px;">
                    <button id="btn-modal-cancelar" type="button" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>
        `

        root.appendChild(overlay)

        function atualizarCapsulaNav() {
            const botoes = [
                { key: 'hoje', label: '📋 Hoje' },
                { key: 'historico', label: '🕓 Histórico' },
                { key: 'novo', label: '✏️ Nova ocorrência' },
            ]
            const navEl = overlay.querySelector("#modal-capsula-nav")
            if (!navEl) return
            navEl.innerHTML = botoes.map(b => {
                const isActive = capsulaEstadoAtual === b.key
                return `
                    <button type="button" data-capsula-estado="${b.key}"
                        style="flex:1; padding:8px 12px; border:none; border-radius:8px;
                               background:${isActive ? '#0f172a' : 'transparent'};
                               color:${isActive ? '#fff' : '#0f172a'};
                               font-size:12px; font-weight:600; cursor:pointer; transition:opacity 0.15s; text-align:center;">
                        ${b.label}
                    </button>
                `
            }).join('')

            navEl.querySelectorAll("[data-capsula-estado]").forEach(btn => {
                btn.addEventListener("click", () => {
                    capsulaEstadoAtual = btn.getAttribute("data-capsula-estado")
                    atualizarCapsulaNav()
                    renderizarAbaAtual()
                })
            })
        }

        function renderizarAbaAtual() {
            const container = overlay.querySelector("#modal-tab-content")
            if (!container) return

            const hoje = getDataHojeLocal()
            const hojeAvaliacoes = avaliacoes.filter(av => {
                const avData = typeof av.data === 'string' ? av.data.split('T')[0] : av.data
                return avData === hoje
            })

            if (capsulaEstadoAtual === 'historico') {
                container.innerHTML = `
                    <div class="modal-section">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                            <h3 class="modal-section-title" style="margin:0;">🕓 Histórico do aluno</h3>
                            <button id="btn-imprimir-historico-aluno" type="button" class="btn btn-secondary btn--sm" style="font-size:12px; display:inline-flex; align-items:center; gap:6px;">
                                <i class="fas fa-print"></i> Imprimir Histórico
                            </button>
                        </div>
                        ${renderHistoricoHTML(avaliacoes)}
                    </div>
                `

                const btnImprimirHist = container.querySelector("#btn-imprimir-historico-aluno")
                if (btnImprimirHist) {
                    btnImprimirHist.addEventListener("click", () => {
                        const sessUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
                        abrirModalFiltroRelatorioAluno({
                            alunoId: aluno.id,
                            alunoNome: aluno.aluno_nome,
                            alunoAvatar: aluno.avatar,
                            turmaNome: aluno.turma_nome || `Turma #${turmaId}`,
                            professorNome: sessUser.name || 'Professor'
                        })
                    })
                }
            } else if (capsulaEstadoAtual === 'hoje') {
                container.innerHTML = `
                    <div class="modal-section">
                        <h3 class="modal-section-title">📋 Avaliações de hoje (${hojeAvaliacoes.length})</h3>
                        ${hojeAvaliacoes.length === 0
                            ? '<p class="text-muted">Nenhuma avaliação registrada hoje.</p>'
                            : hojeAvaliacoes.map(renderAvaliacaoItem).join('')}
                    </div>
                `
            } else if (capsulaEstadoAtual === 'novo') {
                container.innerHTML = `
                    <div class="modal-section">
                        <h3 class="modal-section-title">✏️ Registrar Ocorrência</h3>

                        <!-- Seletor com Ocorrências Padrão e Personalizadas (Tipo Automático e Inerente) -->
                        <div id="container-seletor-ocorrencias"></div>

                        <details style="border-top:1px solid #e2e8f0; padding-top:12px; margin-top:14px;">
                            <summary style="cursor:pointer; font-size:16px; font-weight:600; color:#0f172a; margin-bottom:8px;">
                                ✍️ Ou digite uma ocorrência / observação manual avulsa
                            </summary>
                            <div class="modal-obs-form" style="background:#ffffff; padding:14px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:8px;">
                                <div style="margin-bottom:12px; padding:10px 12px; background:#f8fafc; border-radius:6px; border:1px solid #e2e8f0;">
                                    <label style="font-weight:700; color:#1e293b; display:block; font-size:12px; margin-bottom:6px;">
                                        Tipo da observação avulsa <span style="color:#ef4444;">*</span>
                                    </label>
                                    <div style="display:flex; gap:16px; align-items:center;">
                                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; font-weight:700; color:#16a34a;">
                                            <input type="radio" name="avulso-tipo" value="positiva" checked /> 🟢 Positiva
                                        </label>
                                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; font-weight:700; color:#dc2626;">
                                            <input type="radio" name="avulso-tipo" value="negativa" /> 🔴 Negativa
                                        </label>
                                    </div>
                                </div>

                                <label class="modal-obs-label" style="font-weight:700; color:#1e293b; display:block; margin-bottom:4px;">
                                    Descrição / Motivo <span style="color:#ef4444;">*</span>
                                </label>
                                <input id="obs-input" type="text" placeholder="Ex: Participação em aula, Atraso, Ajuda aos colegas..."
                                    class="form-input" style="margin-bottom:12px;" />

                                <label class="modal-obs-label" style="font-weight:700; color:#1e293b; display:block; margin-bottom:4px;">
                                    Quantidade de PoloCoins <span style="color:#ef4444;">*</span>
                                </label>
                                <div class="modal-obs-row" style="margin-bottom:10px;">
                                    <input id="pts-input" type="number" min="0" max="500" placeholder="Ex: 10"
                                        class="form-input form-input--sm" />
                                    <small class="text-muted text-xs">PoloCoins</small>
                                </div>

                                <p id="obs-aviso" class="alert alert-danger alert--sm" style="display:none; margin-bottom:10px;">Preencha a descrição e quantidade de PoloCoins.</p>
                                <p id="data-auto" class="text-muted text-xs" style="margin-bottom:10px;">Data/hora automática: ${new Date().toLocaleString("pt-BR")}</p>

                                <button id="btn-registrar-obs" type="button" class="btn btn-primary" style="width:100%;">
                                    <i class="fas fa-save"></i>
                                    Registrar Ocorrência Avulsa
                                </button>
                            </div>
                        </details>
                    </div>
                `

                // Inicializa o seletor integrado de ocorrências padrão e personalizadas
                const seletorContainer = container.querySelector("#container-seletor-ocorrencias")
                if (seletorContainer) {
                    renderSeletorOcorrencias(seletorContainer, {
                        categoriasPadrao: categoriasAvaliacao,
                        tituloSecao: "Escolha uma Ocorrência",
                        onSelecionarOcorrencia: async (oc) => {
                            if (!professorId) { alert("Professor não logado."); return }
                            
                            // O tipo é intrínseco à ocorrência: não depende de seleção manual
                            const tipo = oc.tipo === 'negativa' ? 'negativa' : 'positiva'
                            const pontosBase = oc.pontos || (tipo === 'negativa' ? 10 : 20)

                            try {
                                const res = await fetch("/avaliacoes", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        alunoId,
                                        professorId,
                                        categoria: oc.categoria || 'Geral',
                                        valor: oc.valor || oc.label,
                                        pontos: pontosBase,
                                        tipo: tipo,
                                        observacao: oc.observacaoAdicional 
                                            ? `${oc.valor || oc.label} — ${oc.observacaoAdicional}`
                                            : (oc.descricao ? `${oc.valor || oc.label} — ${oc.descricao}` : (oc.valor || oc.label))
                                    }),
                                })
                                const data = await res.json()
                                if (res.ok) {
                                    const sinal = tipo === 'negativa' ? '-' : '+'
                                    const tipoBadge = tipo === 'negativa' ? '🔴 Negativa' : '🟢 Positiva'
                                    const tipoDesc = oc.isPersonalizada ? '⭐ Ocorrência Personalizada' : 'Ocorrência Padrão'
                                    alert(`${tipoDesc} [${tipoBadge}]: ${oc.label || oc.valor}\n${sinal}${pontosBase} PoloCoins`)

                                    // Atualiza os dados locais de ocorrências sem destruir o modal
                                    const novaLista = await fetch(`/avaliacoes/${alunoId}`).then(r => r.json())
                                    novaLista.forEach(av => {
                                        if (av.data instanceof Date) av.data = av.data.toISOString().split('T')[0]
                                        else if (typeof av.data === 'string' && av.data.includes('T')) av.data = av.data.split('T')[0]
                                    })
                                    avaliacoes = novaLista
                                    capsulaEstadoAtual = 'hoje'
                                    atualizarCapsulaNav()
                                    renderizarAbaAtual()
                                    carregarAlunos()
                                } else {
                                    alert(data.error || "Erro ao registrar.")
                                }
                            } catch (erro) {
                                console.error("[AVAL] Exceção:", erro)
                                alert("Erro de conexão ao registrar ocorrência.")
                            }
                        }
                    })
                }

                // Formulário manual de registro avulso
                const btnObs = container.querySelector("#btn-registrar-obs")
                if (btnObs) {
                    btnObs.addEventListener("click", async () => {
                        const obs = container.querySelector("#obs-input").value.trim()
                        const rawPts = container.querySelector("#pts-input").value
                        const pts = Math.abs(parseInt(rawPts) || 0)
                        const tipo = container.querySelector('input[name="avulso-tipo"]:checked')?.value || 'positiva'
                        const aviso = container.querySelector("#obs-aviso")

                        if (!obs) {
                            aviso.textContent = "Preencha a descrição / motivo."
                            aviso.style.display = "block"
                            return
                        }
                        if (!rawPts || pts <= 0) {
                            aviso.textContent = "Informe a quantidade de PoloCoins (maior que 0)."
                            aviso.style.display = "block"
                            return
                        }
                        aviso.style.display = "none"

                        if (!professorId) { alert("Professor não logado."); return }

                        try {
                            const res = await fetch("/avaliacoes", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    alunoId,
                                    professorId,
                                    categoria: "observacao",
                                    valor: obs,
                                    pontos: pts,
                                    tipo: tipo,
                                    observacao: obs
                                }),
                            })
                            const dataRes = await res.json()
                            if (res.ok) {
                                const sinal = tipo === 'negativa' ? '-' : '+'
                                const tipoBadge = tipo === 'negativa' ? '🔴 Negativa' : '🟢 Positiva'
                                alert(`Ocorrência Avulsa [${tipoBadge}] registrada com sucesso!\nValor: ${sinal}${pts} PoloCoins`)
                                // Atualiza os dados locais de ocorrências sem destruir o modal
                                const novaLista = await fetch(`/avaliacoes/${alunoId}`).then(r => r.json())
                                novaLista.forEach(av => {
                                    if (av.data instanceof Date) av.data = av.data.toISOString().split('T')[0]
                                    else if (typeof av.data === 'string' && av.data.includes('T')) av.data = av.data.split('T')[0]
                                })
                                avaliacoes = novaLista
                                capsulaEstadoAtual = 'hoje'
                                atualizarCapsulaNav()
                                renderizarAbaAtual()
                                carregarAlunos()
                            } else {
                                alert(dataRes.error || "Erro ao registrar ocorrência.")
                            }
                        } catch (erro) {
                            console.error("[AVAL] Exceção ao registrar:", erro)
                            alert("Erro de conexão com o servidor.")
                        }
                    })
                }
            }
        }

        atualizarCapsulaNav()
        renderizarAbaAtual()

        // 1. Fechar pelo botão "X" do topo (cabeçalho)
        const btnFecharTopo = overlay.querySelector("#modal-fechar")
        if (btnFecharTopo) {
            btnFecharTopo.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                fecharModal()
            })
        }

        // 2. Fechar pelo botão "Fechar" / "Cancelar" do rodapé
        const btnFecharRodape = overlay.querySelector("#btn-modal-cancelar")
        if (btnFecharRodape) {
            btnFecharRodape.addEventListener("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                fecharModal()
            })
        }

        // 3. Fechar clicando fora do modal (backdrop/overlay)
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                fecharModal()
            }
        })

        // 4. Fechar teclando Escape
        if (activeModalKeydownHandler) {
            document.removeEventListener("keydown", activeModalKeydownHandler)
        }
        activeModalKeydownHandler = (e) => {
            if (e.key === "Escape" || e.keyCode === 27) {
                fecharModal()
            }
        }
        document.addEventListener("keydown", activeModalKeydownHandler)

        // Coloca o foco no botão de fechar para garantir navegação por teclado acessível
        btnFecharTopo?.focus()

    } catch (erro) {
        console.error("[AVAL] Erro ao abrir modal do aluno:", erro)
        fecharModal()
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
                                <div style="font-weight:700; color:#0f172a; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
                                    ${AlunoAvatar({ nome, avatar: avs[0]?.aluno_avatar, tamanho: 'pequeno', formato: 'inline' })}
                                    <span class="text-muted" style="font-weight:400; font-size:12px; margin-left:8px;">${avs.length} av &middot; ${totalPts} pts</span>
                                </div>
                                ${avs.map(av => {
                                    const isNeg = (av.tipo === 'negativa') || (Number(av.pontos) < 0);
                                    const pontosFormatados = (Number(av.pontos) > 0 ? `+${av.pontos}` : `${av.pontos || 0}`) + ' PoloCoins';
                                    return `
                                    <div class="av-list-item" style="border-left-color:${isNeg ? '#ef4444' : '#10b981'}; margin-bottom:8px; padding:10px 12px; background:#fff; border:1px solid #e2e8f0; border-radius:6px;">
                                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:4px;">
                                            <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:9999px; background:${isNeg ? '#fee2e2' : '#dcfce7'}; color:${isNeg ? '#dc2626' : '#16a34a'};">
                                                ${isNeg ? '🔴 Ocorrência Negativa' : '🟢 Ocorrência Positiva'}
                                            </span>
                                            <span style="font-weight:700; font-size:13px; color:${isNeg ? '#dc2626' : '#16a34a'};">${pontosFormatados}</span>
                                        </div>
                                        <div style="font-size:13px; font-weight:600; color:#0f172a;">
                                            ${capitalizar(av.categoria)}: ${av.valor}
                                        </div>
                                        ${av.observacao ? `<small class="text-muted" style="display:block; margin-top:2px;">📝 ${av.observacao}</small>` : ""}
                                        <small class="text-muted text-xs" style="display:block; margin-top:4px;">
                                            <i class="fas fa-chalkboard-teacher" style="margin-right:4px;"></i>${capitalizar(av.professor_nome)} &middot;
                                            <i class="far fa-calendar-alt" style="margin-right:4px;"></i>${formatarDataBR(av.data)} ${av.hora || ''}
                                        </small>
                                    </div>
                                    `;
                                }).join('')}
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
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button id="btn-relatorio-turma" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:6px;">
                        <i class="fas fa-print"></i> Relatório da Turma
                    </button>
                    <button id="btn-ver-todas-ocorrencias" class="btn btn-secondary">
                        <i class="fas fa-list"></i> Ver todas as ocorrências da turma
                    </button>
                </div>
            </div>

            <div class="polocoin-main__layout">
                <div class="polocoin-main__section polocoin-main__section--main">
                    ${DashBoard("Alunos da Turma", false, false)}
                </div>
            </div>

            <div id="dashboard-content" class="card-grid stagger-children"></div>
            <div id="print-area" style="display:none;"></div>
        </main>
    `

    carregarAlunos()
    document.getElementById("btn-ver-todas-ocorrencias").addEventListener("click", mostrarTodasOcorrencias)

    document.getElementById("btn-relatorio-turma")?.addEventListener("click", async () => {
        let listaAlunos = []
        let turmaNome = `Turma #${turmaId}`
        try {
            const [respAlunos, respTurmas] = await Promise.all([
                fetch(`/turmas/${turmaId}/alunos`),
                fetch('/turmas')
            ])
            listaAlunos = await respAlunos.json()
            const turmas = await respTurmas.json()
            const tEncontrada = turmas.find(t => t.id == turmaId)
            if (tEncontrada) {
                turmaNome = `${tEncontrada.serie}º ${tEncontrada.turma}`
            }
        } catch (e) {
            console.error('Erro ao buscar dados para relatório:', e)
        }

        const sessUser = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
        abrirModalFiltroRelatorioTurma({
            turmaId,
            turmaNome,
            alunos: listaAlunos,
            professorNome: sessUser.name || 'Professor'
        })
    })
}

window.addEventListener("DOMContentLoaded", Render)
