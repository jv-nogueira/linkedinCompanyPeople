document.addEventListener("DOMContentLoaded", async () => {

    const botao = document.getElementById("toggle");
    const palavrasInput = document.getElementById("palavras");
    const quantidadeInput = document.getElementById("quantidade");
    const progressoDiv = document.getElementById("progresso");
    const radios = document.querySelectorAll("input[name='salvar']");
    const conectadosCheckbox = document.getElementById("conectados");

    const data = await chrome.storage.local.get([
        "executando",
        "palavras",
        "filtro",
        "limite",
        "progresso",
        "conectados"
    ]);

    let executando = data.executando || false;

    // ==========================
    // RESTORE STATE
    // ==========================

    palavrasInput.value = data.palavras || "";
    quantidadeInput.value = data.limite || 1;
    conectadosCheckbox.checked = data.conectados || false;

    radios.forEach(r => {
        if (r.value === data.filtro) r.checked = true;
    });

    // 🔴 usa SOMENTE storage como fonte
    atualizarProgresso(
        data.progresso || { atual: 0, total: quantidadeInput.value }
    );

    // ==========================
    // AUTO SAVE
    // ==========================

    palavrasInput.addEventListener("input", async () => {
        await chrome.storage.local.set({
            palavras: palavrasInput.value
        });
    });

    quantidadeInput.addEventListener("input", async () => {

        const limite = parseInt(quantidadeInput.value) || 1;

        await chrome.storage.local.set({
            limite: limite,
            progresso: { atual: 0, total: limite } // 🔴 reset persistente
        });
    });

    radios.forEach(r => {
        r.addEventListener("change", async () => {
            if (r.checked) {
                await chrome.storage.local.set({
                    filtro: r.value
                });
            }
        });
    });

    conectadosCheckbox.addEventListener("change", async () => {
        await chrome.storage.local.set({
            conectados: conectadosCheckbox.checked
        });
    });

    // ==========================
    // UI
    // ==========================

    function atualizarProgresso(p) {
        progressoDiv.textContent = `Contagem: ${p.atual}/${p.total}`;
    }

    function atualizarUI() {

        botao.textContent = executando ? "Cancelar" : "Executar";

        palavrasInput.disabled = executando;
        quantidadeInput.disabled = executando;
        conectadosCheckbox.disabled = executando;

        radios.forEach(r => {
            r.disabled = executando;
        });
    }

    // ==========================
    // BOTÃO EXECUTAR
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
                limite: limite,
                ignorarConectados: conectadosCheckbox.checked // 🔴 pronto pra usar no content.js
            });

            executando = true;

            await chrome.storage.local.set({
                executando: true,
                progresso: { atual: 0, total: limite }
            });

        } else {

            chrome.tabs.sendMessage(tab.id, { acao: "parar" });

            executando = false;

            await chrome.storage.local.set({ executando: false });
        }

        atualizarUI();
    });

    // ==========================
    // STORAGE SYNC
    // ==========================

    chrome.storage.onChanged.addListener((changes) => {

        if (changes.executando) {
            executando = changes.executando.newValue;
            atualizarUI();

            if (executando === false) {
                window.close();
            }
        }

        if (changes.progresso) {
            atualizarProgresso(changes.progresso.newValue);
        }

        if (changes.limite) {
            quantidadeInput.value = changes.limite.newValue || 1;
        }

        if (changes.palavras) {
            palavrasInput.value = changes.palavras.newValue || "";
        }

        if (changes.filtro) {
            radios.forEach(r => {
                r.checked = r.value === changes.filtro.newValue;
            });
        }

        if (changes.conectados) {
            conectadosCheckbox.checked = changes.conectados.newValue;
        }
    });

    atualizarUI();

});