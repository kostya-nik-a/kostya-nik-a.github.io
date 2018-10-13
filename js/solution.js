'use strict';

const urlAPI = 'https://neto-api.herokuapp.com/pic';
const wrapApp = document.querySelector('.app');
const currentImage = document.querySelector('.current-image');
const menu = document.querySelector('.menu');
const menuItems = document.querySelectorAll('.mode');
const addFileBtn = document.querySelector('.new');
const menuNewLoad = document.querySelector('.new');
const imageLoader = document.querySelector('.image-loader');
const errorNode = document.querySelector('.error');
const errorTextNode = document.querySelector('.error__message');
const burger = document.querySelector('.burger');
const sharedButton = document.querySelector('.share');
const drawButton = document.querySelector('.draw');
const commentsButton = document.querySelector('.comments');
const copyUrlButton = document.querySelector('.menu_copy');
const menuUrl = document.querySelector('.menu__url');
const toggleButton = document.querySelectorAll('.menu__toggle');
const toggleOn = document.querySelector('#comments-on');
const toggleOff = document.querySelector('#comments-off');
const wrapAppCurrentImage = wrapApp.querySelector('.current-image');
const classCommentsForm = '.comments__form';
const classCommentsBody = '.comments__body';
const classCommentsBodyChild = '.comments__body :nth-last-child(4)';
const classCommentsMarker = '.comments__marker-checkbox';
const fillFrom = 'fillForm';

function activateDefault() {
    function urlId() {
        const url = new URL(`${window.location.href}`);
        imageId = url.searchParams.get('id');
    }

    urlId();
    currentImage.src = '';
    menu.dataset.state = 'initial';
    burger.style.display = 'none';

    if (imageId) {
        fetchRequest(`${urlAPI}/${imageId}`, 'GET')
            .then((result) => {
                host = `${window.location.origin}${window.location.pathname}?id=${imageId}`;
                history.pushState(null, null, host);
                imageLoader.setAttribute('style', 'display: none');
                currentImage.src = result.url;
                delNodeElements(classCommentsForm);
                currentImage.classList.add('load');
                return result
            })
            .then((result) => {
                activateReviewing(result);
            })
    }
}

function activateReviewing(apiInfo) {
    menu.dataset.state = '';
    burger.style.display = '';
    shareMode(apiInfo);
}

function showMenu() {
    showError();
    deleteEmptyChats();

    menuItems.forEach(item => {
        item.dataset.state = '';
        item.style.display = '';
    });
}

function commentsMode() {
    deleteEmptyChats();

    menuItems.forEach(item => {
        item.dataset.state = '';
        item.style.display = 'none';
    });

    commentsButton.dataset.state = 'selected';
    commentsButton.style.display = '';
    turnOnOfComments(checkComments())
}

function checkComments() {
    let result = true;

    if (commentsButton.dataset.state !== 'selected') {
        return false
    }

    toggleButton.forEach(item => {
        if (item.value === 'off' && item.checked) {
            return result = false;
        }
    });

    return result
}

function turnOnOfComments(boolValue) {
    showError();
    deleteEmptyChats();

    const formsList = document.querySelectorAll(classCommentsForm);

    if (boolValue) {
        formsList.forEach(form => {
            form.style.display = '';
        })
    }
}

function shareMode(apiInfo) {
    showError();

    menuItems.forEach(item => {
        item.dataset.state = '';
        item.style.display = 'none';
    });

    currentImage.addEventListener('load', () => {
        createWrapforCanvas();
        createCanvas();
        imageLoader.setAttribute('style', 'display: none');
        buildMess(apiInfo);
        wssConnection();
        turnOnOfComments(checkComments())
    });

    menuUrl.value = host;
    sharedButton.dataset.state = 'selected';
    sharedButton.style.display = '';
}

function activateDrawMode() {
    showError();
    menuItems.forEach(item => {
        item.dataset.state = '';
        item.style.display = 'none';
    });

    drawButton.dataset.state = 'selected';
    drawButton.style.display = '';
    turnOnOfComments(checkComments());
}

copyUrlButton.addEventListener('click', () => {
    menuUrl.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.log('Ошибка копирования');
    }
    window.getSelection().removeAllRanges();
});

function delNodeElements(NodeClassName) {
    const nodes = document.querySelectorAll(NodeClassName);
    if (nodes) {
        nodes.forEach(node => {
            node.parentElement.removeChild(node)
        })
    }
}

document.addEventListener('DOMContentLoaded', activateDefault);
burger.addEventListener('click', showMenu);
commentsButton.addEventListener('click', commentsMode);
drawButton.addEventListener('click', activateDrawMode);
sharedButton.addEventListener('click', shareMode);
