'use strict';

function deleteEmptyChats(formNode = null) {
    if (formNode && !formNode.classList.contains(fillFrom)) {
        wrapCommentsCanvas.removeChild(formNode);
        return;
    }
    const formsList = document.querySelectorAll(classCommentsForm);

    if (!formsList) {
        return;
    }
    formsList.forEach(item => {
        if (!item.classList.contains(fillFrom)) {
            item.parentElement.removeChild(item)
        }
    });
}

function turnOffAllComents() {
    const msgNodeList = document.querySelectorAll(classCommentsMarker);
    if (msgNodeList) {
        msgNodeList.forEach(msgNode => {
            msgNode.checked = false;
        })
    }
}

function createChatForm(posX, posY) {
    deleteEmptyChats();
    const newform = createElement(structureFormComment(posX, posY));
    const newFormCheckbox = newform.querySelector(classCommentsMarker);
    newFormCheckbox.addEventListener('click', () => {
        deleteEmptyChats();
        const isChecked = newFormCheckbox.checked;
        turnOffAllComents();
        newFormCheckbox.checked = isChecked;
    });

    newform.querySelector('.comments__submit').addEventListener('click', (event) => {
        event.preventDefault();

        const newFormCommentInput = newform.querySelector('.comments__input');
        const newFormLoader = newform.querySelector('.loader');
        const mesageText = newFormCommentInput.value;
        const mesageVar = `message=${mesageText}&left=${posX}&top=${posY}`;

        if (!mesageText) {
            return;
        }

        newFormLoader.parentNode.style.display = '';
        newFormCommentInput.value = '';

        fetchRequest(`${urlAPI}/${imageId}/comments`, 'POST', mesageVar, 'msg').then((result) => {
            newFormLoader.parentNode.style.display = 'none';
            addMsg(newform, result);
        })
    });

    newform.querySelector('.comments__close').addEventListener('click', (event) => {
        event.preventDefault();
        newFormCheckbox.checked = false;
        deleteEmptyChats(newform);
    });

    return newform;
}

function addMsg(form, msgList) {
    const formIdentity = form.getAttribute('msgid');
    let msgIdList = [];

    form.querySelectorAll('.comment').forEach(item => {
        if (item.dataset.timestamp) {
            msgIdList.push(Number(item.dataset.timestamp));
        }
    });

    msgList = msgList['comments'];
    let messagesObjectList = {};

    for (let i in msgList) {
        const comment = msgList[i];
        const key = `msgID${comment.left}${comment.top}`;

        if (messagesObjectList[key]) {
            messagesObjectList[key].push(comment)
        } else {
            messagesObjectList[key] = [comment];
        }
    }

    for (let item in messagesObjectList) {
        if (item === formIdentity) {
            for (let msg in messagesObjectList[item]) {
                const timeSt = messagesObjectList[item][msg].timestamp;
                if (msgIdList.indexOf(timeSt) === -1) {
                    const msgNode = createElement(structureMessageComment(messagesObjectList[item][msg]));
                    const theLastChild = form.querySelector(classCommentsBodyChild);
                    form.querySelector(classCommentsBody).insertBefore(msgNode, theLastChild);
                    form.classList.add(fillFrom);
                }
            }
        }
    }
}

function buildMess(info) {
    if (!info) {
        return;
    }
    let comments = info['comments'];
    let messagesObjectList = {};
    for (let i in comments) {
        const comment = comments[i];
        const key = `msgID${comment.left}${comment.top}`;

        if (messagesObjectList[key]) {
            messagesObjectList[key].push(comment);
        } else {
            messagesObjectList[key] = [comment];
        }
    }

    for (let i in messagesObjectList) {
        const {
            left,
            top
        } = messagesObjectList[i][0];
        const formTemp = createChatForm(left, top);

        for (let msg in messagesObjectList[i]) {
            const msgNode = createElement(structureMessageComment(messagesObjectList[i][msg]));
            const theLastChild = formTemp.querySelector(classCommentsBodyChild);
            formTemp.querySelector(classCommentsBody).insertBefore(msgNode, theLastChild);
            formTemp.classList.add(fillFrom);
        }
        wrapCommentsCanvas.appendChild(formTemp);
    }
    turnOnOfComments(checkComments());
}

toggleButton.forEach(button => {
    deleteEmptyChats();
    button.addEventListener('click', event => {
        const radioFlag = event.target.value;
        const forms = document.querySelectorAll(classCommentsForm);

        if (radioFlag === 'off') {
            toggleOn.checked = false;
            toggleOff.checked = true;
            forms.forEach(form => {
                form.style.display = 'none';
            })
        } else {
            toggleOn.checked = true;
            toggleOff.checked = false;
            forms.forEach(form => {
                form.style.display = '';
            })
        }
    })
});