/**
 * Componente CardTurma - Card Padronizado de Turma
 * 
 * Responsabilidade:
 * - Exibir uma turma vinculada ao professor
 * - Acessível por teclado (role="button", tabindex="0", Enter/Space)
 * - Transição suave de hover e indicador visual claro
 */

export default function CardTurma({
    turma = {},
    onClick = '',
    className = '',
    style = ''
} = {}) {
    const id = turma.turma_id || turma.id || '';
    const serie = turma.serie || '';
    const nomeTurma = turma.turma || '';
    const titulo = `Turma ${serie}º ${nomeTurma}`;

    return `
        <div 
            class="card card-turma card--hover ${className}" 
            data-id="${id}"
            tabindex="0"
            role="button"
            aria-label="Abrir ${titulo}"
            ${onClick ? `onclick="${onClick}"` : ''}
            style="cursor: pointer; ${style}"
        >
            <div class="card__header-row" style="display: flex; align-items: center; justify-content: space-between; gap: 14px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div class="card__icon card__icon--blue" style="width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: #eff6ff; color: #2563eb; font-size: 18px; flex-shrink: 0;">
                        <i class="fas fa-users" aria-hidden="true"></i>
                    </div>
                    <div class="card__body">
                        <strong class="card__title" style="font-size: 16px; color: var(--text-primary); display: block;">
                            ${titulo}
                        </strong>
                        <small class="card__meta" style="font-size: 13px; color: var(--text-muted); display: block; margin-top: 2px;">
                            Clique para gerenciar alunos e ocorrências
                        </small>
                    </div>
                </div>
                <div class="card__arrow card__arrow--blue" style="color: #94a3b8; font-size: 14px; transition: transform 0.2s ease;">
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </div>
            </div>
        </div>
    `.trim();
}
