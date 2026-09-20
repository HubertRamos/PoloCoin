import Form from "../../../components/Form/index.js"
import DashBoard from "../../../components/DashBoard/index.js"
import UploadFile from "../../../components/UploadFile/index.js"
import Header from "../../../components/Header/index.js"
import { linksHeader } from "../constLinks.js"

const root = document.getElementById("root")

// Estado para controlar se o painel de cadastro/upload está aberto ou fechado
let mostrarPainel = false

const inputs = [
    { label: "Nome", placeholder: "Nome", type: "text", id: "name-input", required: true },
    { label: "Senha", placeholder: "Senha", type: "password", id: "password-input", required: true },
]

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
    // Verificação de largura feita de forma segura dentro do Render
    const width = window.innerWidth
    const align = width < 800 ? "center" : "flex-start"

    root.innerHTML = `
        ${Header(linksHeader)}
        
        <!-- flex-wrap: wrap permite que o painel caia para baixo no celular -->
        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; flex: 1; align-items: ${align}; justify-content: center;">
            
            <!-- Lado Esquerdo/Principal: Dashboard -->
            <div style="flex: 2; min-width: 300px; width: 100%;">
                ${DashBoard("Tabela de Professores", true, false)}
            </div>

            <!-- Painel de Cadastro e Upload -->
            ${mostrarPainel ? `
                <div style="flex: 1; min-width: 300px; width: 100%;">
                    <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 5px;">
                        <button id="btn-fechar" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">X</button>
                    </div>
                    ${Form("Cadastrar Professor", inputs)}
                    ${UploadFile()}
                </div>
            ` : ''}

        </main>
    `

    carregarDashboard()

    // 1. Evento para abrir o painel ao clicar no botão "+ Adicionar" do Dashboard
    const btnAdd = document.getElementById("btn-add-item")
    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            mostrarPainel = true
            Render() // Re-renderiza a tela com o painel aberto
        })
    }

    // 2. Evento para fechar o painel lateral/inferior
    const btnFechar = document.getElementById("btn-fechar")
    if (btnFechar) {
        btnFechar.addEventListener("click", () => {
            mostrarPainel = false
            Render() // Re-renderiza a tela escondendo o painel
        })
    }

    // 3. Lógica do Formulário Comum
    const formElement = document.getElementById("meu-form")
    if (formElement) {
        formElement.addEventListener("submit", async (event) => {
            event.preventDefault()
            const name = document.getElementById("name-input").value.trim()
            const password = document.getElementById("password-input").value.trim()

            enviarParaBackend(name, password, formElement)
        })
    }

    // 4. Lógica de Leitura da Planilha (CSV)
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
                    if (!linha.trim()) continue;

                    const colunas = linha.split(",")
                    if (colunas.length >= 2) {
                        const name = colunas.comentario || colunas[0].trim() // Ajustado para segurança
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
                fileInput.value = "" 
                carregarDashboard() 
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

