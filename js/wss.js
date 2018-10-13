'use strict';

const urlWss = 'wss://neto-api.herokuapp.com/pic';

function wssConnection() {
    connection = new WebSocket(`${urlWss}/${imageId}`);

    connection.addEventListener('message', event => {
        const parseMsgData = JSON.parse(event.data);
        const parseMsgEvent = JSON.parse(event.data).event;

        if (parseMsgEvent === 'pic'){
            if (parseMsgData.pic.mask) {
                canvas.style.background = `url(${parseMsgData.pic.mask})`;
            }
        }

        if (parseMsgEvent === 'comment'){
            const {
                left,
                top
            } = parseMsgData.comment;

            const forms = document.querySelectorAll(classCommentsForm);
            let formWork = null;
            let needNewFormBool = true;
            const formName = `msgID${left}${top}`;

            if (forms.length) {
                forms.forEach(form => {
                    if (formName === form.getAttribute('msgid')) {
                        needNewFormBool = false;
                        formWork = form;
                    }
                });
            }

            if (needNewFormBool) {
                formWork = createChatForm(left, top);
                wrapCommentsCanvas.appendChild(formWork);
            }

            addMsg(formWork, {'comments': {'comment': parseMsgData.comment}});
            turnOnOfComments(checkComments());
        }

        if (parseMsgEvent === 'mask'){
            canvas.style.background = `url(${parseMsgData.url})`;
        }
    });
}
