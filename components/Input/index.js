export default function Input(placeholder, type = "text", id = "input", required = "", options = []) {
    if (type === "select") {
        const optionsHtml = options.map(opt =>
            `<option value="${opt.value}">${opt.text}</option>`
        ).join('');
        return `
            <select class="form-select" id="${id}" ${required ? 'required' : ''}>
                <option value="" disabled selected>${placeholder || 'Selecione'}</option>
                ${optionsHtml}
            </select>
        `;
    }
    return `
        <input class="form-input" type="${type}" id="${id}" placeholder="${placeholder}" ${required ? 'required' : ''} />
    `;
}
