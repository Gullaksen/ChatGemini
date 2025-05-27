document.addEventListener('DOMContentLoaded', () => {
    // DOM elementer
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');
    const bodyElement = document.body;
    const clearChatButton = document.getElementById('clear-chat-button');
    const newChatButton = document.getElementById('new-chat-button'); 
    const chatListElement = document.getElementById('chat-list'); 
    const chatTitleElement = document.getElementById('chat-title'); // For dynamisk tittel

    const backendUrl = 'https://b9280818-97da-4f17-9c2e-db08824cd4f1-00-2btl4c4c21klj.picard.replit.dev/chat';

    // --- NØKLER OG VARIABLER FOR FLERE CHATTER ---
    const ALL_CHATS_STORAGE_KEY = 'gullaksenAllChats_v1'; // Endret fra CHAT_HISTORY_KEY
    let currentActiveChatId = null;

    // --- TEMABYTTING (din eksisterende kode) ---
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

    // --- HJELPEFUNKSJONER FOR MELDINGER (formatTime, addCopyButton, addMessageToChat, etc.) ---
    // Disse er stort sett som din eksisterende kode, men tilpasset for den nye logikken.
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
        copyBtn.addEventListener('click', (e) => { /* ... din eksisterende kopieringslogikk ... */ 
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

    function showThinkingIndicator() { /* ... din eksisterende ... */ }
    function removeThinkingIndicator() { /* ... din eksisterende ... */ }
    
    // --- NY/OPPDATERT CHAT DATA HÅNDTERING ---
    function getAllChatsData() {
        const data = localStorage.getItem(ALL_CHATS_STORAGE_KEY);
        try {
            const parsedData = data ? JSON.parse(data) : { activeChatId: null, chats: {} };
            if (!parsedData.chats) parsedData.chats = {};
            return parsedData;
        } catch (e) {
            console.error("Feil parsing av allChatsData:", e);
            return { activeChatId: null, chats: {} };
        }
    }

    function saveAllChatsData(allChatsData) {
        try {
            localStorage.setItem(ALL_CHATS_STORAGE_KEY, JSON.stringify(allChatsData));
        } catch (e) { console.error("Feil lagring allChatsData:", e); }
    }

    function getActiveChatHistory() {
        if (!currentActiveChatId) return [];
        const allChats = getAllChatsData();
        return allChats.chats[currentActiveChatId] || [];
    }

    function saveMessageToCurrentChat(messageObject) {
        if (!currentActiveChatId) return;
        const allChats = getAllChatsData();
        if (!allChats.chats[currentActiveChatId]) {
            allChats.chats[currentActiveChatId] = [];
        }
        allChats.chats[currentActiveChatId].push(messageObject);
        saveAllChatsData(allChats);
    }
    
    function createNewChat() {
        const allChats = getAllChatsData();
        const newChatId = `chat-${Date.now()}`;
        currentActiveChatId = newChatId;

        allChats.chats[newChatId] = []; 
        allChats.activeChatId = newChatId;
        
        const welcomeText = "Ny samtale startet. Hvordan kan jeg hjelpe deg?";
        const currentTime = formatTime(new Date());
        const welcomeMessageObject = { text: welcomeText, sender: 'bot', timestamp: currentTime, type: '' };
        allChats.chats[newChatId].push(welcomeMessageObject); // Legg velkomst til den nye chatten
        
        saveAllChatsData(allChats);
        
        renderChatList(); 
        loadActiveChatContent(); 
        userInput.focus();
    }

    function switchActiveChat(chatId) {
        if (!chatId || chatId === currentActiveChatId) return;
        const allChats = getAllChatsData();
        if (!allChats.chats[chatId]) {
            console.warn(`Chat ID ${chatId} ikke funnet.`);
            return;
        }
        currentActiveChatId = chatId;
        allChats.activeChatId = chatId;
        saveAllChatsData(allChats);
        renderChatList(); 
        loadActiveChatContent(); 
    }

    function loadActiveChatContent() {
        chatWindow.innerHTML = ''; 
        const history = getActiveChatHistory();
        history.forEach(messageObject => { 
            const messageElement = addMessageToChat(messageObject.text, messageObject.sender, messageObject.type || '');
            addTimestampFromText(messageElement, messageObject.timestamp);
            if (messageObject.sender === 'bot' && (!messageObject.type || messageObject.type !== 'error')) {
                addCopyButton(messageElement, messageObject.text);
            }
            chatWindow.appendChild(messageElement);
        });
        chatWindow.scrollTop = chatWindow.scrollHeight;
        updateChatUITitle();
    }
    
    function updateChatUITitle() { 
        if (!chatTitleElement) return;
        if (currentActiveChatId) {
            const history = getActiveChatHistory();
            if (history.length > 0 && history[0].text) {
                let title = history[0].text.substring(0, 25);
                if (history[0].text.length > 25) title += "...";
                chatTitleElement.textContent = title;
            } else {
                 chatTitleElement.textContent = "Ny Chat"; 
            }
        } else {
            chatTitleElement.textContent = "Gullaksen Chatbot";
        }
    }

    function renderChatList() {
        chatListElement.innerHTML = ''; 
        const allChats = getAllChatsData();
        const sortedChatIds = Object.keys(allChats.chats).sort((a, b) => {
            const timeA = parseInt(a.split('-')[1]);
            const timeB = parseInt(b.split('-')[1]);
            return timeB - timeA; // Nyeste først
        });

        sortedChatIds.forEach(chatId => {
            const chatHistory = allChats.chats[chatId];
            let chatTitle = `Chat (${formatTime(new Date(parseInt(chatId.split('-')[1])))})`; 
            if (chatHistory && chatHistory.length > 0 && chatHistory[0].text) {
                chatTitle = chatHistory[0].text.substring(0, 25); 
                if (chatHistory[0].text.length > 25) chatTitle += "...";
            } else if (chatHistory && chatHistory.length === 0) {
                 chatTitle = "Tom chat...";
            }


            const listItem = document.createElement('li');
            listItem.classList.add('chat-list-item');
            listItem.textContent = chatTitle;
            listItem.dataset.chatId = chatId; 

            if (chatId === currentActiveChatId) {
                listItem.classList.add('active-chat');
            }
            listItem.addEventListener('click', () => switchActiveChat(chatId));
            chatListElement.appendChild(listItem);
        });
    }

    async function sendMessage() {
        if (!currentActiveChatId) {
            // alert("Vennligst velg eller lag en ny chat først.");
            console.log("Ingen aktiv chat, lager en ny.");
            createNewChat(); // Lag en ny chat hvis ingen er aktiv
            // Vent med å sende meldingen til den nye chatten er klar,
            // eller la brukeren skrive på nytt. For enkelhet, la brukeren skrive på nytt.
            if (!currentActiveChatId) return; // Hvis createNewChat feilet av en eller annen grunn
        }
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        const userMessageElement = addMessageToChat(messageText, 'user');
        const userTimestamp = addTimestamp(userMessageElement); 
        chatWindow.appendChild(userMessageElement);
        saveMessageToCurrentChat({ text: messageText, sender: 'user', timestamp: userTimestamp, type: '' });
        
        if (getActiveChatHistory().length === 1) renderChatList(); // Oppdater tittel i listen hvis det er første melding

        userInput.value = '';
        showThinkingIndicator(); 

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }), // Sender kun siste melding
            });
            removeThinkingIndicator();
            let replyText;
            let messageType = ''; 
            if (!response.ok) {
                let errorData = { reply: `Feil: ${response.status} ${response.statusText}`};
                try { errorData = await response.json(); } catch (e) { /* Ignorer */ }
                replyText = errorData.reply || errorData.error || `Serverfeil: ${response.status}`;
                messageType = 'error'; 
            } else {
                const data = await response.json();
                if (data.reply) replyText = data.reply;
                else if (data.error) { replyText = `Feil fra bot: ${data.error}`; messageType = 'error'; }
                else { replyText = "Fikk et uventet svar fra boten."; messageType = 'error';}
            }
            const botMessageElement = addMessageToChat(replyText, 'bot', messageType);
            const botTimestamp = addTimestamp(botMessageElement); 
            if (messageType !== 'error') addCopyButton(botMessageElement, replyText);
            chatWindow.appendChild(botMessageElement);
            saveMessageToCurrentChat({ text: replyText, sender: 'bot', timestamp: botTimestamp, type: messageType });
            if (getActiveChatHistory().filter(m => m.sender === 'bot').length === 1) renderChatList(); // Oppdater tittel

        } catch (error) {
            removeThinkingIndicator();
            const errorText = 'Kunne ikke koble til chatbot-serveren.';
            const errorMsgElement = addMessageToChat(errorText, 'bot', 'error'); 
            const errorTimestamp = addTimestamp(errorMsgElement); 
            chatWindow.appendChild(errorMsgElement);
            saveMessageToCurrentChat({ text: errorText, sender: 'bot', timestamp: errorTimestamp, type: 'error' }); 
            console.error('Nettverksfeil:', error);
        }
        chatWindow.scrollTop = chatWindow.scrollHeight; 
    }

    // --- EVENT LISTENERS ---
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (userInput) userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage();});
    if (newChatButton) newChatButton.addEventListener('click', createNewChat);

    if (clearChatButton) { 
        clearChatButton.addEventListener('click', () => {
            if (!currentActiveChatId) {
                alert("Ingen aktiv chat å slette.");
                return;
            }
            if (confirm(`Er du sikker på at du vil slette chatten "${chatTitleElement.textContent}"? Dette kan ikke angres.`)) {
                const allChats = getAllChatsData();
                delete allChats.chats[currentActiveChatId]; 
                const remainingChatIds = Object.keys(allChats.chats);
                if (remainingChatIds.length > 0) {
                    // Sorter gjenværende chatter for å velge den nyeste som aktiv
                    const sortedRemaining = remainingChatIds.sort((a,b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]));
                    currentActiveChatId = sortedRemaining[0];
                    allChats.activeChatId = currentActiveChatId;
                } else {
                    currentActiveChatId = null; 
                    allChats.activeChatId = null;
                }
                saveAllChatsData(allChats);
                renderChatList();
                if (currentActiveChatId) {
                    loadActiveChatContent();
                } else {
                    // Hvis ingen chatter igjen, lag en ny automatisk
                    createNewChat();
                }
            }
        });
    }

    // --- INITIALISERING APP ---
    function initializeApp() {
        const allChats = getAllChatsData();
        currentActiveChatId = allChats.activeChatId;

        if (!currentActiveChatId && Object.keys(allChats.chats).length > 0) {
            const sortedChatIds = Object.keys(allChats.chats).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]));
            currentActiveChatId = sortedChatIds[0]; // Velg den nyeste
            allChats.activeChatId = currentActiveChatId;
            saveAllChatsData(allChats);
        } else if (Object.keys(allChats.chats).length === 0) { // Ingen chatter i det hele tatt
            createNewChat(); 
            return; 
        }
        
        renderChatList();
        if (currentActiveChatId) { // Sørg for at en chat faktisk er aktiv før lasting
            loadActiveChatContent();
        } else if (Object.keys(allChats.chats).length > 0) { // Fallback hvis activeChatId var null, men chatter finnes
             createNewChat(); // Eller velg første
        }
    }

    initializeApp(); 
});
