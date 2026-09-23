/**
 * CardOcorrencia - Componente para exibir uma ocorrência do aluno
 * Leitura apenas - sem ações editáveis
 */
const style = {
    card: `
        background: white;
        border-radius: 10px;
        padding: 16px;
        border-left: 4px solid %COR%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        margin-bottom: 12px;
    `,
    header: `
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    `,
    studentInfo: `
        display: flex;
        align-items: center;
        gap: 10px;
    `,
    icon: `
        font-size: 22px;
    `,
    name: `
        font-size: 15px;
        color: #1e293b;
        font-weight: 600;
    `,
    meta: `
        font-size: 12px;
        color: #94a3b8;
        margin-top: 2px;
    `,
    dateBadge: `
        font-size: 11px;
        color: #64748b;
        background: #f1f5f9;
        padding: 3px 8px;
        border-radius: 20px;
        white-space: nowrap;
    `,
    observation: `
        background: #f8fafc;
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 12px;
    `,
    obsText: `
        color: #334155;
        font-size: 13px;
        line-height: 1.5;
        margin: 0;
    `,
    details: `
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #64748b;
        margin-bottom: 12px;
    `,
    detailItem: `
        display: flex;
        gap: 4px;
    `,
}

export default function CardOcorrencia(ocorrencia) {
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
    
    const cor = cores[ocorrencia.valor?.toLowerCase()] || '#3b82f6'
    const cardStyle = style.card.replace('%COR%', cor)

    const dataHora = ocorrencia.data 
        ? new Date(ocorrencia.data + (ocorrencia.hora ? 'T' + ocorrencia.hora : 'T00:00'))
            .toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Data não informada'

    return `
        <div style="${cardStyle}">
            <div style="${style.header}">
                <div style="${style.studentInfo}">
                    <span style="${style.icon}">📌</span>
                    <div>
                        <div style="${style.name}">${ocorrencia.aluno_nome || 'Aluno'}</div>
                        <div style="${style.meta}">
                            ${ocorrencia.serie || '?'}º${ocorrencia.turma || '?'} · ${ocorrencia.categoria || 'Geral'}
                        </div>
                    </div>
                </div>
                <span style="${style.dateBadge}">${dataHora}</span>
            </div>

            <div style="${style.observation}">
                <p style="${style.obsText}">"${ocorrencia.observacao || ocorrencia.valor || 'Sem observação'}"</p>
            </div>

            <div style="${style.details}">
                <div style="${style.detailItem}">
                    <strong>Pontos:</strong> ${ocorrencia.pontos ?? '—'}
                </div>
                <div style="${style.detailItem}">
                    <strong>Valor:</strong> ${ocorrencia.valor || '—'}
                </div>
            </div>
        </div>
    `
}
