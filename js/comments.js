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
    const width = getComputedStyle(wrapApp.querySelector('.current-image')).width.slice(0,-2);
    const height = getComputedStyle(wrapApp.querySelector('.current-image')).height.slice(0,-2);

    canvas.width = width;
    canvas.height = height;

    wrapCommentsCanvas.appendChild(canvas);
}

function createWrapForCanvasComment() {
    const width = getComputedStyle(wrapApp.querySelector('.current-image')).width.slice(0,-2);
    const height = getComputedStyle(wrapApp.querySelector('.current-image')).height.slice(0,-2);
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

function getDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU');
}

function deleteEmptyFormComments(form = null) {
    console.log(form);
    if (form && !form.classList.contains('fillForm')) {
        wrapCommentsCanvas.removeChild(form);
        return;
    }

    const formCommentsList = document.querySelectorAll('.comments__form');

    if (!formCommentsList) {
        return;
    }

    formCommentsList.forEach(item => {
        if (!item.classList.contains('fillForm')) {
            item.parentElement.removeChild(item)
        }
    });
}

function checkComments() {
    if (!(menuСomments.dataset.state === 'selected') || !wrapApp.querySelector('#comments-on').checked) {
        return;
    }
    wrapCommentsCanvas.appendChild(createCommentsForm(event.offsetX, event.offsetY));
}

function createCommentsForm(x, y) {
    deleteEmptyFormComments();
    const formComment = createElement(structureFormComment(x, y));
    formComment.querySelector('.comments__marker-checkbox').checked = true;

    const left = x;
    const top = y;

    formComment.style.cssText = `left: ${left}px; top: ${top}px; z-index: 2;`;
    formComment.dataset.left = left;
    formComment.dataset.top = top;

    hide(formComment.querySelector('.loader').parentElement);

    formComment.querySelector('.comments__close').addEventListener('click', () => {
        deleteEmptyFormComments();
        formComment.querySelector('.comments__marker-checkbox').checked = false;
    });

    formComment.querySelector('.comments__submit').addEventListener('click', (event) => {
        event.preventDefault();

        const messageForm = formComment.querySelector('.comments__input').value;
        const messageSend = `message=${messageForm}&left=${left}&top=${top}`;

        formComment.querySelector('.loader').parentNode.style.display = '';
        formComment.querySelector('.comments__input').value = '';
        formComment.classList.add('fillForm');

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

            if (!wrapApp.querySelector('#comments-on').checked) {
                newForm.style.display = 'none';
            }
        }
    });
}