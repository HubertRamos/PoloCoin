const style = {
    div:`
        background-color: #F8FAFC;
        padding: 20px;
        display: flex;
        flex: 1;
        min-width: 300px;
        height: 500px; /* Altura fixa desejada (você pode ajustar para 100vh ou o tamanho que preferir) */
        max-height: 500px; /* Garante que ele não ultrapasse essa altura */
        flex-direction: column;
        gap: 15px;
        box-sizing: border-box;
        overflow-y: auto; /* Cria a barra de rolagem vertical apenas aqui dentro quando o conteúdo exceder */
        border: 1px solid #e2e8f0;
        border-radius: 15px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

    `,
    h1:`
        margin: 0;
        color: #3d3d3d;
    `,
    lista:`
        display: flex;
        flex-direction: column;
        gap: 10px;
    `
}

export default function DashBoard(dashBoard) {
    return `
        <div style="${style.div}">
            <h1 style="${style.h1}">Dashboard ${dashBoard}</h1>
            <div style="${style.lista}" id="dashboard-content">
                <p>carregando banco...</p>
            </div>
        </div>
    `
}

