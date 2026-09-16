import Form from "../../components/Form/index.js";

const root = document.getElementById("root")

function Render(){
    root.innerHTML = Form()
}

window.addEventListener("DOMContentLoaded", Render)
