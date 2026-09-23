import Header from "../../../components/Header/index.js";

const root = document.getElementById("root");

function Render() {
    root.innerHTML = `
        ${Header({ 'Turmas': ['/app/professor/Turmas/index.html'], 'Meu Perfil': ['/app/professor/Perfil/index.html'] })}
        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 100px 20px 20px; flex: 1; align-items: flex-start; justify-content: center;">
            <div style="flex: 2; min-width: 300px; width: 100%; max-width: 600px;">
                <div style="background-color: #F8FAFC; padding: 20px; border-radius: 15px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); border: 1px solid #e2e8f0; margin-bottom: 20px;">
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
                    
                    <p id="mensagem-senha" style="margin-top: 15px; font-size: 14px; min-height: 20px;"></p>
                </div>
                
                <div style="background-color: #F8FAFC; padding: 20px; border-radius: 15px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); border: 1px solid #e2e8f0;">
                    <h1 style="color: #3d3d3d; font-size: 22px; margin: 0 0 20px 0;">Turmas Vinculadas</h1>
                    
                    <div id="turmas-list" style="margin-bottom: 15px;">
                        <p style="color: #64748b; font-size: 14px;">Carregando turmas...</p>
                    </div>
                    
                    <div id="disponiveis-list">
                        <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">Turmas disponíveis para vincular:</p>
                        <div id="disponiveis-content"></div>
                    </div>
                </div>
            </div>
        </main>
    `;

    carregarUsuario();
    carregarTurmas();
    vincularEventos();
}

async function carregarUsuario() {
    const usuario = sessionStorage.getItem('poloUser');
    if (!usuario) {
        window.location.href = '/index.html';
        return;
    }
}

async function carregarTurmas() {
    const usuario = JSON.parse(sessionStorage.getItem('poloUser'));
    const professorId = usuario?.id;
    
    console.log('[DEBUG] carregarTurmas chamada - professorId:', professorId);
    
    if (!professorId) return;

    try {
        const resposta = await fetch(`http://localhost:3333/professor/turmas?id=${professorId}&_=${Date.now()}`);
        const dados = await resposta.json();
        
        console.log('[DEBUG] API response:', JSON.stringify(dados));
        
        const turmasVinculadas = dados.vinculadas || [];
        const todasTurmas = dados.disponiveis || [];
        
        console.log('[DEBUG] turmasVinculadas:', turmasVinculadas.length, 'turmasDisponiveis:', todasTurmas.length);
        
        // Renderiza turmas vinculadas
        const turmasList = document.getElementById('turmas-list');
        const idsVinculados = turmasVinculadas.map(t => t.turma_id);
        
        if (turmasVinculadas.length === 0) {
            turmasList.innerHTML = `<p style="color: #64748b; font-size: 14px;">Nenhuma turma vinculada.</p>`;
        } else {
            turmasList.innerHTML = turmasVinculadas.map(turma => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px;">
                    <div>
                        <strong>${turma.serie}º${turma.turma}</strong>
                    </div>
                    <button data-turma-id="${turma.turma_id}" 
                            style="background: #EF4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;"
                            class="btn-desvincular">Desvincular</button>
                </div>
            `).join('');
        }
        
        // Renderiza turmas disponíveis (não vinculadas)
        const disponiveisContent = document.getElementById('disponiveis-content');
        const turmasDisponiveis = todasTurmas.filter(t => !idsVinculados.includes(t.id));
        
        if (turmasDisponiveis.length === 0) {
            disponiveisContent.innerHTML = `<p style="color: #64748b; font-size: 14px;">Todas as turmas já estão vinculadas.</p>`;
        } else {
            disponiveisContent.innerHTML = turmasDisponiveis.map(turma => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px;">
                    <div>
                        <strong>${turma.serie}º${turma.turma}</strong>
                    </div>
                    <button data-turma-id="${turma.id}" 
                            style="background: #10B981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;"
                            class="btn-vincular">Vincular</button>
                </div>
            `).join('');
        }
        
        // Vincula eventos dos botões
        document.querySelectorAll('.btn-vincular').forEach(btn => {
            btn.addEventListener('click', async () => {
                const turmaId = btn.getAttribute('data-turma-id');
                await vincularTurma(professorId, turmaId);
            });
        });
        
        document.querySelectorAll('.btn-desvincular').forEach(btn => {
            btn.addEventListener('click', async () => {
                const turmaId = btn.getAttribute('data-turma-id');
                await desvincularTurma(professorId, turmaId);
            });
        });
        
    } catch (erro) {
        console.error("Erro ao carregar turmas:", erro);
        document.getElementById('turmas-list').innerHTML = `<p style="color: #EF4444;">Erro ao carregar turmas.</p>`;
    }
}

async function vincularTurma(professorId, turmaId) {
    const btn = document.querySelector(`button[data-turma-id="${turmaId}"].btn-vincular`);
    const originalText = btn.textContent;
    btn.textContent = 'Vincando...';
    btn.disabled = true;
    
    try {
        const resposta = await fetch('http://localhost:3333/professor/turmas/vincular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professorId, turmaId })
        });
        
        const dados = await resposta.json();
        
        if (resposta.ok) {
            alert(dados.message || 'Turma vinculada com sucesso!');
            carregarTurmas();
        } else {
            alert(dados.error || 'Erro ao vincular turma.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    } catch (erro) {
        alert('Erro de conexão.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function desvincularTurma(professorId, turmaId) {
    if (!confirm('Deseja realmente desvincular esta turma?')) return;
    
    const btn = document.querySelector(`button[data-turma-id="${turmaId}"].btn-desvincular`);
    btn.textContent = 'Desvinculando...';
    btn.disabled = true;
    
    try {
        const resposta = await fetch('http://localhost:3333/professor/turmas/desvincular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professorId, turmaId })
        });
        
        const dados = await resposta.json();
        
        if (resposta.ok) {
            alert(dados.message || 'Turma desvinculada com sucesso!');
            carregarTurmas();
        } else {
            alert(dados.error || 'Erro ao desvincular turma.');
            btn.textContent = 'Desvincular';
            btn.disabled = false;
        }
    } catch (erro) {
        alert('Erro de conexão.');
        btn.textContent = 'Desvincular';
        btn.disabled = false;
    }
}

function vincularEventos() {
    const senhaAtual = document.getElementById('senha-atual');
    const novaSenha = document.getElementById('nova-senha');
    const confirmarSenha = document.getElementById('confirmar-senha');
    const btnSalvar = document.getElementById('btn-salvar');
    const mensagem = document.getElementById('mensagem-senha');

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
