import Form from "../../../components/Form/index.js"
import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"
import { linksHeader } from "../constLinks.js"

const root = document.getElementById("root")

const params = new URLSearchParams(window.location.search)
const turmaId = params.get("turmaId")

let mostrarPainel = false

// Apenas os 3 campos necessários
const inputsAluno = [
    { label: "Nome do Aluno", placeholder: "Nome completo do aluno", type: "text", id: "nome-aluno-input", required: true },
    { label: "Senha do Aluno", placeholder: "Senha de acesso do aluno", type: "password", id: "senha-aluno-input", required: true },
    { label: "Nome do Responsável", placeholder: "Nome completo do responsável", type: "text", id: "nome-responsavel-input", required: true },
    { label: "Senha do Responsável", placeholder: "Senha de acesso do responsável", type: "password", id: "senha-responsavel-input", required: true },
]

async function carregarDadosDaTurmaEAlunos() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return

    if (!turmaId) {
        contentDiv.innerHTML = `<p style="color: #ef4444;">Turma não especificada. Volte e selecione uma turma novamente.</p>`
        return
    }
    
    try {
        const resposta = await fetch(`http://localhost:3333/turmas/${turmaId}/alunos`)
        const alunos = await resposta.json()

        if (alunos.length === 0) {
            contentDiv.innerHTML = `<p style="color: #64748b;">Nenhum aluno cadastrado nesta turma ainda.</p>`
            return
        }

        contentDiv.innerHTML = alunos.map(aluno => `
            <div style="background-color: #fff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div>
                    <strong>Aluno:</strong> ${aluno.aluno_nome} <br/>
                    <small style="color: #64748b;">${aluno.responsavel_nome}</small>
                </div>
            </div>
        `).join('')

    } catch (erro) {
        console.error("Erro ao carregar alunos:", erro)
        contentDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar os alunos do servidor.</p>`
    }
}

function Render(){
    const width = window.innerWidth
    const align = width < 800 ? "center" : "flex-start"

    root.innerHTML = `
        ${Header(linksHeader)}
        
        <div style="padding: 15px 20px 0 20px;">
            <a href="/app/adm/Turmas/index.html" style="text-decoration: none; color: #3b82f6; font-weight: bold; font-size: 14px;">← Voltar para Turmas</a>
        </div>

        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; flex: 1; align-items: ${align}; justify-content: center;">
            
            <div style="flex: 2; min-width: 300px; width: 100%;">
                ${DashBoard("Alunos da Turma", true, false)}
            </div>

            ${mostrarPainel ? `
                <div style="flex: 1; min-width: 300px; width: 100%;">
                    <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 5px;">
                        <button id="btn-fechar" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">X</button>
                    </div>
                    ${Form("Cadastrar Aluno", inputsAluno, [])}
                </div>
            ` : ''}

        </main>
    `

    carregarDadosDaTurmaEAlunos()

    const btnAdd = document.getElementById("btn-add-item")
    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            mostrarPainel = true
            Render()
        })
    }

    const btnFechar = document.getElementById("btn-fechar")
    if (btnFechar) {
        btnFechar.addEventListener("click", () => {
            mostrarPainel = false
            Render()
        })
    }

    const formElement = document.getElementById("meu-form")
    if (formElement) {
        formElement.addEventListener("submit", async (event) => {
            event.preventDefault()
            const nomeAluno = document.getElementById("nome-aluno-input").value.trim()
            const senhaAluno = document.getElementById("senha-aluno-input").value.trim()
            const nomeResponsavel = document.getElementById("nome-responsavel-input").value.trim()
            const senhaResponsavel = document.getElementById("senha-responsavel-input").value.trim()

            try {
                const resposta = await fetch(`http://localhost:3333/turmas/${turmaId}/alunos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        nomeAluno, 
                        nomeResponsavel,
                        senhaAluno, 
                        senhaResponsavel 
                    })
                })
                const resultado = await resposta.json()

                if (resposta.ok) {
                    alert("Aluno cadastrado com sucesso!")
                    formElement.reset()
                    mostrarPainel = false
                    Render()
                } else {
                    alert(resultado.error || "Erro ao cadastrar aluno.")
                }
            } catch (erro) {
                alert("Não foi possível conectar ao servidor.")
            }
        })
    }
}

window.addEventListener("DOMContentLoaded", Render)

