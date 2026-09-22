window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(sessionStorage.getItem("poloUser") || "{}")
    document.getElementById("root").innerHTML = `
        <div style="padding: 20px; font-size: 18px;">
            <h2>Área do Aluno</h2>
            <p style="color: #64748b;">Bem-vindo, ${user.nome || "Aluno"}.</p>
            <p style="color: #94a3b8;">Em breve: seu painel de aluno.</p>
        </div>
    `
})
