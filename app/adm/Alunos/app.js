import Form from '../../../components/Form/index.js'
import DashBoard from '../../../components/DashBoard/index.js'
import Header from '../../../components/Header/index.js'
import { linksHeader } from '../constLinks.js'
import UploadFile from '../../../components/UploadFile/index.js'

const root = document.getElementById('root')

const params = new URLSearchParams(window.location.search)
const turmaId = params.get('turmaId')

let mostrarPainel = false

// Campos para cadastro de aluno
const inputsAluno = [
    { label: 'Nome do Aluno', placeholder: 'Nome completo do aluno', type: 'text', id: 'nome-aluno-input', required: true },
    { label: 'Senha do Aluno', placeholder: 'Senha de acesso do aluno', type: 'password', id: 'senha-aluno-input', required: true },
    { label: 'Nome do Responsável', placeholder: 'Nome completo do responsável', type: 'text', id: 'nome-responsavel-input', required: true },
    { label: 'Senha do Responsável', placeholder: 'Senha de acesso do responsável', type: 'password', id: 'senha-responsavel-input', required: true },
]

async function carregarDadosDaTurmaEAlunos() {
    const contentDiv = document.getElementById('dashboard-content')
    if (!contentDiv) return

    if (!turmaId) {
        contentDiv.innerHTML = `
            <div class="alert alert-danger" style="grid-column: 1 / -1;">
                <span>❌</span>
                <span>Turma não especificada. Volte e selecione uma turma novamente.</span>
            </div>
        `
        return
    }

    try {
        const resposta = await fetch(`/turmas/${turmaId}/alunos`)
        const alunos = await resposta.json()

        if (alunos.length === 0) {
            contentDiv.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state__icon">👤</div>
                    <p class="empty-state__text">Nenhum aluno cadastrado nesta turma ainda.</p>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 8px;">Clique em "+ Adicionar Aluno" para incluir o primeiro aluno.</p>
                </div>
            `
            return
        }

        contentDiv.innerHTML = alunos.map(aluno => `
            <div class="card" style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 36px;
                            height: 36px;
                            background: linear-gradient(135deg, #3b82f6, #2563eb);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 14px;
                            color: white;
                            flex-shrink: 0;
                        ">
                            👤
                        </div>
                        <div style="min-width: 0;">
                            <strong style="font-size: 14px; color: #0f172a; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${aluno.aluno_nome}
                            </strong>
                            <small style="color: #64748b; font-size: 12px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${aluno.responsavel_nome}
                            </small>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; flex-shrink: 0;">
                    <span class="badge badge-neutral" style="font-size: 11px;">ID: ${aluno.id}</span>
                </div>
            </div>
        `).join('')

    } catch (erro) {
        console.error('Erro ao carregar alunos:', erro)
        contentDiv.innerHTML = `
            <div class="alert alert-danger" style="grid-column: 1 / -1;">
                <span>❌</span>
                <span>Erro ao carregar os alunos do servidor.</span>
            </div>
        `
    }
}

function Render() {
    root.innerHTML = `
        ${Header(linksHeader)}

        <main class="polocoin-main">
            <!-- Botão voltar -->
            <div style="margin-bottom: 16px;">
                <a href="/app/adm/Turmas/index.html" class="btn btn-ghost" style="font-size: 13px;">
                    <i class="fa-solid fa-arrow-left" style="font-size: 11px; margin-right: 4px;"></i>
                    Voltar para Turmas
                </a>
            </div>

            <!-- Cabeçalho da Página -->
            <div class="polocoin-main__header">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: linear-gradient(135deg, #10B981, #059669);
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <i class="fa-solid fa-user-graduate" style="color: white; font-size: 16px;"></i>
                        </div>
                        <div>
                            <h1 class="polocoin-main__title">Alunos da Turma</h1>
                            <p class="polocoin-main__subtitle">Gerencie os alunos desta turma</p>
                        </div>
                    </div>
                </div>

                <div class="polocoin-main__actions">
                    <button id="btn-add-item" class="btn btn-primary">
                        <i class="fa-solid fa-plus" style="font-size: 10px;"></i>
                        Adicionar Aluno
                    </button>
                </div>
            </div>

            <!-- Conteúdo -->
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <!-- Dashboard Principal -->
                <div style="flex: 2; min-width: 300px; width: 100%;">
                    ${DashBoard('Alunos da Turma', false, false)}
                </div>

                <!-- Painel de Criação -->
                ${mostrarPainel ? `
                    <div style="flex: 1; min-width: 300px; width: 100%;">
                        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 8px;">
                            <button id="btn-fechar" class="btn btn-danger" style="padding: 6px 12px; font-size: 13px;">
                                <i class="fa-solid fa-xmark" style="font-size: 11px;"></i>
                                Fechar
                            </button>
                        </div>
                        ${Form('Cadastrar Aluno', inputsAluno, [])}
                        ${UploadFile()}
                    </div>
                ` : ''}
            </div>

            <!-- Lista de Alunos -->
            <div id="dashboard-content" class="card-grid stagger-children" style="margin-top: 24px;"></div>
        </main>

        <style>
            /* Animações */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .card-grid {
                animation: fadeIn 0.4s ease;
            }

            /* Botões */
            #btn-add-item:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }

            #btn-fechar:hover {
                background: #dc2626;
            }

            /* Links */
            a.btn-ghost:hover {
                color: #0f172a;
                background: rgba(0, 0, 0, 0.05);
            }
        </style>
    `

    carregarDadosDaTurmaEAlunos()

    const btnAdd = document.getElementById('btn-add-item')
    if (btnAdd) {
        btnAdd.addEventListener('click', () => {
            mostrarPainel = true
            Render()
        })
    }

    const btnFechar = document.getElementById('btn-fechar')
    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            mostrarPainel = false
            Render()
        })
    }

    const formElement = document.getElementById('meu-form')
    if (formElement) {
        formElement.addEventListener('submit', async (event) => {
            event.preventDefault()
            const nomeAluno = document.getElementById('nome-aluno-input').value.trim()
            const senhaAluno = document.getElementById('senha-aluno-input').value.trim()
            const nomeResponsavel = document.getElementById('nome-responsavel-input').value.trim()
            const senhaResponsavel = document.getElementById('senha-responsavel-input').value.trim()

            try {
                const resposta = await fetch(`/turmas/${turmaId}/alunos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nomeAluno,
                        nomeResponsavel,
                        senhaAluno,
                        senhaResponsavel
                    })
                })
                const resultado = await resposta.json()

                if (resposta.ok) {
                    // Feedback visual
                    const formContainer = formElement.closest('div')
                    if (formContainer) {
                        const feedback = document.createElement('div')
                        feedback.className = 'alert alert-success'
                        feedback.style.marginTop = '12px'
                        feedback.innerHTML = '✓ Aluno cadastrado com sucesso!'
                        formContainer.appendChild(feedback)
                        setTimeout(() => feedback.remove(), 3000)
                    }

                    formElement.reset()
                    mostrarPainel = false
                    Render()
                } else {
                    alert(resultado.error || 'Erro ao cadastrar aluno.')
                }
            } catch (erro) {
                alert('Não foi possível conectar ao servidor.')
            }
        })
    }
    const fileInput = document.getElementById('csv-file')

if (fileInput) {
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = async function (e) {
            const conteudo = e.target.result
            const linhas = conteudo.split('\n')

            let cadastrados = 0
            let ignorados = 0

            for (const linha of linhas) {
                if (!linha.trim()) continue

                const colunas = linha.split(',')

                if (colunas.length < 4) {
                    ignorados++
                    continue
                }

                const nomeAluno = colunas[0].trim()
                const senhaAluno = colunas[1].trim()
                const nomeResponsavel = colunas[2].trim()
                const senhaResponsavel = colunas[3].trim()

                try {
                    const resposta = await fetch(`/turmas/${turmaId}/alunos`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nomeAluno,
                            nomeResponsavel,
                            senhaAluno,
                            senhaResponsavel
                        })
                    })

                    if (resposta.ok)
                        cadastrados++
                    else
                        ignorados++

                } catch (erro) {
                    ignorados++
                }
            }

            alert(
                `Importação concluída!\n\n` +
                `Cadastrados: ${cadastrados}\n` +
                `Ignorados: ${ignorados}`
            )

            fileInput.value = ''
            await carregarDadosDaTurmaEAlunos()
        }

        reader.readAsText(file)
    })
}
}



window.addEventListener('DOMContentLoaded', Render)
