
import { exportToMP4 } from "./MP4Manager.js";

const Canvas = document.getElementById("Canvas");

let undoList = [];
let redoList = [];
const maxHistoryc = 30;

function OpenCloseOptionsMenu() {
    if (!OpenedOptionsMenu) {
        OptionsMenu.classList.remove("close")
        OptionsMenu.classList.add("open");
        OpenedOptionsMenu = true;
    } else {
        OptionsMenu.classList.remove("open");
        OptionsMenu.classList.add("close");
        OpenedOptionsMenu = false;
    }
}
setTimeout(function() {
    const loading = document.getElementById("main_loading");
    if (loading) loading.remove();
    
    document.getElementById("MainMenu").style.display = "block";
    document.body.style.background = "green";

    adjustCanvasSize();
}, 1500);

window.addEventListener('resize', adjustCanvasSize);

let frames = [null]; 
let currentFrame = 0;
var PencilSelected = true;
var RubberSelected = false;
var TriangleSelected = false;
var SquareSelected = false;
var LineSelected = false;
var TextSelected = false;
const RubberColor = 'white';
const configOptions = document.getElementById("configOptions");
const colorChooser = document.getElementById("colorChooserInput")
const tickness = document.getElementById("ticknessInput");
var GlobalColor = 'black';
var GlobalTickness = 5;
let CircleSelected = false;
let startX = 0;              
let startY = 0;              
let backupImage = null;

function openFormsMenu() {
    document.getElementById("selectForm").showModal();
}
function closeFormsMenu() {
    document.getElementById("selectForm").close();
}

document.getElementById("forms").addEventListener("click", openFormsMenu);
document.getElementById("closeFormsMenu").addEventListener("click", closeFormsMenu);


function openConfigs() {
    configOptions.showModal();
}

function closeConfigs() {
    configOptions.close();
}

function saveChanges() {
    configOptions.close();
    GlobalColor = colorChooser.value;
    GlobalTickness = tickness.value;
    ctx.lineWidth = GlobalTickness;
    ctx.strokeStyle = GlobalColor; 
}

function SelectCircle() {
    closeFormsMenu()
    LineSelected = false;
    PencilSelected = false;
    RubberSelected = false;
    CircleSelected = true;
    SquareSelected = false;
    TextSelected = false;
    TriangleSelected = false;

    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}

function SelectText() {

    LineSelected = false;
    PencilSelected = false;
    RubberSelected = false;
    CircleSelected = false;
    SquareSelected = false;
    TextSelected = true;
    TriangleSelected = false;

    ctx.fillStyle = GlobalColor;
}

const textButton = document.getElementById("textBtn");
if (textButton) {
    textButton.addEventListener("click", SelectText);
}

function SelectPencil() {
    LineSelected = false;
    PencilSelected = true;
    RubberSelected = false;
    CircleSelected = false;
    SquareSelected = false;
    TextSelected = false;
    TriangleSelected = false;

    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness
}

function SelectRubber() {
    LineSelected = false;
    PencilSelected = false;
    RubberSelected = true;
    CircleSelected = false;
    SquareSelected = false;
    TextSelected = false;
    TriangleSelected = false;
    ctx.strokeStyle = 'white'
}

function SelectLine() {
    closeFormsMenu()
    LineSelected = true;
    PencilSelected = false;
    RubberSelected = false;
    CircleSelected = false;
    SquareSelected = false;
    TextSelected = false;
    TriangleSelected = false;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}

const lineButton = document.getElementById("lineBtn");
if (lineButton) {
    lineButton.addEventListener("click", SelectLine);
}

function SelectSquare() {
    closeFormsMenu()
    LineSelected = false;
    PencilSelected = false;
    RubberSelected = false;
    CircleSelected = false;
    SquareSelected = true;
    TextSelected = false;
    TriangleSelected = false;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}

const squareButton = document.getElementById("squareBtn");
if (squareButton) {
    squareButton.addEventListener("click", SelectSquare);
}

function SelectTriangle() {
    closeFormsMenu()
    LineSelected = false;
    PencilSelected = false;
    RubberSelected = false;
    CircleSelected = false;
    SquareSelected = false;
    TextSelected = false;
    TriangleSelected = true;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}

const triangleButton = document.getElementById("triangleBtn");
if (triangleButton) {
    triangleButton.addEventListener("click", SelectTriangle);
}


document.getElementById("circleBtn").addEventListener("click", SelectCircle);


const ctx = Canvas.getContext('2d');
let drawing = false;
ctx.strokeStyle = 'black';
ctx.lineWidth = GlobalTickness;
ctx.lineCap = 'round'; 


function adjustCanvasSize() {
    const oldWidth = Canvas.width;
    const oldHeight = Canvas.height;

    const temporaryDrown = Canvas.toDataURL();
    
    const actualWidth = Canvas.clientWidth;
    const actualHeight = Canvas.clientHeight;
    
    Canvas.width = actualWidth;
    Canvas.height = actualHeight;
    
    ctx.strokeStyle = PencilSelected ? GlobalColor : 'white';
    ctx.lineWidth = GlobalTickness;
    ctx.lineCap = 'round';
    
    let img = new Image();
    img.src = temporaryDrown;
    img.onload = () => {
        if (oldWidth === 0 || oldHeight === 0) {
            ctx.drawImage(img, 0, 0);
        } else {
            ctx.drawImage(img, 0, 0, oldWidth, oldHeight, 0, 0, actualWidth, actualHeight);
        }
    };
}

Canvas.addEventListener('mousedown', (evento) => {
    saveState();
    drawing = true;
    
    startX = evento.offsetX;
    startY = evento.offsetY;

    if (CircleSelected || TriangleSelected || SquareSelected || LineSelected || TextSelected) {
        backupImage = ctx.getImageData(0, 0, Canvas.width, Canvas.height);
    } 
    
    else {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
});

Canvas.addEventListener('mousemove', (evento) => {
    if (!drawing) return;
    
    const actualyX = evento.offsetX;
    const actualyY = evento.offsetY;

    if (CircleSelected) {
        ctx.putImageData(backupImage, 0, 0);
    
        const xRay = Math.abs(actualyX - startX) / 2;
        const yRay = Math.abs(actualyY - startY) / 2;
    
        const xCenter = startX + (actualyX - startX) / 2;
        const yCenter = startY + (actualyY - startY) / 2;
    
        ctx.beginPath();
        ctx.ellipse(xCenter, yCenter, xRay, yRay, 0, 0, 2 * Math.PI);
        ctx.stroke();

    } else if (TriangleSelected) {
        ctx.putImageData(backupImage, 0, 0);
    
        ctx.beginPath();
        const xTop = startX + (actualyX - startX) / 2;
        ctx.moveTo(xTop, startY); 
    
        ctx.lineTo(actualyX, actualyY);
    
        ctx.lineTo(startX, actualyY);
    
        ctx.closePath();
        ctx.stroke();

    } else if (SquareSelected) {
        ctx.putImageData(backupImage, 0, 0);
    
        
        const width = actualyX - startX;
        const height = actualyY - startY;
    
        ctx.strokeRect(startX, startY, width, height);

    } else if (LineSelected) {
        ctx.putImageData(backupImage, 0, 0);
    
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(actualyX, actualyY);
        ctx.stroke();

    } else if (TextSelected) {
        ctx.putImageData(backupImage, 0, 0);
    
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY, actualyX - startX, actualyY - startY);
        ctx.restore();
    } else {
        ctx.lineTo(actualyX, actualyY);
        ctx.stroke(); 
    }
});

Canvas.addEventListener('mouseup', (evento) => {
    if (!drawing) return;
    drawing = false

    if (TextSelected) {
        ctx.putImageData(backupImage, 0, 0);
        
        const actualyX = evento.offsetX;
        const actualyY = evento.offsetY;
        
        const heightTrack = Math.abs(actualyY - startY);
        const fontSize = heightTrack > 12 ? heightTrack : 30;
        
        const userText = prompt("O que você deseja escrever na animação?");
        
        if (userText && userText.trim() !== "") {
            ctx.fillStyle = GlobalColor;
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textBaseline = "top";
            
            ctx.fillText(userText, startX, startY);
        }
    }


    saveActualyFrame(); 
});

Canvas.addEventListener('mouseleave', () => {
    drawing = false;
});

function getTouchPos(e) {
    const rect = Canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

Canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); 
    saveState();
    drawing = true;

    const pos = getTouchPos(event);
    startX = pos.x;
    startY = pos.y;

    if (CircleSelected || TriangleSelected || SquareSelected || LineSelected || TextSelected) {
        backupImage = ctx.getImageData(0, 0, Canvas.width, Canvas.height);
    } else {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}, { passive: false });

Canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (!drawing) return;

    const pos = getTouchPos(event);
    const actualyX = pos.x;
    const actualyY = pos.y;

    if (CircleSelected) {
        ctx.putImageData(backupImage, 0, 0);
        const xRay = Math.abs(actualyX - startX) / 2;
        const yRay = Math.abs(actualyY - startY) / 2;
        const xCenter = startX + (actualyX - startX) / 2;
        const yCenter = startY + (actualyY - startY) / 2;
        ctx.beginPath();
        ctx.ellipse(xCenter, yCenter, xRay, yRay, 0, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (TriangleSelected) {
        ctx.putImageData(backupImage, 0, 0);
        ctx.beginPath();
        const xTop = startX + (actualyX - startX) / 2;
        ctx.moveTo(xTop, startY); 
        ctx.lineTo(actualyX, actualyY);
        ctx.lineTo(startX, actualyY);
        ctx.closePath();
        ctx.stroke();
    } else if (SquareSelected) {
        ctx.putImageData(backupImage, 0, 0);
        const width = actualyX - startX;
        const height = actualyY - startY;
        ctx.strokeRect(startX, startY, width, height);
    } else if (LineSelected) {
        ctx.putImageData(backupImage, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(actualyX, actualyY);
        ctx.stroke();
    } else if (TextSelected) {
        ctx.putImageData(backupImage, 0, 0);
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY, actualyX - startX, actualyY - startY);
        ctx.restore();
    } else {
        ctx.lineTo(actualyX, actualyY);
        ctx.stroke(); 
    }
}, { passive: false });

Canvas.addEventListener('touchend', (event) => {
    event.preventDefault();
    if (!drawing) return;
    drawing = false;

    if (TextSelected) {
        ctx.putImageData(backupImage, 0, 0);
        const pos = getTouchPos(event);
        const actualyX = pos.x;
        const actualyY = pos.y;
        
        const heightTrack = Math.abs(actualyY - startY);
        const fontSize = heightTrack > 12 ? heightTrack : 30;
        
        const userText = prompt("O que você deseja escrever na animação?");
        
        if (userText && userText.trim() !== "") {
            ctx.fillStyle = GlobalColor;
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textBaseline = "top";
            ctx.fillText(userText, startX, startY);
        }
    }

    saveActualyFrame(); 
});

function saveActualyFrame() {
    frames[currentFrame] = Canvas.toDataURL();
}

function drawnActualyFrame() {
    let actualyImage = frames[currentFrame];
    if (actualyImage) {
        let actualyImg = new Image(); 
        actualyImg.src = actualyImage;    
        actualyImg.onload = () => {
            ctx.drawImage(actualyImg, 0, 0); 
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        };
    }
}

function loadFrame(index) {
    currentFrame = index; 
    
    ctx.clearRect(0, 0, Canvas.width, Canvas.height);

    drawnActualyFrame();
}

document.getElementById("add").addEventListener("click", () => {
    frames.push(null); 
    currentFrame = frames.length - 1; 
    loadFrame(currentFrame);
    console.log("He created it and it went into the frame: " + currentFrame);
});

document.getElementById("advance").addEventListener("click", () => {
    if (currentFrame < frames.length - 1) {
        currentFrame++;
        loadFrame(currentFrame);
        console.log("It went to the successor frame: " + currentFrame);
    } else {
        console.log("You're already on the last frame.");
    }
});

document.getElementById("back").addEventListener("click", () => {
    if (currentFrame > 0) {
        currentFrame--; 
        loadFrame(currentFrame);
        console.log("returned to the previous screen: " + currentFrame);
    } else {
        console.log("You're already on the first frame");
    }
});

document.getElementById("remove").addEventListener("click", () => {
    if (frames.length === 1) {
        frames[0] = null;
        ctx.clearRect(0, 0, Canvas.width, Canvas.height);
        console.log("single clean frame");
        return; 
    }

    frames.splice(currentFrame, 1);

    if (currentFrame >= frames.length) {
        currentFrame = frames.length - 1;
    }

    loadFrame(currentFrame);
    console.log("The frame has been deleted, now you are in the frame: " + currentFrame);
});

let playing = false;
let animationInterval = null; 
const fps = 10;

const btnPlay = document.getElementById("play");

function playFilm() {
    saveActualyFrame();

    if (currentFrame >= frames.length - 1) {
        currentFrame = 0;
    }

    animationInterval = setInterval(() => {
        if (currentFrame < frames.length - 1) {
            currentFrame++;
        } else {
            currentFrame = 0;
        }
        loadFrame(currentFrame);
    }, 1000 / fps);
}

function pauseFilm() {
    clearInterval(animationInterval);
}

btnPlay.addEventListener("click", () => {
    if (!playing) {
        playing = true;
        btnPlay.innerText = "⏸️";
        playFilm();
    } else {
        playing = false;
        btnPlay.innerText = "▶️";
        pauseFilm();
    }
});

function saveState() {
    // Salva o estado atual do canvas na pilha de desfazer
    undoList.push(ctx.getImageData(0, 0, Canvas.width, Canvas.height));
    
    // Se o histórico passar do limite, remove o mais antigo
    if (undoList.length > maxHistoryc) {
        undoList.shift();
    }
    
    // Sempre que o usuário faz um NOVO traço, a lista de refazer precisa ser limpa
    redoList = [];
}

function Undo() {
    if (undoList.length > 0) {
        // Guarda o estado atual na lista de refazer antes de voltar
        redoList.push(ctx.getImageData(0, 0, Canvas.width, Canvas.height));

        
        // Desenha o estado anterior de volta no Canvas
        ctx.putImageData(undoList.pop(), 0, 0);
    }
}

function Redo() {
    if (redoList.length > 0) {
        // Guarda o estado atual de volta no desfazer
        undoList.push(ctx.getImageData(0, 0, Canvas.width, Canvas.height));
        
        // Pega o estado da lista de refazer
        let proximoEstado = redoList.pop();
        
        // Desenha na tela
        ctx.putImageData(proximoEstado, 0, 0);
    }
}

document.getElementById("undo").addEventListener("click", Undo);
document.getElementById("redo").addEventListener("click", Redo);


window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        Undo();
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        Redo();
    }
});

const btnExport = document.getElementById("Export"); 

const endDialog = document.getElementById("saveAnimFinalSucessOrError");
const CloseSaveDialog = document.getElementById("backSaveDialog");
const SaveDialog = document.getElementById("saveAnimationDialog");
const SaveAnim = document.getElementById("saveAnim");

btnExport.addEventListener("click", () => {
   if (playing) {
    playing = false;
    btnPlay.innerText = "▶️";
    pauseFilm();
   }

   SaveDialog.showModal();
});

CloseSaveDialog.addEventListener("click", function() {
    SaveDialog.close();
});

function closeEndDialog() {
    endDialog.close();
}


var archiveName = null;
SaveAnim.addEventListener("click", async () => {
    SaveDialog.close();
    
    saveAnimFinal.showModal();

    saveActualyFrame(); 

    await new Promise(r => setTimeout(r, 50));

    if (frames.length < 2 || (frames[0] === null && frames[1] === null)) {
        console.log("Add at least two frames before exporting.");
        saveAnimFinal.close();
        
        endDialog.innerHTML = `
            <h1>Erro</h1>
            <p>Adicione pelo menos dois quadros para salvar!</p>
            <button id="closeDialogF">Ok</button>
        `;

        document.getElementById("closeDialogF").addEventListener("click", () => {
            endDialog.close();
        });

        endDialog.showModal();
        return;
    }

    SaveAnim.disabled = true;
    btnExport.disabled = true;
    const originalText = btnExport.innerText; 
    btnExport.innerText = "⏳ Gravando..."; 

    try {
        const videoWidth = 800; 
        const videoHeight = 600;

        const virtualCanvas = document.createElement('canvas');
        virtualCanvas.width = videoWidth;
        virtualCanvas.height = videoHeight;
        const virtualCtx = virtualCanvas.getContext('2d');

        const processedFrames = [];

        for (let i = 0; i < frames.length; i++) {
            if (frames[i]) {
                await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        virtualCtx.fillStyle = "white";
                        virtualCtx.fillRect(0, 0, videoWidth, videoHeight);
                        
                        virtualCtx.drawImage(img, 0, 0, videoWidth, videoHeight);
                        
                        processedFrames.push(virtualCanvas.toDataURL("image/png"));
                        resolve();
                    };
                    img.src = frames[i];
                });
            }
        }

        archiveName = document.getElementById("archiveName").value;

        console.log("Creating MP4...");
        await exportToMP4(processedFrames, videoWidth, videoHeight, archiveName);
        
        saveAnimFinal.close();
        
        endDialog.innerHTML = `
            <h1>Sucesso</h1>
            <p>Sua animação foi salva na pasta downloads!</p>
            <button id="closeDialogSucesso">Ok</button>
        `;
        document.getElementById("closeDialogSucesso").addEventListener("click", () => endDialog.close());
        endDialog.showModal();
    
    } catch (error) {
        console.error("An error occurred while trying to generate the mp4: ", error);
        saveAnimFinal.close();
        endDialog.innerHTML = `
            <h1>Erro</h1>
            <p>Ocorreu um erro ao tentar salvar sua animação!</p>
            <button id="closeDialogF">Ok</button>
        `;

        document.getElementById("closeDialogF").addEventListener("click", () => {
            endDialog.close();
        });

        endDialog.showModal();
    } finally {
        SaveAnim.disabled = false;
        btnExport.disabled = false;
        btnExport.innerText = originalText; 
    }
});

window.addEventListener('mp4_exportation_completed', () => {
    const endDialog = document.getElementById("saveAnimFinal");
    if (endDialog) endDialog.close();
    console.log("The export process has ended.");
});

document.getElementById("pencil").addEventListener("click", SelectPencil);
document.getElementById("rubber").addEventListener("click", SelectRubber);
document.getElementById("config").addEventListener("click", openConfigs);
document.getElementById("close").addEventListener("click", closeConfigs);
document.getElementById("saveAlterations").addEventListener("click", saveChanges);