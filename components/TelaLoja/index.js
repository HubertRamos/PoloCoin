import Header from '../Header/index.js'

/**
 * Tela de Loja - Exibe todos os produtos disponíveis para compra (em pontos)
 * Se o pai não liberou, o aluno adiciona à lista de desejos ao invés de comprar.
 */
export default async function TelaLoja(root, alunoId) {
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
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <span style="font-size: 20px;">🪙</span>
                </div>
                <div>
                    <h1 style="margin: 0; font-size: 20px; color: #0f172a; font-weight: 700;">Minha Loja</h1>
                    <p style="color: #64748b; font-size: 13px; margin: 0;">Produtos disponíveis para compra</p>
                </div>
            </div>

            <!-- Saldo do Aluno -->
            <div id="loja-saldo" style="
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border-radius: 12px;
                padding: 14px 20px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 600;
            ">
                <span style="font-size: 22px;">🪙</span>
                <span>Seu saldo: <strong id="loja-saldo-valor">—</strong> PoloCoins</span>
            </div>

            <!-- Status de liberação -->
            <div id="loja-status-liberacao" style="margin-bottom: 16px; font-size: 13px;"></div>

            <!-- Loading -->
            <div id="loja-loading" style="
                text-align: center;
                padding: 40px;
                color: #94a3b8;
            ">
                <div style="font-size: 32px; margin-bottom: 10px;">🛒</div>
                <p>Carregando produtos...</p>
            </div>

            <!-- Lista de produtos -->
            <div id="loja-produtos" style="display: none;">
                <div style="
                    background: rgba(255,255,255,0.8);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                ">
                    <div style="margin-bottom: 16px;">
                        <h2 style="margin: 0 0 4px 0; font-size: 15px; color: #0f172a; font-weight: 600;">
                            Todos os Produtos
                        </h2>
                        <span id="loja-contagem" style="color: #94a3b8; font-size: 13px;"></span>
                    </div>
                    <div id="loja-grid"></div>
                </div>
            </div>

            <!-- Carrinho/Compra -->
            <div id="loja-carrinho" style="display: none; margin-top: 20px;">
                <div style="
                    background: #ecfdf5;
                    border: 1px solid #86efac;
                    border-radius: 10px;
                    padding: 16px;
                ">
                    <h3 style="margin: 0 0 10px 0; color: #10B981; font-size: 14px;">Compra Realizada!</h3>
                    <p id="loja-mensagem" style="color: #334155; font-size: 13px; margin: 0;"></p>
                </div>
            </div>

            <!-- Saldo insuficiente -->
            <div id="loja-saldo-insuficiente" style="display: none; margin-top: 20px;">
                <div style="
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    padding: 16px;
                    text-align: center;
                ">
                    <h3 style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px;">Saldo Insuficiente</h3>
                    <p style="color: #334155; font-size: 13px; margin: 0;">
                        Você precisa de <strong id="loja-falta"></strong> 🪙 para comprar este produto.
                        Seu saldo atual é de <strong id="loja-saldo-atual"></strong> 🪙.
                    </p>
                </div>
            </div>

            <!-- Desejo adicionado -->
            <div id="loja-desejo-adicionado" style="display: none; margin-top: 20px;">
                <div style="
                    background: #fefce8;
                    border: 1px solid #fde68a;
                    border-radius: 10px;
                    padding: 16px;
                    text-align: center;
                ">
                    <h3 style="margin: 0 0 8px 0; color: #ca8a04; font-size: 14px;">✅ Desejo Adicionado!</h3>
                    <p style="color: #334155; font-size: 13px; margin: 0;">
                        Seu responsável receberá_notificação e poderá autorizar a compra.
                    </p>
                </div>
            </div>
        </main>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    `

    // Busca saldo e permissão do aluno
    const dados = JSON.parse(sessionStorage.getItem('poloUser') || '{}')
    const alunoIdNum = dados?.id || alunoId

    try {
        const saldoResp = await fetch(`/aluno/saldo?id=${alunoIdNum}`)
        const saldoData = await saldoResp.json()
        const saldo = saldoData.pontos || 0
        document.getElementById('loja-saldo-valor').textContent = saldo
    } catch (erro) {
        console.error('Erro ao buscar saldo:', erro)
        document.getElementById('loja-saldo-valor').textContent = '?'
    }

    // Verifica se o aluno tem permissão para comprar (pai liberou?)
    let alunoPodeComprar = false
    try {
        const respPermissao = await fetch(`/aluno/pode-comprar?id=${alunoIdNum}`)
        // Se a rota não existir ainda, vamos assumir false
        if (respPermissao.ok) {
            const permData = await respPermissao.json()
            alunoPodeComprar = permData.pode_comprar === true || permData.pode_comprar === 1
        }
    } catch (e) {
        console.log('Rota de permissão não disponível, assumindo bloqueado:', e)
    }

    if (!alunoPodeComprar) {
        document.getElementById('loja-status-liberacao').innerHTML = `
            <div style="
                background: #fef3c7;
                border: 1px solid #fcd34d;
                border-radius: 8px;
                padding: 10px 14px;
                color: #92400e;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <span>🔒</span>
                <span>Compras <strong>bloqueadas</strong> pelo seu responsável. Clique em um produto para adicionar à sua lista de desejos e avisar a ele.</span>
            </div>
        `
    }

    // Carrega produtos
    try {
        const resposta = await fetch('/produtos')
        const produtos = await resposta.json()

        document.getElementById('loja-loading').style.display = 'none'
        document.getElementById('loja-produtos').style.display = 'block'
        document.getElementById('loja-contagem').textContent = `(${produtos.length} itens)`
        document.getElementById('loja-grid').innerHTML = produtos.map(p => {
            const btnText = alunoPodeComprar
                ? `Comprar — 🪙 ${p.custo_pontos}`
                : `➕ Adicionar aos Desejos`
            const btnAction = alunoPodeComprar
                ? `window.comprarProduto(${p.id}, ${p.custo_pontos})`
                : `window.adicionarDesejo(${p.id})`
            return `
                <div style="
                    background: white;
                    border-radius: 10px;
                    padding: 16px;
                    border-left: 4px solid ${getCorCategoria(p.categoria_nome)};
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                    margin-bottom: 12px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <strong style="font-size: 15px; color: #1e293b;">${p.nome}</strong>
                            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${p.categoria_nome || 'Sem categoria'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 18px; font-weight: 700; color: #3b82f6;">
                                🪙 ${p.custo_pontos} PoloCoins
                            </div>
                            <div style="font-size: 11px; color: #94a3b8;">ID: ${p.id}</div>
                        </div>
                    </div>
                    <button
                        data-id="${p.id}"
                        data-custo="${p.custo_pontos}"
                        onclick="${btnAction}"
                        style="
                            width: 100%;
                            margin-top: 12px;
                            padding: 10px;
                            background: linear-gradient(135deg, #3b82f6, #2563eb);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-size: 13px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                        "
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v8M8 12h8"/>
                        </svg>
                        ${btnText}
                    </button>
                </div>
            `
        }).join('')
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro)
        document.getElementById('loja-loading').innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
            <p style="color: #ef4444;">Erro ao carregar produtos. Tente novamente.</p>
        `
    }
}

function getCorCategoria(nome) {
    const cores = {
        'Alimentação':  '#10B981',
        'Beleza':       '#EC4899',
        'Vestuário':    '#3B82F6',
        'Limpeza':      '#F59E0B',
        'Eletrônicos':  '#8B5CF6',
        'Brinquedos':   '#F97316',
        'Outros':       '#64748B',
    }
    return cores[nome] || '#64748B'
}

// Função global para comprar (lógica normal com saldo)
window.comprarProduto = async function(id, custo) {
    const dados = JSON.parse(sessionStorage.getItem('poloUser') || '{}')
    if (!dados.id) {
        alert('Você precisa estar logado para comprar.')
        return
    }

    try {
        const resposta = await fetch('/aluno/comprar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: dados.id, produto_id: id }),
        })

        const resultado = await resposta.json()

        if (resposta.ok) {
            const novoSaldo = resultado.saldo_restante
            document.getElementById('loja-saldo-valor').textContent = novoSaldo

            const container = document.getElementById('loja-carrinho')
            container.style.display = 'block'
            document.getElementById('loja-mensagem').textContent =
                `✅ Você comprou: ${resultado.produto?.nome || 'Produto'} por 🪙 ${resultado.produto?.custo_pontos} pontos. Saldo restante: 🪙 ${novoSaldo}`

            const botao = document.querySelector(`button[data-id="${id}"]`)
            if (botao) {
                botao.disabled = true
                botao.style.opacity = '0.5'
                botao.style.cursor = 'default'
                botao.innerHTML = '✅ Comprado'
            }

            setTimeout(() => {
                container.style.display = 'none'
            }, 5000)
        } else {
            if (resultado.error && resultado.error.includes('Saldo insuficiente')) {
                document.getElementById('loja-saldo-insuficiente').style.display = 'block'
                document.getElementById('loja-falta').textContent = custo
                document.getElementById('loja-saldo-atual').textContent = (await getSaldo(dados.id)) || 0
                setTimeout(() => {
                    document.getElementById('loja-saldo-insuficiente').style.display = 'none'
                }, 4000)
            }
            alert(resultado.error || 'Erro ao realizar pedido.')
        }
    } catch (erro) {
        console.error('Erro na compra:', erro)
        alert('Erro de conexão. Tente novamente.')
    }
}

// Função para adicionar produto aos desejos (quando pai bloqueou)
window.adicionarDesejo = async function(id) {
    const dados = JSON.parse(sessionStorage.getItem('poloUser') || '{}')
    if (!dados.id) {
        alert('Você precisa estar logado para adicionar desejos.')
        return
    }

    try {
        const resposta = await fetch('/aluno/desejos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: dados.id, produto_id: id }),
        })

        const resultado = await resposta.json()

        if (resposta.ok) {
            // Mostra feedback
            const container = document.getElementById('loja-desejo-adicionado')
            container.style.display = 'block'
            setTimeout(() => {
                container.style.display = 'none'
            }, 4000)

            // Atualiza botão visual
            const botao = document.querySelector(`button[data-id="${id}"]`)
            if (botao) {
                botao.disabled = true
                botao.style.opacity = '0.6'
                botao.style.cursor = 'default'
                botao.innerHTML = '✅ Nos Desejos'
            }
        } else {
            if (resultado.error && resultado.error.includes('produto já está')) {
                alert('Este produto já está na sua lista de desejos.')
            } else {
                alert(resultado.error || 'Erro ao adicionar desejo.')
            }
        }
    } catch (erro) {
        console.error('Erro ao adicionar desejo:', erro)
        alert('Erro de conexão. Tente novamente.')
    }
}

async function getSaldo(alunoId) {
    try {
        const res = await fetch(`/aluno/saldo?id=${alunoId}`)
        const data = await res.json()
        return data.pontos || 0
    } catch {
        return 0
    }
}
