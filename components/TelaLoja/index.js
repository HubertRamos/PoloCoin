import Header from '../Header/index.js';

const CARRINHO_KEY = 'poloCarrinho';

function lerCarrinho() {
    try {
        return JSON.parse(sessionStorage.getItem(CARRINHO_KEY) || '[]');
    } catch { return []; }
}

function salvarCarrinho(items) {
    sessionStorage.setItem(CARRINHO_KEY, JSON.stringify(items));
}

function totalCarrinho(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((s, i) => s + Number(i.custo || 0) * (Number(i.quantidade) || 1), 0);
}

export default async function TelaLoja(root, alunoId) {
    root.innerHTML = `
        <main class="container-center polocoin-main__section--centered" style="max-width: 900px;">
            <!-- Cabeçalho -->
            <div class="tela-header">
                <div class="tela-header__icon tela-header__icon--blue">
                    <span class="tela-header__emoji">🪙</span>
                </div>
                <div class="tela-header__info">
                    <h1 class="tela-header__title">Minha Loja</h1>
                    <p class="tela-header__subtitle">Produtos disponíveis para compra</p>
                </div>
            </div>

            <!-- Saldo + Carrinho inline -->
            <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                <div id="loja-saldo" class="saldo-card saldo-card--blue" style="flex: 1; min-width: 200px;">
                    <span class="saldo-card__emoji">🪙</span>
                    <span class="saldo-card__texto">Saldo: <strong id="loja-saldo-valor">—</strong> 🪙</span>
                </div>
                <div id="loja-carrinho-badge" class="saldo-card" style="background: linear-gradient(135deg, #3B82F6, #2563EB); cursor: pointer;" onclick="window.navegarPara('carrinho')">
                    <span style="color: white; font-size: 13px; font-weight: 600;">
                        🛒 Carrinho
                        <span id="loja-carrinho-qtd" style="background: rgba(255,255,255,0.3); padding: 1px 8px; border-radius: 10px; margin-left: 4px; font-size: 12px;">0</span>
                    </span>
                    <span style="color: rgba(255,255,255,0.85); font-size: 13px; margin-left: 8px;">
                        Total: <strong id="loja-carrinho-total">0</strong> 🪙
                    </span>
                </div>
            </div>

            <!-- Filtros -->
            <div id="loja-filtros" style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
                <input id="loja-busca" type="text" placeholder="Buscar produto..."
                    style="flex: 1; min-width: 160px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;"
                    oninput="window.filtrarLoja()">
                <select id="loja-filtro-categoria" style="padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; background: #fff; min-width: 140px;"
                    onchange="window.filtrarLoja()">
                    <option value="">Todas as categorias</option>
                </select>
                <button id="loja-limpar-filtros" class="btn btn-ghost" style="font-size: 12px; padding: 8px 12px; color: #94a3b8;"
                    onclick="window.limparFiltrosLoja()">
                    ✕ Limpar
                </button>
            </div>

            <!-- Loading -->
            <div id="loja-loading" class="loading-state">
                <div class="loading-state__icon">🛒</div>
                <p>Carregando produtos...</p>
            </div>

            <!-- Lista de produtos -->
            <div id="loja-produtos" style="display: none;">
                <div class="card card--lg" style="padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h2 class="card__title-lg" style="margin: 0; font-size: 16px;">Produtos</h2>
                        <span id="loja-contagem" class="text-muted" style="font-size: 13px;"></span>
                    </div>
                    <div id="loja-grid" class="produtos-grid"></div>
                </div>
            </div>

            <!-- Feedback compra -->
            <div id="loja-feedback" class="alert" style="display: none; margin-top: 16px;"></div>

            <!-- Saldo insuficiente -->
            <div id="loja-saldo-insuficiente" class="alert alert-danger" style="display: none; margin-top: 16px;">
                <div class="alert__icon">⚠️</div>
                <div>
                    <h3 style="margin: 0 0 6px 0; color: #991B1B; font-size: 14px;">Saldo Insuficiente</h3>
                    <p style="margin: 0; font-size: 13px;">
                        Falta <strong id="loja-falta"></strong> 🪙. Saldo atual: <strong id="loja-saldo-atual"></strong> 🪙.
                    </p>
                </div>
            </div>

            <!-- Desejo adicionado -->
            <div id="loja-desejo-adicionado" class="alert alert-warning" style="display: none; margin-top: 16px;">
                <div class="alert__icon">✅</div>
                <div>
                    <h3 style="margin: 0 0 6px 0; color: #92400E; font-size: 14px;">Adicionado aos Desejos!</h3>
                    <p style="margin: 0; font-size: 13px; color: #92400E;">Seu responsável será avisado.</p>
                </div>
            </div>
        </main>
    `;

    console.log('sessionStorage poloUser:', sessionStorage.getItem('poloUser'))
    const dados = JSON.parse(sessionStorage.getItem('poloUser') || '{}');
    const alunoIdNum = dados?.id || alunoId;
    try {
        const res = await fetch(`/aluno/saldo?id=${alunoIdNum}`);
        const data = await res.json();
        document.getElementById('loja-saldo-valor').textContent = data.pontos || 0;
    } catch {
        document.getElementById('loja-saldo-valor').textContent = '?';
    }

    // Categorias para filtro
    let categorias = [];
    try {
        const res = await fetch('/categorias/filtro');
        categorias = await res.json();
        const sel = document.getElementById('loja-filtro-categoria');
        categorias.forEach(c => {
            sel.innerHTML += `<option value="${c.nome}">${c.nome}</option>`;
        });
    } catch { /* ignora */ }

    // Produtos
    await carregarProdutos('', '');

    // Botão de limpar filtros
    document.getElementById('loja-limpar-filtros').addEventListener('click', () => {
        window.limparFiltrosLoja();
    });

    // Atualiza badge do carrinho após carregar
    atualizarBadgeCarrinho();

    window.filtrarLoja = async () => {
        const busca = document.getElementById('loja-busca').value;
        const cat = document.getElementById('loja-filtro-categoria').value;
        await carregarProdutos(cat, busca);
    };

    window.limparFiltrosLoja = async () => {
        document.getElementById('loja-busca').value = '';
        document.getElementById('loja-filtro-categoria').value = '';
        await carregarProdutos('', '');
    };

    window.adicionarAoCarrinho = (p) => {
        const carrinho = lerCarrinho();
        const existing = carrinho.find(i => i.id === p.id);
        if (existing) {
            existing.quantidade = (Number(existing.quantidade) || 1) + 1;
        } else {
            const custo = Number(p.custo || 0);
            carrinho.push({ id: p.id, nome: p.nome || 'Produto', custo, quantidade: 1 });
        }
        salvarCarrinho(carrinho);
        atualizarBadgeCarrinho();
        exibirFeedback('success', `✅ <strong>${p.nome || 'Produto'}</strong> adicionado ao carrinho!`);
    };

    window.removerDoCarrinho = (id) => {
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
        atualizarBadgeCarrinho();
        window.navegarPara('carrinho');
    };

    window.adicionarDesejo = (produtoId) => {
        const btn = document.querySelector(`button[data-id="${produtoId}"]`);
        if (btn) btn.disabled = true;
        fetch('/aluno/desejos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoIdNum, produto_id: produtoId })
        })
        .then(r => r.json())
        .then(d => {
            if (d.error) {
                exibirFeedback('danger', `❌ ${d.error}`);
                if (btn) btn.disabled = false;
            } else {
                exibirFeedback('warning', '✅ Produto adicionado aos desejos! Aguarde autorização do responsável.');
            }
        })
        .catch(() => {
            exibirFeedback('danger', '❌ Erro de conexão.');
            if (btn) btn.disabled = false;
        });
    };

    window.confirmarCarrinho = async () => {
        const carrinho = lerCarrinho();
        if (carrinho.length === 0) {
            exibirFeedback('warning', 'Seu carrinho está vazio.');
            return;
        }
        const btn = document.getElementById('btn-confirmar-carrinho');
        btn.disabled = true;
        btn.innerHTML = '⏳ Processando...';

        try {
            const res = await fetch('/aluno/comprar-carrinho', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aluno_id: alunoIdNum, produtos: carrinho })
            });
            const data = await res.json();

            salvarCarrinho([]);
            atualizarBadgeCarrinho();

            if (res.ok) {
                if (data.status === 'desejos' || data.tipo === 'desejos') {
                    let msg = `📋 <strong>Pedido enviado para a Lista de Desejos!</strong><br>`;
                    msg += `Aguarde a aprovação do seu responsável.<br>`;
                    (data.desejos || []).forEach(d => {
                        msg += `• ${d.nome} (×${d.quantidade || 1}) — 🪙 ${d.custo_total || d.custo}<br>`;
                    });
                    msg += `<br>Nenhum PoloCoin foi debitado. Saldo: <strong>🪙 ${data.saldo_restante}</strong>`;
                    exibirFeedback('warning', msg);
                } else {
                    let msg = `✅ <strong>Compra realizada com sucesso!</strong><br>`;
                    (data.comprados || []).forEach(c => {
                        msg += `✅ ${c.nome} (×${c.quantidade || 1}) — 🪙 ${c.custo_total || c.custo}<br>`;
                    });
                    if (data.saldo_restante !== null && data.saldo_restante !== undefined) {
                        msg += `<br>Saldo restante: <strong>🪙 ${data.saldo_restante}</strong>`;
                    }
                    exibirFeedback('success', msg);
                }
                await carregarProdutos(document.getElementById('loja-filtro-categoria').value, document.getElementById('loja-busca').value);
            } else {
                let msg = `❌ <strong>Erro na compra:</strong><br>`;
                data.erros?.forEach(e => {
                    msg += `❌ ${e.msg}<br>`;
                });
                if (!msg.includes('<br>')) msg += data.error || 'Erro desconhecido.';
                exibirFeedback('danger', msg);
            }
        } catch (e) {
            exibirFeedback('danger', '❌ Erro de conexão. Tente novamente.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '🛒 Confirmar Compra';
        }
    };

    async function carregarProdutos(cat, busca) {
        try {
            const res = await fetch(`/produtos/filtrados?categoria=${encodeURIComponent(cat || '')}&busca=${encodeURIComponent(busca || '')}`);
            const data = await res.json();
            const produtos = Array.isArray(data) ? data : [];

            document.getElementById('loja-loading').style.display = 'none';
            document.getElementById('loja-produtos').style.display = 'block';
            document.getElementById('loja-contagem').textContent = `(${produtos.length} itens)`;

            if (produtos.length === 0) {
                document.getElementById('loja-grid').innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
                        Nenhum produto encontrado.
                    </div>
                `;
                return;
            }

            document.getElementById('loja-grid').innerHTML = produtos.map(p => {
                const cor = getCorCategoria(p.categoria_nome) || '#64748B';
                const custo = p.custo_pontos ?? 0;
                const nome = p.nome || 'Produto sem nome';
                console.log('[TelaLoja] Produto carregado:', { id: p.id, nome, custo, categoria: p.categoria_nome });
                return `
                    <div class="produto-card" style="border-left-color: ${cor};">
                        <div class="produto-card__header">
                            <div>
                                <strong class="produto-card__nome">${nome}</strong>
                                <span class="produto-card__categoria">${p.categoria_nome || 'Sem categoria'}</span>
                            </div>
                            <div class="produto-card__preco">
                                <span class="produto-card__preco-valor">🪙 ${custo}</span>
                                <span class="produto-card__preco-label">PoloCoins</span>
                            </div>
                        </div>
                        <button
                            data-id="${p.id}"
                            onclick="window.adicionarAoCarrinho({id:${p.id}, nome:'${nome.replace(/'/g, "\\'")}', custo:${custo}})"
                            class="btn btn-primary btn--sm produto-card__botao"
                        >
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error('Erro ao carregar produtos:', e);
            document.getElementById('loja-loading').innerHTML = `<p style="color:#ef4444;">Erro ao carregar. Tente novamente.</p>`;
        }
    }

    function atualizarBadgeCarrinho() {
        const carrinho = lerCarrinho();
        const totalItens = carrinho.reduce((s, i) => s + (Number(i.quantidade) || 1), 0);
        document.getElementById('loja-carrinho-qtd').textContent = totalItens;
        document.getElementById('loja-carrinho-total').textContent = totalCarrinho(carrinho);
    }

    function exibirFeedback(tipo, html) {
        const el = document.getElementById('loja-feedback');
        el.className = `alert alert-${tipo}`;
        el.style.display = 'block';
        el.innerHTML = html;
        setTimeout(() => { el.style.display = 'none'; }, 5000);
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
    };
    return cores[nome] || '#64748B';
}
