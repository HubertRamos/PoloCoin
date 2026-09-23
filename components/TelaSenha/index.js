import Header from '../Header/index.js'

const style = {
    container: `
        max-width: 480px;
        margin: 0 auto;
        animation: fadeIn 0.3s ease;
    `,
    header: `
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
    `,
    icon: `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3B82F6, #2563eb);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    `,
    title: `
        font-size: 20px;
        color: #0f172a;
        font-weight: 700;
        margin: 0;
    `,
    subtitle: `
        color: #64748b;
        font-size: 13px;
        margin: 2px 0 0 0;
    `,
    card: `
        background: rgba(255,255,255,0.8);
        border-radius: 12px;
        padding: 20px;
        border: 1px solid #e2e8f0;
    `,
    form: `
        display: flex;
        flex-direction: column;
        gap: 14px;
    `,
    label: `
        font-size: 13px;
        font-weight: 600;
        color: #475569;
    `,
    input: `
        width: 100%;
        padding: 11px 14px;
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        color: #0f172a;
        background: #f8fafc;
        transition: border-color 0.2s;
        outline: none;
    `,
    inputFocus: `
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    `,
    button: `
        width: 100%;
        padding: 11px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.1s;
    `,
    message: `
        text-align: center;
        font-size: 12px;
        min-height: 18px;
        margin: 8px 0 0;
    `,
    successMessage: `
        text-align: center;
        font-size: 14px;
        color: #10B981;
        font-weight: 600;
        padding: 12px;
        background: #ecfdf5;
        border-radius: 8px;
        margin-bottom: 16px;
    `,
    dangerMessage: `
        text-align: center;
        font-size: 12px;
        color: #ef4444;
        margin-top: 8px;
    `,
}

export default async function TelaEditarSenha(root, alunoId) {
    const user = JSON.parse(sessionStorage.getItem('poloUser') || '{}')

    root.innerHTML = `
        ${Header({ 'Sair': ['/index.html'] })}

        <main style="padding: 20px; ${style.container}">
            <div style="${style.header}">
                <div style="${style.icon}">🔒</div>
                <div>
                    <h1 style="${style.title}">Alterar Senha</h1>
                    <p style="${style.subtitle}">Atualize sua senha de acesso</p>
                </div>
            </div>

            <div style="${style.card}">
                ${user.senha ? '' : `<div style="${style.successMessage}">Você ainda não tem senha definida.</div>`}
                
                <form id="form-senha" style="${style.form}">
                    ${user.senha ? `
                        <div>
                            <label style="${style.label}">Senha Atual</label>
                            <input 
                                type="password" 
                                id="senha-atual"
                                style="${style.input}"
                                required
                            />
                        </div>
                    ` : ''}
                    
                    <div>
                        <label style="${style.label}">Nova Senha</label>
                        <input 
                            type="password" 
                            id="senha-nova"
                            placeholder="Mínimo 4 caracteres"
                            minlength="4"
                            style="${style.input}"
                            required
                        />
                    </div>

                    <div>
                        <label style="${style.label}">Confirmar Nova Senha</label>
                        <input 
                            type="password" 
                            id="senha-confirm"
                            placeholder="Repita a nova senha"
                            style="${style.input}"
                            required
                        />
                    </div>

                    <button type="submit" style="${style.button}">
                        Salvar Senha
                    </button>

                    <p id="msg-senha" style="${style.message}"></p>
                </form>
            </div>
        </main>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
                outline: none;
            }
            button:hover {
                opacity: 0.9;
            }
            button:active {
                transform: scale(0.98);
            }
        </style>
    `

    const form = document.getElementById('form-senha')
    const msg = document.getElementById('msg-senha')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const senhaAtual = document.getElementById('senha-atual')?.value || ''
        const senhaNova = document.getElementById('senha-nova').value.trim()
        const senhaConfirm = document.getElementById('senha-confirm').value.trim()

        if (senhaNova !== senhaConfirm) {
            msg.textContent = 'As senhas não coincidem.'
            msg.className = style.dangerMessage
            return
        }

        if (senhaNova.length < 4) {
            msg.textContent = 'A senha deve ter no mínimo 4 caracteres.'
            msg.className = style.dangerMessage
            return
        }

        msg.textContent = 'Salvando...'
        msg.className = style.message

        try {
            const resposta = await fetch('/aluno/senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: alunoId,
                    senhaAtual,
                    novaSenha: senhaNova,
                }),
            })

            const resultado = await resposta.json()

            if (resposta.ok) {
                msg.textContent = '✅ Senha alterada com sucesso!'
                msg.className = style.successMessage
                
                // Limpa o formulário
                form.reset()
                
                // Atualiza sessionStorage
                user.senha = senhaNova
                sessionStorage.setItem('poloUser', JSON.stringify(user))
                
                setTimeout(() => {
                    msg.textContent = ''
                }, 3000)
            } else {
                msg.textContent = resultado.error || 'Erro ao alterar senha.'
                msg.className = style.dangerMessage
            }
        } catch (erro) {
            console.error('Erro:', erro)
            msg.textContent = 'Erro de conexão. Tente novamente.'
            msg.className = style.dangerMessage
        }
    })
}
