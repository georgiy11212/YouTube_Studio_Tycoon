const INITIAL_CONFIG = {
    channelName: "",                
    startSubscribers: 0,            
    startDollars: 0,
    startYoutuberts: 0,       
};

let game = {
    channelName: INITIAL_CONFIG.channelName,
    subscribers: INITIAL_CONFIG.startSubscribers,
    dollars: INITIAL_CONFIG.startDollars,
    youtuberts: INITIAL_CONFIG.startYoutuberts,
    timerSeconds: 60,
    baseAdvanceBonus: 1,
    currentTimerReduction: 0, 
    styleLevel: 0,
    uiThemeLevel: 0,
    wheelMultiplier: 1,
    superActionActive: false,
    boostx10Active: false
};

// Динамічний розрахунок бонусу за випередження з урахуванням множника x10
function getEffectiveAdvanceBonus() {
    let bonus = game.baseAdvanceBonus;
    if (game.boostx10Active) bonus *= 10;
    return bonus;
}

// YouTube Play Buttons (Досягнення за підписниками)
const playButtons = [
    { id: 'btn_silver', name: 'Срібна кнопка', threshold: 100000, icon: 'fa-play', color: 'text-gray-300 border-gray-400 bg-gray-900/80' },
    { id: 'btn_gold', name: 'Золота кнопка', threshold: 1000000, icon: 'fa-play', color: 'text-yellow-400 border-yellow-500 bg-yellow-950/40' },
    { id: 'btn_diamond', name: 'Діамантова кнопка', threshold: 10000000, icon: 'fa-play', color: 'text-cyan-400 border-cyan-500 bg-cyan-950/40' },
    { id: 'btn_ruby', name: 'Рубінова кнопка', threshold: 50000000, icon: 'fa-play', color: 'text-red-500 border-red-500 bg-red-950/40' },
    { id: 'btn_red_diamond', name: 'Діамантова кнопка (Червона)', threshold: 100000000, icon: 'fa-play', color: 'text-youtube border-youtube bg-youtube/10' },
    { id: 'btn_custom', name: 'Кастомна кнопка Tycoon', threshold: 500000000, icon: 'fa-crown', color: 'text-purple-400 border-purple-500 bg-purple-950/40' },
    { id: 'btn_legendary', name: 'Легендарна кнопка Всесвіту', threshold: 1000000000, icon: 'fa-meteor', color: 'text-emerald-400 border-emerald-500 bg-emerald-950/40' },
];

// Notification History Storage
let notificationsHistory = [];
let unreadCount = 0;

// Shop Items Data: Ютуберки -> Скорочення таймеру
const youturbertsTimerShop = [
    { id: 't10', name: 'Скорочення таймера -10%', cost: 10, type: 'timer', value: 0.1, desc: 'Зменшує час нарахування підписників на 10%' },
    { id: 't25', name: 'Скорочення таймера -25%', cost: 25, type: 'timer', value: 0.25, desc: 'Зменшує час нарахування підписників на 25%' },
    { id: 't50', name: 'Скорочення таймера -50%', cost: 50, type: 'timer', value: 0.5, desc: 'Зменшує час нарахування підписників на 50%' },
    { id: 't100', name: 'Скорочення таймера -100%', cost: 1000, type: 'timer', value: 1.0, desc: 'Миттєве нарахування підписників (мінімальний час 1с)' },
    { id: 't2000', name: '🌀 Скорочення таймеру -2000%', cost: 25000000, type: 'timer', value: 20.0, desc: 'Супер неможливе скорочення таймеру на 2000%' },
    { id: 't5000', name: '⚡ Скорочення таймеру -5000%', cost: 100000000, type: 'timer', value: 50.0, desc: 'Космічно неможливе скорочення таймеру на 5000%' },
];

// Shop Items Data: Ютуберки -> Кількість підписників
const youturbertsSubsShop = [
    { id: 'b2', name: 'Випереджений час +2', cost: 15, type: 'advance', value: 2, desc: 'Додає +2 підписників за цикл' },
    { id: 'b5', name: 'Випереджений час +5', cost: 35, type: 'advance', value: 5, desc: 'Додає +5 підписників за цикл' },
    { id: 'b10', name: 'Випереджений час +10', cost: 70, type: 'advance', value: 10, desc: 'Додає +10 підписників за цикл' },
    { id: 'b25', name: 'Випереджений час +25', cost: 150, type: 'advance', value: 25, desc: 'Додає +25 підписників за цикл' },
    { id: 'b50', name: 'Випереджений час +50', cost: 300, type: 'advance', value: 50, desc: 'Додає +50 підписників за цикл' },
    { id: 'b10000', name: '🚀 Підписники +10,000', cost: 50000000, type: 'advance', value: 10000, desc: 'Супер неможлива акція: +10,000 підписників за цикл' },
    { id: 'b20000', name: '🌌 Підписники +20,000', cost: 150000000, type: 'advance', value: 20000, desc: 'Неймовірна космічна акція: +20,000 підписників за цикл' },
];

// Shop Items Data: Долари
const dollarsShop = [
    { id: 's1', name: 'Стиль: Неон Studio', cost: 100, level: 1, desc: 'Стильне неонове оформлення каналу' },
    { id: 's2', name: 'Стиль: Кіберпанк 2077', cost: 500, level: 2, desc: 'Футуристичний дизайн студії' },
    { id: 's3', name: 'Стиль: Преміум Gold', cost: 2000, level: 3, desc: 'Золота студія елітного ютубера' },
    { id: 's4', name: 'Стиль: Космічний Legend', cost: 10000, level: 4, desc: 'Легендарний міжгалактичний статус' },
    
    // Акції на інтерфейс від 50,000 до 1,000,000 доларів
    { id: 'ui1', name: 'Інтерфейс: Obsidian Dark', cost: 50000, theme: 1, desc: 'Глибока преміальна темна тема всього інтерфейсу' },
    { id: 'ui2', name: 'Інтерфейс: Crimson Night', cost: 120000, theme: 2, desc: 'Агресивний бордово-червоний стиль сайту' },
    { id: 'ui3', name: 'Інтерфейс: Emerald Matrix', cost: 250000, theme: 3, desc: 'Стильний зелений хакерський інтерфейс сайту' },
    { id: 'ui4', name: 'Інтерфейс: Royal Amethyst', cost: 500000, theme: 4, desc: 'Розкішний фіолетовий дизайн всієї платформи' },
    { id: 'ui5', name: 'Інтерфейс: Supreme Titanium', cost: 1000000, theme: 5, desc: 'Ультра-дорогий титановий інтерфейс студії' },

    // Супер акція за 5 000 000 доларів
    { id: 'super1', name: '⚡ СУПЕР АКЦІЯ СТУДІЇ', cost: 5000000, type: 'super', desc: 'Перетворює нарахування підписників рівно на КОЖНУ СЕКУНДУ та суттєво прискорює ріст!' },
    
    // Нова акція за 50 000 000 доларів
    { id: 'boost10', name: '🚀 Експоненціальний Буст x10', cost: 50000000, type: 'boost10', desc: 'Множить кількість підписників через таймер, нагороди з акцій та з колеса фортуни рівно на 10!' }
];

let wheelPrizes = [
    { type: 'dollars', val: 1, text: '$1 Долар' },
    { type: 'youtuberts', val: 1, text: '1 Ютуберка' },
    { type: 'dollars', val: 5, text: '$5 Доларів' },
    { type: 'youtuberts', val: 5, text: '5 Ютуберок' },
    { type: 'dollars', val: 10, text: '$10 Доларів' },
    { type: 'dollars', val: 1, text: '$1 Долар' },
];

let currentTimeLeft = 1;
let wheelIsSpinning = false;
let gameInterval = null;
let unlockedButtons = new Set();

// DOM Elements
const nameModal = document.getElementById('nameModal');
const channelNameInput = document.getElementById('channelNameInput');
const saveChannelNameBtn = document.getElementById('saveChannelNameBtn');
const displayChannelName = document.getElementById('displayChannelName');
const channelAvatar = document.getElementById('channelAvatar');
const subscribersDisplay = document.getElementById('subscribersDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const advanceBonusDisplay = document.getElementById('advanceBonusDisplay');
const countdownDisplay = document.getElementById('countdownDisplay');
const progressBar = document.getElementById('progressBar');
const dollarsDisplay = document.getElementById('dollarsDisplay');
const yoututbertsDisplay = document.getElementById('youtubertsDisplay');

const shopYoutubertsTimer = document.getElementById('shopYoutubertsTimer');
const shopYoutubertsSubs = document.getElementById('shopYoutubertsSubs');
const shopDollars = document.getElementById('shopDollars');
const youtubertsSubtabs = document.getElementById('youtubertsSubtabs');
const playButtonsGrid = document.getElementById('playButtonsGrid');

const spinWheelBtn = document.getElementById('spinWheelBtn');
const wheelRewardText = document.getElementById('wheelRewardText');
const channelCard = document.getElementById('channelCard');
const appBody = document.getElementById('appBody');

const toggleNotificationsBtn = document.getElementById('toggleNotificationsBtn');
const notificationsDropdown = document.getElementById('notificationsDropdown');
const notificationsList = document.getElementById('notificationsList');
const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
const notifBadge = document.getElementById('notifBadge');

// Notification System
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (container) {
        const notif = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-youtube' : 'bg-blue-600';
        notif.className = `${bgColor} text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto flex items-center gap-2`;
        notif.innerHTML = `<i class="fa-solid fa-bell"></i> ${message}`;
        container.appendChild(notif);

        setTimeout(() => notif.classList.remove('translate-y-2', 'opacity-0'), 10);
        setTimeout(() => {
            notif.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    notificationsHistory.unshift({ message, type, time: timeStr });
    if (notificationsHistory.length > 20) notificationsHistory.pop();

    unreadCount++;
    updateNotificationsUI();
}

function updateNotificationsUI() {
    if (!notifBadge || !notificationsList) return;

    if (unreadCount > 0) {
        notifBadge.textContent = unreadCount;
        notifBadge.classList.remove('hidden');
    } else {
        notifBadge.classList.add('hidden');
    }

    if (notificationsHistory.length === 0) {
        notificationsList.innerHTML = `<div class="text-center text-gray-500 text-xs py-8">Поки немає жодних сповіщень</div>`;
        return;
    }

    notificationsList.innerHTML = notificationsHistory.map(n => {
        const iconColor = n.type === 'success' ? 'text-emerald-400' : n.type === 'error' ? 'text-youtube' : 'text-blue-400';
        return `
            <div class="bg-ytbg/80 border border-ytborder/55 p-2.5 rounded-xl text-xs space-y-1">
                <div class="flex items-center justify-between text-gray-400">
                    <span class="flex items-center gap-1.5 font-medium ${iconColor}"><i class="fa-solid fa-circle text-[6px]"></i> Студія</span>
                    <span>${n.time}</span>
                </div>
                <div class="text-gray-200">${n.message}</div>
            </div>
        `;
    }).join('');
}

// Toggle Notifications Dropdown
if (toggleNotificationsBtn && notificationsDropdown) {
    toggleNotificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationsDropdown.classList.toggle('hidden');
        if (!notificationsDropdown.classList.contains('hidden')) {
            unreadCount = 0;
            updateNotificationsUI();
        }
    });

    document.addEventListener('click', (e) => {
        if (!notificationsDropdown.contains(e.target) && !toggleNotificationsBtn.contains(e.target)) {
            notificationsDropdown.classList.add('hidden');
        }
    });
}

if (clearNotificationsBtn) {
    clearNotificationsBtn.addEventListener('click', () => {
        notificationsHistory = [];
        unreadCount = 0;
        updateNotificationsUI();
    });
}

// Initialize UI
function init() {
    if (!game.channelName) {
        if (nameModal) nameModal.classList.remove('hidden');
    } else {
        if (nameModal) nameModal.classList.add('hidden');
        setupChannelUI();
    }

    renderShops();
    renderPlayButtons();
    updateUI();
    setupWheel();
    updateNotificationsUI();

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000);
}

// Channel Name Setup
if (saveChannelNameBtn) {
    saveChannelNameBtn.addEventListener('click', () => {
        const name = channelNameInput.value.trim();
        if (!name) {
            showNotification('Будь ласка, введіть назву каналу!', 'error');
            return;
        }
        game.channelName = name;
        if (nameModal) nameModal.classList.add('hidden');
        setupChannelUI();
        showNotification(`Канал "${name}" успішно створено!`);
    });
}

function setupChannelUI() {
    if (displayChannelName) displayChannelName.textContent = game.channelName;
    if (channelAvatar) channelAvatar.textContent = game.channelName.charAt(0).toUpperCase();
}

// Game Loop
function gameLoop() {
    if (!game.channelName) return;

    let effectiveTime = game.superActionActive ? 1 : Math.max(1, Math.round(60 * (1 - game.currentTimerReduction)));
    
    if (currentTimeLeft > effectiveTime || currentTimeLeft <= 0) {
        currentTimeLeft = effectiveTime;
    }

    currentTimeLeft--;

    if (currentTimeLeft <= 0) {
        let earnedSubs = getEffectiveAdvanceBonus();
        game.subscribers += earnedSubs;
        game.dollars += 1;
        game.youtuberts += 1;
        
        showNotification(`+${earnedSubs.toLocaleString()} підписників! Отримано $1 та 1 Ютуберку`, 'info');
        currentTimeLeft = effectiveTime;
        
        checkPlayButtons();
    }

    updateUI();
}

// Check and Unlock Play Buttons
function checkPlayButtons() {
    playButtons.forEach(btn => {
        if (game.subscribers >= btn.threshold && !unlockedButtons.has(btn.id)) {
            unlockedButtons.add(btn.id);
            showNotification(`🏆 Досягнення розблоковано: ${btn.name}!`, 'success');
            renderPlayButtons();
        }
    });
}

// Render Play Buttons Grid
function renderPlayButtons() {
    if (!playButtonsGrid) return;

    playButtonsGrid.innerHTML = playButtons.map(btn => {
        const isUnlocked = game.subscribers >= btn.threshold;
        return `
            <div class="border rounded-xl p-3 flex flex-col items-center text-center transition-all ${isUnlocked ? btn.color + ' shadow-md' : 'bg-ytbg/40 border-ytborder/50 text-gray-500 opacity-50'}">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 ${isUnlocked ? 'bg-white/10' : 'bg-ytborder/30'}">
                    <i class="fa-solid ${btn.icon}"></i>
                </div>
                <div class="font-bold text-xs mb-1">${btn.name}</div>
                <div class="text-[10px] ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}">
                    ${isUnlocked ? '✅ Отримано' : `🔒 ${(btn.threshold).toLocaleString()} підп.`}
                </div>
            </div>
        `;
    }).join('');
}

// Update UI Elements
function updateUI() {
    if (subscribersDisplay) subscribersDisplay.textContent = game.subscribers.toLocaleString();
    if (dollarsDisplay) dollarsDisplay.textContent = game.dollars.toLocaleString();
    if (yoututbertsDisplay) yoututbertsDisplay.textContent = game.youtuberts.toLocaleString();
    
    let effectiveTime = game.superActionActive ? 1 : Math.max(1, Math.round(60 * (1 - game.currentTimerReduction)));
    if (timerDisplay) timerDisplay.textContent = effectiveTime + 'с';
    if (advanceBonusDisplay) advanceBonusDisplay.textContent = '+' + getEffectiveAdvanceBonus().toLocaleString();
    
    if (countdownDisplay) countdownDisplay.textContent = currentTimeLeft + 'с';
    if (progressBar) {
        let progressPercent = effectiveTime <= 1 ? 100 : ((effectiveTime - currentTimeLeft) / effectiveTime) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, progressPercent)) + '%';
    }

    applyStyleUI();
    applyUITheme();
}

// Apply Card Styles
function applyStyleUI() {
    if (!channelCard) return;
    channelCard.className = "border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ";
    if (game.styleLevel === 0) {
        channelCard.classList.add('bg-ytcard', 'border-ytborder');
    } else if (game.styleLevel === 1) {
        channelCard.classList.add('bg-gradient-to-br', 'from-zinc-900', 'to-cyan-950', 'border-cyan-500/50');
    } else if (game.styleLevel === 2) {
        channelCard.classList.add('bg-gradient-to-br', 'from-zinc-900', 'to-fuchsia-950', 'border-fuchsia-500/50');
    } else if (game.styleLevel === 3) {
        channelCard.classList.add('bg-gradient-to-br', 'from-zinc-900', 'to-amber-950', 'border-amber-500/50');
    } else if (game.styleLevel >= 4) {
        channelCard.classList.add('bg-gradient-to-br', 'from-zinc-900', 'to-indigo-950', 'border-indigo-500/50');
    }
}

// Apply Full Interface Themes (виправлено застосування стилів всього сайту)
function applyUITheme() {
    if (!appBody) return;
    // Видаляємо всі можливі класи тем
    appBody.classList.remove('bg-ytbg', 'bg-[#07090e]', 'bg-[#140505]', 'bg-[#03140a]', 'bg-[#0f0714]', 'bg-[#12141a]');
    
    if (game.uiThemeLevel === 0) {
        appBody.classList.add('bg-ytbg');
    } else if (game.uiThemeLevel === 1) {
        appBody.classList.add('bg-[#07090e]');
    } else if (game.uiThemeLevel === 2) {
        appBody.classList.add('bg-[#140505]');
    } else if (game.uiThemeLevel === 3) {
        appBody.classList.add('bg-[#03140a]');
    } else if (game.uiThemeLevel === 4) {
        appBody.classList.add('bg-[#0f0714]');
    } else if (game.uiThemeLevel >= 5) {
        appBody.classList.add('bg-[#12141a]');
    }
}

// Shop Rendering
window.renderShops = function() {
    if (shopYoutubertsTimer) {
        shopYoutubertsTimer.innerHTML = youturbertsTimerShop.map(item => `
            <div class="bg-ytbg/60 border border-ytborder p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                    <h3 class="font-bold text-sm">${item.name}</h3>
                    <p class="text-xs text-gray-400 mt-0.5">${item.desc}</p>
                    <div class="text-youtube font-bold text-xs mt-2"><i class="fa-solid fa-play"></i> ${item.cost.toLocaleString()} Ютуберок</div>
                </div>
                <button onclick="buyItem('${item.id}', 'youtuberts_timer')" class="bg-youtube hover:bg-red-700 font-bold text-xs px-4 py-2 rounded-lg transition shrink-0 cursor-pointer">
                    Купити
                </button>
            </div>
        `).join('');
    }

    if (shopYoutubertsSubs) {
        shopYoutubertsSubs.innerHTML = youturbertsSubsShop.map(item => `
            <div class="bg-ytbg/60 border border-ytborder p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                    <h3 class="font-bold text-sm">${item.name}</h3>
                    <p class="text-xs text-gray-400 mt-0.5">${item.desc}</p>
                    <div class="text-youtube font-bold text-xs mt-2"><i class="fa-solid fa-play"></i> ${item.cost.toLocaleString()} Ютуберок</div>
                </div>
                <button onclick="buyItem('${item.id}', 'youtuberts_subs')" class="bg-youtube hover:bg-red-700 font-bold text-xs px-4 py-2 rounded-lg transition shrink-0 cursor-pointer">
                    Купити
                </button>
            </div>
        `).join('');
    }

    if (shopDollars) {
        shopDollars.innerHTML = dollarsShop.map(item => {
            let isPurchased = false;
            if (item.level && game.styleLevel >= item.level) isPurchased = true;
            if (item.theme && game.uiThemeLevel >= item.theme) isPurchased = true;
            if (item.type === 'super' && game.superActionActive) isPurchased = true;
            if (item.type === 'boost10' && game.boostx10Active) isPurchased = true;

            return `
                <div class="bg-ytbg/60 border border-ytborder p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                        <h3 class="font-bold text-sm">${item.name} ${isPurchased ? '(Куплено)' : ''}</h3>
                        <p class="text-xs text-gray-400 mt-0.5">${item.desc}</p>
                        <div class="text-emerald-400 font-bold text-xs mt-2"><i class="fa-solid fa-dollar-sign"></i> ${item.cost.toLocaleString()} Доларів</div>
                    </div>
                    <button onclick="buyItem('${item.id}', 'dollars')" class="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs px-4 py-2 rounded-lg transition shrink-0 cursor-pointer ${isPurchased ? 'opacity-50 cursor-not-allowed' : ''}">
                        ${isPurchased ? 'Активно' : 'Купити'}
                    </button>
                </div>
            `;
        }).join('');
    }
}

// Category & Subtab Switching
window.switchCategory = function(cat) {
    const tabCatYoutuberts = document.getElementById('tabCatYoutuberts');
    const tabCatDollars = document.getElementById('tabCatDollars');
    
    if (cat === 'youtuberts') {
        if (tabCatYoutuberts) tabCatYoutuberts.className = "flex-1 pb-2 font-bold text-sm border-b-2 border-youtube text-youtube transition cursor-pointer";
        if (tabCatDollars) tabCatDollars.className = "flex-1 pb-2 font-bold text-sm border-b-2 border-transparent text-gray-400 hover:text-white transition cursor-pointer";
        if (youtubertsSubtabs) youtubertsSubtabs.classList.remove('hidden');
        
        const activeSub = document.getElementById('tabSubTimer').classList.contains('text-youtube') ? 'timer' : 'subs';
        if (activeSub === 'timer') {
            if (shopYoutubertsTimer) shopYoutubertsTimer.classList.remove('hidden');
            if (shopYoutubertsSubs) shopYoutubertsSubs.classList.add('hidden');
        } else {
            if (shopYoutubertsSubs) shopYoutubertsSubs.classList.remove('hidden');
            if (shopYoutubertsTimer) shopYoutubertsTimer.classList.add('hidden');
        }
        if (shopDollars) shopDollars.classList.add('hidden');
    } else {
        if (tabCatDollars) tabCatDollars.className = "flex-1 pb-2 font-bold text-sm border-b-2 border-youtube text-youtube transition cursor-pointer";
        if (tabCatYoutuberts) tabCatYoutuberts.className = "flex-1 pb-2 font-bold text-sm border-b-2 border-transparent text-gray-400 hover:text-white transition cursor-pointer";
        if (youtubertsSubtabs) youtubertsSubtabs.classList.add('hidden');
        if (shopYoutubertsTimer) shopYoutubertsTimer.classList.add('hidden');
        if (shopYoutubertsSubs) shopYoutubertsSubs.classList.add('hidden');
        if (shopDollars) shopDollars.classList.remove('hidden');
    }
}

window.switchYoutubertsTab = function(sub) {
    const tabSubTimer = document.getElementById('tabSubTimer');
    const tabSubSubs = document.getElementById('tabSubSubs');

    if (sub === 'timer') {
        if (tabSubTimer) tabSubTimer.className = "flex-1 text-xs font-semibold pb-1.5 border-b-2 border-youtube text-youtube transition cursor-pointer";
        if (tabSubSubs) tabSubSubs.className = "flex-1 text-xs font-semibold pb-1.5 border-b-2 border-transparent text-gray-400 hover:text-white transition cursor-pointer";
        if (shopYoutubertsTimer) shopYoutubertsTimer.classList.remove('hidden');
        if (shopYoutubertsSubs) shopYoutubertsSubs.classList.add('hidden');
    } else {
        if (tabSubSubs) tabSubSubs.className = "flex-1 text-xs font-semibold pb-1.5 border-b-2 border-youtube text-youtube transition cursor-pointer";
        if (tabSubTimer) tabSubTimer.className = "flex-1 text-xs font-semibold pb-1.5 border-b-2 border-transparent text-gray-400 hover:text-white transition cursor-pointer";
        if (shopYoutubertsSubs) shopYoutubertsSubs.classList.remove('hidden');
        if (shopYoutubertsTimer) shopYoutubertsTimer.classList.add('hidden');
    }
}

// Purchase Handler
window.buyItem = function(id, category) {
    if (category === 'youtuberts_timer') {
        const item = youturbertsTimerShop.find(i => i.id === id);
        if (game.youtuberts < item.cost) {
            showNotification('Недостатньо Ютуберок!', 'error');
            return;
        }
        game.youtuberts -= item.cost;
        game.currentTimerReduction += item.value;
        showNotification(`Придбано ${item.name}!`);
    } else if (category === 'youtuberts_subs') {
        const item = youturbertsSubsShop.find(i => i.id === id);
        if (game.youtuberts < item.cost) {
            showNotification('Недостатньо Ютуберок!', 'error');
            return;
        }
        game.youtuberts -= item.cost;
        game.baseAdvanceBonus += item.value;
        showNotification(`Придбано ${item.name}!`);
    } else if (category === 'dollars') {
        const item = dollarsShop.find(i => i.id === id);
        
        if (item.type === 'super') {
            if (game.superActionActive) {
                showNotification('⚡ СУПЕР АКЦІЯ вже активована!', 'error');
                return;
            }
            if (game.dollars < item.cost) {
                showNotification('Недостатньо Доларів!', 'error');
                return;
            }
            game.dollars -= item.cost;
            game.superActionActive = true;
            currentTimeLeft = 1;
            showNotification(`⚡ СУПЕР АКЦІЮ СТУДІЇ активовано! Таймер нарахування тепер працює рівно кожну секунду!`);
            renderShops();
            updateUI();
            return;
        }

        if (item.type === 'boost10') {
            if (game.boostx10Active) {
                showNotification('🚀 Буст x10 вже активовано!', 'error');
                return;
            }
            if (game.dollars < item.cost) {
                showNotification('Недостатньо Доларів!', 'error');
                return;
            }
            game.dollars -= item.cost;
            game.boostx10Active = true;
            showNotification(`🚀 Експоненціальний Буст x10 активовано! Усі прибутки та нагороди помножено на 10!`);
            renderShops();
            updateUI();
            return;
        }

        if (item.level) {
            if (game.styleLevel >= item.level) {
                showNotification('Цей стиль вже активовано!', 'error');
                return;
            }
            if (game.dollars < item.cost) {
                showNotification('Недостатньо Доларів!', 'error');
                return;
            }
            game.dollars -= item.cost;
            game.styleLevel = item.level;
            showNotification(`Стиль каналу "${item.name}" успішно активовано!`);
            renderShops();
        } else if (item.theme) {
            if (game.uiThemeLevel >= item.theme) {
                showNotification('Цей інтерфейс вже активовано!', 'error');
                return;
            }
            if (game.dollars < item.cost) {
                showNotification('Недостатньо Доларів!', 'error');
                return;
            }
            game.dollars -= item.cost;
            game.uiThemeLevel = item.theme;
            showNotification(`Інтерфейс сайту "${item.name}" успішно активовано!`);
            renderShops();
        }
    }

    checkPlayButtons();
    updateUI();
}

// Fortune Wheel
function setupWheel() {
    const wheel = document.getElementById('wheel');
    if (wheel) {
        wheel.style.background = `conic-gradient(
            #10b981 0deg 60deg, 
            #ff0000 60deg 120deg, 
            #059669 120deg 180deg, 
            #cc0000 180deg 240deg, 
            #047857 240deg 300deg, 
            #34d399 300deg 360deg
        )`;
    }
}

if (spinWheelBtn) {
    spinWheelBtn.addEventListener('click', () => {
        if (wheelIsSpinning) return;

        wheelIsSpinning = true;
        spinWheelBtn.disabled = true;
        spinWheelBtn.classList.add('opacity-50', 'cursor-not-allowed');
        if (wheelRewardText) wheelRewardText.textContent = 'Колесо обертається...';

        const randomDegree = Math.floor(1800 + Math.random() * 1800);
        const wheel = document.getElementById('wheel');
        if (wheel) wheel.style.transform = `rotate(${randomDegree}deg)`;

        setTimeout(() => {
            wheelIsSpinning = false;
            spinWheelBtn.disabled = false;
            spinWheelBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            const normalizedDegree = randomDegree % 360;
            const segmentSize = 360 / wheelPrizes.length;
            const winningIndex = Math.floor((360 - (normalizedDegree % 360)) / segmentSize) % wheelPrizes.length;
            const prize = wheelPrizes[winningIndex];

            // Множення нагород з колеса фортуни, якщо активовано буст x10
            let multiplier = game.wheelMultiplier * (game.boostx10Active ? 10 : 1);
            const finalVal = Math.round(prize.val * multiplier);

            if (prize.type === 'dollars') {
                game.dollars += finalVal;
                if (wheelRewardText) wheelRewardText.textContent = `Ви виграли: $${finalVal} Доларів!`;
                showNotification(`Виграш у колесі: +$${finalVal}`);
            } else {
                game.youtuberts += finalVal;
                if (wheelRewardText) wheelRewardText.textContent = `Ви виграли: ${finalVal} Ютуберок!`;
                showNotification(`Виграш у колесі: +${finalVal} Ютуберок`);
            }

            checkPlayButtons();
            updateUI();
        }, 3000);
    });
}

window.addEventListener('DOMContentLoaded', init);
