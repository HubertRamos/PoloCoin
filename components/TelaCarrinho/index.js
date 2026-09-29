const CARRINHO_KEY = 'poloCarrinho';

function lerCarrinho() {
    try { return JSON.parse(sessionStorage.getItem(CARRINHO_KEY) || '[]'); }
    catch { return []; }
}

function salvarCarrinho(items) {
    sessionStorage.setItem(CARRINHO_KEY, JSON.stringify(items));
}

function totalCarrinho(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((s, i) => s + Number(i.custo || 0) * (Number(i.quantidade) || 1), 0);
}

function totalItensCarrinho(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((s, i) => s + (Number(i.quantidade) || 1), 0);
}

export default async function TelaCarrinho(root, alunoId) {
    const dados = JSON.parse(sessionStorage.getItem('poloUser') || '{}');
    const alunoIdNum = dados?.id || alunoId;

    let saldo = 0;
    try {
        const r = await fetch(`/aluno/saldo?id=${alunoIdNum}`);
        const d = await r.json();
        saldo = d.pontos || 0;
    } catch {}

    const renderTela = (mensagemResultado = null) => {
        const carrinho = lerCarrinho();

        // Se há mensagem de resultado de compra recente (desejos ou comprado)
        let feedbackBanner = '';
        if (mensagemResultado) {
            if (mensagemResultado.tipo === 'desejos' || mensagemResultado.status === 'desejos') {
                feedbackBanner = `
                    <div class="alert alert-warning" style="margin-bottom: 20px; border-left: 4px solid #f59e0b; background: #fffbeb; padding: 16px; border-radius: 8px;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <span style="font-size: 24px;">📋</span>
                            <div>
                                <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #92400e; font-weight: 700;">Pedido enviado para a Lista de Desejos!</h3>
                                <p style="margin: 0 0 8px 0; font-size: 13px; color: #92400e;">
                                    Como você está bloqueado para compras diretas, o pedido foi enviado para a Lista de Desejos e aguarda autorização do seu responsável.
                                </p>
                                <ul style="margin: 0 0 10px 18px; font-size: 13px; color: #92400e; padding: 0;">
                                    ${(mensagemResultado.desejos || []).map(d => `<li><strong>${d.nome}</strong> (×${d.quantidade || 1}) — 🪙 ${d.custo_total || d.custo}</li>`).join('')}
                                </ul>
                                <div style="font-size: 13px; font-weight: 600; color: #92400e;">
                                    🪙 Nenhum PoloCoin foi descontado. Seu saldo continua: <strong>🪙 ${mensagemResultado.saldo_restante}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (mensagemResultado.tipo === 'comprado' || mensagemResultado.status === 'comprado') {
                feedbackBanner = `
                    <div class="alert alert-success" style="margin-bottom: 20px; border-left: 4px solid #10b981; background: #ecfdf5; padding: 16px; border-radius: 8px;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <span style="font-size: 24px;">📦</span>
                            <div>
                                <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #065f46; font-weight: 700;">Compra realizada com sucesso!</h3>
                                <p style="margin: 0 0 8px 0; font-size: 13px; color: #065f46;">
                                    Seu pedido foi registrado e enviado para a fila de entrega (Pendentes de Entrega).
                                </p>
                                <ul style="margin: 0 0 10px 18px; font-size: 13px; color: #065f46; padding: 0;">
                                    ${(mensagemResultado.comprados || []).map(c => `<li><strong>${c.nome}</strong> (×${c.quantidade || 1}) — 🪙 ${c.custo_total || c.custo}</li>`).join('')}
                                </ul>
                                <div style="font-size: 13px; font-weight: 600; color: #065f46;">
                                    🪙 Saldo restante: <strong>🪙 ${mensagemResultado.saldo_restante}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        if (carrinho.length === 0) {
            root.innerHTML = `
            <main class="container-center polocoin-main" style="max-width: 680px; margin-top: 70px;">
                <div class="tela-header">
                    <div class="tela-header__icon tela-header__icon--blue">
                        <span class="tela-header__emoji">🛍️</span>
                    </div>
                    <div class="tela-header__info">
                        <h1 class="tela-header__title">Meu Carrinho</h1>
                        <p class="tela-header__subtitle">Produtos selecionados para compra</p>
                    </div>
                </div>

                ${feedbackBanner}

                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; text-align: center; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 56px; margin-bottom: 12px;">🛒</div>
                    <h2 style="font-size: 18px; color: #0f172a; margin-bottom: 4px;">Seu carrinho está vazio</h2>
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Adicione produtos da loja para continuar.</p>
                    <button onclick="window.navegarPara('loja')" class="btn btn-primary" style="padding: 10px 24px; font-size: 14px;">
                        ← Ir para a Loja
                    </button>
                </div>
            </main>`;
            return;
        }

        const total = totalCarrinho(carrinho);
        const totalQtd = totalItensCarrinho(carrinho);
        const falta = total - saldo;
        const podeFinalizar = saldo >= total;
        const saldoAbaixo = total > saldo;

        const itensHtml = carrinho.map(item => {
            const itemQtd = Number(item.quantidade) || 1;
            const itemCusto = Number(item.custo) || 0;
            const subtotal = itemCusto * itemQtd;

            return `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; background: #f8fafc; border-radius: 8px; padding: 12px 16px; border: 1px solid #e2e8f0;">
                <div style="flex: 1; min-width: 0;">
                    <strong style="font-size: 14px; color: #0f172a; display: block;">${item.nome || 'Produto'}</strong>
                    <span style="font-size: 12px; color: #94a3b8;">🪙 ${itemCusto} PoloCoins cada</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <!-- Controle de Quantidade -->
                    <div style="display: flex; align-items: center; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
                        <button onclick="window.decrementarDoCarrinho(${item.id})" class="btn btn-ghost" style="padding: 4px 10px; font-size: 14px; font-weight: bold; color: #64748b; line-height: 1;" title="Diminuir quantidade">−</button>
                        <span style="font-size: 13px; font-weight: 700; color: #0f172a; min-width: 28px; text-align: center;">${itemQtd}</span>
                        <button onclick="window.incrementarDoCarrinho(${item.id})" class="btn btn-ghost" style="padding: 4px 10px; font-size: 14px; font-weight: bold; color: #64748b; line-height: 1;" title="Aumentar quantidade">+</button>
                    </div>

                    <span style="font-size: 14px; font-weight: 700; color: #F59E0B; min-width: 70px; text-align: right;">🪙 ${subtotal}</span>

                    <button onclick="window.removerDoCarrinho(${item.id})" class="btn btn-ghost" style="padding: 4px 8px; font-size: 14px; color: #ef4444;" title="Remover produto do carrinho">
                        ✕
                    </button>
                </div>
            </div>`;
        }).join('');

        root.innerHTML = `
            <main class="container-center polocoin-main" style="max-width: 680px; margin-top: 70px;">
                <div class="tela-header">
                    <div class="tela-header__icon tela-header__icon--blue">
                        <span class="tela-header__emoji">🛍️</span>
                    </div>
                    <div class="tela-header__info">
                        <h1 class="tela-header__title">Meu Carrinho</h1>
                        <p class="tela-header__subtitle">Produtos selecionados para compra</p>
                    </div>
                </div>

                ${feedbackBanner}

                <!-- Resumo dos itens -->
                <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <span style="font-size: 13px; color: #64748b; font-weight: 500;">
                            🛒 Total de produtos: <strong>${totalQtd} ${totalQtd === 1 ? 'unidade' : 'unidades'}</strong> (${carrinho.length} ${carrinho.length === 1 ? 'item' : 'itens'} distintos)
                        </span>
                        <div style="font-size: 14px;">Total: <strong style="color: #F59E0B; font-size: 20px;">🪙 ${total}</strong></div>
                    </div>
                </div>

                <!-- Lista de itens do carrinho -->
                <div id="carrinho-listagem" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                    ${itensHtml}
                </div>

                <!-- Painel de Saldo e Finalização -->
                <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <span style="font-size: 13px; color: #64748b;">Seu saldo disponível:</span>
                            <span style="font-size: 18px; font-weight: 700; color: #3b82f6; margin-left: 4px;">🪙 ${saldo}</span>
                        </div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button onclick="window.navegarPara('loja')" class="btn btn-secondary" style="padding: 10px 18px; font-size: 13px;">
                                ← Continuar comprando
                            </button>
                            <button id="btn-confirmar-carrinho" class="btn btn-success" style="padding: 10px 24px; font-size: 14px; font-weight: 600;" ${!podeFinalizar ? 'disabled' : ''}>
                                ${!podeFinalizar ? '🛒 Saldo Insuficiente' : '🛒 Finalizar Compra'}
                            </button>
                        </div>
                    </div>

                    ${saldoAbaixo ? `
                    <div style="margin-top: 14px; padding: 12px 14px; background: #fef2f2; border-radius: 8px; font-size: 13px; color: #991B1B; border: 1px solid #fecaca; display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 18px;">⚠️</span>
                        <div>
                            <strong>Saldo insuficiente!</strong> Faltam <strong>🪙 ${falta}</strong> PoloCoins para finalizar este pedido.<br>
                            Diminua as quantidades ou remova produtos do carrinho.
                        </div>
                    </div>` : ''}
                </div>

                <div id="carrinho-feedback" class="alert" style="display: none; margin-top: 16px;"></div>
            </main>`;

        // Vincula evento de clique no botão de finalizar
        document.getElementById('btn-confirmar-carrinho')?.addEventListener('click', () => {
            if (!podeFinalizar) {
                const fb = document.getElementById('carrinho-feedback');
                if (fb) {
                    fb.className = 'alert alert-danger';
                    fb.innerHTML = `❌ <strong>Saldo insuficiente!</strong> Faltam 🪙 ${falta} PoloCoins para finalizar.`;
                    fb.style.display = 'block';
                    setTimeout(() => { fb.style.display = 'none'; }, 4000);
                }
                return;
            }
            criarModalConfirmacao(carrinho, total, saldo);
        });
    };

    // Funções globais de manipulação do carrinho
    window.incrementarDoCarrinho = (id) => {
        const carrinho = lerCarrinho();
        const item = carrinho.find(i => i.id === id);
        if (item) {
            item.quantidade = (Number(item.quantidade) || 1) + 1;
            salvarCarrinho(carrinho);
            renderTela();
        }
    };

    window.decrementarDoCarrinho = (id) => {
        const carrinho = lerCarrinho();
        const item = carrinho.find(i => i.id === id);
        if (item) {
            if ((Number(item.quantidade) || 1) > 1) {
                item.quantidade -= 1;
            } else {
                const idx = carrinho.indexOf(item);
                carrinho.splice(idx, 1);
            }
            salvarCarrinho(carrinho);
            renderTela();
        }
    };

    window.removerDoCarrinho = (id) => {
        const novos = lerCarrinho().filter(i => i.id !== id);
        salvarCarrinho(novos);
        renderTela();
    };

    // ---- Modal de Conferência do Pedido ----
    const criarModalConfirmacao = (carrinho, total, saldoAtual) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.6); display: flex;
            align-items: center; justify-content: center; z-index: 9999;
            backdrop-filter: blur(2px);
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #fff; border-radius: 16px; width: 100%; max-width: 440px;
            padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalIn 0.2s ease-out; margin: 16px;
        `;

        modal.innerHTML = `
            <style>
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <h2 style="margin: 0; font-size: 18px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span>🛒</span> Conferência do Pedido
                </h2>
                <button id="modal-fechar" style="
                    background: none; border: none; font-size: 20px; cursor: pointer;
                    color: #94a3b8; padding: 4px 8px; line-height: 1;
                ">✕</button>
            </div>
            <p style="margin: 0 0 12px; font-size: 13px; color: #64748b;">
                Confira os itens abaixo antes de confirmar a finalização:
            </p>
            <div style="background: #f8fafc; border-radius: 10px; padding: 12px; margin-bottom: 16px; max-height: 220px; overflow-y: auto; border: 1px solid #e2e8f0;">
                ${carrinho.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                        <div style="flex: 1; min-width: 0;">
                            <span style="font-size: 13px; color: #0f172a; font-weight: 600;">${item.nome || 'Produto'}</span>
                            <span style="font-size: 12px; color: #64748b; margin-left: 4px;">×${Number(item.quantidade) || 1}</span>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 13px; font-weight: 700; color: #F59E0B;">🪙 ${(Number(item.custo) || 0) * (Number(item.quantidade) || 1)}</span>
                        </div>
                    </div>`).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fef9c3; border-radius: 8px; margin-bottom: 14px; border: 1px solid #fde68a;">
                <span style="font-size: 14px; color: #92400e; font-weight: 600;">Total em PoloCoins:</span>
                <span style="font-size: 20px; font-weight: 700; color: #F59E0B;">🪙 ${total}</span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 18px; text-align: right;">
                Saldo disponível: <strong>🪙 ${saldoAtual}</strong>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="modal-cancelar" class="btn btn-secondary" style="flex: 1; padding: 10px; font-size: 14px;">
                    Cancelar
                </button>
                <button id="modal-confirmar" class="btn btn-success" style="flex: 1; padding: 10px; font-size: 14px; font-weight: 600;">
                    ✅ Confirmar
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const fechar = () => overlay.remove();

        document.getElementById('modal-fechar').onclick = fechar;
        document.getElementById('modal-cancelar').onclick = fechar;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });

        document.getElementById('modal-confirmar').onclick = async () => {
            const btnConfirmar = document.getElementById('modal-confirmar');
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = '⏳ Processando...';

            await processarCompra(fechar);
        };
    };

    const processarCompra = async (fecharModal) => {
        const carrinho = lerCarrinho();
        try {
            const res = await fetch('/aluno/comprar-carrinho', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aluno_id: alunoIdNum, produtos: carrinho })
            });
            const data = await res.json();

            if (res.ok) {
                // Limpa o carrinho
                salvarCarrinho([]);

                // Atualiza o saldo localmente
                if (data.saldo_restante !== null && data.saldo_restante !== undefined) {
                    saldo = Number(data.saldo_restante);
                }

                if (fecharModal) fecharModal();
                renderTela(data);
            } else {
                if (fecharModal) fecharModal();
                const fb = document.getElementById('carrinho-feedback');
                if (fb) {
                    fb.className = 'alert alert-danger';
                    fb.innerHTML = `❌ <strong>Erro:</strong> ${data.error || 'Não foi possível concluir o pedido.'}`;
                    fb.style.display = 'block';
                    setTimeout(() => { fb.style.display = 'none'; }, 6000);
                }
            }
        } catch {
            if (fecharModal) fecharModal();
            const fb = document.getElementById('carrinho-feedback');
            if (fb) {
                fb.className = 'alert alert-danger';
                fb.innerHTML = '❌ Erro de conexão ao finalizar. Tente novamente.';
                fb.style.display = 'block';
                setTimeout(() => { fb.style.display = 'none'; }, 6000);
            }
        }
    };

    // Render inicial
    renderTela();
}
