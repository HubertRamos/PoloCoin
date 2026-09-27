import MenuLateral from '/components/MenuLateral/index.js'

const root = document.getElementById('root')
const user = JSON.parse(sessionStorage.getItem('poloUser') || '{}')

const menuConfig = {
    loja: {
        nome: "Minha Loja",
        icone: "🛒",
        acao: "window.navegarPara('loja')"
    },
    carrinho: {
        nome: "Meu Carrinho",
        icone: "🛍️",
        acao: "window.navegarPara('carrinho')"
    },
    ocorrencias: {
        nome: "Ocorrências",
        icone: "📋",
        acao: "window.navegarPara('ocorrencias')"
    },
    senha: {
        nome: "Alterar Senha",
        icone: "🔒",
        acao: "window.navegarPara('senha')"
    }
}

function renderizarMenu() {
    root.innerHTML = MenuLateral(menuConfig, user)

    if (window.navegarPara) {
        window.navegarPara('loja')
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (!user.id) {
        window.location.href = '/index.html'
        return
    }
    renderizarMenu()
})
