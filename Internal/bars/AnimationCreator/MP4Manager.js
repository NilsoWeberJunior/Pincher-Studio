export async function exportToMP4(frameList, width, height, archiveName) {
    console.log("Iniciando gravador otimizado...");

    if (frameList.length === 0 || !frameList[0]) {
        console.error("Nenhum frame válido enviado para exportação.");
        return;
    }

    const tempImg = new Image();
    tempImg.src = frameList[0];
    await new Promise(r => tempImg.onload = r);
    
    const realWidth = tempImg.naturalWidth || width;
    const realHeight = tempImg.naturalHeight || height;

    const virtualCanvas = document.createElement('canvas');
    virtualCanvas.width = realWidth;
    virtualCanvas.height = realHeight;
    const virtualCtx = virtualCanvas.getContext('2d');

    const stream = virtualCanvas.captureStream(0);

    let opcoes = {};
    let extensaoFinal = "";
    let tipoBlob = "";

    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42001E')) {
        opcoes = {
            mimeType: 'video/mp4;codecs=avc1.42001E',
            videoBitsPerSecond: 5000000 
        };
        extensaoFinal = ".mp4";
        tipoBlob = "video/mp4";
        console.log("Sucesso: Usando MP4 nativo da Apple!");

    } else {
        opcoes = {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000
        };
        extensaoFinal = ".webm";
        tipoBlob = "video/webm";
        console.log("MP4 não suportado. Mudando para WebM de alta qualidade.");
    }

    const mediaRecorder = new MediaRecorder(stream, opcoes);

    let videoParts = [];

    mediaRecorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) videoParts.push(evento.data);
    };

    if (!archiveName || archiveName.trim() === "") {
        archiveName = "minha_animacao";
    }

    mediaRecorder.onstop = () => {
        const blobVideo = new Blob(videoParts, { type: tipoBlob });
        const endURL = URL.createObjectURL(blobVideo);

        const link = document.createElement('a');
        link.href = endURL;

        link.download = archiveName + extensaoFinal; 
        link.click();
        console.log("Download do vídeo concluído com sucesso!");
        
        window.dispatchEvent(new Event('mp4_exportation_completed'));
    };

    const loadImage = (src) => {
        return new Promise((resolve) => {
            if (!src) { resolve(null); return; }
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
        });
    };

    mediaRecorder.start();

    for (let i = 0; i < frameList.length; i++) {
        virtualCtx.fillStyle = 'white'; 
        virtualCtx.fillRect(0, 0, realWidth, realHeight);

        const img = await loadImage(frameList[i]);
        if (img) {
            virtualCtx.drawImage(img, 0, 0, realWidth, realHeight);
            console.log(`Processado quadro ${i} em resolução real: ${realWidth}x${realHeight}`);
        }

        if (stream.getVideoTracks()[0] && stream.getVideoTracks()[0].requestFrame) {
            stream.getVideoTracks()[0].requestFrame();
        }

        await new Promise(r => setTimeout(r, 100)); 
    }

    await new Promise(r => setTimeout(r, 200));
    mediaRecorder.stop();
}
