setTimeout(function() {
    const loading = document.getElementById("main_loading");
    if (loading) loading.remove();
    
    document.body.style.background = "linear-gradient(135deg, #00e1ff 20%, #0011ff 70%) fixed"
}, 1500);



const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const somBuffers = {}; 

const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.8; 
gainNode.connect(audioCtx.destination);

const mapeamentoSons = {
    "Bumbo": "./Songs/instruments/bass-drum.ogg",
    "Tarol": "./Songs/instruments/snare-drum.ogg",
    "Prato": "./Songs/instruments/cymbal.ogg",
    "Hi-Hat": "./Songs/instruments/hi-hat.ogg",
    "Side-Stick": "./Songs/instruments/side-stick.ogg", 
    "Aplauso": "./Songs/instruments/applause.ogg"       
};


async function carregarSom(nome, url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        somBuffers[nome] = audioBuffer;
        console.log(`🎵 ${nome} carregado com sucesso!`);
    } catch (erro) {
        console.error(`❌ Erro ao carregar o som: ${nome} no caminho ${url}`, erro);
    }
}


async function iniciarSons() {
    for (const [nome, url] of Object.entries(mapeamentoSons)) {
        await carregarSom(nome, url);
    }
}
iniciarSons();




let isPlaying = false;
let tempoAtual = 0;
let totalTempos = 16;
let bpm = 125;
let idIntervalo = null;

const configDialog = document.getElementById("configDialog")
document.getElementById("configBtn").addEventListener("click", function() {
    configDialog.showModal();
    console.log("Opened configs")
});
document.getElementById("closeConfigDialogBtn").addEventListener("click", function() {
    configDialog.close();
});

document.getElementById("saveConfigsBtn").addEventListener("click", function() {
    
    const novoTotalTempos = parseInt(document.getElementById("bpmInput").value);
    if (novoTotalTempos !== totalTempos) {
        if(novoTotalTempos <= 128) {
            if (novoTotalTempos && novoTotalTempos > 0) {
                if (isPlaying) togglePlay();
                totalTempos = novoTotalTempos;
                const gridHtml = document.getElementById("grid");
                gridHtml.innerHTML = "";
                criarGrade();
            }
        }
        else {
            console.error("O valor de tempos ultrapassa o limite")
        }
    }

    
    const novoVolume = parseFloat(document.getElementById("volumeSlider").value);
    gainNode.gain.setValueAtTime(novoVolume, audioCtx.currentTime);

    configDialog.close();
    console.log("Configs salvas! Volume ajustado para:", novoVolume);
});

function tocarSom(buffer, tom) {
    if (!buffer) return;
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    
    
    if (tom === "agudo") {
        source.playbackRate.value = 1.5;
    } else if (tom === "grave") {
        source.playbackRate.value = 0.65;
    } else {
        source.playbackRate.value = 1.0;
    }
    
    
    source.connect(gainNode);
    source.start(0);
}

function proximoPasso() {
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    
    const botoesDoTempo = document.querySelectorAll(`.cell[data-tempo="${tempoAtual}"]`);
    
    botoesDoTempo.forEach(botao => {
        
        botao.style.transform = "scale(1.1)";
        setTimeout(() => botao.style.transform = "", 100);

        
        if (botao.classList.contains("active")) {
            const instrumento = botao.dataset.instrumento;
            const tom = botao.dataset.tom;
            tocarSom(somBuffers[instrumento], tom);
        }
    });

    
    tempoAtual = (tempoAtual + 1) % totalTempos;
}

function togglePlay() {
    if (isPlaying) {
        clearInterval(idIntervalo);
        isPlaying = false;
        tempoAtual = 0;
        document.getElementById("btnPlay").innerText = "▶️ Play";
    } else {
        isPlaying = true;
        document.getElementById("btnPlay").innerText = "⏹️ Parar";
        
        
        const milissegundosPorPasso = (60 / bpm / 4) * 1000; 
        idIntervalo = setInterval(proximoPasso, milissegundosPorPasso);
    }
}




function criarGrade() {
    const gridHtml = document.getElementById("grid");
    
    const instrumentos = ["Bumbo", "Tarol", "Prato", "Hi-Hat", "Side-Stick", "Aplauso"];

    gridHtml.style.display = "grid";
    
    gridHtml.style.gridTemplateColumns = `80px repeat(${totalTempos}, 40px)`;
    gridHtml.style.gap = "6px";

    instrumentos.forEach((instrumento) => {
        
        
        const etiqueta = document.createElement("div");
        etiqueta.className = "instrument-label";
        etiqueta.innerText = instrumento;
        gridHtml.appendChild(etiqueta);

        
        for (let tempo = 0; tempo < totalTempos; tempo++) {
            const botao = document.createElement("button");
            botao.className = "cell";
            
            botao.dataset.instrumento = instrumento;
            botao.dataset.tempo = tempo;

            function alternarTom() {
                if (!botao.classList.contains("active")) return;

                if (!botao.dataset.tom || botao.dataset.tom === "normal") {
                    botao.dataset.tom = "agudo";
                } else if (botao.dataset.tom === "agudo") {
                    botao.dataset.tom = "grave";
                } else {
                    botao.dataset.tom = "normal";
                }
            }

            botao.addEventListener("click", () => {
                if (!botao.classList.contains("active")) {
                    botao.classList.add("active");
                    botao.dataset.tom = "normal";
                } else if (botao.dataset.tom === "normal") {
                    botao.classList.remove("active");
                    botao.removeAttribute("data-tom");
                } else {
                    botao.dataset.tom = "normal";
                }
            });

            botao.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                alternarTom();
            });

            let tempoToque;
            botao.addEventListener("touchstart", (e) => {
                tempoToque = setTimeout(() => {
                    if (botao.classList.contains("active")) {
                        alternarTom();
                    }
                }, 500);
            });

            botao.addEventListener("touchend", () => {
                clearTimeout(tempoToque);
            });

            gridHtml.appendChild(botao);
        }
    });
}

function configurarControles() {
    const toolbar2 = document.getElementById("Toolbar2");
    if (!toolbar2) return;

    
    toolbar2.innerHTML = `
        <button id="btnPlay" style="width: 30%; padding: 1% 1%; font-weight: bold; background: #21ebbf; border: none; border-radius: 25px; cursor: pointer; color: #1a1a1a; transition: transform 0.1s;">▶️ Play</button>
        <label style="display: flex; align-items: center; gap: 8px; font-weight: bold;">
            BPM: 
            <input type="number" id="inputBPM" value="${bpm}" style="width: 20%; background: #333; color: white; border: 1px solid #555; padding: 3%; border-radius: 8px; text-align: center;">
        </label>
    `;

    
    document.getElementById("btnPlay").addEventListener("click", togglePlay);

    
    document.getElementById("inputBPM").addEventListener("input", (e) => {
        bpm = parseInt(e.target.value) || 120;
        if (isPlaying) {
            
            clearInterval(idIntervalo);
            const milissegundosPorPasso = (60 / bpm / 4) * 1000; 
            idIntervalo = setInterval(proximoPasso, milissegundosPorPasso);
        }
    });
}

const dialogExportar = document.getElementById("SaveMyAudio");
const dialogProcessando = document.getElementById("savingAudio");


document.getElementById("Export").addEventListener("click", () => {
    dialogExportar.showModal();
});


document.getElementById("closeSaveDialog").addEventListener("click", () => {
    dialogExportar.close();
});


document.getElementById("saveAudioBtn").addEventListener("click", async () => {
    const nomeArquivo = document.getElementById("archiveName").value.trim() || "my_audio";
    
    
    dialogExportar.close();
    dialogProcessando.showModal();

    
    const milissegundosPorPasso = (60 / bpm / 4) * 1000;
    const duracaoTotalSegundos = (milissegundosPorPasso * totalTempos) / 1000;

    
    const sampleRate = audioCtx.sampleRate;

    
    const offlineCtx = new OfflineAudioContext(2, sampleRate * duracaoTotalSegundos, sampleRate);

    
    const celulasAtivas = document.querySelectorAll(".cell.active");

    celulasAtivas.forEach(celula => {
        const instrumento = celula.dataset.instrumento;
        const tempo = parseInt(celula.dataset.tempo);
        const tom = celula.dataset.tom;
        const bufferSom = somBuffers[instrumento];

        if (bufferSom) {
            
            const tempoDisparoSegundos = (tempo * milissegundosPorPasso) / 1000;

            
            const fonteOffline = offlineCtx.createBufferSource();
            fonteOffline.buffer = bufferSom;

            
            if (tom === "agudo") {
                fonteOffline.playbackRate.value = 1.5;
            } else if (tom === "grave") {
                fonteOffline.playbackRate.value = 0.65;
            } else {
                fonteOffline.playbackRate.value = 1.0;
            }

            
            fonteOffline.connect(offlineCtx.destination);
            
            fonteOffline.start(tempoDisparoSegundos);
        }
    });

    try {
        
        const audioBufferRenderizado = await offlineCtx.startRendering();
        
        
        const blobWav = bufferParaWav(audioBufferRenderizado);

        
        const urlDownload = URL.createObjectURL(blobWav);
        const linkInvisivel = document.createElement("a");
        linkInvisivel.href = urlDownload;
        linkInvisivel.download = `${nomeArquivo}.wav`;
        document.body.appendChild(linkInvisivel);
        linkInvisivel.click();
        document.body.removeChild(linkInvisivel);

        console.log(`🚀 Áudio "${nomeArquivo}.wav" exportado com sucesso!`);
    } catch (erro) {
        console.error("❌ Falha na renderização do áudio:", erro);
    } finally {
        
        dialogProcessando.close();
    }
});

criarGrade();
configurarControles();