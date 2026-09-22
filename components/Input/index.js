const style = {
    input:`
        width: 95%;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin: 0 auto;
    `
}


export default function Input(placeholder, type = "text", id = "input", required = "", options = []) {
    if (type === "select") {
        const optionsHtml = options.map(opt =>
            `<option value="${opt.value}">${opt.text}</option>`
        ).join('');
        return `
           <select style="${style.input}" id="${id}" required="${required}">
               <option value="" disabled selected>${placeholder || 'Selecione'}</option>
               ${optionsHtml}
           </select>
        `
    }

    return `
       <input style="${style.input}" type="${type}" id="${id}" placeholder="${placeholder}" required="${required}"> 
    `
}

