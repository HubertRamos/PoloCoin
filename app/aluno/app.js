import MenuLateral from '/components/MenuLateral/index.js'

const root = document.getElementById('root');
const user = JSON.parse(sessionStorage.getItem('poloUser') || '{}');

const menuConfig = {
    loja: {
        nome: "Minha Loja",
        icone: "🛒",
        acao: "window.navegarPara('loja')"
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
};

function renderizarMenu() {
    root.innerHTML = MenuLateral(menuConfig, user);
    
    // Navegar para a tela padrão (loja) após a renderização do HTML
    if (window.navegarPara) {
        window.navegarPara('loja');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (!user.id) {
        window.location.href = '/index.html';
        return;
    }
    renderizarMenu();
});
