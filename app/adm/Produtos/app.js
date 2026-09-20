import Dashboard from '../../../components/DashBoard/index.js';
import Header from '../../../components/Header/index.js';
import { linksHeader } from '../constLinks.js';


function Render(){
    const root = document.getElementById('root');
    root.innerHTML = `
        ${Header(linksHeader)}
        ${Dashboard('Tabela de Produtos')}
    `;
}

window.addEventListener('DOMContentLoaded', Render);
