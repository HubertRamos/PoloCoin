import Header from "../../../components/Header/index.js";

const root = document.getElementById("root");

function Render() {
    root.innerHTML = `
        ${Header({ 'Turmas': ['/app/professor/Turmas/index.html'], 'Meu Perfil': ['/app/professor/Perfil/index.html'] })}
        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 100px 20px 20px; flex: 1; align-items: flex-start; justify-content: center;">
            <div style="flex: 2; min-width: 300px; width: 100%; max-width: 500px;">
                <div style="background-color: #F8FAFC; padding: 20px; border-radius: 15px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); border: 1px solid #e2e8f0;">
                    <h1 style="color: #3d3d3d; font-size: 22px; margin: 0 0 20px 0;">Alterar Senha</h1>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #3d3d3d;">Senha Atual</label>
                        <input type="password" id="senha-atual" placeholder="Digite sua senha atual" 
                               style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #3d3d3d;">Nova Senha</label>
                        <input type="password" id="nova-senha" placeholder="Digite a nova senha" 
                               style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: 500; margin-bottom: 5px; color: #3d3d3d;">Confirmar Nova Senha</label>
                        <input type="password" id="confirmar-senha" placeholder="Confirme a nova senha" 
                               style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
                    </div>
                    
                    <button id="btn-salvar" 
                            style="width: 100%; background-color: #3B82F6; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px;"
                            disabled>Salvar Senha</button>
                    
                    <p id="mensagem" style="margin-top: 15px; font-size: 14px; min-height: 20px;"></p>
                </div>
            </div>
        </main>
    `;

    carregarUsuario();
    vincularEventos();
}

async function carregarUsuario() {
    const usuario = sessionStorage.getItem('poloUser');
    if (!usuario) {
        window.location.href = '/index.html';
        return;
    }
}

function vincularEventos() {
    const senhaAtual = document.getElementById('senha-atual');
    const novaSenha = document.getElementById('nova-senha');
    const confirmarSenha = document.getElementById('confirmar-senha');
    const btnSalvar = document.getElementById('btn-salvar');
    const mensagem = document.getElementById('mensagem');

    function atualizarBotao() {
        const temSenhaAtual = senhaAtual.value.trim().length > 0;
        const temNovaSenha = novaSenha.value.trim().length > 0;
        const senhasCoincidem = novaSenha.value === confirmarSenha.value;
        btnSalvar.disabled = !(temSenhaAtual && temNovaSenha && senhasCoincidem);
    }

    senhaAtual.addEventListener('input', atualizarBotao);
    novaSenha.addEventListener('input', atualizarBotao);
    confirmarSenha.addEventListener('input', atualizarBotao);

    btnSalvar.addEventListener('click', async () => {
        const usuario = JSON.parse(sessionStorage.getItem('poloUser'));
        
        mensagem.textContent = '';
        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Salvando...';

        try {
            const resposta = await fetch('http://localhost:3333/professor/senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: usuario.id,
                    senhaAtual: senhaAtual.value.trim(),
                    novaSenha: novaSenha.value.trim()
                })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                mensagem.style.color = '#10B981';
                mensagem.textContent = dados.message;
                senhaAtual.value = '';
                novaSenha.value = '';
                confirmarSenha.value = '';
                setTimeout(() => {
                    mensagem.textContent = '';
                    btnSalvar.textContent = 'Salvar Senha';
                    btnSalvar.disabled = true;
                }, 2000);
            } else {
                mensagem.style.color = '#EF4444';
                mensagem.textContent = dados.error || 'Erro ao atualizar senha.';
                btnSalvar.textContent = 'Salvar Senha';
                btnSalvar.disabled = false;
                atualizarBotao();
            }
        } catch (erro) {
            mensagem.style.color = '#EF4444';
            mensagem.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
            btnSalvar.textContent = 'Salvar Senha';
            btnSalvar.disabled = false;
            atualizarBotao();
        }
    });
}

window.addEventListener("DOMContentLoaded", Render);
