document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const bodyElement = document.body;
    const clearChatButton = document.getElementById('clear-chat-button'); 

    // NYE ELEMENTER FOR MENY
    const menuToggleButton = document.getElementById('menu-toggle-button');
    const menuOverlay = document.getElementById('menu-overlay');
    const closeMenuButton = document.getElementById('close-menu-button');
    // const chatTitleMain = document.getElementById('chat-title-main'); // Kan brukes senere

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

    function addTimestamp(messageElement) { // Denne legger ALLTID til NÅVÆRENDE tid og returnerer det
        let metaDiv = messageElement.querySelector('.message-meta');
        if (!metaDiv) { 
            metaDiv = document.createElement('div');
            metaDiv.classList.add('message-meta');
            messageElement.appendChild(metaDiv);
        }
        
        const timestampSpan = document.createElement('span'); 
        const currentTime = formatTime(new Date());
        timestampSpan.textContent = currentTime;
        
        if (messageElement.classList.contains('bot-message') && !messageElement.classList.contains('error-message')) { 
             metaDiv.insertBefore(timestampSpan, metaDiv.firstChild); 
        } else {
            metaDiv.appendChild(timestampSpan); 
        }
        return currentTime; 
    }

    function addTimestampFromText(messageElement, timestampText) {
        let metaDiv = messageElement.querySelector('.message-meta');
        if (!metaDiv) {
            metaDiv = document.createElement('div');
            metaDiv.classList.add('message-meta');
            messageElement.appendChild(metaDiv);
        }
        const timestampSpan = document.createElement('span');
        timestampSpan.textContent = timestampText;
        
        if (messageElement.classList.contains('bot-message') && !messageElement.classList.contains('error-message')) {
             metaDiv.insertBefore(timestampSpan, metaDiv.firstChild);
        } else {
            metaDiv.appendChild(timestampSpan);
        }
    }
    
    function addCopyButton(messageElement, textToCopy) {
        let metaDiv = messageElement.querySelector('.message-meta');
        if (!metaDiv) { 
            metaDiv = document.createElement('div');
            metaDiv.classList.add('message-meta');
            messageElement.appendChild(metaDiv);
        }

        const copyBtn = document.createElement('button');
        copyBtn.classList.add('copy-button');
        copyBtn.innerHTML = '⎘'; 
        copyBtn.title = 'Kopier melding';

        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.innerHTML = '✓'; 
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

    function addMessageToChat(message, sender, type = '') { 
        const messageElement = document.createElement('div');
        messageElement.classList.add('message'); 

        if (type === 'error') {
            messageElement.classList.add('error-message');
        } else {
            messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        }
        
        const pElement = document.createElement('p');
        pElement.textContent = message;
        messageElement.appendChild(pElement);
        
        return messageElement;
    }

    function showThinkingIndicator() {
        const thinkingElement = document.createElement('div');
        thinkingElement.classList.add('message', 'bot-message', 'thinking'); 
        thinkingElement.id = 'thinking-indicator';
        
        const pElement = document.createElement('p');
        pElement.textContent = "Tenker...";
        thinkingElement.appendChild(pElement);

        chatWindow.appendChild(thinkingElement); 
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeThinkingIndicator() {
        const thinkingIndicator = document.getElementById('thinking-indicator');
        if (thinkingIndicator) {
            thinkingIndicator.remove();
        }
    }
    
    // --- CHAT HISTORIKK (LocalStorage) ---
    const CHAT_HISTORY_KEY = 'gullaksenChatHistory_v2'; 

    function saveMessageToHistory(messageObject) {
        const history = getChatHistory();
        history.push(messageObject);
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("Feil ved lagring til localStorage (muligens full?):", e);
        }
    }

    function getChatHistory() {
        const historyJSON = localStorage.getItem(CHAT_HISTORY_KEY);
        try {
            return historyJSON ? JSON.parse(historyJSON) : [];
        } catch (e) {
            console.error("Feil ved parsing av historikk fra localStorage:", e);
            localStorage.removeItem(CHAT_HISTORY_KEY); 
            return []; 
        }
    }

    function clearChatHistory() {
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }

    function displayMessageFromHistory(messageObject) {
        const messageElement = addMessageToChat(messageObject.text, messageObject.sender, messageObject.type || '');
        addTimestampFromText(messageElement, messageObject.timestamp); 

        if (messageObject.sender === 'bot' && (!messageObject.type || messageObject.type !== 'error')) {
            addCopyButton(messageElement, messageObject.text);
        }
        chatWindow.appendChild(messageElement);
    }

    function loadChatHistory() {
        chatWindow.innerHTML = ''; 
        const history = getChatHistory();
        
        if (history.length === 0) { 
            const welcomeText = "Hei! Hvordan kan jeg hjelpe deg i dag?";
            const welcomeMessageElement = addMessageToChat(welcomeText, 'bot');
            const currentTime = formatTime(new Date());
            addTimestampFromText(welcomeMessageElement, currentTime); 
            chatWindow.appendChild(welcomeMessageElement);
            // Ikke lagre velkomstmeldingen her, den genereres ved tom historikk.
            // Den første faktiske bruker/bot-interaksjonen vil bli lagret.
        } else {
            history.forEach(displayMessageFromHistory);
        }
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        const userMessageElement = addMessageToChat(messageText, 'user');
        const userTimestamp = addTimestamp(userMessageElement); 
        chatWindow.appendChild(userMessageElement);
        saveMessageToHistory({ text: messageText, sender: 'user', timestamp: userTimestamp, type: '' }); 

        userInput.value = '';
        showThinkingIndicator(); 

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });

            removeThinkingIndicator();
            let replyText;
            let messageType = ''; 

            if (!response.ok) {
                let errorData = { reply: `Feil: ${response.status} ${response.statusText}`};
                try { errorData = await response.json(); } catch (e) { /* Ignorer */ }
                replyText = errorData.reply || errorData.error || `Serverfeil: ${response.status}`;
                messageType = 'error'; 
                console.error('Serverfeil:', response);
            } else {
                const data = await response.json();
                if (data.reply) {
                    replyText = data.reply;
                } else if (data.error) {
                    replyText = `Feil fra bot: ${data.error}`;
                    messageType = 'error'; 
                } else {
                    replyText = "Fikk et uventet svar fra boten.";
                    messageType = 'error'; 
                }
            }
            
            const botMessageElement = addMessageToChat(replyText, 'bot', messageType);
            const botTimestamp = addTimestamp(botMessageElement); 
            if (messageType !== 'error') { 
                addCopyButton(botMessageElement, replyText);
            }
            chatWindow.appendChild(botMessageElement);
            saveMessageToHistory({ text: replyText, sender: 'bot', timestamp: botTimestamp, type: messageType }); 

        } catch (error) {
            removeThinkingIndicator();
            const errorText = 'Kunne ikke koble til chatbot-serveren. Sjekk at serveren kjører og at backendUrl er riktig.';
            const errorMsgElement = addMessageToChat(errorText, 'bot', 'error'); 
            const errorTimestamp = addTimestamp(errorMsgElement); 
            chatWindow.appendChild(errorMsgElement);
            saveMessageToHistory({ text: errorText, sender: 'bot', timestamp: errorTimestamp, type: 'error' }); 
            console.error('Nettverksfeil eller feil ved sending/mottak:', error);
        }
        chatWindow.scrollTop = chatWindow.scrollHeight; 
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

    if (clearChatButton) { 
        clearChatButton.addEventListener('click', () => {
            if (confirm("Er du sikker på at du vil slette chat-historikken?")) { // Lagt til bekreftelse
                clearChatHistory(); 
                loadChatHistory(); 
            }
        });
    }

    // NYTT: EVENT LISTENERS FOR MENY
    if (menuToggleButton) {
        menuToggleButton.addEventListener('click', () => {
            menuOverlay.classList.add('visible');
            // bodyElement.classList.add('no-scroll'); // For å forhindre scrolling bak
        });
    }

    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', () => {
            menuOverlay.classList.remove('visible');
            // bodyElement.classList.remove('no-scroll');
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', (event) => {
            if (event.target === menuOverlay) { // Klikk på bakgrunnen
                menuOverlay.classList.remove('visible');
                // bodyElement.classList.remove('no-scroll');
            }
        });
    }

    // --- INITIALISERING ---
    loadChatHistory(); 
});
