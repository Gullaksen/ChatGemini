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
    const backgroundSelector = document.getElementById('background-selector'); // For bakgrunnsvalg

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
        // Oppdater menyikonfarge basert på tema (hvis header ikke alltid er blå)
        // updateMenuIconColor(); // Kan kalles her hvis nødvendig
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        bodyElement.classList.add('dark-mode');
        if(themeToggleCheckbox) themeToggleCheckbox.checked = true;
    } else {
        bodyElement.classList.remove('dark-mode');
        if(themeToggleCheckbox) themeToggleCheckbox.checked = false;
    }
    // updateMenuIconColor(); // Initial sjekk

    if (themeToggleCheckbox) {
        themeToggleCheckbox.addEventListener('change', toggleTheme);
    }

    // --- HJELPEFUNKSJONER FOR MELDINGER (din eksisterende kode) ---
    function formatTime(date) { /* ... din eksisterende ... */ }
    function addTimestamp(messageElement) { /* ... din eksisterende ... */ return currentTime; }
    function addTimestampFromText(messageElement, timestampText) { /* ... din eksisterende ... */ }
    function addCopyButton(messageElement, textToCopy) { /* ... din eksisterende ... */ }
    function addMessageToChat(message, sender, type = '') { /* ... din eksisterende ... */ return messageElement; }
    function showThinkingIndicator() { /* ... din eksisterende ... */ }
    function removeThinkingIndicator() { /* ... din eksisterende ... */ }
    
    // --- CHAT HISTORIKK (LocalStorage) (din eksisterende kode for én chat) ---
    const CHAT_HISTORY_KEY = 'gullaksenChatHistory_v2'; 
    function saveMessageToHistory(messageObject) { /* ... din eksisterende ... */ }
    function getChatHistory() { /* ... din eksisterende ... */ return historyJSON ? JSON.parse(historyJSON) : []; }
    function clearChatHistory() { /* ... din eksisterende ... */ }
    function displayMessageFromHistory(messageObject) { /* ... din eksisterende ... */ }
    function loadChatHistory() { /* ... din eksisterende ... */ }

    // --- BAKGRUNNSVALG ---
    const CHAT_BACKGROUND_KEY = 'gullaksenChatBackground';

    function applyChatBackground(bgValue) {
        chatWindow.style.backgroundColor = ''; // Nullstill inline stil først
        chatWindow.style.backgroundImage = ''; // Nullstill bilde
        chatWindow.classList.remove('bg-default', 'bg-lightgray', 'bg-lightblue', 'bg-lightgreen', 'bg-image1'); // Fjern gamle klasser

        if (bgValue.startsWith('image')) { // Hvis det er et bilde
            // Anta at du har CSS-klasser for bilder, eller sett direkte
            // chatWindow.style.backgroundImage = `url('${bgValue}.png')`; // Erstatt med faktiske bildestier
            chatWindow.classList.add(bgValue); // Forutsetter CSS-klasse som .bg-image1 { background-image: ... }
             console.log(`Applying background image class: ${bgValue}`);
        } else if (bgValue === 'default') {
            chatWindow.classList.add('bg-default'); // Bruk CSS-klasse for standard
        } else {
            // For farger, sett direkte eller bruk klasser
            // chatWindow.style.backgroundColor = bgValue; // Kan sette farge direkte
            chatWindow.classList.add(`bg-${bgValue.replace('#', '')}`); // Hvis du har klasser som .bg-f0f0f0
             console.log(`Applying background color class: bg-${bgValue.replace('#', '')}`);
        }
        localStorage.setItem(CHAT_BACKGROUND_KEY, bgValue);

        // Oppdater aktiv knapp i velgeren
        document.querySelectorAll('#background-selector .bg-choice').forEach(btn => {
            btn.classList.remove('active-bg');
            if (btn.dataset.bg === bgValue || btn.dataset.bgImage === bgValue) {
                btn.classList.add('active-bg');
            }
        });
    }
    
    if (backgroundSelector) {
        backgroundSelector.addEventListener('click', (event) => {
            if (event.target.classList.contains('bg-choice')) {
                const bgValue = event.target.dataset.bg || event.target.dataset.bgImage;
                if (bgValue) {
                    applyChatBackground(bgValue);
                }
            }
        });
    }

    function loadChatBackground() {
        const savedBg = localStorage.getItem(CHAT_BACKGROUND_KEY);
        if (savedBg) {
            applyChatBackground(savedBg);
        } else {
            applyChatBackground('default'); // Standard hvis ingenting er lagret
        }
    }


    // --- SENDMESSAGE (din eksisterende kode) ---
    async function sendMessage() { /* ... din eksisterende ... */ }

    // --- EVENT LISTENERS ---
    if (sendButton) { sendButton.addEventListener('click', sendMessage); }
    if (userInput) { userInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') sendMessage(); });}
    if (clearChatButton) { 
        clearChatButton.addEventListener('click', () => {
            if (confirm("Er du sikker på at du vil slette chat-historikken?")) {
                clearChatHistory(); 
                loadChatHistory(); 
            }
        });
    }

    // NYTT: EVENT LISTENERS FOR MENY
    if (menuToggleButton) {
        menuToggleButton.addEventListener('click', () => {
            menuOverlay.classList.add('visible');
            // bodyElement.classList.add('no-scroll'); // Vurder for å låse bakgrunnsscroll
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
    loadChatBackground(); // Last lagret bakgrunn

    // Kopier inn dine eksisterende funksjoner her:
    // formatTime, addTimestamp, addTimestampFromText, addCopyButton, addMessageToChat,
    // showThinkingIndicator, removeThinkingIndicator, saveMessageToHistory, getChatHistory,
    // clearChatHistory, displayMessageFromHistory, loadChatHistory, sendMessage.
});
