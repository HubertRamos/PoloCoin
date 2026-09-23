/**
 * CardProduto - Componente para exibir um produto individual
 * Reutilizável em qualquer lista de produtos
 */
const style = {
    card: `
        background: white;
        border-radius: 10px;
        padding: 16px;
        border-left: 4px solid %COR%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        margin-bottom: 12px;
        transition: transform 0.2s, box-shadow 0.2s;
    `,
    header: `
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    `,
    title: `
        font-size: 15px;
        color: #1e293b;
        font-weight: 600;
    `,
    category: `
        font-size: 12px;
        color: #94a3b8;
        margin-top: 2px;
    `,
    price: `
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
        text-align: right;
    `,
    id: `
        font-size: 11px;
        color: #94a3b8;
        text-align: right;
    `,
    buyButton: `
        width: 100%;
        margin-top: 12px;
        padding: 10px;
        background: linear-gradient(135deg, #10B981, #059669);
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
        transition: opacity 0.2s, transform 0.1s;
    `,
}

const coresCategoria = {
    'Alimentação':  '#10B981',
    'Beleza':       '#EC4899',
    'Vestuário':    '#3B82F6',
    'Limpeza':      '#F59E0B',
    'Eletrônicos':  '#8B5CF6',
    'Brinquedos':   '#F97316',
    'Outros':       '#64748B',
}

export default function CardProduto(produto, onClickComprar) {
    const cor = coresCategoria[produto.categoria_nome] || coresCategoria['Outros']
    const preco = parseFloat(produto.preco) || 0
    const categoria = produto.categoria_nome || 'Sem categoria'

    const cardStyle = style.card.replace('%COR%', cor)

    return `
        <div style="${cardStyle}">
            <div style="${style.header}">
                <div>
                    <div style="${style.title}">${produto.nome}</div>
                    <div style="${style.category}">${categoria}</div>
                </div>
                <div style="text-align: right;">
                    <div style="${style.price}">
                        R$ ${preco.toFixed(2).replace('.', ',')}
                    </div>
                    <div style="${style.id}">ID: ${produto.id}</div>
                </div>
            </div>
            <button 
                class="btn-comprar" 
                data-id="${produto.id}"
                data-nome="${produto.nome.replace(/"/g, '&quot;')}"
                data-preco="${preco}"
                style="${style.buyButton}"
                onclick="window.comprarProduto(${produto.id})"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Comprar
            </button>
        </div>
    `
}
