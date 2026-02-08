// Foydalanuvchilar ro'yxati (simulyatsiya)
let onlineUsers = 1235;

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Har qanday login qabul qilish
    if (username === "" || password === "") {
        showMessage("Please enter both username and password", "warning");
        return;
    }
    
    // Login effekti
    const button = document.querySelector('.login-btn');
    const originalHTML = button.innerHTML;
    
    button.innerHTML = `
        <i class="fas fa-satellite fa-spin"></i>
        <span>CONNECTING TO UNIVERSE NETWORK...</span>
    `;
    button.disabled = true;
    
    // Online foydalanuvchilar sonini oshirish
    onlineUsers++;
    document.querySelector('.stats .number:first-child').textContent = onlineUsers.toLocaleString();
    
    // 2 soniya kutish (simulyatsiya)
    setTimeout(() => {
        // Login ma'lumotlarini saqlash (faqat frontend)
        const userData = {
            username: username || "Explorer_" + Math.floor(Math.random() * 10000),
            loginTime: new Date().toISOString(),
            sessionId: 'session_' + Math.random().toString(36).substr(2, 9)
        };
        
        localStorage.setItem('spaceExplorer', JSON.stringify(userData));
        
        // Universumga yo'naltirish
        window.location.href = "universe.html";
    }, 2000);
}

function showMessage(text, type) {
    // Mavjud xabarlarni o'chirish
    const existingMessage = document.querySelector('.message');
    if (existingMessage) existingMessage.remove();
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${text}</span>
    `;
    
    // Styling
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? 'rgba(255, 100, 100, 0.9)' : 'rgba(76, 201, 240, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    document.body.appendChild(message);
    
    // 4 soniyadan keyin o'chirish
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 4000);
}

// Animation CSS qo'shish
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Enter bilan login
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // Random username generatsiya
    const usernameInput = document.getElementById('username');
    if (usernameInput.value === '') {
        const randomNames = [
            "Astronaut_42",
            "Cosmic_Explorer",
            "Star_Voyager",
            "Galaxy_Seeker",
            "Space_Pioneer",
            "Quantum_Traveler"
        ];
        usernameInput.value = randomNames[Math.floor(Math.random() * randomNames.length)];
    }
    
    // Auto-fill password
    document.getElementById('password').value = "explore2024";
});