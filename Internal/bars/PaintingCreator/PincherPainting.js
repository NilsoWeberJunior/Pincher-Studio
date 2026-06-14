const Canvas = document.getElementById("Canvas");
const ctx = Canvas.getContext('2d');

let undoList = [];
let redoList = [];
const maxHistoryc = 30;

ctx.lineCap = 'round'; 
ctx.lineJoin = 'round';

setTimeout(function() {
    const loading = document.getElementById("main_loading");
    if (loading) loading.remove();
    
    document.getElementById("MainMenu").style.display = "block";
    document.body.style.background = "green";

    adjustCanvasSize();
}, 1500);

window.addEventListener('resize', adjustCanvasSize);

let drawing = false;
var PencilSelected = true;
var RubberSelected = false;
var TriangleSelected = false;
var SquareSelected = false;
var LineSelected = false;
var TextSelected = false;
let CircleSelected = false;

const configOptions = document.getElementById("configOptions");
const colorChooser = document.getElementById("colorChooserInput");
const tickness = document.getElementById("ticknessInput");

var GlobalColor = 'black';
var GlobalTickness = 5;
let startX = 0;              
let startY = 0;              
let backupImage = null;

function openFormsMenu() { document.getElementById("selectForm").showModal(); }
function closeFormsMenu() { document.getElementById("selectForm").close(); }
function openConfigs() { configOptions.showModal(); }
function closeConfigs() { configOptions.close(); }

document.getElementById("forms").addEventListener("click", openFormsMenu);
document.getElementById("closeFormsMenu").addEventListener("click", closeFormsMenu);
document.getElementById("config").addEventListener("click", openConfigs);
document.getElementById("close").addEventListener("click", closeConfigs);

function saveChanges() {
    configOptions.close();
    GlobalColor = colorChooser.value;
    GlobalTickness = tickness.value;
    ctx.lineWidth = GlobalTickness;
    ctx.strokeStyle = RubberSelected ? 'white' : GlobalColor; 
}
document.getElementById("saveAlterations").addEventListener("click", saveChanges);

function SelectCircle() {
    closeFormsMenu();
    resetTools();
    CircleSelected = true;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}
function SelectText() {
    resetTools();
    TextSelected = true;
    ctx.fillStyle = GlobalColor;
}
function SelectPencil() {
    resetTools();
    PencilSelected = true;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}
function SelectRubber() {
    resetTools();
    RubberSelected = true;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = GlobalTickness;
}
function SelectLine() {
    closeFormsMenu();
    resetTools();
    LineSelected = true;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}
function SelectSquare() {
    closeFormsMenu();
    resetTools();
    SquareSelected = true;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}
function SelectTriangle() {
    closeFormsMenu();
    resetTools();
    TriangleSelected = true;
    ctx.strokeStyle = GlobalColor;
    ctx.lineWidth = GlobalTickness;
}

function resetTools() {
    LineSelected = false; PencilSelected = false; RubberSelected = false;
    CircleSelected = false; SquareSelected = false; TextSelected = false; TriangleSelected = false;
}

document.getElementById("pencil").addEventListener("click", SelectPencil);
document.getElementById("rubber").addEventListener("click", SelectRubber);
document.getElementById("circleBtn").addEventListener("click", SelectCircle);
document.getElementById("squareBtn").addEventListener("click", SelectSquare);
document.getElementById("triangleBtn").addEventListener("click", SelectTriangle);
if (document.getElementById("lineBtn")) document.getElementById("lineBtn").addEventListener("click", SelectLine);
if (document.getElementById("textBtn")) document.getElementById("textBtn").addEventListener("click", SelectText);

function adjustCanvasSize() {
    const oldWidth = Canvas.width;
    const oldHeight = Canvas.height;
    const temporaryDrown = Canvas.toDataURL();
    
    const actualWidth = Canvas.clientWidth;
    const actualHeight = Canvas.clientHeight;
    
    Canvas.width = actualWidth;
    Canvas.height = actualHeight;
    
    ctx.strokeStyle = RubberSelected ? 'white' : GlobalColor;
    ctx.lineWidth = GlobalTickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
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
    } else {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
});

Canvas.addEventListener('mousemove', (evento) => {
    if (!drawing) return;
    drawUpdate(evento.offsetX, evento.offsetY);
});

Canvas.addEventListener('mouseup', (evento) => {
    if (!drawing) return;
    drawing = false;
    handleTextCreation(evento.offsetX, evento.offsetY);
});

Canvas.addEventListener('mouseleave', () => { drawing = false; });

function getTouchPos(e) {
    const rect = Canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

Canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); 
    saveState();
    drawing = true;
    const pos = getTouchPos(event);
    startX = pos.x; startY = pos.y;

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
    drawUpdate(pos.x, pos.y);
}, { passive: false });

Canvas.addEventListener('touchend', (event) => {
    event.preventDefault();
    if (!drawing) return;
    drawing = false;
    const pos = getTouchPos(event);
    handleTextCreation(pos.x, pos.y);
}, { passive: false });

function drawUpdate(actualyX, actualyY) {
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
        ctx.strokeRect(startX, startY, actualyX - startX, actualyY - startY);
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
}

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


function handleTextCreation(actualyX, actualyY) {
    if (TextSelected) {
        ctx.putImageData(backupImage, 0, 0);
        const heightTrack = Math.abs(actualyY - startY);
        const fontSize = heightTrack > 12 ? heightTrack : 30;
        const userText = prompt("O que você deseja escrever no seu desenho?");
        
        if (userText && userText.trim() !== "") {
            ctx.fillStyle = GlobalColor;
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textBaseline = "top";
            ctx.fillText(userText, startX, startY);
        }
    }
}

document.getElementById("remove").addEventListener("click", () => {
    ctx.clearRect(0, 0, Canvas.width, Canvas.height);
    console.log("Tela limpa");
});

document.getElementById("Export").addEventListener("click", () => {
    const finalDialog = document.getElementById("SaveMyPainting");
    finalDialog.showModal();
});

document.getElementById("closeSaveDialog").addEventListener("click", function() {
    document.getElementById("SaveMyPainting").close();
});

document.getElementById("savePaintingBtn").addEventListener("click", function() {
    const finalDialog = document.getElementById("SaveMyPainting");
    const AlertDialog = document.getElementById("alertDialog");
    const Transparent = document.getElementById("transparentBox").checked;

    finalDialog.close();
    document.getElementById("savingAnimation").showModal();

    setTimeout(function() {
        try {
            var imgToExport = null;

            if (Transparent) {
                imgToExport = Canvas.toDataURL("image/png");
            } else {
                const whiteCanvas = document.createElement("canvas");
                whiteCanvas.width = Canvas.width;
                whiteCanvas.height = Canvas.height;
                const whiteCtx = whiteCanvas.getContext("2d");

                whiteCtx.fillStyle = "white";
                whiteCtx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);

                whiteCtx.drawImage(Canvas, 0, 0);

                imgToExport = whiteCanvas.toDataURL("image/png");
            }
            
            const link = document.createElement('a');
            link.href = imgToExport;

            var fileName = document.getElementById("archiveName").value.trim();
            if (fileName === "") {
                fileName = "my painting";
            }
            
            link.download = fileName + ".png"; 
            link.click();

            AlertDialog.showModal();
            AlertDialog.innerHTML = `
                <h1>Sucesso</h1>
                <h3>Sucesso ao salvar sua pintura!</h3>
                <p>Seu desenho foi salvo na pasta downloads</p>
                <button id="ok">Ok</button>
            `;
            document.getElementById("ok").addEventListener("click", function() {
                AlertDialog.close();
            });

        } catch (error) {
            console.error(error);
            AlertDialog.showModal();
            AlertDialog.innerHTML = `
                <h1>Erro!</h1>
                <h3>Ocorreu um erro inesperado ao tentar salvar sua pintura!</h3>
                <button id="ok_error">Ok</button>
            `;
            document.getElementById("ok_error").addEventListener("click", function() {
                AlertDialog.close();
            });
        } finally {
            document.getElementById("savingAnimation").close();
        }
    }, 500);
});