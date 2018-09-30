'use strict';

let connection;

const urlWss = 'wss://neto-api.herokuapp.com/pic';

function insertWssCommentForm(wssComment) {
    const wsCommentEdited = {};
    wsCommentEdited[wssComment.id] = {};
    wsCommentEdited[wssComment.id].left = wssComment.left;
    wsCommentEdited[wssComment.id].top = wssComment.top;
    wsCommentEdited[wssComment.id].timestamp = wssComment.timestamp;
    wsCommentEdited[wssComment.id].message = wssComment.message;

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

