const style = {
    div:`
        background-color: #F8FAFC;
        padding: 20px;
        display: flex;
        flex: 1;
        min-width: 300px;
        height: 500px;
        max-height: 500px;
        flex-direction: column;
        gap: 15px;
        box-sizing: border-box;
        overflow-y: auto;
        border: 1px solid #e2e8f0;
        border-radius: 15px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    `,
    headerContainer: `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `,
    h1:`
        margin: 0;
        color: #3d3d3d;
        font-size: 22px;
    `,
    lista:`
        display: flex;
        flex-direction: column;
        gap: 10px;
    `,
    btnAdd: `
        background-color: #10B981;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
    `,
    btnEdit: `
        background-color: #3B82F6;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `
}

/**
 * Componente DashBoard Dinâmico
 * @param {string} title - Título exibido no topo
 * @param {boolean} showAddButton - Se true, exibe o botão de Adicionar no topo
 * @param {boolean} showEditButton - Se true, exibe o botão de Editar em cada item da lista
 */
export default function DashBoard(title, showAddButton = false, showEditButton = false) {

    // Renderiza o botão de Adicionar no topo apenas se for true
    const addButtonHtml = showAddButton ? `
        <button style="${style.btnAdd}" id="btn-add-item">+ Adicionar</button>
    ` : '';

    return `
        <div style="${style.div}">
            <div style="${style.headerContainer}">
                <h1 style="${style.h1}">${title}</h1>
                ${addButtonHtml}
            </div>
            
            <div style="${style.lista}" id="dashboard-content">
                <p>carregando banco...</p>
            </div>
        </div>
    `;
}

