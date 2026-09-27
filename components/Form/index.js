import Input from "../Input/index.js"

export default function Form(type, inputs = [], categorias = []) {
    const inputsHtml = inputs.map(item => {
        return `
            <div class="form-group">
                <label class="form-label" for="${item.id}">${item.label}</label>
                ${Input(item.placeholder, item.type, item.id, item.required, item.options || [])}
            </div>
        `;
    }).join('');

    const selectHtml = categorias.length > 0 ? `
        <div class="form-group">
            <label class="form-label" for="categoria-select">Categoria</label>
            <select class="form-select" id="categoria-select" name="categoria_id" required>
                <option value="" disabled selected>Selecione uma categoria</option>
                ${categorias.map(cat => `<option value="${cat.id}">${cat.nome}</option>`).join('')}
            </select>
        </div>
    ` : '';

    return `
        <form id="meu-form" style="max-width: 400px; margin: 10px auto; padding: 20px;">
            <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #3d3d3d;">${type}</h1>
            ${inputsHtml}
            ${selectHtml}
            <button type="submit" class="btn btn-primary" style="margin-top: 20px;">${type}</button>
        </form>
    `;
}
