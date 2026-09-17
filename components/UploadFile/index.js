
const style = {
    container: `
        border: 1px solid #e2e8f0;
        border-radius: 15px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 15px 10px 10px 10px;
        font-size: 14px;
        color: #3d3d3d;
        background-color: #F8FAFC;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    `,
    input: `
        padding: 8px;
        border: 1px dashed #cbd5e1;
        border-radius: 6px;
        background-color: #fff;
        cursor: pointer;
    `
}

export default function UploadFile() {
    return `
        <div style="${style.container}">
            <label for="csv-file"><h2>Ou importe via Planilha (.csv):</h2></label>
            <input type="file" id="csv-file" accept=".csv" style="${style.input}" />
        </div>
    `
}
