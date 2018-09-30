'use strict';

const errorMoreDrag = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом "Загрузить новое" в меню';
const errorFileType = 'Неверный формат файла. Пожалуйста, выберите изображение в формате .jpg или .png.';

function fetchRequest(url, method, body, header = null) {
    const headers = header === null ? {} : {'Content-Type': 'application/x-www-form-urlencoded'} ;
    const requestParameters = {
        method: method,
        body: body,
        headers: headers,
        credentials: 'same-origin',
    }

    return fetch(url, requestParameters)
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                return res;
            }
            throw new Error(res.statusText);
        })
        .then(res => res.json())
}

function sendFile(file) {
    const formData = new FormData();
    const fileName = file[0].name;
    const fileType = file[0].type;

    formData.append('title', fileName);
    formData.append('image', file[0]);

    loader.removeAttribute('style');

    if (fileType === "image/jpeg" || fileType === "image/png") {
        fetchRequest(`${urlApi}/pic`, 'POST', formData)
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

let count = 0;

function uploadFileFromDrop(event) {
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

menuNewLoad.addEventListener('click', uploadFileFromButtom);
wrapApp.addEventListener('drop', uploadFileFromDrop);
wrapApp.addEventListener('dragover', event => event.preventDefault());

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