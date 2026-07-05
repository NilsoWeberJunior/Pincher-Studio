




function bufferParaWav(audioBuffer) {
    const numCanais = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const formato = 1; 
    const bitDepth = 16; 
    
    let resultado;
    if (numCanais === 2) {
        resultado = intercalarCanais(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
    } else {
        resultado = audioBuffer.getChannelData(0);
    }
    
    const bufferFinal = new ArrayBuffer(44 + resultado.length * 2);
    const view = new DataView(bufferFinal);
    
    /* CABEÇALHO DO ARQUIVO RIFF / WAV */
    escreverString(view, 0, 'RIFF');
    view.setUint32(4, 36 + resultado.length * 2, true);
    escreverString(view, 8, 'WAVE');
    escreverString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, formato, true);
    view.setUint16(22, numCanais, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numCanais * (bitDepth / 8), true);
    view.setUint16(32, numCanais * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    escreverString(view, 36, 'data');
    view.setUint32(40, resultado.length * 2, true);
    
    
    floatParaInt16(view, 44, resultado);
    
    return new Blob([view], { type: 'audio/wav' });
}

function intercalarCanais(canalEsquerdo, canalDireito) {
    const comprimento = canalEsquerdo.length + canalDireito.length;
    const resultado = new Float32Array(comprimento);
    let indice = 0;
    let entrada = 0;
    
    while (indice < comprimento) {
        resultado[indice++] = canalEsquerdo[entrada];
        resultado[indice++] = canalDireito[entrada];
        entrada++;
    }
    return resultado;
}

function floatParaInt16(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function escreverString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}