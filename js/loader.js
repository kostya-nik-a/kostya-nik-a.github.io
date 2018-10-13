'use strict';

let host;
const errorMoreDrag = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом "Загрузить новое" в меню';
const errorFileType = 'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';

function fetchRequest(url, method, bodyRequest = null, header = null) {
    const headers = header === null ? {} : {'Content-Type': 'application/x-www-form-urlencoded'};
    const body = method === 'POST' ? bodyRequest : null;
    const requestParameters = {
        credentials: 'same-origin',
        method,
        body,
        headers
    };

    return fetch(url, requestParameters)
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                return res.json();
            }
            throw new Error(res.statusText);
        })
}

function sendFile(file) {
    const formData = new FormData();
    const {name, type} = file[0];

    formData.append('title', name);
    formData.append('image', file[0]);

    if (type === "image/jpeg" || type === "image/png") {
        fetchRequest(urlAPI, 'POST', formData)
            .then((result) => {
                fetchRequest(`${urlAPI}/${result.id}`, 'GET')
                    .then((result) => {
                        imageId = result.id;
                        host = `${window.location.origin}${window.location.pathname}?id=${imageId}`;
                        history.pushState(null, null, host);
                        currentImage.src = result.url;
                    })
                .then(activateReviewing)
            })
    }
}

function uploadFileFromButtom(event) {
    event.preventDefault();

    const input = document.createElement('input');
    input.setAttribute('id', 'fileInput');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg, image/png');
    input.click();

    showError();
    delNodeElements(classCommentsForm);
    input.addEventListener('change', event => {
        const files = Array.from(event.currentTarget.files);

        if (canvas) {
            canvas.style.background = '';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        currentImage.src = '';
        imageLoader.removeAttribute('style');
        sendFile(files);
    });
}

function uploadFileFromDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);

    if (currentImage.classList.contains('load')) {
        showError(errorMoreDrag, true);
        return;
    }

    files.forEach(file => {
        if ((file.type === 'image/jpeg') || (file.type === 'image/png')) {
            imageLoader.removeAttribute('style');
            sendFile(files);
        } else {
            showError(errorFileType, true);
        }
    });
}

function showError(errorText = '', showBool = false) {
    errorTextNode.innerText = errorText;
    showBool ? errorNode.style.display = '' : errorNode.style.display = 'none';
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

menuNewLoad.addEventListener('click', uploadFileFromButtom);
wrapApp.addEventListener('drop', uploadFileFromDrop);
wrapApp.addEventListener('dragover', event => event.preventDefault());