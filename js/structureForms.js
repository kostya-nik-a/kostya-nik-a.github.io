'use strict';

function structureFormComment(posX, posY) {
    return {
        tag: 'form',
        class: 'comments__form',
        attrs: {
            msgid: `msgID${posX}${posY}`,
            style: `top: ${posY - 14}px; left: ${posX - 22}px; z-index: 2`
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
    function getDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('ru-RU');
    }

    let msgNode = {
        tag: 'div',
        class: 'comment',
        attrs: {
            'data-timestamp': msg.timestamp
        },
        content: [
            {
                tag: 'p',
                class: 'comment__time',
                content: getDate(msg.timestamp)
            }
        ]
    };

    msg.message.split('\n').forEach(item => {
        if (!item) {
            msgNode.content.push({tag: 'br'})
        }
        msgNode.content.push({
            tag: 'p',
            class: 'comment__message',
            content: item
        })
    });

    return msgNode;
}

function canvasStructure(widthPx, heightPx) {
    return {
        tag: 'canvas',
        class: 'canvasNode',
        attrs: {
            'width': widthPx,
            'height': heightPx
        }
    }
}

function wrapCanvasStructure(widthPx, heightPx) {
    return {
        tag: 'div',
        class: 'wrapCanvas',
        attrs: {
            'style': `width: ${widthPx}; height: ${heightPx}`
        }
    }
}

function createElement(node) {
    if ((node === undefined) || (node === null) || (node === false)) {
        return document.createTextNode('');
    }

    if ((typeof node === 'string') || (typeof node === 'number') || (typeof node === true)) {
        return document.createTextNode(node)
    }

    if (Array.isArray(node)) {
        return node.reduce(function (f, item) {
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

    return element
}
