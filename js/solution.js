'use strict';

const urlApi = 'https://neto-api.herokuapp.com';
const urlWss = 'wss://neto-api.herokuapp.com/pic';
const errorFileType = 'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';
const errorMoreDrag = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом "Загрузить новое" в меню';

const currentImage = document.querySelector('.current-image');
const wrapApp = document.querySelector('.app');
const menu = document.querySelector('.menu');
const menuBurger = menu.querySelector('.burger');
const menuNewLoad = menu.querySelector('.new');
const menuDraw = menu.querySelector('.draw');
const error = document.querySelector('.error');
const loader = document.querySelector('.image-loader');
const menuUrl = menu.querySelector('.menu__url');
const toggleOn = document.querySelector('#comments-on');
const toggleOff = document.querySelector('#comments-off');

let currentColor;
let curves = [];
let drawing = false;
let needsRepaint = false;
const BRUSH_THICK = 4;

let dataParse;
let host;
let connection;
let showComments = {};

function hide(el) {
    el.setAttribute('style', 'display: none;');
}

currentImage.src = '';
menu.dataset.state = 'initial';
wrapApp.dataset.state = '';

hide(menuBurger);

function uploadFileFromButtom(event) {
    const input = document.createElement('input');
    input.setAttribute('id', 'fileInput');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg, image/png');
    menu.appendChild(input);

    document.querySelector('#fileInput').addEventListener('change', event => {
        const files = Array.from(event.currentTarget.files);
        sendFile(files);
    });

    input.click();
    menu.removeChild(input);
}

menuNewLoad.addEventListener('click', uploadFileFromButtom);

function errorRemove() {
    setTimeout(function() {
        hide(error)
    }, 5000);
}

function sendFile(file) {
    const formData = new FormData();
    const fileName = file[0].name;
    const fileType = file[0].type;

    formData.append('title', fileName);
    formData.append('image', file[0]);

    loader.removeAttribute('style');

    if (fileType === "image/jpeg" || fileType === "image/png") {
        fetch(`${urlApi}/pic`, {
            body: formData,
            credentials: 'same-origin',
            method: 'POST'
        })
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                return res;
            }
        throw new Error(res.statusText);
        })
        .then(res => res.json())
        .then(res => {
            getFileInfo(res.id);
        })
        .catch(er => {
            console.log(er);
            hide(loader);
        });
    } else {
        error.removeAttribute('style');
        error.lastElementChild.textContent = errorFileType;
        hide(loader);
        errorRemove();
        return;
    }

}

function getFileInfo(id) {
    const xhr = new XMLHttpRequest();

    xhr.open(
        'GET',
        `${urlApi}/pic/${id}`,
        false
    );
    xhr.send();

    dataParse = JSON.parse(xhr.responseText);
    host = `${window.location.origin}${window.location.pathname}?id=${dataParse.id}`;

    wssConnection();
    setCurrentImage(dataParse);
    currentImage.src = dataParse.url;
    menuBurger.style.cssText = '';
    showMenu();

    currentImage.addEventListener('load', () => {
        hide(loader);
        createWrapForCanvasComment();
        createCanvas();
    });

    updateCommentForm(dataParse.comments);
}

function setCurrentImage(fileInfo) {
    currentImage.src = fileInfo.url;
}

let count = 0;

function onFileDrop(event) {
    event.preventDefault();
    hide(error);
    const files = Array.from(event.dataTransfer.files);

    const fileName = files[0].name;
    const fileType = files[0].type;

    if (count > 0) {
        error.removeAttribute('style');
        error.lastElementChild.textContent = errorMoreDrag;
        errorRemove();
        return;
    }

    count++;

    if (fileType === 'image/jpeg' || fileType === 'image/png') {
        sendFile(files);
    } else {
        error.removeAttribute('style');
        errorRemove();
        count = 0;
    };
}

wrapApp.addEventListener('drop', onFileDrop);
wrapApp.addEventListener('dragover', event => event.preventDefault());

function removeForm() {
    const formComment = wrapApp.querySelectorAll('.comments__form');
    Array.from(formComment).forEach(item => {item.remove()})
}

function showMenu() {
    menu.dataset.state = 'default';

    Array.from(menu.querySelectorAll('.mode')).forEach(item => {
        item.dataset.state = ''

        item.addEventListener('click', () => {
            if (!item.classList.contains('new')){
                menu.dataset.state = 'selected';
                item.dataset.state = 'selected';
            }
            if (item.classList.contains('share')) {
                menuUrl.value = host;
            }
        })
    })
}

menuBurger.addEventListener('click', showMenu);

function insertWssCommentForm(wssComment) {
    const wsCommentEdited = {};
    wsCommentEdited[wssComment.id] = {};
    wsCommentEdited[wssComment.id].left = wssComment.left;
    wsCommentEdited[wssComment.id].message = wssComment.message;
    wsCommentEdited[wssComment.id].timestamp = wssComment.timestamp;
    wsCommentEdited[wssComment.id].top = wssComment.top;
    updateCommentForm(wsCommentEdited);
}

function wssConnection() {
    connection = new WebSocket(`${urlWss}/${dataParse.id}`);

    connection.addEventListener('message', event => {
        if (JSON.parse(event.data).event === 'pic'){
            if (JSON.parse(event.data).pic.mask) {
                canvas.style.background = `url(${JSON.parse(event.data).pic.mask})`;
            }
        }

        if (JSON.parse(event.data).event === 'comment'){
            insertWssCommentForm(JSON.parse(event.data).comment);
            console.log(JSON.parse(event.data).comment);
        }

        if (JSON.parse(event.data).event === 'mask'){
            canvas.style.background = `url(${JSON.parse(event.data).url})`;
        }
    });
}

// Поделиться

const copyUrl = document.querySelector('.menu_copy');

copyUrl.addEventListener('click', function(event) {
    menuUrl.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'успешно ' : 'не';
        console.log(`URL ${msg} скопирован`);
    } catch(err) {
        console.log('Ошибка копирования');
    }
    window.getSelection().removeAllRanges();
});

let url = (new URL(`${window.location.href}`)).searchParams;
let paramId = url.get('id');
urlId();

function urlId() {
    if (!paramId) { return;	}
    getFileInfo(paramId);
    showMenuComments();
}

//Плавающее меню

document.addEventListener('mousedown', dragFloatingMenu);
document.addEventListener('mousemove', moveFloatingMenu(drag))
document.addEventListener('mouseup', dropFloatingMenu);


let movedPiece = null;
let minX, minY, maxX, maxY;
let shiftX = 0;
let shiftY = 0;

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

function drag(event) {
    if (!movedPiece) {return; }

    let x = event.pageX - shiftX;
    let y = event.pageY - shiftY;
    x = Math.min(x, maxX);
    y = Math.min(y, maxY);
    x = Math.max(x, minX);
    y = Math.max(y, minY);
    movedPiece.style.left = x + 'px';
    movedPiece.style.top = y + 'px';
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

function tick () {
    if (menu.offsetHeight > 66) {
        menu.style.left = (wrapApp.offsetWidth - menu.offsetWidth) - 2 + 'px';
    }

    if(needsRepaint) {
        repaint();
        needsRepaint = false;
    }

    window.requestAnimationFrame(tick);
}

tick();

//Форма для комментариев

const menuСomments = menu.querySelector('.comments');
const formComments = document.querySelector('.comments__form');
const commentsMarkerOn = document.querySelector('.menu__toggle-title_on');
const commentsMarkerOff = document.querySelector('.menu__toggle-title_off');
toggleOn.addEventListener('click', markerOn);
toggleOff.addEventListener('click', markerOff);

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const wrapCommentsCanvas = document.createElement('div');

canvas.addEventListener('click', checkComments);
wrapApp.removeChild(formComments);

commentsMarkerOn.addEventListener('click', markerOn);
commentsMarkerOff.addEventListener('click', markerOff);

function showMenuComments() {
    menu.dataset.state = 'default';

    Array.from(menu.querySelectorAll('.mode')).forEach(item => {
        if (!item.classList.contains('comments')){
            return;
        }

        menu.dataset.state = 'selected';
        item.dataset.state = 'selected';
    })
}

function markerOff() {
    const forms = document.querySelectorAll('.comments__form');
    Array.from(forms).forEach(item => {
        item.style.display = 'none';
})
}

function markerOn() {
    const forms = document.querySelectorAll('.comments__form');
    Array.from(forms).forEach(item => {
        item.style.display = '';
})
}

function createCanvas() {
    const width = getComputedStyle(wrapApp.querySelector('.current-image')).width.slice(0, -2);
    const height = getComputedStyle(wrapApp.querySelector('.current-image')).height.slice(0, -2);

    canvas.width = width;
    canvas.height = height;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.display = 'block';
    canvas.style.zIndex = '1';

    wrapCommentsCanvas.appendChild(canvas);
}

function checkComments() {
    if (!(menuСomments.dataset.state === 'selected') || !wrapApp.querySelector('#comments-on').checked) {
        return;
    }
    wrapCommentsCanvas.appendChild(createCommentsForm(event.offsetX, event.offsetY));
}

function createWrapForCanvasComment() {
    const width = getComputedStyle(wrapApp.querySelector('.current-image')).width;
    const height = getComputedStyle(wrapApp.querySelector('.current-image')).height;
    wrapCommentsCanvas.style.cssText = `width: ${width}; height: ${height};	position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: block;`;
    wrapApp.appendChild(wrapCommentsCanvas);

    wrapCommentsCanvas.addEventListener('click', event => {
        if (event.target.closest('.comments__form')) {
            Array.from(wrapCommentsCanvas.querySelectorAll('.comments__form')).forEach(item => {
                item.style.zIndex = 2;
            });
            event.target.closest('.comments__form').style.zIndex = 3;
        }
    });
}

function structureFormComment(posX, posY) {
    return {
        tag: 'form',
        class: 'comments__form',
        attrs: {
            datacors: `${posX}_${posY}`,
            style: `top: ${posY}px; left: ${posX}px; z-index: 2`
        },
        content: [
            {
                tag: 'span',
                class: 'comments__marker'
            },
            {
                tag: 'input',
                class: 'comments__marker-checkbox',
                attrs: {
                    type: 'checkbox'
                }
            },
            {
                tag: 'div',
                class: 'comments__body',
                content: [
                    {
                        tag: 'div',
                        class: 'comment',
                        attrs: {
                            style: "display: none"
                        },
                        content: {
                            tag: 'div',
                            class: 'loader',
                            content: [
                                {tag: 'span'},
                                {tag: 'span'},
                                {tag: 'span'},
                                {tag: 'span'},
                                {tag: 'span'}
                            ]
                        }
                    },
                    {
                        tag: 'textarea',
                        class: 'comments__input',
                        attrs: {
                            type: 'taxt',
                            placeholder: 'Напишите ответ...'
                        }
                    },
                    {
                        tag: 'input',
                        class: 'comments__close',
                        attrs: {
                            type: 'button',
                            value: 'Закрыть'
                        }
                    },
                    {
                        tag: 'input',
                        class: 'comments__submit',
                        attrs: {
                            type: 'submit',
                            value: 'Отправить'
                        }
                    }
                ]
            }
        ]

    }
}

function createElement(node) {
    if ((node === undefined) || (node === null) || (node === false)) {
        return document.createTextNode('');
    }

    if ((typeof node === 'string') || (typeof node === 'number') || (typeof node === true)) {
        return document.createTextNode(node)
    }

    if(Array.isArray(node)) {
        return node.reduce(function(f, item) {
            f.appendChild(createElement(item));
            return f;
        }, document.createDocumentFragment(node.tag))
    }

    const element = document.createElement(node.tag || 'div');
    element.classList.add(...[].concat(node.class || []));
    if (node.attrs) {
        Object.keys(node.attrs).forEach(key => {
            element.setAttribute(key, node.attrs[key])
    })
    }

    if (node.content) {
        element.appendChild(createElement(node.content))
    }

    return element;
}

function createCommentsForm(x, y) {
    const formComment = createElement(structureFormComment(x, y));
    const left = x - 22;
    const top = y - 14;
    formComment.style.cssText = `top: ${top}px; left: ${left}px; z-index: 2;`;
    formComment.dataset.left = left;
    formComment.dataset.top = top;

    hide(formComment.querySelector('.loader').parentElement);

    formComment.querySelector('.comments__close').addEventListener('click', () => {
        formComment.querySelector('.comments__marker-checkbox').checked = false;
    });

    formComment.addEventListener('submit', messageSend);
    formComment.querySelector('.comments__input').addEventListener('keydown', keyMessageSend);

    function keyMessageSend(event) {
        if (event.repeat) { return; }
        if (!event.ctrlKey) { return; }

        switch (event.code) {
            case 'Enter':
                messageSend();
                break;
        }
    }

    function commentsSend(message) {
        fetch(`${urlApi}/pic/${dataParse.id}/comments`, {
            method: 'POST',
            body: message,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
            .then( res => {
            if (res.status >= 200 && res.status < 300) {
            return res;
        }

        throw new Error (res.statusText);
    })
    .then(res => res.json())
    .catch(er => {
            console.log(er)
        formComment.querySelector('.loader').parentNode.style.display = 'none';
    });
    }

    function messageSend(event) {
        if (event) {
            event.preventDefault();
        }

        const message = formComment.querySelector('.comments__input').value;
        console.log(message);
        const messageSend = `message=${message}&left=${left}&top=${top}`;
        console.log(messageSend);
        commentsSend(messageSend);

        formComment.querySelector('.loader').parentNode.style.display = '';
        formComment.querySelector('.comments__input').value = '';
    }

    return formComment;
}

function getDate(timestamp) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const date = new Date(timestamp);
    const dateStr = date.toLocaleString('ru-RU', options);

    return dateStr.slice(0, 8) + dateStr.slice(9);
}

function addMessageComment(message, form) {
    let parentLoaderDiv = form.querySelector('.loader').parentElement;

    const newMessageDiv = document.createElement('div');
    newMessageDiv.classList.add('comment');
    newMessageDiv.dataset.timestamp = message.timestamp;

    const commentTimeP = document.createElement('p');
    commentTimeP.classList.add('comment__time');
    commentTimeP.textContent = getDate(message.timestamp);
    newMessageDiv.appendChild(commentTimeP);

    const commentMessageP = document.createElement('p');
    commentMessageP.classList.add('comment__message');
    commentMessageP.textContent = message.message;
    newMessageDiv.appendChild(commentMessageP);

    form.querySelector('.comments__body').insertBefore(newMessageDiv, parentLoaderDiv);
}

function updateCommentForm(newComment) {
    if (!newComment) {
        return;
    }

    Object.keys(newComment).forEach(id => {
        if (id in showComments) {
            return;
        }

        showComments[id] = newComment[id];
        let needCreateNewForm = true;

        Array.from(wrapApp.querySelectorAll('.comments__form')).forEach(form => {
            if (+form.dataset.left === showComments[id].left && +form.dataset.top === showComments[id].top) {
                form.querySelector('.loader').parentElement.style.display = 'none';
                addMessageComment(newComment[id], form);
                needCreateNewForm = false;
            }
        });

    if (needCreateNewForm) {
        const newForm = createCommentsForm(newComment[id].left + 22, newComment[id].top + 14);
        newForm.dataset.left = newComment[id].left;
        newForm.dataset.top = newComment[id].top;
        newForm.style.left = newComment[id].left + 'px';
        newForm.style.top = newComment[id].top + 'px';
        wrapApp.appendChild(newForm);

        addMessageComment(newComment[id], newForm);

        if (!wrapApp.querySelector('#comments-on').checked) {
            newForm.style.display = 'none';
        }
    }
});
}

// РИСОВАНИЕ

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

const trottledSendMask = throttleCanvas(sendMaskState, 1000);

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

window.addEventListener('beforeunload', () => { connection.close() });