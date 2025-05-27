document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const bodyElement = document.body;
    const clearChatButton = document.getElementById('clear-chat-button'); // NYTT

    const backendUrl = 'https://b9280818-97da-4f17-9c2e-db08824cd4f1-00-2btl4c4c21klj.picard.replit.dev/chat';

    // --- TEMABYTTING ---
    const toggleTheme = () => {
        if (themeToggleCheckbox.checked) {
            bodyElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            bodyElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        bodyElement.classList.add('dark-mode');
        if(themeToggleCheckbox) themeToggleCheckbox.checked = true;
    } else {
        bodyElement.classList.remove('dark-mode');
        if(themeToggleCheckbox) themeToggleCheckbox.checked = false;
    }

    if (themeToggleCheckbox) {
        themeToggleCheckbox.addEventListener('change', toggleTheme);
    }

    // --- HJELPEFUNKSJONER FOR MELDINGER ---
    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function addTimestamp(messageElement) {
        let metaDiv = messageElement.querySelector('.message-meta');
        if (!metaDiv) { // Lag meta-div hvis den ikke finnes
            metaDiv = document.createElement('div');
            metaDiv.classList.add('message-meta');
            messageElement.appendChild(metaDiv);
        }
        
        const timestampSpan = document.createElement('span'); // For å unngå konflikt med flex på bot-meldinger
        timestampSpan.textContent = formatTime(new Date());
        
        if (messageElement.classList.contains('bot-message')) {
             metaDiv.insertBefore(timestampSpan, metaDiv.firstChild); // Legg timestamp først i flex container
        } else {
            metaDiv.appendChild(timestampSpan); // For brukermeldinger, legg til normalt (blir høyrejustert av CSS)
        }
    }
    
    function addCopyButton(messageElement, textToCopy) {
        let metaDiv = messageElement.querySelector('.message-meta');
        if (!metaDiv) { // Bør ikke skje hvis addTimestamp kjøres først
            metaDiv = document.createElement('div');
            metaDiv.classList.add('message-meta');
            messageElement.appendChild(metaDiv);
        }

        const copyBtn = document.createElement('button');
        copyBtn.classList.add('copy-button');
        copyBtn.innerHTML = '⎘'; // Kopi-ikon (kan byttes ut med SVG eller bilde)
        copyBtn.title = 'Kopier melding';

        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Forhindre at klikk på knapp trigger andre hendelser på meldingen
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.innerHTML = '✓'; // Hake-ikon
                copyBtn.title = 'Kopiert!';
                setTimeout(() => {
                    copyBtn.innerHTML = '⎘';
                    copyBtn.title = 'Kopier melding';
                }, 2000);
            }).catch(err => {
                console.error('Kunne ikke kopiere tekst: ', err);
                copyBtn.textContent = 'Feil';
                 setTimeout(() => {
                    copyBtn.innerHTML = '⎘';
                    copyBtn.title = 'Kopier melding';
                }, 2000);
            });
        });
        metaDiv.appendChild(copyBtn);
    }

    // Refaktorert addMessageToChat
    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        const pElement = document.createElement('p');
        pElement.textContent = message;
        messageElement.appendChild(pElement);
        
        // chatWindow.appendChild(messageElement); // Flyttet ut
        return messageElement;
    }

    function showThinkingIndicator() {
        // ... (din eksisterende kode, men vi legger til meldingen utenfor)
        const thinkingElement = document.createElement('div');
        thinkingElement.classList.add('message', 'bot-message', 'thinking');
        thinkingElement.id = 'thinking-indicator';
        
        const pElement = document.createElement('p');
        pElement.textContent = "Tenker...";
        thinkingElement.appendChild(pElement);

        chatWindow.appendChild(thinkingElement); // Legg til direkte her
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeThinkingIndicator() {
        const thinkingIndicator = document.getElementById('thinking-indicator');
        if (thinkingIndicator) {
            thinkingIndicator.remove();
        }
    }

    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        const userMessageElement = addMessageToChat(messageText, 'user');
        addTimestamp(userMessageElement);
        chatWindow.appendChild(userMessageElement);

        userInput.value = '';
        showThinkingIndicator(); // Denne kaller scrollTop internt nå
        // chatWindow.scrollTop = chatWindow.scrollHeight; // Ikke nødvendigvis her hvis showThinkingIndicator gjør det

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });

            removeThinkingIndicator();
            let replyText;

            if (!response.ok) {
                let errorData = { reply: `Feil: ${response.status} ${response.statusText}`};
                try { errorData = await response.json(); } catch (e) { /* Ignorer */ }
                replyText = errorData.reply || errorData.error || `Serverfeil: ${response.status}`;
                console.error('Serverfeil:', response);
            } else {
                const data = await response.json();
                if (data.reply) {
                    replyText = data.reply;
                } else if (data.error) {
                    replyText = `Feil fra bot: ${data.error}`;
                } else {
                    replyText = "Fikk et uventet svar fra boten.";
                }
            }
            
            const botMessageElement = addMessageToChat(replyText, 'bot');
            addTimestamp(botMessageElement);
            addCopyButton(botMessageElement, replyText);
            chatWindow.appendChild(botMessageElement);

        } catch (error) {
            removeThinkingIndicator();
            const errorMsgElement = addMessageToChat('Kunne ikke koble til chatbot-serveren. Sjekk at serveren kjører og at backendUrl er riktig.', 'bot');
            addTimestamp(errorMsgElement);
            // addCopyButton(errorMsgElement, 'Kunne ikke koble til chatbot-serveren...'); // Vurder om feilmeldinger skal kunne kopieres
            chatWindow.appendChild(errorMsgElement);
            console.error('Nettverksfeil eller feil ved sending/mottak:', error);
        }
        chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll til bunn etter svar/feil
    }

    // --- EVENT LISTENERS ---
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    if (userInput) {
        userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }

    if (clearChatButton) { // NYTT
        clearChatButton.addEventListener('click', () => {
            const initialBotMessageText = "Hei! Hvordan kan jeg hjelpe deg i dag?";
            chatWindow.innerHTML = ''; 
            
            const welcomeMessageElement = addMessageToChat(initialBotMessageText, 'bot');
            addTimestamp(welcomeMessageElement);
            // addCopyButton(welcomeMessageElement, initialBotMessageText); // Kopier-knapp på velkomstmelding?
            chatWindow.appendChild(welcomeMessageElement);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
    }

    // Legg til timestamp på den initielle meldingen som er i HTML
    const initialBotMessageElement = chatWindow.querySelector('.bot-message');
    if (initialBotMessageElement && initialBotMessageElement.querySelector('p').textContent.startsWith("Hei!")) {
        addTimestamp(initialBotMessageElement);
        // addCopyButton(initialBotMessageElement, initialBotMessageElement.querySelector('p').textContent); // Kopier-knapp på velkomstmelding?
    }
});
