'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#username-form');
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#input-message');
const messageList = document.querySelector('#message-list');
const connectingElement = document.querySelector('#connecting-spinner');
const spinnerElement = document.querySelector('#spinner');

let stompClient = null;
let username = null;
const colors = ["primary", "secondary", "success", "danger", "warning", "info"];

usernameForm.addEventListener('submit', (event) => connect(event, usernameForm), true);
messageForm.addEventListener('submit', sendMessage, true);


function connect(event, form) {
    event.preventDefault();

    const dataData = new FormData(form);
    username = dataData.get('username');

    if (!username) return;

    usernamePage.classList.add('visually-hidden');
    chatPage.classList.remove('visually-hidden');

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    stompClient.subscribe('/topic/public', (payload) => onMessageReceived(payload));
    stompClient.send("/app/chat.addUser", {}, JSON.stringify({sender: username, type: 'JOIN'}));
    connectingElement.classList.add('visually-hidden');
}

function onError() {
    connectingElement.textContent = 'Connection error. Please refresh this page to try again!';
    spinnerElement.remove();
    connectingElement.classList.add("text-danger")
}

function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        const chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    const payloadMessage = JSON.parse(payload.body);
    const messageElement = document.createElement('li');
    messageElement.classList.add('list-group-item');

    if (payloadMessage.messageType === 'JOIN') {
        const welcomeMessageElement = document.createElement('p');
        welcomeMessageElement.textContent = `${payloadMessage.sender} has just joined the chat!`;
        welcomeMessageElement.classList.add('text-center');
        messageElement.appendChild(welcomeMessageElement);
    } else if (payloadMessage.messageType === 'LEAVE') {
        const leaveMessageElement = document.createElement('p');
        leaveMessageElement.textContent = `${payloadMessage.sender} has just left the chat!`;
        leaveMessageElement.classList.add('text-center');
        messageElement.appendChild(leaveMessageElement);
    } else {
        const usernameElement = document.createElement('p');
        usernameElement.textContent = payloadMessage.sender;
        usernameElement.classList.add('fw-bold');

        const userMessageElement = document.createElement('p');
        userMessageElement.textContent = payloadMessage.content;

        messageElement.appendChild(usernameElement);
        messageElement.appendChild(userMessageElement);
    }

    messageList.appendChild(messageElement);
}
