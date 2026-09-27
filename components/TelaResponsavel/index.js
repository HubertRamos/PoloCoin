/** Renderiza o dashboard do responsável (filhos + desejos) */
export async function renderDashboard(root) {
    const user = JSON.parse(sessionStorage.getItem('poloUser') || '{}')

    root.innerHTML = `
        <div class="resp-dashboard">
            <div class="resp-header">
                <h1 class="resp-header__title">Painel do Responsável</h1>
                <p class="resp-header__subtitle">Controle os saldos e pedidos de compra dos seus filhos</p>
            </div>

            <div id="resp-stats" class="resp-stats"></div>

            <div class="resp-secao">
                <div class="resp-secao__header">
                    <div class="resp-secao__icon resp-secao__icon--purple">👨‍👧‍👦</div>
                    <h2 class="resp-secao__title">Meus Filhos</h2>
                    <span id="resp-filhos-count" class="resp-secao__count"></span>
                </div>
                <div id="resp-filhos-grid" class="filhos-grid"></div>
            </div>

            <div class="resp-secao">
                <div class="resp-secao__header">
                    <div class="resp-secao__icon resp-secao__icon--orange">📦</div>
                    <h2 class="resp-secao__title">Pedidos de Compra</h2>
                    <span id="resp-desejos-count" class="resp-secao__count"></span>
                </div>
                <div id="resp-desejos-grid" class="desejos-grid"></div>
            </div>
        </div>
    `

    try {
        const [filhosResp, desejosResp] = await Promise.all([
            fetch(`/responsavel/filhos?id=${user.id}`),
            fetch(`/responsavel/desejos?id=${user.id}`)
        ])

        const filhos = await filhosResp.json()
        const desejosData = await desejosResp.json()

        // Stats
        const totalDesejos = desejosData.reduce((s, item) => s + (item.desejos?.length || 0), 0)



        document.getElementById('resp-filhos-count').textContent = `(${filhos.length})`
        document.getElementById('resp-desejos-count').textContent = `(${totalDesejos})`

        // Filhos
        const filhosGrid = document.getElementById('resp-filhos-grid')
        if (filhos.length === 0) {
            filhosGrid.innerHTML = `
                <div class="empty-block" style="grid-column: 1/-1;">
                    <div class="empty-block__icon">👶</div>
                    <p class="empty-block__text">Nenhum filho associado a você.</p>
                </div>
            `
        } else {
            filhosGrid.innerHTML = filhos.map(filho => {
                const inicial = (filho.nome || '?')[0]
                const statusClass = filho.pode_comprar ? 'filho-status--liberado' : 'filho-status--bloqueado'
                const statusText = filho.pode_comprar ? '✅ Liberado' : '🔒 Bloqueado'
                return `
                    <div class="filho-card">
                        <div class="filho-card__top">
                            <div class="filho-avatar">${inicial}</div>
                            <div class="filho-info">
                                <h3 class="filho-nome">${filho.nome}</h3>
                                <span class="filho-meta">
                                    ${filho.serie || '?'}º${filho.turma || '?'} · ID ${filho.id}
                                </span>
                            </div>
                            <div class="filho-saldo">
                                <div class="filho-saldo__badge">
                                    🪙 ${filho.pontos} <span>PoloCoins</span>
                                </div>
                                <span class="filho-status ${statusClass}">${statusText}</span>
                            </div>
                        </div>
                        <div class="filho-card__acoes">Liberdade de compra
                            ${filho.pode_comprar
                                ? `<button class="btn btn-danger btn--sm" onclick="window.bloquearCompra(${filho.id})">🔒 Bloquear</button>`
                                : `<button class="btn btn-success btn--sm" onclick="window.liberarCompra(${filho.id})">🔓 Liberar</button>`}
                        </div>
                    </div>
                `
            }).join('')
        }

        // Desejos
        const todosDesejos = desejosData.flatMap(item =>
            (item.desejos || []).map(d => ({
                aluno: item.aluno,
                ...d
            }))
        )

        const desejosGrid = document.getElementById('resp-desejos-grid')
        if (todosDesejos.length === 0) {
            desejosGrid.innerHTML = `
                <div class="empty-block" style="grid-column: 1/-1;">
                    <div class="empty-block__icon">🎉</div>
                    <p class="empty-block__text">Nenhum pedido de compra pendente.</p>
                </div>
            `
        } else {
            desejosGrid.innerHTML = todosDesejos.map(desejo => `
                <div class="desejo-card">
                    <div class="desejo-card__top">
                        <div class="desejo-icone">📦</div>
                        <div class="desejo-info">
                            <h3 class="desejo-nome">${desejo.produto_nome}</h3>
                            <span class="desejo-meta">
                                Filho: ${desejo.aluno?.nome || '—'} · 🪙 ${desejo.custo_pontos} PoloCoins
                            </span>
                        </div>
                        <div class="desejo-preco">
                            <span class="desejo-preco__value">🪙 ${desejo.custo_pontos}</span>
                            <span class="desejo-preco__label">custo</span>
                        </div>
                    </div>
                    <div class="desejo-card__acoes">
                        <button class="btn btn-success btn--sm" onclick="window.autorizarCompra(${desejo.aluno_id}, ${desejo.produto_id}, '${desejo.produto_nome.replace(/'/g, "\\'")}', ${desejo.custo_pontos})">
                            ✅ Autorizar
                        </button>
                    </div>
                </div>
            `).join('')
        }
    } catch (erro) {
        console.error('Erro ao carregar dados do responsável:', erro)
        const filhosGrid = document.getElementById('resp-filhos-grid')
        if (filhosGrid) {
            filhosGrid.innerHTML = `
                <div class="empty-block" style="grid-column: 1/-1;">
                    <p class="alert alert-danger" style="text-align: center; padding: 20px;">Erro ao carregar dados. Tente novamente.</p>
                </div>
            `
        }
    }
}
