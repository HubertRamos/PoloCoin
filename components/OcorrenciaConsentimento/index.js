/**
 * Componente de consentimento passo-a-passo para ocorrências
 * Mostra uma ocorrência por vez com navegação anterior/próxima
 */
const style = {
    container: `
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%);
        padding: 20px;
    `,
    popup: `
        background: white;
        padding: 28px 30px;
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        max-width: 560px;
        width: 100%;
        border: 1px solid #e2e8f0;
    `,
    headerCircle: `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        background: #fef2f2;
        border-radius: 50%;
        margin-bottom: 12px;
    `,
    title: `
        color: #1e293b;
        margin: 0 0 6px 0;
        font-size: 18px;
    `,
    subtitle: `
        color: #64748b;
        font-size: 13px;
        margin: 0;
        line-height: 1.4;
    `,
    progressBar: `
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f1f5f9;
        border-radius: 8px;
        padding: 10px 14px;
        margin-bottom: 18px;
        font-size: 12px;
    `,
    progressLabel: `
        color: #64748b;
    `,
    progressValue: `
        font-weight: 600;
        color: #3b82f6;
    `,
    cardContainer: `
        background: #f8fafc;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 8px;
    `,
    cardHeader: `
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
    `,
    studentInfo: `
        display: flex;
        align-items: center;
        gap: 10px;
    `,
    icon: `
        font-size: 24px;
    `,
    studentName: `
        color: #1e293b;
        font-size: 16px;
        font-weight: 600;
    `,
    studentMeta: `
        font-size: 12px;
        color: #94a3b8;
        margin-top: 2px;
    `,
    dateBadge: `
        font-size: 11px;
        color: #64748b;
        background: white;
        padding: 4px 10px;
        border-radius: 20px;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    `,
    badge: `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 20px;
        padding: 5px 12px;
        margin-bottom: 12px;
    `,
    badgeDot: `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    `,
    badgeText: `
        color: #dc2626;
        font-weight: 600;
        font-size: 13px;
    `,
    observation: `
        background: white;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 14px;
        border: 1px solid #e2e8f0;
    `,
    obsText: `
        color: #334155;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
    `,
    details: `
        display: flex;
        gap: 20px;
        font-size: 13px;
        color: #64748b;
        margin-bottom: 16px;
        padding: 0 2px;
    `,
    labelContainer: `
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 12px 16px;
        background: #eff6ff;
        border-radius: 10px;
        border: 2px solid #bfdbfe;
        transition: all 0.2s;
    `,
    labelContainerChecked: `
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 12px 16px;
        background: #dcfce7;
        border-radius: 10px;
        border: 2px solid #86efac;
        transition: all 0.2s;
    `,
    checkbox: `
        width: 18px;
        height: 18px;
        accent-color: #3b82f6;
        cursor: pointer;
    `,
    labelText: `
        font-size: 14px;
        color: #1e293b;
        font-weight: 500;
    `,
    navigation: `
        display: flex;
        gap: 12px;
        margin-top: 20px;
    `,
    navBtn: `
        flex: 1;
        padding: 14px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    `,
    navPrev: `
        background: white;
        border: 1.5px solid #e2e8f0;
        color: #475569;
    `,
    navNext: `
        background: #3b82f6;
        border: none;
        color: white;
    `,
    navFinish: `
        background: #10B981;
        border: none;
        color: white;
    `,
    message: `
        text-align: center;
        font-size: 12px;
        min-height: 18px;
        margin-top: 10px;
    `,
    emptyState: `
        text-align: center;
        padding: 40px 20px;
        color: #94a3b8;
    `,
}

/**
 * Retorna o ícone baseado na categoria
 */
function getIcon(categoria) {
    const icons = {
        'comportamento': '🧠',
        'entrega': '📦',
        'comprometimento': '🎯',
        'social': '🤝',
        'Geral': '📋',
    }
    return icons[categoria?.toLowerCase()] || '📌'
}

/**
 * Retorna a cor do badge baseada no valor da ocorrência
 */
function getBadgeColor(valor) {
    const cores = {
        'bagunça':       '#f59e0b',
        'desmotivado':   '#64748b',
        'não entregou':  '#ef4444',
        'conflituante':  '#ef4444',
        'isolado':       '#a855f7',
        'desinteressado':'#64748b',
        'indiferente':   '#64748b',
        'atrasado':      '#eab308',
    }
    return cores[valor?.toLowerCase()] || '#3b82f6'
}

/**
 * Formata data e hora
 */
function formatarDataHora(data, hora) {
    if (!data) return 'Data não informada'
    try {
        return new Date(data + (hora ? 'T' + hora : 'T00:00'))
            .toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
    } catch {
        return `${data} ${hora || ''}`
    }
}

/**
 * Componente principal - exibe ocorrências uma por uma
 * Recebe estado externo para sincronizar com gerenciarConsentimento
 */
export default function OcorrenciaConsentimento({ocorrencias, onFinish, indiceAtual = 0, consentimentos = {}}) {
    if (!ocorrencias || ocorrencias.length === 0) {
        return `
            <div style="${style.container}">
                <div style="${style.popup}">
                    <div style="${style.emptyState}">
                        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                        <h2 style="color: #334155; font-size: 16px; margin: 0 0 8px 0;">Nenhuma ocorrência</h2>
                        <p style="font-size: 13px;">Parabéns! Seus filhos não têm ocorrências negativas registradas.</p>
                    </div>
                    <div style="margin-top: 20px;">
                        <button id="btn-entrar"
                            style="
                                width: 100%;
                                background: #10B981;
                                color: white;
                                border: none;
                                padding: 14px;
                                border-radius: 10px;
                                font-weight: 600;
                                font-size: 14px;
                                cursor: pointer;
                                transition: opacity 0.2s;
                            "
                        >
                            Entrar no sistema
                        </button>
                    </div>
                </div>
            </div>
        `
    }

    const idx = indiceAtual
    const cons = consentimentos
    const oc = ocorrencias[idx]
    const total = ocorrencias.length
    const atual = idx + 1
    const checkId = `check-${oc.avaliacao_id}`
    const checked = cons[oc.avaliacao_id] ? 'checked' : ''

    const canPrev = idx > 0
    const isLast = idx === total - 1
    const canFinish = isLast && cons[oc.avaliacao_id]

    return `
        <div style="${style.container}">
            <div style="${style.popup}">
                <!-- Cabeçalho -->
                <div style="text-align: center; margin-bottom: 16px;">
                    <div style="${style.headerCircle}">
                        <span style="font-size: 24px;">👤</span>
                    </div>
                    <h2 style="${style.title}">
                        Ocorrência ${atual} de ${total}
                    </h2>
                    <p style="${style.subtitle}">
                        Leia cuidadosamente e confirme que concorda em receber esta informação.
                    </p>
                </div>

                <!-- Barra de progresso -->
                <div style="${style.progressBar}">
                    <span style="${style.progressLabel}">Progresso</span>
                    <span style="${style.progressValue}">
                        ${atual} / ${total}
                    </span>
                </div>

                <!-- Cards com barras indicadoras -->
                <div style="display: flex; gap: 6px; margin-bottom: 16px; justify-content: center;">
                    ${ocorrencias.map((_, i) => `
                        <div style="
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: ${i === idx ? '#3b82f6' : (i < idx ? '#10B981' : '#e2e8f0')};
                            transition: all 0.3s;
                            cursor: ${i < idx ? 'pointer' : 'default'};
                        "
                            onclick="window.navegarOcorrencia(${i})"
                            title="${i < idx ? 'Voltar' : (i === idx ? 'Atual' : 'Pendente')}"
                        ></div>
                    `).join('')}
                </div>

                <!-- Conteúdo da ocorrência -->
                <div style="${style.cardContainer}">
                    <div style="${style.cardHeader}">
                        <div style="${style.studentInfo}">
                            <span style="${style.icon}">${getIcon(oc.categoria)}</span>
                            <div>
                                <div style="${style.studentName}">${oc.aluno_nome || 'Aluno'}</div>
                                <div style="${style.studentMeta}">
                                    ${oc.serie || '?'}º${oc.turma || '?'} · ${oc.categoria || 'Geral'}
                                </div>
                            </div>
                        </div>
                        <span style="${style.dateBadge}">
                            ${formatarDataHora(oc.data, oc.hora)}
                        </span>
                    </div>

                    <!-- Badge de valor -->
                    <div style="${style.badge}">
                        <span style="${style.badgeDot}" style="background: ${getBadgeColor(oc.valor)}"></span>
                        <span style="${style.badgeText}">${oc.valor || '—'}</span>
                    </div>

                    <!-- Observação -->
                    <div style="${style.observation}">
                        <p style="${style.obsText}">"${oc.observacao || 'Sem observação adicional'}"</p>
                    </div>

                    <!-- Detalhes -->
                    <div style="${style.details}">
                        <span><strong>Pontos:</strong> ${oc.pontos ?? '—'}</span>
                        <span><strong>Valor:</strong> ${oc.valor || '—'}</span>
                    </div>
                </div>

                <!-- Checkbox de consentimento -->
                <label id="${checkId}-label"
                    style="${checked ? style.labelContainerChecked : style.labelContainer}"
                >
                    <input type="checkbox"
                        id="${checkId}"
                        data-avaliacao-id="${oc.avaliacao_id}"
                        ${checked}
                        style="${style.checkbox}"
                    >
                    <span style="${style.labelText}">
                        ✓ Li e concordo em receber esta informação
                    </span>
                </label>

                <p id="mensagem" style="${style.message}"></p>

                <!-- Navegação -->
                <div style="${style.navigation}">
                    <button id="btn-anterior"
                        ${canPrev ? '' : 'disabled'}
                        style="${style.navBtn} ${style.navPrev} ${canPrev ? '' : 'opacity: 0.5; cursor: not-allowed;'}"
                    >
                        <span style="font-size: 16px;">◀</span>
                        Anterior
                    </button>
                    ${isLast ? `
                        <button id="btn-finalizar"
                            ${canFinish ? '' : 'disabled'}
                            style="${style.navBtn} ${style.navFinish} ${canFinish ? '' : 'opacity: 0.5; cursor: not-allowed;'}"
                        >
                            ✓ Finalizar
                        </button>
                    ` : `
                        <button id="btn-proximo"
                            style="${style.navBtn} ${style.navNext}"
                        >
                            Próximo
                            <span style="font-size: 16px;">▶</span>
                        </button>
                    `}
                </div>
            </div>
        </div>
    `
}

/**
 * Gerencia o fluxo de consentimento (estado e navegação)
 */
export function gerenciarConsentimento(root, ocorrencias, onFinish) {
    let indiceAtual = 0
    let consentimentos = {}

    function renderizar() {
        const popupHtml = OcorrenciaConsentimento({ 
            ocorrencias, 
            indiceAtual: indiceAtual,
            consentimentos: consentimentos,
        })

        root.innerHTML = popupHtml

        const btnProximo = document.getElementById('btn-proximo')
        const btnAnterior = document.getElementById('btn-anterior')
        const btnFinalizar = document.getElementById('btn-finalizar')
        const mensagem = document.getElementById('mensagem')
        const checkId = `check-${ocorrencias[indiceAtual].avaliacao_id}`
        const check = document.getElementById(checkId)
        const label = document.getElementById(`${checkId}-label`)

        // Evento checkbox
        if (check) {
            check.addEventListener('change', () => {
                const avaliacao_id = parseInt(check.dataset.avaliacaoId)
                
                if (check.checked) {
                    consentimentos[avaliacao_id] = true
                    label.style.background = '#dcfce7'
                    label.style.borderColor = '#86efac'
                    mensagem.textContent = ''
                } else {
                    delete consentimentos[avaliacao_id]
                    label.style.background = '#eff6ff'
                    label.style.borderColor = '#bfdbfe'
                }

                // Re-renderiza para atualizar o estado do botão finalizar
                if (indiceAtual === ocorrencias.length - 1) {
                    const btnFin = document.getElementById('btn-finalizar')
                    if (btnFin) {
                        const allConsented = ocorrencias.every(oc => consentimentos[oc.avaliacao_id])
                        btnFin.disabled = !allConsented
                        btnFin.style.opacity = allConsented ? '1' : '0.5'
                        btnFin.style.cursor = allConsented ? 'pointer' : 'not-allowed'

                        if (allConsented) {
                            mensagem.textContent = '✓ Todas as ocorrências consentidas. Pode finalizar.'
                            mensagem.style.color = '#10B981'
                        } else {
                            mensagem.textContent = ''
                        }
                    }
                }

                // Re-renderiza para refletir o checkbox marcado/desmarcado
                // (pois o estilo do label é injetado via innerHTML)
                renderizar()
            })
        }

        // Botão próximo
        if (btnProximo) {
            btnProximo.addEventListener('click', () => {
                if (indiceAtual < ocorrencias.length - 1) {
                    indiceAtual++
                    renderizar()
                }
            })
        }

        // Botão anterior
        if (btnAnterior) {
            btnAnterior.addEventListener('click', () => {
                if (indiceAtual > 0) {
                    indiceAtual--
                    renderizar()
                }
            })
        }

        // Botão finalizar
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', () => {
                if (todasConsentidas()) {
                    // Envia para o servidor as avaliações que foram consentidas
                    const idsParaConsentir = ocorrencias
                        .filter(oc => consentimentos[oc.avaliacao_id])
                        .map(oc => oc.avaliacao_id)

                    fetch('/responsavel/consentir-avaliacoes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avaliacoes_ids: idsParaConsentir })
                    }).then(r => r.json()).then(dados => {
                        console.log('Consentimento salvo:', dados.message)
                    }).catch(e => console.error('Erro ao salvar consentimento:', e))

                    root.innerHTML = ''
                    onFinish()
                }
            })
        }

        // Navegação por dots
        window.navegarOcorrencia = function(indice) {
            if (indice >= 0 && indice < ocorrencias.length) {
                indiceAtual = indice
                renderizar()
            }
        }
    }

    function todasConsentidas() {
        return ocorrencias.every(oc => consentimentos[oc.avaliacao_id])
    }

    renderizar()
}
