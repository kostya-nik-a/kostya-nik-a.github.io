'use strict';

canvas.addEventListener('click', checkComments);
wrapApp.removeChild(formComments);

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

toggleOn.addEventListener('click', markerOn);
toggleOff.addEventListener('click', markerOff);

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

function createCanvas() {
    const width = getComputedStyle(wrapApp.querySelector('.current-image')).width.slice(0, -2);
    const height = getComputedStyle(wrapApp.querySelector('.current-image')).height.slice(0, -2);

    canvas.width = width;
    canvas.height = height;

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

function structureMessageComment(msg) {
    return {
        tag: 'div',
        class: 'comment',
        attrs: {
            'data-timestamp' : msg.timestamp
        },
        content: [
            {
                tag: 'p',
                class: 'comment__time',
                content: getDate(msg.timestamp)
            },
            {
                tag: 'p',
                class: 'comment__message',
                content: msg.message
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

function getDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU');
}

function createCommentsForm(x, y) {
    const formComment = createElement(structureFormComment(x, y));
    const left = x;
    const top = y;

    formComment.style.cssText = `top: ${top}px; left: ${left}px; z-index: 2;`;
    formComment.dataset.left = left;
    formComment.dataset.top = top;

    hide(formComment.querySelector('.loader').parentElement);

    formComment.querySelector('.comments__close').addEventListener('click', () => {
        formComment.querySelector('.comments__marker-checkbox').checked = false;
    });

    formComment.querySelector('.comments__submit').addEventListener('click', (event) => {
        event.preventDefault();

        const messageForm = formComment.querySelector('.comments__input').value;
        const messageSend = `message=${messageForm}&left=${left}&top=${top}`;

        formComment.querySelector('.loader').parentNode.style.display = '';
        formComment.querySelector('.comments__input').value = '';

        fetchRequest(`${urlApi}/pic/${dataParse.id}/comments`, 'POST', messageSend, 'null')
        .then((result) => {
            formComment.querySelector('.loader').parentNode.style.display = 'none';
        })
        .catch(er => {
            console.log(er)
        });

    });

    return formComment;
}

function addMessageComment(msg, form) {
    let parentNode = form.querySelector('.loader').parentElement;
    let newMessageElement = createElement(structureMessageComment(msg));

    form.querySelector('.comments__body').insertBefore(newMessageElement, parentNode);
}

function updateCommentForm(newComment) {
    if (!newComment) {
        return;
    }

    Object.keys(newComment).forEach((id) => {
        if (id in showComments) {
            return;
        }

        showComments[id] = newComment[id];

        let needCreateNewForm = true;

        Array.from(wrapApp.querySelectorAll('.comments__form')).forEach((form) => {
            if (+form.dataset.left === showComments[id].left && +form.dataset.top === showComments[id].top) {
                form.querySelector('.loader').parentElement.style.display = 'none';
                addMessageComment(newComment[id], form);
                needCreateNewForm = false;
            }
        });

        if (needCreateNewForm) {
            const newForm = createCommentsForm(newComment[id].left, newComment[id].top);
            newForm.dataset.left = newComment[id].left;
            newForm.dataset.top = newComment[id].top;
            newForm.style.left = newComment[id].left + 'px';
            newForm.style.top = newComment[id].top + 'px';
            wrapCommentsCanvas.appendChild(newForm);
            addMessageComment(newComment[id], newForm);
            console.log(newComment[id]);

            if (!wrapApp.querySelector('#comments-on').checked) {
                newForm.style.display = 'none';
            }
        }
    });
}

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