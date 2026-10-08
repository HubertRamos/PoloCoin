/**
 * Tela de Perfil do Aluno com personalização de Avatar.
 * Permite escolher emojis/ícones pré-definidos divididos em 7 categorias.
 * Não permite upload, arquivos ou URLs externas.
 * Atualiza em tempo real sem recarregar a página.
 */

import Toast from '../Toast/index.js';

const CATEGORIAS_PADRAO = [
    {
        id: 'rostos',
        nome: 'Rostos',
        icone: '😀',
        avatares: [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️',
            '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋',
            '😛', '😜', '🤪', '🤓', '😎', '🥸', '🥳', '🤩', '🤠'
        ]
    },
    {
        id: 'animais',
        nome: 'Animais',
        icone: '🐶',
        avatares: [
            '🐱', '🐶', '🐺', '🦊', '🦝', '🦁', '🐯', '🐨', '🐼', '🐻',
            '🐸', '🐵', '🦄', '🦖', '🦕', '🐙', '🐬', '🐳', '🦅', '🦉',
            '🐝', '🦋', '🐢', '🐧'
        ]
    },
    {
        id: 'jogos',
        nome: 'Jogos',
        icone: '🎮',
        avatares: [
            '🎮', '🕹️', '👾', '🎲', '♟️', '🎯', '🎳', '🎪', '🪄', '🧩',
            '🃏', '🀄'
        ]
    },
    {
        id: 'esportes',
        nome: 'Esportes',
        icone: '⚽',
        avatares: [
            '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓',
            '🏸', '🥊', '🥋', '🛹', '⛸️', '🚴', '🏆', '🥇'
        ]
    },
    {
        id: 'tecnologia',
        nome: 'Tecnologia',
        icone: '🤖',
        avatares: [
            '🤖', '🚀', '🛸', '💻', '🛰️', '🔬', '🔭', '📡', '🔋', '⚡',
            '⚙️', '🖥️'
        ]
    },
    {
        id: 'criatividade',
        nome: 'Criatividade',
        icone: '🎨',
        avatares: [
            '🎨', '🎭', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎸',
            '📚', '✍️', '✏️', '💡'
        ]
    },
    {
        id: 'diversao',
        nome: 'Diversão',
        icone: '🎉',
        avatares: [
            '🔥', '💎', '👑', '⭐', '🌟', '🌈', '🍕', '🍔', '🍿', '🍦',
            '🍩', '🍭', '🎈', '🎁', '🧁', '🍪', '🌞', '🌙'
        ]
    }
];

export default async function TelaPerfil(root, alunoId) {
    if (!root) return;

    let user = JSON.parse(sessionStorage.getItem('poloUser') || '{}');
    let alunoInfo = {
        nome: user.nome || user.name || 'Aluno',
        avatar: user.avatar || '🙂',
        pontos: 0,
        turma_nome: 'Carregando...',
        responsavel_nome: 'Carregando...'
    };

    root.innerHTML = `
        <main class="container-center polocoin-main__section--centered" style="max-width: 720px;">
            <div class="tela-header">
                <div class="tela-header__icon tela-header__icon--blue">
                    <span class="tela-header__emoji" id="perfil-header-emoji">${alunoInfo.avatar}</span>
                </div>
                <div class="tela-header__info">
                    <h1 class="tela-header__title">Meu Perfil</h1>
                    <p class="tela-header__subtitle">Personalize seu avatar e acompanhe seus dados</p>
                </div>
            </div>

            <!-- Alerta de feedback dinâmico -->
            <div id="perfil-feedback-msg" class="alert alert-success" style="display: none; margin-bottom: 20px; font-weight: 600; animation: fadeIn 0.2s ease;">
                <span id="perfil-feedback-texto">✓ Avatar atualizado com sucesso</span>
            </div>

            <!-- Seção: Meu Avatar -->
            <div class="card" style="padding: 24px; margin-bottom: 20px; text-align: center; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px;">
                    <span style="font-size: 20px;">😀</span>
                    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">Meu Avatar Atual</h2>
                </div>

                <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                    <!-- Grande Avatar Atual -->
                    <div id="perfil-avatar-preview-box" style="
                        width: 104px;
                        height: 104px;
                        background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
                        border: 3px solid #6366f1;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 58px;
                        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.25);
                        user-select: none;
                        transition: transform 0.2s ease;
                    ">
                        <span id="perfil-avatar-grande">${alunoInfo.avatar}</span>
                    </div>

                    <p style="color: #64748b; font-size: 14px; margin: 0; max-width: 400px;">
                        Este avatar representa você no painel da turma, ocorrências, lojinha e para seus responsáveis!
                    </p>

                    <!-- Botão Trocar Avatar -->
                    <button id="btn-abrir-seletor-avatar" class="btn btn-primary" type="button" style="
                        padding: 10px 22px;
                        font-size: 15px;
                        font-weight: 700;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                        cursor: pointer;
                    ">
                        <span>🎨</span>
                        <span>Trocar Avatar</span>
                    </button>
                </div>
            </div>

            <!-- Seção: Meus Dados -->
            <div class="card" style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span>📌</span>
                    <span>Informações da Conta</span>
                </h3>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
                    <div style="padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <small style="color: #64748b; font-size: 12px; font-weight: 600; display: block; margin-bottom: 2px;">Nome do Aluno</small>
                        <strong id="perfil-info-nome" style="color: #0f172a; font-size: 14px;">${alunoInfo.nome}</strong>
                    </div>

                    <div style="padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <small style="color: #64748b; font-size: 12px; font-weight: 600; display: block; margin-bottom: 2px;">Turma</small>
                        <strong id="perfil-info-turma" style="color: #0f172a; font-size: 14px;">${alunoInfo.turma_nome}</strong>
                    </div>

                    <div style="padding: 12px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <small style="color: #64748b; font-size: 12px; font-weight: 600; display: block; margin-bottom: 2px;">Responsável</small>
                        <strong id="perfil-info-resp" style="color: #0f172a; font-size: 14px;">${alunoInfo.responsavel_nome}</strong>
                    </div>

                    <div style="padding: 12px 14px; background: #fef3c7; border-radius: 8px; border: 1px solid #fde68a;">
                        <small style="color: #92400e; font-size: 12px; font-weight: 600; display: block; margin-bottom: 2px;">Saldo Atual</small>
                        <strong id="perfil-info-saldo" style="color: #b45309; font-size: 15px;">🪙 ${alunoInfo.pontos} PoloCoins</strong>
                    </div>
                </div>

                <div style="margin-top: 18px; display: flex; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="window.navegarPara('senha')" style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px;">
                        <span>🔒</span> Alterar Minha Senha
                    </button>
                </div>
            </div>
        </main>
    `;

    // Carrega dados completos do aluno do servidor
    try {
        const respAluno = await fetch(`/alunos/${alunoId}`);
        if (respAluno.ok) {
            const dados = await respAluno.json();
            if (dados) {
                alunoInfo.avatar = dados.avatar || alunoInfo.avatar || '🙂';
                alunoInfo.nome = dados.nome || alunoInfo.nome;
                alunoInfo.turma_nome = dados.turma_nome || 'N/A';
                alunoInfo.responsavel_nome = dados.responsavel_nome || 'Não informado';
                alunoInfo.pontos = dados.pontos ?? 0;

                // Atualiza sessão
                user.avatar = alunoInfo.avatar;
                sessionStorage.setItem('poloUser', JSON.stringify(user));

                // Atualiza interface
                const elAvatarGrande = document.getElementById('perfil-avatar-grande');
                const elHeaderEmoji = document.getElementById('perfil-header-emoji');
                const elNome = document.getElementById('perfil-info-nome');
                const elTurma = document.getElementById('perfil-info-turma');
                const elResp = document.getElementById('perfil-info-resp');
                const elSaldo = document.getElementById('perfil-info-saldo');

                if (elAvatarGrande) elAvatarGrande.textContent = alunoInfo.avatar;
                if (elHeaderEmoji) elHeaderEmoji.textContent = alunoInfo.avatar;
                if (elNome) elNome.textContent = alunoInfo.nome;
                if (elTurma) elTurma.textContent = alunoInfo.turma_nome;
                if (elResp) elResp.textContent = alunoInfo.responsavel_nome;
                if (elSaldo) elSaldo.textContent = `🪙 ${alunoInfo.pontos} PoloCoins`;

                // Atualiza avatar do sidebar
                const elSideAvatar = document.querySelector('#sidebar-aluno-avatar span, .polocoin-sidebar__avatar span');
                if (elSideAvatar) elSideAvatar.textContent = alunoInfo.avatar;
            }
        }
    } catch (e) {
        console.warn('Erro ao carregar dados do aluno no perfil:', e);
    }

    // Listener do botão Trocar Avatar
    const btnTrocar = document.getElementById('btn-abrir-seletor-avatar');
    if (btnTrocar) {
        btnTrocar.addEventListener('click', () => {
            abrirModalSeletorAvatar({
                alunoId,
                avatarAtual: alunoInfo.avatar,
                onAvatarSalvo: (novoAvatar) => {
                    alunoInfo.avatar = novoAvatar;
                    user.avatar = novoAvatar;
                    sessionStorage.setItem('poloUser', JSON.stringify(user));

                    // Atualiza elementos na tela
                    const elAvatarGrande = document.getElementById('perfil-avatar-grande');
                    const elHeaderEmoji = document.getElementById('perfil-header-emoji');
                    const previewBox = document.getElementById('perfil-avatar-preview-box');

                    if (elAvatarGrande) elAvatarGrande.textContent = novoAvatar;
                    if (elHeaderEmoji) elHeaderEmoji.textContent = novoAvatar;
                    if (previewBox) {
                        previewBox.style.transform = 'scale(1.15)';
                        setTimeout(() => { previewBox.style.transform = 'scale(1)'; }, 250);
                    }

                    // Atualiza avatar no menu lateral / sidebar
                    const elSideAvatar = document.querySelector('#sidebar-aluno-avatar span, .polocoin-sidebar__avatar span');
                    if (elSideAvatar) elSideAvatar.textContent = novoAvatar;

                    // Exibe feedback de sucesso: "✓ Avatar atualizado com sucesso"
                    exibirFeedbackPerfil('✓ Avatar atualizado com sucesso');
                }
            });
        });
    }
}

/**
 * Exibe notificação de feedback na tela do perfil
 */
function exibirFeedbackPerfil(texto) {
    const feedbackBox = document.getElementById('perfil-feedback-msg');
    const feedbackTexto = document.getElementById('perfil-feedback-texto');
    if (!feedbackBox || !feedbackTexto) return;

    feedbackTexto.textContent = texto;
    feedbackBox.style.display = 'block';

    setTimeout(() => {
        if (feedbackBox) feedbackBox.style.display = 'none';
    }, 4000);
}

/**
 * Modal visual de seleção de Avatar
 * Grade com categorias: Rostos, Animais, Jogos, Esportes, Tecnologia, Criatividade, Diversão.
 */
export function abrirModalSeletorAvatar({ alunoId, avatarAtual = '🙂', onAvatarSalvo = () => {} }) {
    const modalId = 'modal-seletor-avatar-aluno';
    const existente = document.getElementById(modalId);
    if (existente) existente.remove();

    let categoriaAtiva = 'rostos';
    let avatarSelecionado = avatarAtual;
    let salvando = false;

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 16px;
        animation: fadeIn 0.15s ease;
    `;

    function renderConteudo() {
        const catObj = CATEGORIAS_PADRAO.find(c => c.id === categoriaAtiva) || CATEGORIAS_PADRAO[0];

        overlay.innerHTML = `
            <div class="modal-content" style="
                background: white;
                max-width: 580px;
                width: 100%;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                max-height: 90vh;
                animation: scaleUp 0.15s ease;
            " role="dialog" aria-modal="true" aria-labelledby="modal-avatar-title">

                <!-- Header -->
                <div style="padding: 18px 22px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="font-size: 24px;">🎨</div>
                        <div>
                            <h2 id="modal-avatar-title" style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;">Escolha seu Novo Avatar</h2>
                            <p style="margin: 0; font-size: 12px; color: #64748b;">Selecione uma categoria e clique no emoji desejado</p>
                        </div>
                    </div>
                    <button id="btn-fechar-modal-avatar" type="button" class="btn btn-ghost" style="padding: 6px 10px; font-size: 16px; color: #64748b; border: none; background: transparent; cursor: pointer; border-radius: 6px;" aria-label="Fechar">
                        ✕
                    </button>
                </div>

                <!-- Tabs de Categorias -->
                <div style="padding: 10px 16px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: thin;">
                    ${CATEGORIAS_PADRAO.map(cat => {
                        const isAtiva = cat.id === categoriaAtiva;
                        return `
                            <button type="button" class="btn-categoria-avatar" data-cat="${cat.id}" style="
                                padding: 6px 12px;
                                font-size: 13px;
                                font-weight: ${isAtiva ? '700' : '500'};
                                border-radius: 20px;
                                border: 1px solid ${isAtiva ? '#4f46e5' : '#e2e8f0'};
                                background: ${isAtiva ? '#4f46e5' : '#f8fafc'};
                                color: ${isAtiva ? '#ffffff' : '#475569'};
                                cursor: pointer;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                                white-space: nowrap;
                                transition: all 0.15s ease;
                            ">
                                <span>${cat.icone}</span>
                                <span>${cat.nome}</span>
                            </button>
                        `;
                    }).join('')}
                </div>

                <!-- Corpo: Grade Visual de Emojis -->
                <div style="padding: 20px; overflow-y: auto; flex: 1;">
                    <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 13px; font-weight: 600; color: #475569;">
                            Categoria: <strong>${catObj.nome}</strong> (${catObj.avatares.length} opções)
                        </span>
                        <span style="font-size: 12px; color: #94a3b8;">
                            Clique duas vezes para salvar direto
                        </span>
                    </div>

                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
                        gap: 10px;
                    ">
                        ${catObj.avatares.map(emoji => {
                            const isSelecionado = emoji === avatarSelecionado;
                            return `
                                <button type="button" class="btn-item-avatar" data-emoji="${emoji}" style="
                                    height: 56px;
                                    font-size: 32px;
                                    border-radius: 12px;
                                    border: 2px solid ${isSelecionado ? '#4f46e5' : '#e2e8f0'};
                                    background: ${isSelecionado ? '#e0e7ff' : '#ffffff'};
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    transition: transform 0.15s, border-color 0.15s, background-color 0.15s;
                                    position: relative;
                                    box-shadow: ${isSelecionado ? '0 0 0 3px rgba(79, 70, 229, 0.25)' : 'none'};
                                " title="Selecionar ${emoji}">
                                    <span>${emoji}</span>
                                    ${isSelecionado ? `
                                        <span style="
                                            position: absolute;
                                            top: 2px;
                                            right: 2px;
                                            width: 14px;
                                            height: 14px;
                                            background: #4f46e5;
                                            color: white;
                                            border-radius: 50%;
                                            font-size: 9px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-weight: bold;
                                        ">✓</span>
                                    ` : ''}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Footer: Preview e Botão Salvar -->
                <div style="padding: 14px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 44px;
                            height: 44px;
                            background: white;
                            border: 2px solid #4f46e5;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 26px;
                            box-shadow: 0 2px 8px rgba(79,70,229,0.2);
                        ">
                            <span id="preview-avatar-selecionado">${avatarSelecionado}</span>
                        </div>
                        <div>
                            <span style="font-size: 11px; color: #64748b; display: block; font-weight: 600;">AVATAR ESCOLHIDO</span>
                            <strong style="font-size: 13px; color: #0f172a;">Pronto para aplicar</strong>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <button id="btn-cancelar-modal-avatar" type="button" class="btn btn-secondary" style="padding: 8px 14px; font-size: 13px;">
                            Cancelar
                        </button>
                        <button id="btn-confirmar-salvar-avatar" type="button" class="btn btn-primary" style="
                            padding: 8px 18px;
                            font-size: 13px;
                            font-weight: 700;
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            background: #16a34a;
                            border-color: #16a34a;
                            box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
                        " ${salvando ? 'disabled' : ''}>
                            <span>${salvando ? '⏳' : '✓'}</span>
                            <span>${salvando ? 'Salvando...' : 'Salvar Avatar'}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Eventos
        const btnFechar = overlay.querySelector('#btn-fechar-modal-avatar');
        const btnCancelar = overlay.querySelector('#btn-cancelar-modal-avatar');
        if (btnFechar) btnFechar.onclick = fechar;
        if (btnCancelar) btnCancelar.onclick = fechar;

        // Troca de categoria
        overlay.querySelectorAll('.btn-categoria-avatar').forEach(btn => {
            btn.onclick = () => {
                categoriaAtiva = btn.getAttribute('data-cat');
                renderConteudo();
            };
        });

        // Clique em emoji
        overlay.querySelectorAll('.btn-item-avatar').forEach(btn => {
            const emoji = btn.getAttribute('data-emoji');
            btn.onclick = () => {
                avatarSelecionado = emoji;
                renderConteudo();
            };
            btn.ondblclick = () => {
                avatarSelecionado = emoji;
                executarSalvamento();
            };
        });

        // Botão Salvar
        const btnSalvar = overlay.querySelector('#btn-confirmar-salvar-avatar');
        if (btnSalvar) {
            btnSalvar.onclick = executarSalvamento;
        }
    }

    async function executarSalvamento() {
        if (salvando) return;
        salvando = true;
        renderConteudo();

        try {
            const resp = await fetch(`/alunos/${alunoId}/avatar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: avatarSelecionado })
            });

            const resultado = await resp.json();

            if (resp.ok) {
                fechar();
                Toast.success('✓ Avatar atualizado com sucesso!');
                onAvatarSalvo(resultado.avatar || avatarSelecionado);
            } else {
                Toast.error(resultado.error || 'Erro ao salvar avatar.');
                salvando = false;
                renderConteudo();
            }
        } catch (err) {
            console.error('Erro de conexão ao salvar avatar:', err);
            // Em caso de falha de conexão, aplica localmente para não bloquear o aluno
            fechar();
            Toast.info('Avatar atualizado temporariamente.');
            onAvatarSalvo(avatarSelecionado);
        }
    }

    function fechar() {
        overlay.remove();
    }

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fechar();
    });

    // Fechar ao pressionar ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            fechar();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    document.body.appendChild(overlay);
    renderConteudo();
}
