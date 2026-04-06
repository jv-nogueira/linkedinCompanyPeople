document.addEventListener("DOMContentLoaded", async () => {

    const botao = document.getElementById("toggle");
    const palavrasInput = document.getElementById("palavras");
    const quantidadeInput = document.getElementById("quantidade");
    const radios = document.querySelectorAll("input[name='salvar']");

    // 🔴 CARREGA ESTADO COMPLETO
    const data = await chrome.storage.local.get([
        "executando",
        "palavras",
        "filtro",
        "limite"
    ]);

    let executando = data.executando || false;

    // 🔴 RESTAURA VALORES
    palavrasInput.value = data.palavras || "";
    quantidadeInput.value = data.limite || 1;

    radios.forEach(r => {
        if (r.value === data.filtro) r.checked = true;
    });

    atualizarUI();

    // ==========================
    // CLICK BOTÃO
    // ==========================
    botao.addEventListener("click", async () => {

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        let filtro = "todos";

        radios.forEach(r => {
            if (r.checked) filtro = r.value;
        });

        const palavras = palavrasInput.value
            .toLowerCase()
            .split(",")
            .map(p => p.trim())
            .filter(Boolean);

        const limite = parseInt(quantidadeInput.value) || 1;

        if (!executando) {

            chrome.tabs.sendMessage(tab.id, {
                acao: "iniciar",
                palavras: palavras,
                filtro: filtro,
                limite: limite
            });

            executando = true;

            // 🔴 SALVA CONFIG
            await chrome.storage.local.set({
                executando: true,
                palavras: palavrasInput.value,
                filtro: filtro,
                limite: limite
            });

        } else {

            chrome.tabs.sendMessage(tab.id, { acao: "parar" });

            executando = false;

            await chrome.storage.local.set({ executando: false });
        }

        atualizarUI();
    });

    // ==========================
    // SINCRONIZAÇÃO GLOBAL
    // ==========================
    chrome.storage.onChanged.addListener((changes) => {

        if (changes.executando) {
            executando = changes.executando.newValue;
            atualizarUI();
        }

        // 🔴 mantém inputs sincronizados também
        if (changes.palavras) palavrasInput.value = changes.palavras.newValue || "";
        if (changes.limite) quantidadeInput.value = changes.limite.newValue || 1;

        if (changes.filtro) {
            radios.forEach(r => {
                r.checked = r.value === changes.filtro.newValue;
            });
        }
    });

    // ==========================
    // TRAVAR / DESTRAVAR UI
    // ==========================
    function atualizarUI() {

        botao.textContent = executando ? "Cancelar" : "Executar";

        // 🔴 trava inputs durante execução
        palavrasInput.disabled = executando;
        quantidadeInput.disabled = executando;

        radios.forEach(r => {
            r.disabled = executando;
        });
    }

});