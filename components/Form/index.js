import Input from "../Input/index.js"

const style = {
    form:`
        background-color: #F8FAFC;
        width: 400px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        justify-content: left;
        margin: 10px;
        border-radius: 15px;
    `,
    button:`
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin: 20px auto;
    `,
    h1:`
        margin: 20px 0;
        color: #3d3d3d;
    `
}

window.meuJovem = function(event) {
    event.preventDefault();
    
    const name = document.getElementById("name-input").value;
    const password = document.getElementById("password-input").value;
    
    
}

export default function Form() {
    return `
        <form style="${style.form}" id="form" onsubmit="meuJovem(event)">
            <h1 style="${style.h1}">Entrar</h1>
                
                ${Input("Digite seu nome", "text", "name-input", true)}
                ${Input("Digite sua senha", "password", "password-input", true)}            
            <button style="${style.button}" type="submit">Entrar</button>
        </form>
    `
}

