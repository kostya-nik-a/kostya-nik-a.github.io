'use strict';

let movedPiece = null;

function dragFloatingMenu(event) {
    if (!event.target.classList.contains('drag')) {
        return;
    }

    movedPiece = event.target.parentElement;
    minX = wrapApp.offsetLeft;
    minY = wrapApp.offsetTop;

    maxX = wrapApp.offsetLeft + wrapApp.offsetWidth - movedPiece.offsetWidth;
    maxY = wrapApp.offsetTop + wrapApp.offsetHeight - movedPiece.offsetHeight;

    shiftX = event.pageX - event.target.getBoundingClientRect().left - window.pageXOffset;
    shiftY = event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset;
}

function dropFloatingMenu(event) {
    if (movedPiece) {
        movedPiece = null;
    }
}

function moveFloatingMenu(callback) {
    let isWaiting = false;
    return function (...rest) {
        if (!isWaiting) {
            callback.apply(this, rest);
            isWaiting = true;
            requestAnimationFrame(() => {
                isWaiting = false;
            });
        }
    };
}

function dragPoint(event) {
    if (!movedPiece) {
        return;
    }

    let x = event.pageX - shiftX;
    let y = event.pageY - shiftY;
    x = Math.min(x, maxX);
    y = Math.min(y, maxY);
    x = Math.max(x, minX);
    y = Math.max(y, minY);
    movedPiece.style.left = x + 'px';
    movedPiece.style.top = y + 'px';
}

document.addEventListener('mousedown', dragFloatingMenu);
document.addEventListener('mousemove', moveFloatingMenu(dragPoint))
document.addEventListener('mouseup', dropFloatingMenu);