const style = {
    input:`
        width: 95%;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin: 0 auto;
    `
}


export default function Input(placeholder, type = "text", id = "input", required = "") {
    return `
       <input style="${style.input}" type="${type}" id="${id}" placeholder="${placeholder}" required="${required}"> 
    `
}

