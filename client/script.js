import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// Create a template for the chat stripe
const chatStripeTemplate = document.createElement("div");
chatStripeTemplate.innerHTML = `
    <div class="wrapper">
        <div class="chat">
            <div class="profile">
                <img src="" alt="">
            </div>
            <div class="message"></div>
        </div>
    </div>
`;

function loader(element) {
    element.textContent = '';
    let dots = 0;
    loadInterval = setInterval(() => {
        element.textContent += '.';
        dots++;
        if (dots === 4) {
            element.textContent = '';
            dots = 0;
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value) {
    // Clone the template
    let stripe = chatStripeTemplate.cloneNode(true);
    stripe.classList.add(isAi ? "ai" : "user");

    // Update the image src and alt
    stripe.querySelector("img").src = isAi ? bot : user;
    stripe.querySelector("img").alt = isAi ? "bot" : "user";

    // Update the message text
    stripe.querySelector(".message").textContent = value;

    return stripe;
}

const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    // user's chatstripe
    let userChatStripe = chatStripe(false, data.get('prompt'));
    chatContainer.appendChild(userChatStripe);

    form.reset();

    // bot's chatstripe
    let uniqueId = generateUniqueId();
    let botChatStripe = chatStripe(true, "", uniqueId);
    botChatStripe.querySelector(".message").id = uniqueId;
    chatContainer.appendChild(botChatStripe);

    // Use requestAnimationFrame to update the scroll position
    requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);

    // fetch data from server -> bot's response
    const response = await fetch('https://codex-5bnc.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();
        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();
        messageDiv.innerHTML = "Something went wrong";
        alert(err);
    }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});

