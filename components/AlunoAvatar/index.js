/**
 * Componente AlunoAvatar - Reutilizável
 * 
 * Responsabilidade:
 * - Exibir o avatar do aluno com garantia de fallback para '🙂' (nunca null, undefined ou vazio).
 * - Suportar diferentes tamanhos e formatos visuais (inline, badge circular, avatar-only, stacked, card-header).
 * - Garantir acessibilidade com aria-label em emojis.
 * - Evitar duplicação de lógica visual em dezenas de arquivos do projeto.
 */

export const AVATAR_PADRAO = '🙂';

/**
 * Obtém o avatar seguro com fallback padrão 🙂
 * @param {Object|string} alunoOuAvatar
 * @returns {string} Emoji seguro
 */
export function obterAvatarSeguro(alunoOuAvatar) {
    if (!alunoOuAvatar) return AVATAR_PADRAO;
    if (typeof alunoOuAvatar === 'string') {
        const limpo = alunoOuAvatar.trim();
        return limpo || AVATAR_PADRAO;
    }
    const av = alunoOuAvatar.avatar || alunoOuAvatar.aluno_avatar;
    if (av && typeof av === 'string' && av.trim()) {
        return av.trim();
    }
    return AVATAR_PADRAO;
}

/**
 * Obtém o nome seguro do aluno
 * @param {Object|string} alunoOuNome
 * @param {string} fallback
 * @returns {string} Nome formatado
 */
export function obterNomeSeguro(alunoOuNome, fallback = 'Aluno') {
    if (!alunoOuNome) return fallback;
    if (typeof alunoOuNome === 'string') {
        const limpo = alunoOuNome.trim();
        return limpo || fallback;
    }
    const nome = alunoOuNome.aluno_nome || alunoOuNome.nome;
    if (nome && typeof nome === 'string' && nome.trim()) {
        return nome.trim();
    }
    return fallback;
}

// Configurações de tamanhos para círculos e emojis
const MAPA_TAMANHOS = {
    mini: {
        circleSize: '24px',
        fontSize: '14px',
        gap: '6px'
    },
    pequeno: {
        circleSize: '32px',
        fontSize: '18px',
        gap: '8px'
    },
    medio: {
        circleSize: '42px',
        fontSize: '24px',
        gap: '10px'
    },
    grande: {
        circleSize: '54px',
        fontSize: '32px',
        gap: '12px'
    },
    extra: {
        circleSize: '84px',
        fontSize: '48px',
        gap: '16px'
    }
};

/**
 * Componente funcional que retorna HTML em string
 * Compatível com o padrão de módulos do projeto (Vanilla JS + ES Modules)
 *
 * @param {Object} props
 * @param {Object} [props.aluno] Objeto de dados do aluno
 * @param {string} [props.avatar] Avatar direto (sobrescreve props.aluno)
 * @param {string} [props.nome] Nome direto (sobrescreve props.aluno)
 * @param {'mini'|'pequeno'|'medio'|'grande'|'extra'} [props.tamanho='medio'] Tamanho visual
 * @param {'inline'|'badge'|'avatar-only'|'stacked'|'card-header'} [props.formato='inline'] Formato de exibição
 * @param {string} [props.subtitulo] Texto ou HTML de subtítulo (ex: saldo, responsável)
 * @param {string} [props.className] Classes extras
 * @param {string} [props.style] Estilos extras
 * @returns {string} HTML renderizado
 */
export default function AlunoAvatar({
    aluno = null,
    avatar = null,
    nome = null,
    tamanho = 'medio',
    formato = 'inline',
    subtitulo = '',
    className = '',
    style = ''
} = {}) {
    const avatarFinal = obterAvatarSeguro(avatar || aluno);
    const nomeFinal = obterNomeSeguro(nome || aluno);
    const configTamanho = MAPA_TAMANHOS[tamanho] || MAPA_TAMANHOS.medio;

    // 1. Apenas o Avatar com Círculo Visual e Acessibilidade
    if (formato === 'avatar-only') {
        return `
            <div class="aluno-avatar-circle ${className}"
                 style="
                    width: ${configTamanho.circleSize};
                    height: ${configTamanho.circleSize};
                    min-width: ${configTamanho.circleSize};
                    border-radius: 50%;
                    background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%);
                    border: 1px solid #c7d2fe;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${configTamanho.fontSize};
                    user-select: none;
                    line-height: 1;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    ${style}
                 "
                 role="img"
                 aria-label="Avatar de ${nomeFinal}: ${avatarFinal}">
                <span>${avatarFinal}</span>
            </div>
        `.trim();
    }

    // 2. Formato Inline: "🙂 Nome do Aluno"
    if (formato === 'inline') {
        return `
            <span class="aluno-avatar-inline ${className}"
                  style="display: inline-flex; align-items: center; gap: ${configTamanho.gap}; font-weight: inherit; line-height: 1.3; ${style}">
                <span class="aluno-avatar-emoji"
                      style="font-size: ${configTamanho.fontSize}; line-height: 1; user-select: none;"
                      role="img"
                      aria-label="Avatar de ${nomeFinal}: ${avatarFinal}">
                    ${avatarFinal}
                </span>
                <span class="aluno-avatar-nome">${nomeFinal}</span>
            </span>
        `.trim();
    }

    // 3. Formato Badge: [🙂] Nome do Aluno (+ Subtítulo opcional)
    if (formato === 'badge') {
        return `
            <div class="aluno-avatar-badge ${className}"
                 style="display: inline-flex; align-items: center; gap: ${configTamanho.gap}; ${style}">
                <div class="aluno-avatar-circle"
                     style="
                        width: ${configTamanho.circleSize};
                        height: ${configTamanho.circleSize};
                        min-width: ${configTamanho.circleSize};
                        border-radius: 50%;
                        background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%);
                        border: 1px solid #c7d2fe;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${configTamanho.fontSize};
                        line-height: 1;
                        user-select: none;
                        flex-shrink: 0;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                     "
                     role="img"
                     aria-label="Avatar de ${nomeFinal}: ${avatarFinal}">
                    <span>${avatarFinal}</span>
                </div>
                <div class="aluno-avatar-info" style="min-width: 0;">
                    <div class="aluno-avatar-nome" style="font-weight: 700; color: #0f172a; line-height: 1.2;">${nomeFinal}</div>
                    ${subtitulo ? `<div class="aluno-avatar-sub" style="font-size: 12px; color: #64748b; margin-top: 2px;">${subtitulo}</div>` : ''}
                </div>
            </div>
        `.trim();
    }

    // 4. Formato Stacked (Centralizado, Avatar em cima e nome embaixo)
    if (formato === 'stacked') {
        return `
            <div class="aluno-avatar-stacked ${className}"
                 style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; ${style}">
                <div class="aluno-avatar-circle"
                     style="
                        width: ${configTamanho.circleSize};
                        height: ${configTamanho.circleSize};
                        border-radius: 50%;
                        background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%);
                        border: 2px solid #818cf8;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${configTamanho.fontSize};
                        line-height: 1;
                        user-select: none;
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
                     "
                     role="img"
                     aria-label="Avatar de ${nomeFinal}: ${avatarFinal}">
                    <span>${avatarFinal}</span>
                </div>
                <strong class="aluno-avatar-nome" style="font-size: 14px; color: #0f172a;">${nomeFinal}</strong>
                ${subtitulo ? `<span class="aluno-avatar-sub" style="font-size: 12px; color: #64748b;">${subtitulo}</span>` : ''}
            </div>
        `.trim();
    }

    // 5. Formato Card-Header (Destaque em topos de modais ou painel)
    if (formato === 'card-header') {
        return `
            <div class="aluno-avatar-header ${className}"
                 style="display: flex; align-items: center; gap: ${configTamanho.gap}; ${style}">
                <div class="aluno-avatar-circle"
                     style="
                        width: ${configTamanho.circleSize};
                        height: ${configTamanho.circleSize};
                        min-width: ${configTamanho.circleSize};
                        border-radius: 50%;
                        background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%);
                        border: 2px solid #818cf8;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${configTamanho.fontSize};
                        line-height: 1;
                        user-select: none;
                        flex-shrink: 0;
                        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.18);
                     "
                     role="img"
                     aria-label="Avatar de ${nomeFinal}: ${avatarFinal}">
                    <span>${avatarFinal}</span>
                </div>
                <div style="min-width: 0;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.2;">${nomeFinal}</h2>
                    ${subtitulo ? `<div style="font-size: 13px; color: #64748b; margin-top: 3px;">${subtitulo}</div>` : ''}
                </div>
            </div>
        `.trim();
    }

    // Fallback padrão
    return `<span>${avatarFinal} ${nomeFinal}</span>`;
}
