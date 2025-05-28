document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const bodyElement = document.body;
    const clearChatButton = document.getElementById('clear-chat-button');

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
            // Kopier den *originale* teksten, ikke den HTML-renderte
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

    // *** NY FUNKSJON FOR ENKEL MARKDOWN RENDERING ***
    function renderSimpleMarkdown(text) {
        if (typeof text !== 'string') return ''; // Sikrer at input er en streng

        // NB: Dette er en veldig enkel implementering.
        // For en robust løsning, bruk et bibliotek som 'marked.js' eller 'Showdown'.
        // Vær også forsiktig med XSS-sårbarheter når du bruker .innerHTML.
        // Et skikkelig bibliotek vil vanligvis ha "sanitizing" for å forhindre dette.

        let html = text;
        // Konverter fet tekst: **tekst** -> <strong>tekst</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Konverter kursiv tekst: *tekst* -> <em>tekst</em>
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Konverter linjeskift: \n -> <br>
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    // *** OPPDATERT addMessageToChat FUNKSJON ***
    function addMessageToChat(message, sender, type = '') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (type === 'error') {
            messageElement.classList.add('error-message');
        } else {
            messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        }

        const pElement = document.createElement('p');
        // Bruk renderSimpleMarkdown og innerHTML i stedet for textContent
        // Dette gjelder primært for bot-meldinger. Brukermeldinger vises som de er.
        if (sender === 'bot') {
            pElement.innerHTML = renderSimpleMarkdown(message);
        } else {
            pElement.textContent = message; // Brukermeldinger vises som ren tekst
        }
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
        // Meldingen i messageObject.text er allerede den originale meldingen
        // addMessageToChat vil håndtere renderingen hvis det er en bot-melding
        const messageElement = addMessageToChat(messageObject.text, messageObject.sender, messageObject.type || '');
        addTimestampFromText(messageElement, messageObject.timestamp);

        // textToCopy for kopier-knappen bør være den originale teksten
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
            // addMessageToChat vil rendre Markdown hvis boten sender det i velkomstmeldingen
            const welcomeMessageElement = addMessageToChat(welcomeText, 'bot');
            const currentTime = formatTime(new Date());
            addTimestampFromText(welcomeMessageElement, currentTime);
            // Legg til kopier-knapp med den originale teksten
            addCopyButton(welcomeMessageElement, welcomeText);
            // Lagre den originale teksten
            // saveMessageToHistory({ text: welcomeText, sender: 'bot', timestamp: currentTime, type: '' }); // Valgfritt å lagre velkomst
            chatWindow.appendChild(welcomeMessageElement);
        } else {
            history.forEach(displayMessageFromHistory);
        }
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }


    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        // Brukers melding (vises som ren tekst)
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
            let replyText; // Dette vil være den originale teksten fra boten
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

            // addMessageToChat vil nå rendre Markdown for bot-meldinger
            const botMessageElement = addMessageToChat(replyText, 'bot', messageType);
            const botTimestamp = addTimestamp(botMessageElement);
            if (messageType !== 'error') {
                // Kopier-knappen skal kopiere den *originale* teksten, ikke den renderte HTML-en
                addCopyButton(botMessageElement, replyText);
            }
            chatWindow.appendChild(botMessageElement);
            // Lagre den *originale* teksten i historikken
            saveMessageToHistory({ text: replyText, sender: 'bot', timestamp: botTimestamp, type: messageType });

        } catch (error) {
            removeThinkingIndicator();
            const errorText = 'Kunne ikke koble til chatbot-serveren. Sjekk at serveren kjører og at backendUrl er riktig.';
            // addMessageToChat vil håndtere dette som en bot-melding (men den renderes ikke som Markdown siden det er 'error')
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
            clearChatHistory();
            loadChatHistory();
        });
    }

    // --- INITIALISERING ---
    loadChatHistory();
});
