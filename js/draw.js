'use strict';

Array.from(menu.querySelectorAll('.menu__color')).forEach(color => {
    if (color.checked) {
        currentColor = getComputedStyle(color.nextElementSibling).backgroundColor;
    };

    color.addEventListener('click', (event) => {
        currentColor = getComputedStyle(event.currentTarget.nextElementSibling).backgroundColor;
    });
});

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

function tick () {
    if (menu.offsetHeight > 66) {
        menu.style.left = (wrapApp.offsetWidth - menu.offsetWidth) + 'px';
    }

    if(needsRepaint) {
        repaint();
        needsRepaint = false;
    }

    window.requestAnimationFrame(tick);
}

tick();

const trottledSendMask = throttleCanvas(sendMaskState, 1000);

canvas.addEventListener("mousedown", (event) => {
    if (!(menuDraw.dataset.state === 'selected')) {
        return;
    }

    event.preventDefault();
    drawing = true;

    const curve = [];
    curve.color = currentColor;

    curve.push(makePoint(event.offsetX, event.offsetY));
    curves.push(curve);
    needsRepaint = true;
});

canvas.addEventListener("mouseup", (event) => {
    drawing = false;
});

canvas.addEventListener("mouseleave", (event) => {
    drawing = false;
});

canvas.addEventListener("mousemove", (event) => {
    if (drawing) {
        const point = makePoint(event.offsetX, event.offsetY)
        curves[curves.length - 1].push(point);
        needsRepaint = true;
        trottledSendMask();
    }
});
