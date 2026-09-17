const style = {
    button:`
        padding: 10px;
        border-radius: 15px;
        margin: 10px;
        border: none;
        color: #3d3d3d;
        background-color: #F8FAFC;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    `,
    icon:`
        margin: 10px;
        color: #3d3d3d;
        scale: 2;
    `
}

export default function ButtomReturn() {
    return `
        <button onclick="history.back()" style="${style.button}"><i style="${style.icon}" class="fa-solid fa-arrow-left"></i><h1>Voltar</h1></button>
    `
}
