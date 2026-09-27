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

export default async function TelaCarrinho(root, alunoId) {
    const dados = JSON.parse(sessionStorage.getItem('poloUser') || '{}');
    const alunoIdNum = dados?.id || alunoId;

    let saldo = 0;
    try {
        const r = await fetch(`/aluno/saldo?id=${alunoIdNum}`);
        const d = await r.json();
        saldo = d.pontos || 0;
    } catch {}

    const carrinho = lerCarrinho();

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
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center;">
                <div style="font-size: 56px; margin-bottom: 12px;">🛒</div>
                <h2 style="font-size: 18px; color: #0f172a; margin-bottom: 4px;">Seu carrinho está vazio</h2>
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Adicione produtos da loja para aqui.</p>
                <button onclick="window.navegarPara('loja')" class="btn btn-primary" style="padding: 10px 24px; font-size: 14px;">
                    Ir para a Loja
                </button>
            </div>
        </main>`;
        return;
    }

    const total = totalCarrinho(carrinho);
    const falta = total - saldo;
    const podeFinalizar = saldo >= total;

    const itensHtml = carrinho.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0;">
            <div style="flex: 1; min-width: 0;">
                <strong style="font-size: 14px; color: #0f172a; display: block;">${item.nome || 'Produto removido'}</strong>
                <span style="font-size: 12px; color: #94a3b8;">🪙 ${item.custo || 0} PoloCoins</span>
                <span style="font-size: 11px; color: #64748b; margin-left: 4px;">×${Number(item.quantidade) || 1}</span>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
                <span style="font-size: 14px; font-weight: 700; color: #F59E0B; min-width: 60px; text-align: right;">🪙 ${(Number(item.custo) || 0) * (Number(item.quantidade) || 1)}</span>
                <button onclick="window.decrementarDoCarrinho(${item.id})" class="btn btn-ghost" style="padding: 4px 8px; font-size: 14px; color: #64748b;" title="Diminuir quantidade">
                    −
                </button>
                <button onclick="window.removerDoCarrinho(${item.id})" class="btn btn-ghost" style="padding: 4px 8px; font-size: 12px; color: #ef4444;" title="Remover">
                    ✕
                </button>
            </div>
        </div>`).join('');

    const saldoAbaixo = total > saldo;

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

            <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <span style="font-size: 13px; color: #94a3b8;">${carrinho.reduce((s, i) => s + (Number(i.quantidade) || 1), 0)} ${carrinho.reduce((s, i) => s + (Number(i.quantidade) || 1), 0) === 1 ? 'item' : 'itens'} no carrinho</span>
                    <div style="font-size: 14px;">Total: <strong style="color: #F59E0B; font-size: 18px;">🪙 ${total}</strong></div>
                </div>
            </div>

            <div id="carrinho-listagem" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                ${itensHtml}
            </div>

            <div style="background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <span style="font-size: 13px; color: #64748b;">Seu saldo:</span>
                        <span style="font-size: 18px; font-weight: 700; color: #3b82f6; margin-left: 4px;">🪙 ${saldo}</span>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="window.navegarPara('loja')" class="btn btn-secondary" style="padding: 10px 18px; font-size: 13px;">
                            ← Volta à loja
                        </button>
                        <button id="btn-confirmar-carrinho" class="btn btn-success" style="padding: 10px 24px; font-size: 14px; font-weight: 600;" ${!podeFinalizar ? 'disabled' : ''}>
                            ${!podeFinalizar ? '🛒 Saldo Insuficiente' : '🛒 Confirmar Compra'}
                        </button>
                    </div>
                </div>
                ${saldoAbaixo ? `
                <div style="margin-top: 12px; padding: 12px; background: #fef2f2; border-radius: 6px; font-size: 13px; color: #991B1B; border: 1px solid #fecaca;">
                    ⚠️ <strong>Saldo insuficiente!</strong> Faltam 🪙 ${falta} para finalizar.<br>
                    Retire produtos do carrinho ou adicione mais pontos com avaliações positivas.
                </div>` : ''}
            </div>

            <div id="carrinho-feedback" class="alert" style="display: none; margin-top: 16px;"></div>
        </main>`;

    window.decrementarDoCarrinho = (id) => {
        const carrinho = lerCarrinho();
        const item = carrinho.find(i => i.id === id);
        if (item) {
            if ((item.quantidade || 1) > 1) {
                item.quantidade -= 1;
            } else {
                const idx = carrinho.indexOf(item);
                carrinho.splice(idx, 1);
            }
        }
        salvarCarrinho(carrinho);
        window.navegarPara('carrinho');
    };

    window.removerDoCarrinho = (id) => {
        const novos = lerCarrinho().filter(i => i.id !== id);
        salvarCarrinho(novos);
        window.navegarPara('carrinho');
    };

    // ---- Popup de confirmação ----
    const criarModalConfirmacao = () => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.6); display: flex;
            align-items: center; justify-content: center; z-index: 9999;
            backdrop-filter: blur(2px);
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #fff; border-radius: 16px; width: 100%; max-width: 420px;
            padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalIn 0.2s ease-out;
        `;

        modal.innerHTML = `
            <style>
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h2 style="margin: 0; font-size: 18px; color: #0f172a;">🛒 Confirmar Compra</h2>
                <button id="modal-fechar" style="
                    background: none; border: none; font-size: 20px; cursor: pointer;
                    color: #94a3b8; padding: 4px 8px; line-height: 1;
                ">✕</button>
            </div>
            <p style="margin: 0 0 12px; font-size: 13px; color: #64748b;">
                Confira os itens abaixo antes de finalizar:
            </p>
            <div style="background: #f8fafc; border-radius: 10px; padding: 12px; margin-bottom: 16px; max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0;">
                ${carrinho.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
                        <div style="flex: 1; min-width: 0;">
                            <span style="font-size: 14px; color: #0f172a; font-weight: 600;">${item.nome || 'Produto'}</span>
                            <span style="font-size: 12px; color: #94a3b8; margin-left: 4px;">×${Number(item.quantidade) || 1}</span>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 14px; font-weight: 700; color: #F59E0B;">🪙 ${(Number(item.custo) || 0) * (Number(item.quantidade) || 1)}</span>
                        </div>
                    </div>`).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fef9c3; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fde68a;">
                <span style="font-size: 14px; color: #92400e; font-weight: 600;">Total da compra:</span>
                <span style="font-size: 20px; font-weight: 700; color: #F59E0B;">🪙 ${total}</span>
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
            fechar();
            await processarCompra();
        };
    };

    const processarCompra = async () => {
        const btn = document.getElementById('btn-confirmar-carrinho');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Processando...';
        }

        const fb = document.getElementById('carrinho-feedback');
        try {
            const res = await fetch('/aluno/comprar-carrinho', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aluno_id: alunoIdNum, produtos: carrinho })
            });
            const data = await res.json();
            salvarCarrinho([]);

            if (fb) {
                if (res.ok) {
                    let html = `✅ <strong>Compra realizada!</strong><br><br>`;
                    data.comprados?.forEach(c => { html += `✅ ${c.nome} — 🪙 ${c.custo}<br>`; });
                    if (data.saldo_restante !== null) html += `<br>Saldo restante: <strong>🪙 ${data.saldo_restante}</strong>`;
                    fb.className = 'alert alert-success';
                    fb.innerHTML = html || '✅ Compra realizada com sucesso!';
                } else {
                    let html = `❌ <strong>Erro na compra:</strong><br>`;
                    data.erros?.forEach(e => { html += `❌ ${e.msg}<br>`; });
                    if (data.error) html += `<br>${data.error}`;
                    fb.className = 'alert alert-danger';
                    fb.innerHTML = html || '❌ Erro desconhecido.';
                }
                fb.style.display = 'block';
                setTimeout(() => { fb.style.display = 'none'; }, 6000);
            }

            window.navegarPara('carrinho');
        } catch {
            if (fb) {
                fb.className = 'alert alert-danger';
                fb.innerHTML = '❌ Erro de conexão. Tente novamente.';
                fb.style.display = 'block';
                setTimeout(() => { fb.style.display = 'none'; }, 6000);
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '🛒 Confirmar Compra';
            }
        }
    };

    document.getElementById('btn-confirmar-carrinho')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-confirmar-carrinho');
        if (!btn) return;

        if (carrinho.length === 0) {
            const fb = document.getElementById('carrinho-feedback');
            if (fb) {
                fb.className = 'alert alert-warning';
                fb.innerHTML = 'Seu carrinho está vazio.';
                fb.style.display = 'block';
                setTimeout(() => { fb.style.display = 'none'; }, 3000);
            }
            return;
        }

        if (!podeFinalizar) {
            const fb = document.getElementById('carrinho-feedback');
            if (fb) {
                fb.className = 'alert alert-danger';
                fb.innerHTML = `❌ <strong>Saldo insuficiente!</strong> Faltam 🪙 ${falta} para finalizar. Retire produtos do carrinho.`;
                fb.style.display = 'block';
                setTimeout(() => { fb.style.display = 'none'; }, 5000);
            }
            return;
        }

        criarModalConfirmacao();
    });
}
