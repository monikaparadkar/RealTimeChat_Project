const socket = io('http://localhost:8000');

// DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const usersList = document.getElementById('users-list');
const typingStatus = document.getElementById('typing-status');
var audio = new Audio('ding.mp3');

// Function to append messages to the message container
const appendMessage = (message, position, timestamp) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);

    if (timestamp) {
        const timeElement = document.createElement('span');
        timeElement.innerText = timestamp;
        timeElement.classList.add('timestamp');
        messageElement.append(timeElement);
    }
    messageContainer.append(messageElement);
    if (position == 'left') {
        audio.play();
    }
}

// Function to update the users list
const updateUsersList = (users) => {
    usersList.innerHTML = '';
    for (let id in users) {
        const userElement = document.createElement('li');
        userElement.innerText = users[id];
        usersList.append(userElement);
    }
}

// Prompt for user's name
const userName = prompt("Enter your name to join");
if (userName) {
    socket.emit('new-user-joined', userName);
}

// Event listener for the form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    appendMessage(`You: ${message}`, 'right', timestamp);
    socket.emit('send-message', message);
    socket.emit('stop-typing');
    messageInput.value = '';
});

// Event listener for typing
messageInput.addEventListener('input', () => {
    if (messageInput.value) {
        socket.emit('typing');
    } else {
        socket.emit('stop-typing');
    }
});

// Event listener for when a new user joins
socket.on('user-joined', data => {
    appendMessage(`${data.userName} joined the chat`, 'right');
    updateUsersList(data.users);
});

// Event listener for receiving messages
socket.on('receive-message', data => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    appendMessage(`${data.userName}: ${data.message}`, 'left', timestamp);
});

// Event listener for when a user leaves
socket.on('user-left', userName => {
    appendMessage(`${userName} left the chat`, 'left');
    updateUsersList(data.users);
});

// Event listener for typing indicator
socket.on('user-typing', userName => {
    typingStatus.innerText = `${userName} is typing...`;
});

socket.on('user-stop-typing', () => {
    typingStatus.innerText = '';
});

// Event listener to update the users list
socket.on('update-user-list', users => {
    updateUsersList(users);
});
