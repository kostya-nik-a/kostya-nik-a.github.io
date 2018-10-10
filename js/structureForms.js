'use strict';

function structureFormComment(posX, posY) {
    return {
        tag: 'form',
        cls: 'comments__form',
        attrs: {
            msgid: `msgID${posX}${posY}`,
            style: `top: ${posY}px; left: ${posX}px; z-index: 2`
        },
        content: [
            {
                tag: 'span',
                cls: 'comments__marker'
            },
            {
                tag: 'input',
                cls: 'comments__marker-checkbox',
                attrs: {
                    type: 'checkbox'
                }
            },
            {
                tag: 'div',
                cls: 'comments__body',
                content: [
                    {
                        tag: 'div',
                        cls: 'comment',
                        attrs: {
                            style: "display: none"
                        },
                        content: {
                            tag: 'div',
                            cls: 'loader',
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
                        cls: 'comments__input',
                        attrs: {
                            type: 'taxt',
                            placeholder: 'Напишите ответ...'
                        }
                    },
                    {
                        tag: 'input',
                        cls: 'comments__close',
                        attrs: {
                            type: 'button',
                            value: 'Закрыть'
                        }
                    },
                    {
                        tag: 'input',
                        cls: 'comments__submit',
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
        cls: 'comment',
        attrs: {
            'data-timestamp': msg.timestamp
        },
        content: [
            {
                tag: 'p',
                cls: 'comment__time',
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
            cls: 'comment__message',
            content: item
        })
    });

    return msgNode;
}

function canvasStructure(widthPx, heightPx) {
    return {
        tag: 'canvas',
        cls: 'canvasNode',
        attrs: {
            'width': widthPx,
            'height': heightPx
        }
    }
}

function wrapCanvasStructure(widthPx, heightPx) {
    return {
        tag: 'div',
        cls: 'wrapCanvas',
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
    element.classList.add(...[].concat(node.cls || []));
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
