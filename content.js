console.log("CONTENT CARREGADO NA PÁGINA ✅");

let dados = [];
let i = 0;
let rodando = false;

let palavrasChave = [];
let salvarApenasComKeyword = false;

let totalMatches = 0;
let limiteMatches = 1;

let empresaGlobal = "";

chrome.runtime.onMessage.addListener((msg) => {

    if (msg.acao === "iniciar") {

        rodando = true;
        i = 0;
        dados = [];
        totalMatches = 0;

        palavrasChave = (msg.palavras || [])
            .map(p => p.toLowerCase().trim())
            .filter(Boolean);

        salvarApenasComKeyword = msg.filtro === "apenas_keyword";
        limiteMatches = msg.limite || 1;

        empresaGlobal = document.querySelectorAll("h1")[0]?.innerText || "Empresa não encontrada";

        console.log("EMPRESA:", empresaGlobal);
        console.log("PALAVRAS:", palavrasChave);
        console.log("LIMITE:", limiteMatches);

        setTimeout(Start, 2000);
    }

    if (msg.acao === "parar") {

        rodando = false;
        baixarTXT();
    }

});


function Start(){

    if (!rodando) return;

    let profile = document.querySelectorAll("li.grid");

    if (!profile[i]) {

        console.log("Fim da lista");

        rodando = false;
        baixarTXT();
        return;
    }

    let name = profile[i].querySelectorAll("a")[1]?.innerText || "";
    let title = profile[i].querySelectorAll("a")[1]?.parentElement?.parentNode?.children[2]?.innerText || "";
    let link = profile[i].querySelectorAll("a")[1]?.href || "";

    let conectar = profile[i].querySelectorAll('button')[0]?.innerText || "";
    let isConexao = conectar.trim().toLowerCase() !== "conectar";

    profile[i].scrollIntoView();

    const texto = (name + " " + title).toLowerCase();

    let palavrasEncontradas = palavrasChave.filter(p =>
        texto.includes(p)
    );

    palavrasEncontradas = [...new Set(palavrasEncontradas)];

    if (palavrasEncontradas.length > 0) {
        totalMatches++;
        console.log("MATCH:", totalMatches, "/", limiteMatches);
    }

    const deveSalvar =
        !salvarApenasComKeyword || palavrasEncontradas.length > 0;

    if (deveSalvar) {
        dados.push({
            nome: name,
            titulo: title,
            empresa: empresaGlobal,
            palavras: palavrasEncontradas.join(", "),
            conexao: isConexao ? "SIM" : "",
            link: link
        });
    }

    if (totalMatches >= limiteMatches) {

        console.log("LIMITE ATINGIDO ✅");

        rodando = false;
        baixarTXT();
        return;
    }

    const buttons = Array.from(document.querySelectorAll('button'));

    const target = buttons.find(btn =>
        btn.querySelector('span')?.textContent.includes('Exibir mais resultados')
    );

    if (i < profile.length - 4) {

        i++;
        setTimeout(Start, 500);

    } else {

        if (target) target.click();

        i++;
        setTimeout(Start, 5000);
    }
}


// ==========================
// DOWNLOAD
// ==========================

function baixarTXT() {

    let conteudo = "\uFEFFNome\tTítulo\tEmpresa\tPalavras-chave\tConexão\tLink\n";

    dados.forEach(d => {
        conteudo += `${d.nome}\t${d.titulo}\t${d.empresa}\t${d.palavras}\t${d.conexao}\t${d.link}\n`;
    });

    const blob = new Blob([conteudo], { type: "text/plain" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "linkedin_dados.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log("TXT GERADO ✅");

    // 🔴 ESSENCIAL
    chrome.storage.local.set({ executando: false });
}