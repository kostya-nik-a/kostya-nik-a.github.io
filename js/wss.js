'use strict';

const urlWss = 'wss://neto-api.herokuapp.com/pic';

function wssConnection() {
    connection = new WebSocket(`${urlWss}/${imageId}`);

    connection.addEventListener('message', event => {
        if (JSON.parse(event.data).event === 'pic'){
            if (JSON.parse(event.data).pic.mask) {
                canvas.style.background = `url(${JSON.parse(event.data).pic.mask})`;
            }
        }

        if (JSON.parse(event.data).event === 'comment'){
            const {left, top} = JSON.parse(event.data).comment;

            const forms = document.querySelectorAll('.comments__form');
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

            addMsg(formWork, {'comments': {'comment': JSON.parse(event.data).comment}});
            turnOnOfComments(checkComments());
        }

        if (JSON.parse(event.data).event === 'mask'){
            canvas.style.background = `url(${JSON.parse(event.data).url})`;
        }
    });
}
