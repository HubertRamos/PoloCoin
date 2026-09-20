import Form from "../../../components/Form/index.js"
import DashBoard from "../../../components/DashBoard/index.js"
import Header from "../../../components/Header/index.js"
import { linksHeader } from "../constLinks.js"

const root = document.getElementById("root")

// Estado para controlar se o painel de criar turma está aberto ou fechado
let mostrarPainel = false

const inputsTurma = [
    { label: "Série", placeholder: "Ex: 3", type: "number", id: "serie-input", required: true, min: "1", step: "1" },
    { label: "Turma", placeholder: "Ex: A", type: "text", id: "turma-input", required: true, maxlength: "1" },
]

async function carregarTurmas() {
    const contentDiv = document.getElementById("dashboard-content")
    if (!contentDiv) return
    
    try {
        const resposta = await fetch("http://localhost:3333/turmas") 
        const turmas = await resposta.json()

        if (turmas.length === 0) {
            contentDiv.innerHTML = `<p style="color: #64748b;">Nenhuma turma cadastrada ainda.</p>`
            return
        }

        contentDiv.innerHTML = turmas.map(turma => `
            <div class="card-turma" data-id="${turma.id}" style="background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; margin-bottom: 10px;">
                <div>
                    <strong>Turma:</strong> ${turma.serie}º ${turma.turma} <br/>
                    <small style="color: #64748b;">Clique para gerenciar alunos</small>
                </div>
                <span style="font-size: 18px; color: #3b82f6;">➔</span>
            </div>
        `).join('')

        // Adiciona evento de clique em cada card de turma usando o caminho absoluto
        document.querySelectorAll(".card-turma").forEach(card => {
            card.addEventListener("click", () => {
                const turmaId = card.getAttribute("data-id")
window.location.href = `/app/adm/Turmas/alunos.html?turmaId=${turmaId}`
           })
        })

    } catch (erro) {
        console.error("Erro ao carregar turmas:", erro)
        contentDiv.innerHTML = `<p style="color: #ef4444;">Erro ao carregar as turmas do servidor.</p>`
    }
}

function Render(){
    const width = window.innerWidth
    const align = width < 800 ? "center" : "flex-start"

    root.innerHTML = `
        ${Header(linksHeader)}
        
        <main style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; flex: 1; align-items: ${align}; justify-content: center;">
            
            <div style="flex: 2; min-width: 300px; width: 100%;">
                ${DashBoard("Gerenciamento de Turmas", true, false)}
            </div>

            ${mostrarPainel ? `
                <div style="flex: 1; min-width: 300px; width: 100%;">
                    <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 5px;">
                        <button id="btn-fechar" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">X</button>
                    </div>
                    ${Form("Criar Turma", inputsTurma, [])}
                </div>
            ` : ''}

        </main>
    `

    carregarTurmas()

    // Botão "+ Adicionar" do Dashboard abre o painel
    const btnAdd = document.getElementById("btn-add-item")
    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            mostrarPainel = true
            Render()
        })
    }

    // Botão "X" fecha o painel
    const btnFechar = document.getElementById("btn-fechar")
    if (btnFechar) {
        btnFechar.addEventListener("click", () => {
            mostrarPainel = false
            Render()
        })
    }

    // Trava para o input de Turma aceitar apenas 1 caractere e sempre maiúsculo
    const turmaInput = document.getElementById("turma-input")
    if (turmaInput) {
        turmaInput.addEventListener("input", (event) => {
            let valor = event.target.value.toUpperCase()
            if (valor.length > 1) {
                valor = valor.charAt(0)
            }
            event.target.value = valor
        })
    }

    // Submissão do formulário de criação de turma
    const formElement = document.getElementById("meu-form")
    if (formElement) {
        formElement.addEventListener("submit", async (event) => {
            event.preventDefault()
            const serie = document.getElementById("serie-input").value.trim()
            const turma = document.getElementById("turma-input").value.trim()

            try {
                const resposta = await fetch("http://localhost:3333/turmas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ serie: Number(serie), turma: turma })
                })
                const resultado = await resposta.json()

                if (resposta.ok) {
                    alert("Turma criada com sucesso!")
                    formElement.reset()
                    mostrarPainel = false
                    Render()
                } else {
                    alert(resultado.error || "Erro ao criar turma.")
                }
            } catch (erro) {
                alert("Não foi possível conectar ao servidor.")
            }
        })
    }
}

window.addEventListener("DOMContentLoaded", Render)

