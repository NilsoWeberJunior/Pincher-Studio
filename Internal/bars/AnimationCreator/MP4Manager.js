export async function exportToMP4(frameList, width, height, archiveName) {
    console.log("Initializing recorder...");

    const virtualCanvas = document.createElement('canvas');
    virtualCanvas.width = width;
    virtualCanvas.height = height;
    const virtualCtx = virtualCanvas.getContext('2d');

    const stream = virtualCanvas.captureStream(); 

    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/mp4;codecs=avc1.42001E'
    });

    let videoParts = [];

    mediaRecorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) videoParts.push(evento.data);
    };

    if (archiveName == "" || archiveName == null) {
        archiveName = "my animation";
    }

    mediaRecorder.onstop = () => {
        const blobMp4 = new Blob(videoParts, { type: 'video/mp4' });
        const endURL = URL.createObjectURL(blobMp4);

        const link = document.createElement('a');
        link.href = endURL;
        link.download = archiveName + ".mp4"; 
        link.click();
        console.log("Sucessful to downlod mp4");
        
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
        virtualCtx.fillRect(0, 0, width, height);

        const img = await loadImage(frameList[i]);
        if (img) {
            
            virtualCtx.drawImage(img, 0, 0, width, height);
            console.log(`processed frame ${i} and adjusted to ${width}x${height}`);
        }

        
        if (stream.getVideoTracks()[0] && stream.getVideoTracks()[0].requestFrame) {
            stream.getVideoTracks()[0].requestFrame();
        }

        await new Promise(r => setTimeout(r, 100)); 
    }

    await new Promise(r => setTimeout(r, 200));
    mediaRecorder.stop();
}