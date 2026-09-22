import Input from "../Input/index.js"

const style = {
    form:`
        background-color: #F8FAFC;
        width: 100%;
        max-width: 400px;
        box-sizing: border-box;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        justify-content: left;
        margin: 10px auto;
        border-radius: 15px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    `,
    button:`
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin: 20px auto 0 auto;
        cursor: pointer;
    `,
    h1:`
        margin: 10px 0 20px 0;
        color: #3d3d3d;
        font-size: 24px;
    `,
    select: `
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin: 5px 0 10px 0;
        background-color: white;
    `,
    label: `
        font-size: 14px;
        color: #3d3d3d;
        font-weight: bold;
        margin-top: 8px;
    `
}

export default function Form(type, inputs = [], categorias = []) {
    
    const inputsHtml = inputs.map(item => {
        return `
            <label style="${style.label}" for="${item.id}">${item.label}</label>
            ${Input(item.placeholder, item.type, item.id, item.required, item.options || [])}
        `;
    }).join('');

    const selectHtml = categorias.length > 0 ? `
        <label style="${style.label}" for="categoria-select">Categoria</label>
        <select style="${style.select}" id="categoria-select" name="categoria_id" required>
            <option value="" disabled selected>Selecione uma categoria</option>
            ${categorias.map(cat => `<option value="${cat.id}">${cat.nome}</option>`).join('')}
        </select>
    ` : '';

    return `
        <form style="${style.form}" id="meu-form">
            <h1 style="${style.h1}">${type}</h1>
            
            ${inputsHtml}
            ${selectHtml}
            
            <button style="${style.button}" type="submit">${type}</button>
        </form>
    `;
}

