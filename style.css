/* Din eksisterende CSS (fra input_file_0.js) ... */
body {
    font-family: sans-serif;
    display: flex; /* Endret for app-container */
    /* justify-content: center; Fjerner disse da app-container styrer layout */
    /* align-items: center; */
    min-height: 100vh;
    margin: 0;
    background-color: #f0f0f0; 
    color: #333; 
    padding: 0; /* Endret til 0 for fullskjermslayout */
    box-sizing: border-box;
    transition: background-color 0.3s, color 0.3s; 
}

/* NYTT: Layout for hele appen */
#app-container {
    display: flex;
    width: 100vw; 
    height: 100vh; 
    box-sizing: border-box;
}

#sidebar {
    width: 280px; /* Økt bredde litt */
    background-color: #f9f9f9; /* Lysere enn bot-melding for bedre kontrast */
    border-right: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transition: background-color 0.3s, border-color 0.3s;
    flex-shrink: 0; /* Forhindre at sidemenyen krymper */
}

#sidebar-header {
    padding: 15px 20px; /* Økt horisontal padding */
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff; /* Hvit bakgrunn for header */
}

#sidebar-header h2 {
    margin: 0;
    font-size: 1.1em; /* Litt mindre for å passe bedre */
    color: #333;
    font-weight: 600;
}

#new-chat-button {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 18px; /* Mer avrundet */
    padding: 7px 14px; /* Litt mindre padding */
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 500;
    transition: background-color 0.2s;
}
#new-chat-button:hover {
    background-color: #0056b3;
}

#chat-list {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1; 
}

.chat-list-item {
    padding: 12px 20px; /* Økt horisontal padding */
    cursor: pointer;
    border-bottom: 1px solid #eee; /* Lysere skillelinje */
    font-size: 0.9em;
    color: #333;
    transition: background-color 0.2s, color 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; 
}

.chat-list-item:last-child {
    border-bottom: none;
}

.chat-list-item:hover {
    background-color: #e9e9eb;
}

.chat-list-item.active-chat {
    background-color: #007bff;
    color: white;
    font-weight: 600; /* Litt tykkere for aktiv */
}
.chat-list-item.active-chat:hover { /* Sørg for at hover ikke overstyrer aktiv farge */
    background-color: #0069d9;
}


/* Juster #chat-container for å passe ved siden av sidemenyen */
#chat-container {
    flex-grow: 1; 
    height: 100vh; 
    max-height: 100vh; /* Endret fra none for å unngå dobbel scrollbar med body */
    /* Eksisterende #chat-container stiler beholdes for indre layout */
    background-color: #fff; /* Standard bakgrunn */
    border-radius: 0; /* Fjern radius hvis det var satt før */
    box-shadow: none; /* Fjerner skygge hvis den var satt direkte her */
    display: flex;
    flex-direction: column;
    overflow: hidden; 
    position: relative; 
    transition: background-color 0.3s, box-shadow 0.3s;
}

#chat-container h1 { /* Overstyrer for å passe i ny layout */
    font-size: 1.2em; /* Mindre for å passe bedre */
    text-align: left; /* Venstrejustert tittel for chatten */
    padding: 18px 20px; /* Justert padding */
    /* margin: 0; */ /* Beholdes */
    /* background-color: #007bff; */ /* Beholdes */
    /* color: white; */ /* Beholdes */
    border-bottom: 1px solid #ddd; /* Beholdes */
    /* transition: ... */ /* Beholdes */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}


/* ... resten av din eksisterende CSS (message, user-message, bot-message, error-message, input-area, etc.) ... */
/* Sørg for at .theme-toggle-container posisjoneres relativt til #chat-container (ikke body) */
.theme-toggle-container {
    position: absolute; /* Beholdt fra din kode */
    top: 22px; 
    right: 20px; 
    z-index: 10; 
}

#chat-window {
    flex-grow: 1;
    padding: 15px;
    overflow-y: auto;
    border-bottom: 1px solid #ddd; /* Kan fjernes hvis #input-area har top-border */
    display: flex;
    flex-direction: column;
    background-color: #f9f9f9; /* Din eksisterende */
    transition: background-color 0.3s, border-color 0.3s;
}

.message {
    max-width: 80%;
    margin-bottom: 10px;
    padding: 10px 15px;
    border-radius: 18px;
    line-height: 1.4;
    transition: background-color 0.3s, color 0.3s;
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.user-message { /* ... din eksisterende ... */ }
.bot-message { /* ... din eksisterende ... */ }
.error-message { /* ... din eksisterende ... */ }
.error-message p::before { /* ... din eksisterende ... */ }
.message p { /* ... din eksisterende ... */ }
#input-area { /* ... din eksisterende ... */ }
#user-input { /* ... din eksisterende ... */ }
#user-input::placeholder { /* ... din eksisterende ... */ }
#send-button { /* ... din eksisterende ... */ }
#send-button:hover { /* ... din eksisterende ... */ }
.thinking { /* ... din eksisterende ... */ }
.disclaimer-text { /* ... din eksisterende ... */ }
.message-meta { /* ... din eksisterende ... */ }
.user-message .message-meta { /* ... din eksisterende ... */ }
.bot-message .message-meta { /* ... din eksisterende ... */ }
.error-message .message-meta { /* ... din eksisterende ... */ }
.copy-button { /* ... din eksisterende ... */ }
.copy-button:hover { /* ... din eksisterende ... */ }
#chat-controls { /* ... din eksisterende ... */ }
#clear-chat-button { /* ... din eksisterende ... */ }


/* --- Mørk modus for sidemeny og justeringer --- */
body.dark-mode #sidebar {
    background-color: #2c2c2c;
    border-right: 1px solid #3f3f3f; /* Litt lysere enn bakgrunn */
}

body.dark-mode #sidebar-header {
    background-color: #333333; /* Samme som dark-mode #chat-container */
    border-bottom: 1px solid #3f3f3f;
}

body.dark-mode #sidebar-header h2 {
    color: #e0e0e0;
}

body.dark-mode #new-chat-button {
    background-color: #0069d9;
}
body.dark-mode #new-chat-button:hover {
    background-color: #0056b3;
}

body.dark-mode #chat-list-item {
    border-bottom: 1px solid #3a3a3a; /* Mørkere skillelinje */
    color: #ccc;
}

body.dark-mode #chat-list-item:hover {
    background-color: #383838;
}

body.dark-mode #chat-list-item.active-chat {
    background-color: #005aaa;
    color: white;
}
body.dark-mode #chat-list-item.active-chat:hover {
    background-color: #004c96;
}

/* ... resten av din eksisterende DARK MODE CSS ... */
body.dark-mode #chat-container { /* ... din eksisterende ... */ }
body.dark-mode #chat-container h1 { /* Sørg for at tittelen i mørk modus også er synlig */
    background-color: #0056b3; /* Fra din eksisterende H1 dark mode */
    color: #f0f0f0; /* Fra din eksisterende H1 dark mode */
    border-bottom: 1px solid #444; /* Fra din eksisterende H1 dark mode */
}
body.dark-mode .switch input:not(:checked) + .slider { /* ... din eksisterende ... */ }
body.dark-mode .switch input:checked + .slider { /* ... din eksisterende ... */ }
body.dark-mode #chat-window { /* ... din eksisterende ... */ }
body.dark-mode .bot-message { /* ... din eksisterende ... */ }
body.dark-mode .error-message { /* ... din eksisterende ... */ }
body.dark-mode .user-message { /* ... din eksisterende ... */ }
body.dark-mode #input-area { /* ... din eksisterende ... */ }
body.dark-mode #user-input { /* ... din eksisterende ... */ }
body.dark-mode #user-input::placeholder { /* ... din eksisterende ... */ }
body.dark-mode #send-button { /* ... din eksisterende ... */ }
body.dark-mode #send-button:hover { /* ... din eksisterende ... */ }
body.dark-mode .thinking { /* ... din eksisterende ... */ }
body.dark-mode .disclaimer-text { /* ... din eksisterende ... */ }
body.dark-mode .message-meta { /* ... din eksisterende ... */ }
body.dark-mode .user-message .message-meta { /* ... din eksisterende ... */ }
body.dark-mode .error-message .message-meta { /* ... din eksisterende ... */ }
body.dark-mode .copy-button { /* ... din eksisterende ... */ }
body.dark-mode #clear-chat-button { /* ... din eksisterende ... */ }
