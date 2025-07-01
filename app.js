// Inisialisasi
const character = document.getElementById('character');
const speechBubble = document.getElementById('speech-bubble');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const listenBtn = document.getElementById('listen-btn');
const chatHistory = document.getElementById('chat-history');
const feedBtn = document.getElementById('feed-btn');
const playBtn = document.getElementById('play-btn');
const cleanBtn = document.getElementById('clean-btn');

// State karakter
let state = 'idle';
let happiness = 50;
let hunger = 50;
let cleanliness = 50;

// Register Service Worker untuk PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Fungsi untuk menampilkan pesan di chat
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Fungsi untuk menampilkan speech bubble
function showSpeech(text) {
    speechBubble.textContent = text;
    speechBubble.style.opacity = 1;
    
    setTimeout(() => {
        speechBubble.style.opacity = 0;
    }, 3000);
}

// Fungsi untuk mengirim pertanyaan ke DeepSeek AI
async function askDeepSeek(question) {
    try {
        // Ganti dengan API key dan endpoint DeepSeek yang sebenarnya
        // Ini hanya contoh, Anda perlu menyesuaikan dengan API DeepSeek yang tersedia
        const response = await fetch(window.config.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ${window.config.DEEPSEEK_API_KEY}',
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "Kamu adalah Ubur, teman bicara yang ramah dan membantu. Jawablah dengan santai dan friendly."
                    },
                    {
                        role: "user",
                        content: question
                    }
                ],
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        return "Maaf, aku sedang tidak bisa menjawab sekarang. Coba lagi nanti ya!";
    }
}

// Event listeners
sendBtn.addEventListener('click', async () => {
    const question = userInput.value.trim();
    if (question) {
        addMessage(question, true);
        userInput.value = '';
        
        // Tampilkan animasi berpikir
        character.classList.remove('idle', 'eating', 'playing');
        character.classList.add('thinking');
        showSpeech("...");
        
        // Dapatkan jawaban dari DeepSeek
        const answer = await askDeepSeek(question);
        
        // Kembalikan ke animasi idle
        character.classList.remove('thinking');
        character.classList.add('idle');
        
        // Tampilkan jawaban
        addMessage(answer, false);
        showSpeech(answer);
        
        // Tingkatkan kebahagiaan
        happiness = Math.min(100, happiness + 5);
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

// Fitur voice recognition
listenBtn.addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            listenBtn.style.backgroundColor = '#e74c3c';
            showSpeech("Aku mendengarkan...");
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            listenBtn.style.backgroundColor = '';
        };
        
        recognition.onend = () => {
            listenBtn.style.backgroundColor = '';
        };
        
        recognition.start();
    } else {
        alert('Browser tidak mendukung voice recognition');
    }
});

// Aksi karakter
feedBtn.addEventListener('click', () => {
    character.classList.remove('idle', 'playing');
    character.classList.add('eating');
    showSpeech("Nyam.. nyam.. terima kasih!");
    
    setTimeout(() => {
        character.classList.remove('eating');
        character.classList.add('idle');
    }, 2000);
    
    hunger = Math.max(0, hunger - 20);
    happiness = Math.min(100, happiness + 10);
});

playBtn.addEventListener('click', () => {
    character.classList.remove('idle', 'eating');
    character.classList.add('playing');
    showSpeech("Yey! Ayo main!");
    
    setTimeout(() => {
        character.classList.remove('playing');
        character.classList.add('idle');
    }, 2000);
    
    happiness = Math.min(100, happiness + 15);
    hunger = Math.min(100, hunger + 10);
});

cleanBtn.addEventListener('click', () => {
    showSpeech("Aku jadi bersih lagi!");
    cleanliness = 100;
});

// Update status karakter secara berkala
setInterval(() => {
    hunger = Math.min(100, hunger + 1);
    happiness = Math.max(0, happiness - 0.5);
    cleanliness = Math.max(0, cleanliness - 0.3);
    
    if (hunger > 80) {
        showSpeech("Aku lapar...");
    }
    
    if (happiness < 20) {
        showSpeech("Aku bosan...");
    }
    
    if (cleanliness < 30) {
        showSpeech("Aku kotor...");
    }
}, 60000);

// PWA Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Tampilkan button install
    setTimeout(() => {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-btn';
        installBtn.textContent = 'Install Aplikasi';
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.left = '50%';
        installBtn.style.transform = 'translateX(-50%)';
        installBtn.style.zIndex = '1000';
        document.body.appendChild(installBtn);
        
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted install');
                } else {
                    console.log('User dismissed install');
                }
                deferredPrompt = null;
            });
        });
    }, 5000);
});
