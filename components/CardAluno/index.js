/**
 * Componente CardAluno - Card Padronizado de Aluno
 * 
 * Responsabilidade:
 * - Exibir informações de um aluno com avatar, nome, saldo em PoloCoins e metadados
 * - Usado no painel do professor (lista de turma) e no painel do responsável
 * - Acessível por teclado (role="button", tabindex="0", evento Enter/Space)
 */

import AlunoAvatar from '../AlunoAvatar/index.js';
import Badge from '../Badge/index.js';

export default function CardAluno({
    aluno = {},
    onClick = '',
    mostrarSaldo = true,
    mostrarStatusCompra = false,
    subtitulo = '',
    className = '',
    style = ''
} = {}) {
    const id = aluno.id || '';
    const nome = aluno.aluno_nome || aluno.nome || 'Aluno';
    const pontos = Number(aluno.pontos ?? 0);
    const podeComprar = aluno.pode_comprar ?? false;

    let badgeCompra = '';
    if (mostrarStatusCompra) {
        badgeCompra = podeComprar
            ? Badge({ variant: 'success', text: 'Liberado', icon: '✓' })
            : Badge({ variant: 'warning', text: 'Bloqueado', icon: '🔒' });
    }

    const sub = subtitulo || (aluno.responsavel_nome ? `Resp: ${aluno.responsavel_nome}` : '');

    return `
        <div 
            class="card card-aluno card--hover ${className}" 
            data-id="${id}"
            tabindex="0"
            role="button"
            aria-label="Ver detalhes de ${nome}"
            ${onClick ? `onclick="${onClick}"` : ''}
            style="cursor: pointer; ${style}"
        >
            <div class="card-aluno__content" style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
                    ${AlunoAvatar({ aluno, tamanho: 'medio', formato: 'avatar-only' })}
                    <div style="min-width: 0;">
                        <strong class="card-aluno__nome" style="font-size: 15px; color: var(--text-primary); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${nome}
                        </strong>
                        ${sub ? `<span class="card-aluno__sub" style="font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px;">${sub}</span>` : ''}
                    </div>
                </div>

                <div class="card-aluno__meta" style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
                    ${mostrarSaldo ? `
                        <div class="card-aluno__saldo" style="display: flex; align-items: center; gap: 5px; font-weight: 700; color: #d97706; font-size: 14px; font-variant-numeric: tabular-nums;">
                            <span aria-hidden="true">🪙</span>
                            <span>${pontos}</span>
                            <span style="font-size: 11px; font-weight: 500; color: var(--text-muted);">PoloCoins</span>
                        </div>
                    ` : ''}
                    ${badgeCompra}
                </div>
            </div>
        </div>
    `.trim();
}
