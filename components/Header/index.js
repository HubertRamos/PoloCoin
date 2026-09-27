const style = {
    header: `
        background-color: #fff;
        padding: 12px 20px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 1000;
        box-sizing: border-box;
    `,
    h1: `
        color: #3d3d3d;
        margin: 0;
        font-size: 22px;
    `,
    button: `
        background-color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        cursor: pointer;
    `,
    lista: `
        display: flex;
        flex-direction: row;
        list-style: none;
        margin: 0;
        padding: 0;
        gap: 20px;
    `,
    link: `
        color: #3d3d3d;
        text-decoration: none;
        font-weight: 500;
    `
}

export default function Header(links = {}) {
    const isMobile = window.innerWidth < 800;

    // Converte o objeto { Chave: [Link] } em uma estrutura limpa
    const itensMenu = Object.entries(links).map(([nome, arrayLink]) => ({
        nome: nome,
        url: arrayLink[0] || '#'
    }));

    return `
        <header class="polocoin-header">
            <div class="polocoin-header__inner">
                <a href="/index.html" class="polocoin-header__brand">
                    <div class="polocoin-header__brand-icon">🪙</div>
                    <span>PoloCoin</span>
                </a>
                ${isMobile ? `
                    <select class="polocoin-header__mobile-menu" onchange="window.location.href=this.value">
                        <option value="" disabled selected>Menu</option>
                        ${itensMenu.map(item => `
                            <option value="${item.url}">${item.nome}</option>
                        `).join('')}
                    </select>
                ` : `
                    <nav class="polocoin-header__nav">
                        ${itensMenu.map(item => `
                            <a href="${item.url}" class="polocoin-header__nav-link">${item.nome}</a>
                        `).join('')}
                    </nav>
                `}
            </div>
        </header>
    `;
}

function toggleSidebar() {
    const sidebar = document.querySelector('.polocoin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) {
        sidebar.classList.toggle('polocoin-sidebar--open');
    }
    if (overlay) {
        overlay.classList.toggle('polocoin-sidebar-overlay--visible');
    }
}

