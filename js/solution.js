'use strict';

let movedPiece = null;
let needsRepaint = false;
let minX, minY, maxX, maxY;
let shiftX = 0;
let shiftY = 0;
let dataParse;
let host;
let currentColor;
let curves = [];
let drawing = false;
let showComments = {};
const BRUSH_THICK = 4;

const currentImage = document.querySelector('.current-image');
const loader = document.querySelector('.image-loader');
const menu = document.querySelector('.menu');
const menuNewLoad = menu.querySelector('.new');
const wrapApp = document.querySelector('.app');
const menuBurger = menu.querySelector('.burger');
const error = document.querySelector('.error');
const menuUrl = menu.querySelector('.menu__url');
const urlApi = 'https://neto-api.herokuapp.com';
const toggleOn = document.querySelector('#comments-on');
const toggleOff = document.querySelector('#comments-off');
const menuСomments = menu.querySelector('.comments');
const formComments = document.querySelector('.comments__form');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const wrapCommentsCanvas = document.createElement('div');
const menuDraw = menu.querySelector('.draw');

function hide(element) {
    element.setAttribute('style', 'display: none;');
}

currentImage.src = '';
menu.dataset.state = 'initial';
wrapApp.dataset.state = '';

hide(menuBurger);

function errorRemove() {
    setTimeout(function() {
        hide(error)
    }, 5000);
}

function setCurrentImage(fileInfo) {
    currentImage.src = fileInfo.url;
}

function removeForm() {
    const formComment = wrapApp.querySelectorAll('.comments__form');
    Array.from(formComment).forEach(item => {
        item.remove()
    })
}

function showMenu() {
    menu.dataset.state = 'default';

    Array.from(menu.querySelectorAll('.mode')).forEach(item => {
        item.dataset.state = ''

        item.addEventListener('click', () => {
            if (!item.classList.contains('new')){
                menu.dataset.state = 'selected';
                item.dataset.state = 'selected';
            }
            if (item.classList.contains('share')) {
                menuUrl.value = host;
            }
        })
    })
}

menuBurger.addEventListener('click', showMenu);

window.addEventListener('beforeunload', () => {
    connection.close()
});