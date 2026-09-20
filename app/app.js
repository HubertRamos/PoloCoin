
import Form from "../../components/Form/index.js"

const root = document.getElementById("root")

const inputsLogin = [
    { label: "Tipo de Usuário", type: "select", id: "tipo-usuario-input", required: true, options: [
        { value: "adm", text: "Administrador" },
        { value: "professor", text: "Professor" },
        { value: "aluno", text: "Aluno" },
        { value: "responsavel", text: "Responsável" }
    ]},
    { label: "Identificação / Nome", placeholder: "Digite seu nome ou usuário", type: "text", id: "usuario-input", required: true },
    { label: "Senha", placeholder: "Digite sua senha", type: "password", id: "senha-input", required: true },
]

function Render() {
    root.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1e293b; margin: 0;">PoloCoin</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Faça login para continuar</p>
            </div>
            ${Form("Entrar", inputsLogin, [])}
        </div>
    `

    const formElement = document.getElementById("meu-form")
    if (formElement) {
        formElement.addEventListener("submit", async (event) => {
            event.preventDefault()
            
            const tipo = document.getElementById("tipo-usuario-input").value
            const usuario = document.getElementById("usuario-input").value.trim()
            const senha = document.getElementById("senha-input").value.trim()

            // Aqui faremos a chamada para a rota de autenticação do backend em breve
            console.log({ tipo, usuario, senha })
            alert(`Tentativa de login como [${tipo}] para o usuário [${usuario}]`)
        })
    }
}

window.addEventListener("DOMContentLoaded", Render)
