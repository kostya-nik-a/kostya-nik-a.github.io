'use strict';

const BRUSH_THICK = 4;

let currentColor;
let needsRepaint = false;
let wrapCommentsCanvas;
let canvas = null;
let minX, minY, maxX, maxY, shiftX, shiftY, menuDragAria, ctx;
let imageId = null;
let drawMode = false;
let curves = [];
let connection;

document.querySelectorAll('.menu__color').forEach(color => {
    if (color.checked) {
        currentColor = getComputedStyle(color.nextElementSibling).backgroundColor;
    };

    color.addEventListener('click', (event) => {
        currentColor = getComputedStyle(event.currentTarget.nextElementSibling).backgroundColor;
    });
});

function createWrapforCanvas() {
    delNodeElements('.wrapCanvas');

    const width = getComputedStyle(wrapAppCurrentImage).width.slice(0,-2);
    const height = getComputedStyle(wrapAppCurrentImage).height.slice(0,-2);

    wrapCommentsCanvas = createElement(wrapCanvasStructure(width, height));
    wrapCommentsCanvas.style.cssText = `width: ${width}; height: ${height};	position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: block;`;
    wrapApp.appendChild(wrapCommentsCanvas);
}

function createCanvas() {
    delNodeElements('.canvasNode');

    const width = getComputedStyle(wrapAppCurrentImage).width.slice(0,-2);
    const height = getComputedStyle(wrapAppCurrentImage).height.slice(0,-2);

    curves = [];
    canvas = createElement(canvasStructure(width, height));
    ctx = canvas.getContext('2d');
    wrapCommentsCanvas.appendChild(canvas);


    canvas.addEventListener("mousedown", (event) => {
        if (drawButton.dataset.state !== 'selected') {
            return;
        }
        event.preventDefault();
        drawMode = true;

        const curve = [];
        curve.color = currentColor;
        curve.push(makePoint(event.offsetX, event.offsetY));
        curves.push(curve);
        needsRepaint = true;
    });

    canvas.addEventListener("mouseup", () => {
        ctx.closePath();
        drawMode = false;
    });

    canvas.addEventListener("mouseleave", () => {
        drawMode = false;
    });

    canvas.addEventListener("mousemove", (event) => {
        if (drawButton.dataset.state !== 'selected' || !drawMode) {
            return;
        }

        const point = makePoint(event.offsetX, event.offsetY);
        curves[curves.length - 1].push(point);
        needsRepaint = true;
        trottledSendMask();
    });

    canvas.addEventListener('click', (event) => {
        if (checkComments()) {
            let {offsetX, offsetY} = event;
            let newform = wrapCommentsCanvas.appendChild(createChatForm(offsetX, offsetY));
            turnOffAllComents();
            newform.querySelector(classCommentsMarker).checked = true;
        }
    });
}

function circle(point) {
    ctx.beginPath();
    ctx.arc(...point, BRUSH_THICK / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function smoothCurveBetween (p1, p2) {
    const cp = p1.map((coord, idx) => (coord + p2[idx]) / 2);
    ctx.quadraticCurveTo(...p1, ...cp);
}

function smoothCurve(points) {
    ctx.beginPath();
    ctx.lineWidth = BRUSH_THICK;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.moveTo(...points[0]);

    for(let i = 1; i < points.length - 1; i++) {
        smoothCurveBetween(points[i], points[i + 1]);
    }

    ctx.stroke();
}

function makePoint(x, y) {
    return [x, y];
};

function repaint () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    curves.forEach((curve) => {
        ctx.strokeStyle = curve.color;
        ctx.fillStyle = curve.color;
        circle(curve[0]);
        smoothCurve(curve);
    });
}

function sendMaskState() {
    canvas.toBlob(function (blob) {
        connection.send(blob);
    });
}

function throttleCanvas(callback, delay) {
    let isWaiting = false;

    return function () {
        if (!isWaiting) {
            isWaiting = true;

            setTimeout(() => {
                callback();
                isWaiting = false;
            }, delay);
        }
    }
}

const trottledSendMask = throttleCanvas(sendMaskState, 1000);

function tick () {
    if (menu.offsetHeight > 66) {
        menu.style.left = (wrapApp.offsetWidth - menu.offsetWidth) - 1 + 'px';
    }

    if(needsRepaint) {
        repaint();
        needsRepaint = false;
    }

    window.requestAnimationFrame(tick);
}

setInterval(tick, 10);
