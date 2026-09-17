import Form from "../../../components/Form/index.js"
import DashBoard from "../../../components/DashBoard/index.js"
import ButtomReturn from "../../../components/ButtomReturn/index.js"
import UploadFile from "../../../components/UploadFile/index.js" // Importando o novo componente

const root = document.getElementById("root")

async function carregarDashboard() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return
    
    try {
        const resposta = await fetch("http://localhost:3333/professores")
        const professores = await resposta.json()

        if (professores.length === 0) {
            contentDiv.innerHTML = `<p style="color: #64748b;">Nenhum professor cadastrado ainda.</p>`
            return
        }

        contentDiv.innerHTML = professores.map(prof => `
            <div style="background-color: #fff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <strong>ID:</strong> ${prof.id} <br/>
                <strong>Nome:</strong> ${prof.name}
            </div>
        `).join('')
    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro)
    }
}

function Render(){
    root.innerHTML = `
        <div>
            ${ButtomReturn()}
            ${Form("Cadastrar")}
            ${UploadFile()} <!-- Inserindo o componente na tela -->
        </div>
        ${DashBoard("de Professores")}
    `

    carregarDashboard()

    // 1. Lógica do Formulário Comum (com .trim automático via input ou envio)
    const formElement = document.getElementById("meu-form")
    if (formElement) {
        formElement.addEventListener("submit", async (event) => {
            event.preventDefault()
            const name = document.getElementById("name-input").value.trim()
            const password = document.getElementById("password-input").value.trim()

            enviarParaBackend(name, password, formElement)
        })
    }

    // 2. Lógica de Leitura da Planilha (CSV)
    const fileInput = document.getElementById("csv-file")
    if (fileInput) {
        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = async function(e) {
                const conteudo = e.target.result
                const linhas = conteudo.split("\n")

                let cadastrados = 0
                let ignorados = 0

                for (let linha of linhas) {
                    // Ignora linhas vazias
                    if (!linha.trim()) continue;

                    // Formato esperado no CSV: Nome,Senha
                    const colunas = linha.split(",")
                    if (colunas.length >= 2) {
                        const name = colunas[0].trim()
                        const password = colunas[1].trim()

                        try {
                            const resposta = await fetch("http://localhost:3333/cadastrar", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name, password })
                            })
                            if (resposta.ok) cadastrados++
                            else ignorados++
                        } catch (err) {
                            console.error("Erro na importação:", err)
                        }
                    }
                }

                alert(`Importação concluída!\nCadastrados: ${cadastrados}\nDuplicados/Ignorados: ${ignorados}`)
                fileInput.value = "" // Limpa o input file
                carregarDashboard()  // Atualiza o painel
            }
            reader.readAsText(file)
        })
    }
}

async function enviarParaBackend(name, password, formElement) {
    try {
        const resposta = await fetch("http://localhost:3333/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password })
        })
        const resultado = await resposta.json()

        if (resposta.ok) {
            alert(resultado.message)
            if (formElement) formElement.reset()
            carregarDashboard()
        } else {
            alert(resultado.error || "Ocorreu um erro.")
        }
    } catch (erro) {
        alert("Não foi possível conectar ao servidor.")
    }
}

window.addEventListener("DOMContentLoaded", Render)

