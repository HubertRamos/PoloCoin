import TelaLoja from '../../components/TelaLoja/index.js'
import TelaOcorrencias from '../../components/TelaOcorrencias/index.js'
import TelaEditarSenha from '../../components/TelaSenha/index.js'

export default function MenuLateral(buttons = {}, user = {}) {
    // Mapeia os botões dinâmicos com ícones padrão caso não sejam passados
    const iconesPadrao = {
        loja: '🛒',
        ocorrencias: '📋',
        senha: '🔒'
    };

    const itensMenu = Object.entries(buttons).map(([chave, item]) => ({
        chave: chave,
        nome: item.nome || chave,
        icone: item.icone || iconesPadrao[chave] || '📌',
        acao: item.acao || `window.navegarPara('${chave}')`
    }));

    // Registra globalmente as funções do menu
    window.navegarPara = async function(tela) {
        const conteudo = document.getElementById('conteudo-principal');
        if (!conteudo) return;
        
        conteudo.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                <div style="font-size: 32px; margin-bottom: 10px;">⏳</div>
                <p>Carregando...</p>
            </div>
        `;

        try {
            switch (tela) {
                case 'loja':
                    await TelaLoja(conteudo, user.id);
                    break;
                case 'ocorrencias':
                    await TelaOcorrencias(conteudo, user.id);
                    break;
                case 'senha':
                    await TelaEditarSenha(conteudo, user.id);
                    break;
            }
        } catch (erro) {
            console.error('Erro ao carregar tela:', erro);
            conteudo.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #ef4444;">
                    <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
                    <p>Erro ao carregar. Tente novamente.</p>
                </div>
            `;
        }
    };

    window.sair = function() {
        sessionStorage.removeItem('poloUser');
        window.location.href = '/index.html';
    };

    return `
        <div style="
            display: flex;
            min-height: 100vh;
            background: #f1f5f9;
        ">
            <!-- Menu Lateral -->
            <aside style="
                width: 220px;
                background: white;
                border-right: 1px solid #e2e8f0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="
                        width: 56px;
                        height: 56px;
                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                        border-radius: 50%;
                        margin: 0 auto 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <span style="font-size: 24px;">🧑‍🎓</span>
                    </div>
                    <strong style="color: #0f172a; font-size: 14px;">${user.nome || 'Aluno'}</strong>
                    <span style="color: #94a3b8; font-size: 11px; display: block; margin-top: 2px;">
                        Aluno • Turma ${user.serie || '?'}${user.turma || ''}
                    </span>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 10px 0;">
                
                ${itensMenu.map(item => `
                    <button 
                        onclick="${item.acao}"
                        style="
                            background: none;
                            border: none;
                            padding: 10px 14px;
                            border-radius: 8px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            width: 100%;
                            text-align: left;
                            transition: background 0.2s;
                        "
                    >
                        <span style="font-size: 18px;">${item.icone}</span>
                        <span style="color: #334155; font-size: 14px;">${item.nome}</span>
                    </button>
                `).join('')}

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 10px 0;">

                <button 
                    onclick="window.sair()"
                    style="
                        background: #fef2f2;
                        border: none;
                        padding: 10px 14px;
                        border-radius: 8px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        width: 100%;
                        text-align: left;
                        color: #dc2626;
                        font-size: 14px;
                        transition: background 0.2s;
                    "
                >
                    <span style="font-size: 18px;">🚪</span>
                    Sair
                </button>
            </aside>

            <!-- Conteúdo Principal -->
            <main id="conteudo-principal" style="
                flex: 1;
                padding: 20px;
                background: #f8fafc;
                min-height: 100vh;
            ">
                <div style="
                    text-align: center;
                    padding: 60px 20px;
                    color: #94a3b8;
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">👋</div>
                    <h2 style="color: #334155; font-size: 18px; margin: 0 0 8px 0;">Selecione uma opção</h2>
                    <p style="font-size: 14px;">Use o menu à esquerda para navegar.</p>
                </div>
            </main>
        </div>
    `;
}
