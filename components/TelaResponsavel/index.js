import Header from '../Header/index.js'

/**Tela do Responsável - Painel com filhos, saldos e pedidos de compra */
export default async function TelaResponsavel(root) {
    const user = JSON.parse(sessionStorage.getItem('poloUser') || '{}')
    root.innerHTML = `
        ${Header({ 'Sair': ['/index.html'] })}

        <main style="
            padding: 20px;
            max-width: 900px;
            margin: 0 auto;
            animation: fadeIn 0.3s ease;
        ">
            <!-- Cabeçalho -->
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <div style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <span style="font-size: 20px;">👨‍ 👧‍👦</span>
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 20px; color: #0f172a; font-weight: 700;">Painel do Responsável</h1>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">Controle os saldos e pedidos de compra dos seus filhos</p>
                </div>
            </div>

            <!-- Filhos com saldos -->
            <div id="resp-filhossection" style="
                background: rgba(255,255,255,0.8);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #e2e8f0;
                margin-bottom: 20px;
            ">
                <div style="margin-bottom: 16px;">
                    <h2 style="margin: 0 0 4px 0; font-size: 15px; color: #0f172a; font-weight: 600;">Meus Filhos — Saldos</h2>
                    <span id="resp-filhos-contagem" style="color: #94a3b8; font-size: 13px;"></span>
                </div>
                <div id="resp-filhos-grid"></div>
            </div>

            <!-- Desejos dos filhos -->
            <div id="resp-desejossection" style="
                background: rgba(255,255,255,0.8);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #e2e8f0;
            ">
                <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">📝</span>
                    <h2 style="margin: 0; font-size: 15px; color: #0f172a; font-weight: 600;">Pedidos de Compra dos Filhos</h2>
                </div>
                <div id="resp-desejos-grid"></div>
            </div>
        </main>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .resp-filho-card {
                background: white;
                border-radius: 10px;
                padding: 16px;
                border-left: 4px solid #8B5CF6;
                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                margin-bottom: 12px;
            }

            .resp-desejo-card {
                background: white;
                border-radius: 10px;
                padding: 14px 16px;
                border-left: 4px solid #F97316;
                box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                margin-bottom: 12px;
            }

            .resp-botao-autorizar {
                padding: 8px 16px;
                background: linear-gradient(135deg, #10B981, #059669);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .resp-botao-autorizar:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .resp-botao-bloquear, .resp-botao-liberar {
                padding: 6px 12px;
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
            }

            .resp-botao-bloquear {
                background: #ef4444;
            }

            .resp-botao-liberar {
                background: #10B981;
            }
        </style>
    `

    // Carrega filhos e desejos
    try {
        const [filhosResp, desejosResp] = await Promise.all([
            fetch(`/responsavel/filhos?id=${user.id}`),
            fetch(`/responsavel/desejos?id=${user.id}`)
        ])

        const filhos = await filhosResp.json()
        const desejosData = await desejosResp.json()

        document.getElementById('resp-filhos-contagem').textContent = `(${filhos.length} filho${filhos.length !== 1 ? 's' : ''})`

        if (filhos.length === 0) {
            document.getElementById('resp-filhos-grid').innerHTML = `
                <p style="color: #64748b; text-align: center; padding: 20px;">Nenhum filho associado a você.</p>
            `
        } else {
            document.getElementById('resp-filhos-grid').innerHTML = filhos.map(filho => `
                <div class="resp-filho-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="font-size: 15px; color: #1e293b;">${filho.nome}</strong>
                            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                                ${filho.serie || '?'}º${filho.turma || '?'} · ID: ${filho.id}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: 700; color: #3b82f6;">
                                🪙 ${filho.pontos} PoloCoins
                            </div>
                            <div style="font-size: 11px; color: ${filho.pode_comprar ? '#10B981' : '#ef4444'};">
                                ${filho.pode_comprar ? '✅ Compra liberada' : '🔒 Compra bloqueada'}
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: flex-end;">
                        ${filho.pode_comprar
                            ? `<button class="resp-botao-bloquear" onclick="window.bloquearCompra(${filho.id})">🔒 Bloquear</button>`
                            : `<button class="resp-botao-liberar" onclick="window.liberarCompra(${filho.id})">🔓 Liberar</button>`
                        }
                    </div>
                </div>
            `).join('')
        }

        // Desejos dos filhos
        const todosDesejos = desejosData.flatMap(item =>
            item.desejos.map(d => ({
                aluno: item.aluno,
                ...d
            }))
        )

        if (todosDesejos.length === 0) {
            document.getElementById('resp-desejos-grid').innerHTML = `
                <p style="color: #64748b; text-align: center; padding: 20px;">Nenhum pedido de compra pendente. 😊</p>
            `
        } else {
            document.getElementById('resp-desejos-grid').innerHTML = todosDesejos.map(desejo => `
                <div class="resp-desejo-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <strong style="font-size: 14px; color: #1e293b;">${desejo.produto_nome}</strong>
                            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                                Filho: ${desejo.aluno.nome} · 🪙 ${desejo.custo_pontos} PoloCoins
                            </div>
                        </div>
                        <button class="resp-botao-autorizar"
                            onclick="window.autorizarCompra(${desejo.aluno_id}, ${desejo.produto_id}, '${desejo.produto_nome.replace(/'/g, "\\'")}', ${desejo.custo_pontos})"
                        >
                            ✅ Autorizar Compra
                        </button>
                    </div>
                </div>
            `).join('')
        }
    } catch (erro) {
        console.error('Erro ao carregar dados do responsável:', erro)
        document.getElementById('resp-filhos-grid').innerHTML = `
            <p style="color: #ef4444; text-align: center; padding: 20px;">Erro ao carregar dados. Tente novamente.</p>
        `
    }
}

// Função global para liberar compra
window.liberarCompra = async function(alunoId) {
    try {
        const resposta = await fetch('/aluno/pode-comprar', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, pode_comprar: true }),
        })

        if (resposta.ok) {
            alert('✅ Compra liberada para este aluno!')
            window.location.reload()
        } else {
            alert('Erro ao liberar compra.')
        }
    } catch (erro) {
        console.error('Erro ao liberar compra:', erro)
        alert('Erro de conexão.')
    }
}

// Função global para bloquear compra
window.bloquearCompra = async function(alunoId) {
    try {
        const resposta = await fetch('/aluno/pode-comprar', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, pode_comprar: false }),
        })

        if (resposta.ok) {
            alert('🔒 Compra bloqueada para este aluno!')
            window.location.reload()
        } else {
            alert('Erro ao bloquear compra.')
        }
    } catch (erro) {
        console.error('Erro ao bloquear compra:', erro)
        alert('Erro de conexão.')
    }
}

// Função global para autorizar compra do filho
window.autorizarCompra = async function(alunoId, produtoId, nomeProduto, custoPontos) {
    // Confirmação antes de autorizar
    if (!confirm(`Autorizar a compra de "${nomeProduto}" (🪙 ${custoPontos} pontos) para o aluno?`)) {
        return
    }

    try {
        const resposta = await fetch('/responsavel/comprar-desejo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, produto_id: produtoId }),
        })

        const resultado = await resposta.json()

        if (resposta.ok) {
            alert(`✅ Compra autorizada!\n\n"${resultado.produto?.nome}" por 🪙 ${resultado.produto?.custo_pontos} pontos.\nSaldo restante do aluno: 🪙 ${resultado.saldo_restante}`)
            window.location.reload()
        } else {
            if (resultado.error && resultado.error.includes('Saldo insuficiente')) {
                alert('❌ O aluno não tem pontos suficientes para esta compra.')
            } else {
                alert('❌ Erro ao autorizar compra: ' + (resultado.error || 'Desconhecido'))
            }
        }
    } catch (erro) {
        console.error('Erro ao autorizar compra:', erro)
        alert('Erro de conexão.')
    }
}
