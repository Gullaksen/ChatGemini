document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // --- NYTT FOR TEMAKNAPP ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const bodyElement = document.body;
    // -------------------------

    // URL til din backend-server (DENNE MÅ ENDRES SENERE!)
    const backendUrl = 'https://b9280818-97da-4f17-9c2e-db08824cd4f1-00-2btl4c4c21klj.picard.replit.dev/chat';

    // --- NY FUNKSJON FOR TEMABYTTING ---
    const toggleTheme = () => {
        bodyElement.classList.toggle('dark-mode');
        
        // Lagre valgt tema i localStorage
        if (bodyElement.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleButton.textContent = 'Lyst Tema'; // Oppdater knappetekst
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleButton.textContent = 'Mørkt Tema'; // Oppdater knappetekst
        }
    };

    // Hent lagret tema ved lasting av siden
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        bodyElement.classList.add('dark-mode');
        if(themeToggleButton) themeToggleButton.textContent = 'Lyst Tema';
    } else {
        if(themeToggleButton) themeToggleButton.textContent = 'Mørkt Tema';
    }

    // Legg til hendelseslytter på temaknappen
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
    // ------------------------------------


    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        const pElement = document.createElement('p');
        pElement.textContent = message;
        messageElement.appendChild(pElement);
        
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
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

    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        addMessageToChat(messageText, 'user');
        userInput.value = '';
        showThinkingIndicator();

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            removeThinkingIndicator();

            if (!response.ok) {
                let errorData = { reply: `Feil: ${response.status} ${response.statusText}`};
                try {
                    errorData = await response.json();
                } catch (e) { /* Ignorer */ }
                addMessageToChat(errorData.reply || errorData.error || `Serverfeil: ${response.status}`, 'bot');
                console.error('Serverfeil:', response);
                return;
            }

            const data = await response.json();
            if (data.reply) {
                addMessageToChat(data.reply, 'bot');
            } else if (data.error) {
                addMessageToChat(`Feil fra bot: ${data.error}`, 'bot');
            } else {
                 addMessageToChat("Fikk et uventet svar fra boten.", 'bot');
            }

        } catch (error) {
            removeThinkingIndicator();
            addMessageToChat('Kunne ikke koble til chatbot-serveren. Sjekk at serveren kjører og at backendUrl er riktig.', 'bot');
            console.error('Nettverksfeil eller feil ved sending/mottak:', error);
        }
    }

    if (sendButton) { // Sjekk om knappen finnes før event listener legges til
        sendButton.addEventListener('click', sendMessage);
    }
    if (userInput) { // Sjekk om inputfeltet finnes
        userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
