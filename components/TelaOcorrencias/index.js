import Header from '../Header/index.js'

/**
 * Tela de Ocorrências - Painel de leitura apenas para aluno
 */
export default async function TelaOcorrencias(root, alunoId) {
    root.innerHTML = `
        ${Header({ 'Sair': ['/index.html'] })}

        <main style="
            padding: 20px;
            max-width: 700px;
            margin: 0 auto;
            animation: fadeIn 0.3s ease;
        ">
            <!-- Cabeçalho -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #F59E0B, #D97706);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <span style="font-size: 20px;">📋</span>
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 20px; color: #0f172a; font-weight: 700;">Minhas Ocorrências</h1>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">Visualização apenas - sem edições</p>
                </div>
            </div>

            <!-- Loading -->
            <div id="obs-loading" style="
                text-align: center;
                padding: 40px;
                color: #94a3b8;
            ">
                <div style="font-size: 32px; margin-bottom: 10px;">⏳</div>
                <p>Carregando ocorrências...</p>
            </div>

            <!-- Lista vazia -->
            <div id="obs-vazio" style="display: none; text-align: center; padding: 40px; color: #94a3b8;">
                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <h2 style="color: #334155; font-size: 16px; margin: 0 0 4px 0;">Nenhuma ocorrência registrada</h2>
                <p style="font-size: 13px;">Parabéns! Nenhuma ocorrência negativa foi registrada sobre você.</p>
            </div>

            <!-- Lista de ocorrências -->
            <div id="obs-lista" style="display: none;">
                <div style="
                    background: rgba(255,255,255,0.8);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                ">
                    <div style="margin-bottom: 16px;">
                        <h2 style="margin: 0 0 4px 0; font-size: 15px; color: #0f172a; font-weight: 600;">
                            Ocorrências Registradas
                        </h2>
                        <span id="obs-contagem" style="color: #94a3b8; font-size: 13px;"></span>
                    </div>
                    <div id="obs-grid"></div>
                </div>
            </div>
        </main>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    `

    // Carrega ocorrências do aluno
    try {
        const resposta = await fetch(`/aluno/ocorrencias?id=${alunoId}`)
        const ocorrencias = await resposta.json()

        document.getElementById('obs-loading').style.display = 'none'

        if (ocorrencias.length === 0) {
            document.getElementById('obs-vazio').style.display = 'block'
        } else {
            document.getElementById('obs-lista').style.display = 'block'
            document.getElementById('obs-contagem').textContent = `(${ocorrencias.length} ocorrência${ocorrencias.length > 1 ? 's' : ''})`
            document.getElementById('obs-grid').innerHTML = `
                <div style="background: #fef2f2; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; border: 1px solid #fecaca;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 18px;">⚠️</span>
                            <span style="color: #dc2626; font-weight: 600; font-size: 13px;">Ocorrências Negativas</span>
                        </div>
                        <span style="color: #dc2626; font-weight: 600;">${ocorrencias.length}</span>
                    </div>
                </div>
                ${ocorrencias.map(oc => `
                    <div style="
                        background: white;
                        border-radius: 10px;
                        padding: 16px;
                        border-left: 4px solid ${getCorOcorrencia(oc.valor)};
                        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                        margin-bottom: 12px;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 22px;">📌</span>
                                <div>
                                    <strong style="font-size: 15px; color: #1e293b;">${oc.aluno_nome || 'Aluno'}</strong>
                                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                                        ${oc.serie || '?'}º${oc.turma || '?'} · ${oc.categoria || 'Geral'}
                                    </div>
                                </div>
                            </div>
                            <span style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 3px 8px; border-radius: 20px; white-space: nowrap;">
                                ${formatarDataHora(oc.data, oc.hora)}
                            </span>
                        </div>
                        <div style="background: #f8fafc; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
                            <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0;">"${oc.observacao || oc.valor || 'Sem observação'}"</p>
                        </div>
                        <div style="display: flex; gap: 16px; font-size: 12px; color: #64748b;">
                            <span><strong>Pontos:</strong> ${oc.pontos ?? '—'}</span>
                            <span><strong>Valor:</strong> ${oc.valor || '—'}</span>
                        </div>
                    </div>
                `).join('')}
            `
        }
    } catch (erro) {
        console.error('Erro ao carregar ocorrências:', erro)
        document.getElementById('obs-loading').innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
            <p style="color: #ef4444;">Erro ao carregar ocorrências. Tente novamente.</p>
        `
    }
}

function getCorOcorrencia(valor) {
    const cores = {
        'bagunça': '#f59e0b',
        'desmotivado': '#64748b',
        'não entregou': '#ef4444',
        'conflituante': '#ef4444',
        'isolado': '#a855f7',
        'desinteressado': '#64748b',
        'indiferente': '#64748b',
        'atrasado': '#eab308',
    }
    return cores[valor?.toLowerCase()] || '#3b82f6'
}

function formatarDataHora(data, hora) {
    if (!data) return 'Data não informada'
    try {
        return new Date(data + (hora ? 'T' + hora : 'T00:00'))
            .toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
        return `${data} ${hora || ''}`
    }
}
