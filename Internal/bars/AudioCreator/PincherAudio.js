const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let soundtrackTracks = [];


setTimeout(function() {
    const loading = document.getElementById("main_loading");
    if (loading) loading.remove();
    
    document.body.style.background = "rgb(33, 235, 191)"; 
}, 1500);

document.getElementById("Export").addEventListener("click", () => {
    const finalDialog = document.getElementById("SaveMyAudio");
    finalDialog.showModal();
});

document.getElementById("closeSaveDialog").addEventListener("click", function() {
    document.getElementById("SaveMyAudio").close();
});



document.getElementById("addTrackBtn").addEventListener("click", () => {
    criarNovaFaixa();
});

let intervaloPalitinho = null;

var audioPlayed = false;


document.getElementById("addSound").addEventListener("click", function() {
    document.getElementById("addSoundDialog").showModal();
});

document.getElementById("closeAddSoundDialog").addEventListener("click", function() {
    document.getElementById("addSoundDialog").close();
});

document.getElementById("explosion").addEventListener("click", function() {
    criarNovaFaixaDefinida("Explosão", "./AudioLib/explosion.ogg");
    document.getElementById("addSoundDialog").close();
})

document.getElementById("cymbal").addEventListener("click", function() {
    criarNovaFaixaDefinida("Prato", "./AudioLib/instruments/cymbal.ogg");
    document.getElementById("addSoundDialog").close();
})

document.getElementById("hi-hat").addEventListener("click", function() {
    criarNovaFaixaDefinida("Prato Hi Hat", "./AudioLib/instruments/hi-hat.ogg");
    document.getElementById("addSoundDialog").close();
})

document.getElementById("snare-drum").addEventListener("click", function() {
    criarNovaFaixaDefinida("Tarol", "./AudioLib/instruments/snare-drum.ogg");
    document.getElementById("addSoundDialog").close();
})

document.getElementById("bass-drum").addEventListener("click", function() {
    criarNovaFaixaDefinida("Bumbo", "./AudioLib/instruments/bass-drum.ogg");
    document.getElementById("addSoundDialog").close();
})

document.getElementById("applause").addEventListener("click", function() {
    criarNovaFaixaDefinida("palma", "./AudioLib/instruments/applause.ogg");
    document.getElementById("addSoundDialog").close();
})

document.getElementById("side-stick").addEventListener("click", function() {
    criarNovaFaixaDefinida("Bastão Lateral", "./AudioLib/instruments/side-stick.ogg");
    document.getElementById("addSoundDialog").close();
})

document.getElementById("recordAudio").addEventListener("click", function() {
    document.getElementById("recordAudioDialog").showModal();
})

document.getElementById("closeRecordAudioDialog").addEventListener("click", function() {
    document.getElementById("recordAudioDialog").close();
})

let gravadorMidia = null;
let pedacosDeAudio = [];

const btnGravar = document.getElementById("record");
const btnPararGravar = document.getElementById("stopRecord");

btnGravar.addEventListener("click", async function() {
    try {
        const fluxoMidia = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        gravadorMidia = new MediaRecorder(fluxoMidia);
        pedacosDeAudio = [];

        gravadorMidia.ondataavailable = function(e) {
            if (e.data.size > 0) {
                pedacosDeAudio.push(e.data);
            }
        };

        gravadorMidia.onstop = async function() {
            const blobAudioGravado = new Blob(pedacosDeAudio, { type: 'audio/webm' });
            
            const arrayBuffer = await blobAudioGravado.arrayBuffer();
            
            audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
                const trackId = "track_" + Date.now();
                const trackDiv = document.getElementById("TrackDiv");
                const trackRow = document.createElement("div");
                trackRow.className = "track-row";
                trackRow.id = trackId;

                trackRow.innerHTML = `
                    <span>🎙️ Gravação de Voz</span>
                    <input type="file" class="audio-input" accept="audio/*" style="display:none;">
                    
                    <label style="flex-direction: column; align-items: flex-start; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                            <span class="time-display" style="font-size: 11px; color: #aaa;">Início (s):</span>
                            <input type="number" class="time-number-input" min="0" max="60" step="0.1" value="0" 
                                   style="width: 50px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px; font-size: 11px; padding: 2px 4px;">
                        </div>
                        <input type="range" id="selectArchiveToThisTrack" class="timeline-input" min="0" max="60" step="0.1" value="0">
                    </label>

                    <label>Vol: 
                        <input type="range" class="volume-input" min="0" max="1" step="0.1" value="0.8">
                    </label>
                    <button class="delete-track-btn" style="background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">❌</button>
                `;

                trackDiv.appendChild(trackRow);

                const novaFaixaObjeto = {
                    id: trackId,
                    audioBuffer: buffer, 
                    volume: 0.8,
                    startTime: 0, 
                    audioSourceNode: null,
                    gainNode: null
                };
                
                soundtrackTracks.push(novaFaixaObjeto);

                const timelineInput = trackRow.querySelector(".timeline-input");
                const timeNumberInput = trackRow.querySelector(".time-number-input");
                const duracaoArredondada = Math.ceil(buffer.duration);
                const limiteFinal = duracaoArredondada + 10;
                
                timelineInput.max = limiteFinal;
                timeNumberInput.max = limiteFinal;

                function atualizarTempoInicio(valor) {
                    let segundos = parseFloat(valor);
                    if (isNaN(segundos)) segundos = 0;
                    novaFaixaObjeto.startTime = segundos;
                    timelineInput.value = segundos;
                    timeNumberInput.value = segundos.toFixed(1);
                }

                timelineInput.addEventListener("input", (e) => atualizarTempoInicio(e.target.value));
                timeNumberInput.addEventListener("input", (e) => atualizarTempoInicio(e.target.value));

                trackRow.querySelector(".volume-input").addEventListener("input", function(e) {
                    novaFaixaObjeto.volume = parseFloat(e.target.value);
                    if (novaFaixaObjeto.gainNode) {
                        novaFaixaObjeto.gainNode.gain.value = novaFaixaObjeto.volume;
                    }
                });

                trackRow.querySelector(".delete-track-btn").addEventListener("click", function() {
                    if (novaFaixaObjeto.audioSourceNode) { try { novaFaixaObjeto.audioSourceNode.stop(); } catch(e){} }
                    trackRow.remove();
                    soundtrackTracks = soundtrackTracks.filter(faixa => faixa.id !== trackId);
                });

                fluxoMidia.getTracks().forEach(track => track.stop());
                
                document.getElementById("recordAudioDialog").close();
            });
        };

        gravadorMidia.start();

        btnGravar.disabled = true;
        btnGravar.style.opacity = "0.5";
        btnGravar.innerText = "🎙️ Gravando...";
        
        btnPararGravar.disabled = false;
        btnPararGravar.style.opacity = "1";
        btnPararGravar.style.cursor = "pointer";

    } catch (erro) {
        console.error("Erro ao acessar o microfone:", erro);
        alert("Não foi possível acessar o microfone. Verifique as permissões do seu navegador!");
    }
});

btnPararGravar.addEventListener("click", function() {
    if (gravadorMidia && gravadorMidia.state !== "inactive") {
        gravadorMidia.stop();

        btnGravar.disabled = false;
        btnGravar.style.opacity = "1";
        btnGravar.innerText = "🎙️ Gravar";

        btnPararGravar.disabled = true;
        btnPararGravar.style.opacity = "0.5";
        btnPararGravar.style.cursor = "not-allowed";
    }
});



document.getElementById("playAndStopAllBtn").addEventListener("click", () => {

    if (!audioPlayed) {
        const tempoAtualDoAudioContext = audioCtx.currentTime;

        soundtrackTracks.forEach(track => {
            if (track.audioBuffer) {
                track.audioSourceNode = audioCtx.createBufferSource();
                track.audioSourceNode.buffer = track.audioBuffer;
                track.gainNode = audioCtx.createGain();
                track.gainNode.gain.value = track.volume;
                track.audioSourceNode.connect(track.gainNode);
                track.gainNode.connect(audioCtx.destination);

                const momentoDeComecar = tempoAtualDoAudioContext + track.startTime;
            track.audioSourceNode.start(momentoDeComecar);
            }
        });

        const tempoInicial = Date.now();
    
        clearInterval(intervaloPalitinho);
    
        intervaloPalitinho = setInterval(() => {
                const segundosPassados = (Date.now() - tempoInicial) / 1000;
    
                soundtrackTracks.forEach(track => {
                    const linhaDaFaixa = document.getElementById(track.id);
                    if (linhaDaFaixa && track.audioBuffer) {
                        const duracaoAudio = track.audioBuffer.duration;
                        const tempoFinalDoAudio = track.startTime + duracaoAudio;

                        if (segundosPassados >= track.startTime && segundosPassados <= tempoFinalDoAudio) {
                            linhaDaFaixa.querySelector(".time-display").innerText = `Tocando... (${Math.floor(segundosPassados - track.startTime)}s / ${Math.floor(duracaoAudio)}s)`;
                        } 
                        else if (segundosPassados > tempoFinalDoAudio) {
                            linhaDaFaixa.querySelector(".time-display").innerText = `Terminado (${Math.floor(duracaoAudio)}s)`;
                        }
                    }
                });
        }, 16);
        audioPlayed = true;
        document.getElementById("playAndStopAllBtn").textContent = "⏸️"

    } else {
        pararTodosOsSons();
        document.getElementById("playAndStopAllBtn").textContent = "▶️"
        audioPlayed = false;
    }
});

function pararTodosOsSons() {
    clearInterval(intervaloPalitinho);

    soundtrackTracks.forEach(track => {
        if (track.audioSourceNode) {
            try {
                track.audioSourceNode.stop();
            } catch(e) {
            }
            track.audioSourceNode = null;
        }

        const linhaDaFaixa = document.getElementById(track.id);
        if (linhaDaFaixa) {
            linhaDaFaixa.querySelector(".time-display").innerText = `Início: ${track.startTime}s`;
        }
    });

    console.log("Trilha sonora e relógios completamente interrompidos.");
}



function criarNovaFaixa(nomeDoSom = "Nova Faixa") {
    const trackDiv = document.getElementById("TrackDiv");
    const trackId = "track_" + Date.now();

    const trackRow = document.createElement("div");
    trackRow.className = "track-row";
    trackRow.id = trackId;

    trackRow.innerHTML = `
        <span>${nomeDoSom}</span>
        <input type="file" class="audio-input" accept="audio/*">
        
        <label style="flex-direction: column; align-items: flex-start; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <span class="time-display" style="font-size: 11px; color: #aaa;">Início (s):</span>
                <input type="number" class="time-number-input" min="0" max="60" step="0.1" value="0" 
                       style="width: 50px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px; font-size: 11px; padding: 2px 4px;">
            </div>
            <input type="range" id="selectArchiveToThisTrack" class="timeline-input" min="0" max="60" step="0.1" value="0">
        </label>

        <label>Vol: 
            <input type="range" class="volume-input" min="0" max="1" step="0.1" value="0.8">
        </label>
        <button class="delete-track-btn" style="background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">❌</button>
    `;

    trackDiv.appendChild(trackRow);

    const novaFaixaObjeto = {
        id: trackId,
        audioBuffer: null,
        volume: 0.8,
        startTime: 0, 
        audioSourceNode: null,
        gainNode: null
    };
    
    soundtrackTracks.push(novaFaixaObjeto);

    const timelineInput = trackRow.querySelector(".timeline-input");
    const timeNumberInput = trackRow.querySelector(".time-number-input");

    function atualizarTempoInicio(valor) {
        let segundos = parseFloat(valor);
        if (isNaN(segundos)) segundos = 0;
        
        novaFaixaObjeto.startTime = segundos;
        
        timelineInput.value = segundos;
        timeNumberInput.value = segundos.toFixed(1);
    }

    timelineInput.addEventListener("input", function(e) {
        atualizarTempoInicio(e.target.value);
    });

    timeNumberInput.addEventListener("input", function(e) {
        atualizarTempoInicio(e.target.value);
    });

    trackRow.querySelector(".audio-input").addEventListener("change", async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        trackRow.querySelector("span").innerText = file.name;
        const arrayBuffer = await file.arrayBuffer();
        audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
            novaFaixaObjeto.audioBuffer = buffer;
            const duracaoArredondada = Math.ceil(buffer.duration);
            const limiteFinal = duracaoArredondada + 10; 
            
            timelineInput.max = limiteFinal; 
            timeNumberInput.max = limiteFinal; 
        });
    });

    trackRow.querySelector(".volume-input").addEventListener("input", function(e) {
        novaFaixaObjeto.volume = parseFloat(e.target.value);
        if (novaFaixaObjeto.gainNode) {
            novaFaixaObjeto.gainNode.gain.value = novaFaixaObjeto.volume;
        }
    });

    trackRow.querySelector(".delete-track-btn").addEventListener("click", function() {
        if (novaFaixaObjeto.audioSourceNode) { try { novaFaixaObjeto.audioSourceNode.stop(); } catch(e){} }
        trackRow.remove();
        soundtrackTracks = soundtrackTracks.filter(faixa => faixa.id !== trackId);
    });
}

async function criarNovaFaixaDefinida(nomeDoSom = "Nova Faixa", urlDoAudio) {
    const trackDiv = document.getElementById("TrackDiv");
    const trackId = "track_" + Date.now();

    const trackRow = document.createElement("div");
    trackRow.className = "track-row";
    trackRow.id = trackId;

    trackRow.innerHTML = `
        <span>${nomeDoSom} (Carregando...)</span>
        
        <label style="flex-direction: column; align-items: flex-start; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <span class="time-display" style="font-size: 11px; color: #aaa;">Início (s):</span>
                <input type="number" class="time-number-input" min="0" max="60" step="0.1" value="0" 
                       style="width: 50px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px; font-size: 11px; padding: 2px 4px;">
            </div>
            <input type="range" id="selectArchiveToThisTrack" class="timeline-input" min="0" max="60" step="0.1" value="0">
        </label>

        <label>Vol: 
            <input type="range" class="volume-input" min="0" max="1" step="0.1" value="0.8">
        </label>
        <button class="delete-track-btn" style="background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">❌</button>
    `;

    trackDiv.appendChild(trackRow);

    const novaFaixaObjeto = {
        id: trackId,
        audioBuffer: null,
        volume: 0.8,
        startTime: 0, 
        audioSourceNode: null,
        gainNode: null
    };
    
    soundtrackTracks.push(novaFaixaObjeto);

    const timelineInput = trackRow.querySelector(".timeline-input");
    const timeNumberInput = trackRow.querySelector(".time-number-input");

    function atualizarTempoInicio(valor) {
        let segundos = parseFloat(valor);
        if (isNaN(segundos)) segundos = 0;
        
        novaFaixaObjeto.startTime = segundos;
        
        timelineInput.value = segundos;
        timeNumberInput.value = segundos.toFixed(1);
    }

    timelineInput.addEventListener("input", function(e) {
        atualizarTempoInicio(e.target.value);
    });

    timeNumberInput.addEventListener("input", function(e) {
        atualizarTempoInicio(e.target.value);
    });

    if (urlDoAudio) {
        try {
            const response = await fetch(urlDoAudio);
            const arrayBuffer = await response.arrayBuffer();
            
            audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
                novaFaixaObjeto.audioBuffer = buffer;
                
                const duracaoArredondada = Math.ceil(buffer.duration);
                const timelineInput = trackRow.querySelector(".timeline-input");
                timelineInput.max = duracaoArredondada + 10; 
                
                trackRow.querySelector("span").innerText = nomeDoSom;
            });
        } catch (erro) {
            console.error("Erro ao carregar o áudio do servidor:", erro);
            trackRow.querySelector("span").innerText = `${nomeDoSom} (Erro ao carregar)`;
        }
    }

    trackRow.querySelector(".volume-input").addEventListener("input", function(e) {
        novaFaixaObjeto.volume = parseFloat(e.target.value);
        if (novaFaixaObjeto.gainNode) {
            novaFaixaObjeto.gainNode.gain.value = novaFaixaObjeto.volume;
        }
    });

    trackRow.querySelector(".delete-track-btn").addEventListener("click", function() {
        if (novaFaixaObjeto.audioSourceNode) { try { novaFaixaObjeto.audioSourceNode.stop(); } catch(e){} }
        trackRow.remove();
        soundtrackTracks = soundtrackTracks.filter(faixa => faixa.id !== trackId);
    });
}

document.getElementById("saveAudioBtn").addEventListener("click", async function() {
    const finalDialog = document.getElementById("SaveMyAudio");
    const AlertDialog = document.getElementById("alertDialog");

    finalDialog.close();
    document.getElementById("savingAudio").showModal();

    try {
        let fileName = document.getElementById("archiveName").value.trim();
        if (fileName === "") fileName = "meu_audio";
        
        if (!fileName.toLowerCase().endsWith(".wav")) fileName += ".wav";

        let duracaoTotalMix = 0;
        soundtrackTracks.forEach(track => {
            if (track.audioBuffer) {
                const fimDestaFaixa = track.startTime + track.audioBuffer.duration;
                if (fimDestaFaixa > duracaoTotalMix) {
                    duracaoTotalMix = fimDestaFaixa;
                }
            }
        });

        if (duracaoTotalMix === 0) {
            throw new Error("Nenhuma faixa de áudio carregada para exportar.");
        }

        const sampleRate = audioCtx.sampleRate;
        const offlineCtx = new OfflineAudioContext(2, sampleRate * duracaoTotalMix, sampleRate);

        soundtrackTracks.forEach(track => {
            if (track.audioBuffer) {
                const bufferSourceNode = offlineCtx.createBufferSource();
                bufferSourceNode.buffer = track.audioBuffer;

                const gainNode = offlineCtx.createGain();
                gainNode.gain.value = track.volume;

                bufferSourceNode.connect(gainNode);
                gainNode.connect(offlineCtx.destination);

                bufferSourceNode.start(track.startTime);
            }
        });

        const renderedBuffer = await offlineCtx.startRendering();

        const wavBlob = bufferToWav(renderedBuffer);
        const url = URL.createObjectURL(wavBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(url);

        document.getElementById("savingAudio").close();
        AlertDialog.showModal();
        AlertDialog.innerHTML = `
            <h1>Sucesso</h1>
            <h3>Áudio exportado com sucesso!</h3>
            <p>Seu arquivo <strong>${fileName}</strong> foi salvo na pasta de downloads.</p>
            <button id="ok">Ok</button>
        `;
        document.getElementById("ok").addEventListener("click", () => AlertDialog.close());

    } catch (error) {
        console.error(error);
        document.getElementById("savingAudio").close();
        AlertDialog.showModal();
        AlertDialog.innerHTML = `
            <h1>Erro!</h1>
            <h3>Ocorreu um erro ao tentar salvar seu áudio!</h3>
            <p style="color: #ff4d4d; font-size:12px;">${error.message}</p>
            <button id="ok_error">Ok</button>
        `;
        document.getElementById("ok_error").addEventListener("click", () => AlertDialog.close());
    }
});

function bufferToWav(buffer) {
    let numOfChan = buffer.numberOfChannels,
        btwSampleRate = buffer.sampleRate,
        format = 1, 
        bitDepth = 16,
        resultBuffer;

    if (numOfChan === 2) {
        resultBuffer = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
        resultBuffer = buffer.getChannelData(0);
    }

    let bufferLength = resultBuffer.length * (bitDepth / 8);
    let headerBuffer = new ArrayBuffer(44 + bufferLength);
    let view = new DataView(headerBuffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bufferLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, btwSampleRate, true);
    view.setUint32(28, btwSampleRate * numOfChan * (bitDepth / 8), true);
    view.setUint16(32, numOfChan * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, bufferLength, true);

    let offset = 44;
    for (let i = 0; i < resultBuffer.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, resultBuffer[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });

    function interleave(inputL, inputR) {
        let length = inputL.length + inputR.length;
        let result = new Float32Array(length);
        let index = 0, inputIndex = 0;
        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return result;
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}