let tokens = 0;
let tokensPerSecond = 0;
let clickPower = 1;

let currentStage = 1;
let monsterMaxHP = 50;
let monsterHP = 50;
let bossTimeLeft = 0;
let isBossStage = false;

// Combo System
let combo = 1;
let comboTimer = 0;
let stakedTokens = 0;
let stakingMultiplier = 1.0;
let prestigeTokens = 0; // Hashpower
let prestigeMultiplier = 1.0;
let isDdosActive = false;
let buyMultiplier = 1;
let goalReached = false;

// Active Skill: Overclock
let overclockActive = false;
let overclockCooldown = 0;
const OVERCLOCK_DURATION = 8;
const OVERCLOCK_COOLDOWN = 40;

// Stats Tracking
let stats = { totalTaps: 0, bestCombo: 1, epochsCleared: 0, totalEarned: 0, bossesDefeated: 0, ddosCleared: 0, critHits: 0 };

// Achievements
const achievements = [
    { id: 'first_tap', name: '🖱️ First Tap', desc: 'Tap the node for the first time', check: () => stats.totalTaps >= 1, done: false },
    { id: 'rich_100', name: '💰 First Hundred', desc: 'Earn 100 $RIA', check: () => stats.totalEarned >= 100, done: false },
    { id: 'rich_10k', name: '💎 10K Club', desc: 'Earn 10,000 $RIA', check: () => stats.totalEarned >= 10000, done: false },
    { id: 'rich_1m', name: '🏆 Millionaire', desc: 'Earn 1,000,000 $RIA', check: () => stats.totalEarned >= 1000000, done: false },
    { id: 'combo_3', name: '🔥 Combo Master', desc: 'Reach combo x3.0', check: () => stats.bestCombo >= 3, done: false },
    { id: 'combo_5', name: '💥 Combo Legend', desc: 'Reach combo x5.0', check: () => stats.bestCombo >= 5, done: false },
    { id: 'boss_1', name: '⚔️ Boss Slayer', desc: 'Defeat your first boss', check: () => stats.bossesDefeated >= 1, done: false },
    { id: 'epoch_20', name: '🛡️ Epoch Warrior', desc: 'Clear 20 epochs', check: () => stats.epochsCleared >= 20, done: false },
    { id: 'epoch_50', name: '🌟 Epoch Legend', desc: 'Clear 50 epochs', check: () => stats.epochsCleared >= 50, done: false },
    { id: 'crit_50', name: '🎯 Sharpshooter', desc: 'Land 50 critical hits', check: () => stats.critHits >= 50, done: false },
];
let lastAchievementCount = 0;

// Music toggle
let musicEnabled = false;
let musicOsc = null;

// Fever Mode
let feverMode = false;
let feverTimer = 0;
let rapidTaps = 0;
let rapidTapTimer = 0;
const FEVER_THRESHOLD = 15; // taps needed in 3s
const FEVER_DURATION = 5;

const SAVE_KEY = 'ai_tycoon_save';
const GOAL_TOKENS = 10000000;

const scoreDisplay = document.getElementById('scoreDisplay');
const tpsDisplay = document.getElementById('tpsDisplay');
const aiCore = document.getElementById('aiCore');
const upgradesList = document.getElementById('upgradesList');
const comboDisplay = document.getElementById('comboDisplay');
const missionTitle = document.getElementById('missionTitle');
const missionText = document.getElementById('missionText');
const missionReward = document.getElementById('missionReward');
const goalFill = document.getElementById('goalFill');
const goalText = document.getElementById('goalText');
const eventBanner = document.getElementById('eventBanner');
const nodeStatus = document.getElementById('nodeStatus');
const toast = document.getElementById('toast');
const winModal = document.getElementById('winModal');
const keepPlayingBtn = document.getElementById('keepPlayingBtn');

const upgrades = [
    { id: 'omni_account',    name: '🔑 Omni Account',       desc: '+1 $RIA / sec',      baseCost: 12,      costMult: 1.14, tps: 1,      count: 0, tier: 1 },
    { id: 'rialo_edge',      name: '🌐 Edge Node',           desc: '+5 $RIA / sec',      baseCost: 75,      costMult: 1.14, tps: 5,      count: 0, tier: 1 },
    { id: 'rialo_engine',    name: '⚙️ Execution Engine',    desc: '+50 $RIA / sec',     baseCost: 800,     costMult: 1.14, tps: 50,     count: 0, tier: 1 },
    { id: 'rialo_consensus', name: '⚡ Consensus Validator', desc: '+250 $RIA / sec',    baseCost: 9000,    costMult: 1.14, tps: 250,    count: 0, tier: 2 },
    { id: 'rialo_vm',        name: '🖥️ VM Cluster',          desc: '+2000 $RIA / sec',   baseCost: 95000,   costMult: 1.14, tps: 2000,   count: 0, tier: 2 },
    { id: 'rialo_shard',     name: '🔷 Shard Processor',     desc: '+8000 $RIA / sec',   baseCost: 600000,  costMult: 1.15, tps: 8000,   count: 0, tier: 2 },
    { id: 'rialo_zkproof',   name: '🔐 ZK Proof Engine',     desc: '+35000 $RIA / sec',  baseCost: 4000000, costMult: 1.15, tps: 35000,  count: 0, tier: 3 },
    { id: 'rialo_oracle',    name: '🌟 Oracle Network',      desc: '+150000 $RIA / sec', baseCost: 25000000,costMult: 1.15, tps: 150000, count: 0, tier: 3 },
    { id: 'rialo_singularity',name:'🤖 AI Singularity',      desc: '+1M $RIA / sec',     baseCost: 200000000,costMult:1.16, tps: 1000000,count: 0, tier: 3 },
];

const bots = [
    { name: "Satoshi.eth", score: 100000000 },
    { name: "Subzero_Labs", score: 50000000 },
    { name: "Vitalik_Node", score: 10000000 },
    { name: "Rialo_Whale", score: 500000 },
    { name: "Script_Kiddie", score: 1000 }
];

const UI_REFRESH_MS = 125;
let lastUiRefresh = 0;
let pendingUiRefresh = false;

// Audio Setup
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function initAudio() { if (!audioCtx) audioCtx = new AudioContext(); if (audioCtx.state === 'suspended') audioCtx.resume(); }

function playPop() {
    initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    const pitch = 400 + (combo - 1) * 100 + (feverMode ? 200 : 0);
    osc.type = 'sine'; osc.frequency.setValueAtTime(pitch, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(pitch * 2, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}

function playBuy() {
    initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(300, audioCtx.currentTime); osc.frequency.setValueAtTime(400, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.2);
}

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
}

function showToast(message) {
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('active');
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove('active'), 2600);
}

function updateMission() {
    if (!missionTitle || !missionText || !missionReward || !goalFill || !goalText) return;

    const firstUpgrade = upgrades[0];
    const totalUpgrades = upgrades.reduce((acc, curr) => acc + curr.count, 0);
    const goalPct = Math.min((tokens + stakedTokens) / GOAL_TOKENS, 1) * 100;
    goalFill.style.width = goalPct + '%';
    goalText.innerText = `${formatNumber(tokens + stakedTokens)} / ${formatNumber(GOAL_TOKENS)} $RIA`;

    if (tokens + stakedTokens >= GOAL_TOKENS) {
        missionTitle.innerText = 'Final Mission';
        missionReward.innerText = 'Mainnet Ready';
        missionText.innerText = 'Goal complete. Keep scaling your validator empire.';
    } else if (currentStage >= 10) {
        missionTitle.innerText = 'Mission 4';
        missionReward.innerText = 'Hard Fork';
        missionText.innerText = 'Use Hard Fork to convert progress into permanent Hashpower.';
    } else if (totalUpgrades >= 5) {
        missionTitle.innerText = 'Mission 3';
        missionReward.innerText = 'Beat Epoch 10';
        missionText.innerText = 'Reach the first slashing event and clear it before time runs out.';
    } else if (firstUpgrade.count > 0) {
        missionTitle.innerText = 'Mission 2';
        missionReward.innerText = '+Auto Income';
        missionText.innerText = 'Buy 5 upgrades to increase click power and speed up epochs.';
    } else {
        missionTitle.innerText = 'Mission 1';
        missionReward.innerText = '+Starter Boost';
        missionText.innerText = 'Earn 12 $RIA to buy your first Omni Account.';
    }
}

function updateEventBanner(message) {
    if (eventBanner) eventBanner.innerText = message;
}

function checkGoalReached() {
    if (goalReached || tokens + stakedTokens < GOAL_TOKENS) return;
    goalReached = true;
    saveGame();
    showToast('Goal complete: 10M $RIA reached');
    if (winModal) winModal.classList.add('active');
}

function getCostForOne(upgrade, currentCount) { return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentCount)); }

function getPurchaseInfo(upgrade) {
    let totalCost = 0;
    let countToBuy = 0;
    
    if (buyMultiplier === 'max') {
        let tempTokens = tokens;
        let tempCount = upgrade.count;
        while(tempTokens >= getCostForOne(upgrade, tempCount)) {
            let cost = getCostForOne(upgrade, tempCount);
            tempTokens -= cost;
            totalCost += cost;
            countToBuy++;
            tempCount++;
            if(countToBuy > 1000) break;
        }
        if(countToBuy === 0) {
            totalCost = getCostForOne(upgrade, upgrade.count);
            countToBuy = 1;
        }
    } else {
        let amount = parseInt(buyMultiplier);
        countToBuy = amount;
        let tempCount = upgrade.count;
        for(let i = 0; i < amount; i++) {
            totalCost += getCostForOne(upgrade, tempCount);
            tempCount++;
        }
    }
    return { cost: totalCost, amount: countToBuy, canAfford: tokens >= totalCost };
}

const TIER_COLORS = { 1: '#3b82f6', 2: '#a855f7', 3: '#f59e0b' };
const TIER_LABELS = { 1: 'T1', 2: 'T2', 3: 'T3 ⭐' };
function renderUpgrades() {
    upgradesList.innerHTML = '';
    upgrades.forEach((upgrade, index) => {
        const info = getPurchaseInfo(upgrade);
        const tier = upgrade.tier || 1;
        const tc = TIER_COLORS[tier];
        const btn = document.createElement('button');
        btn.className = 'upgrade-btn';
        btn.style.borderLeftColor = tc;
        btn.disabled = !info.canAfford;
        btn.onclick = () => buyUpgrade(upgrade, info);
        btn.innerHTML = `
            <div class="upgrade-info">
                <div class="tier-badge" style="background:${tc}22;color:${tc};border-color:${tc}44">${TIER_LABELS[tier]}</div>
                <h3>${upgrade.name}</h3>
                <p>${upgrade.desc}</p>
                <div class="owned">Owned: ${upgrade.count}</div>
            </div>
            <div class="upgrade-price ${info.canAfford ? 'cost-green' : 'cost-red'}">
                Buy ${buyMultiplier === 'max' ? (info.amount > 1 ? info.amount : 'Max') : info.amount}: ${formatNumber(info.cost)}
            </div>
        `;
        upgradesList.appendChild(btn);
    });
}

function updateUI() {
    scoreDisplay.innerText = formatNumber(tokens);
    tpsDisplay.innerText = formatNumber(tokensPerSecond) + ' $RIA / sec';
    if (nodeStatus) {
        nodeStatus.innerText = tokensPerSecond > 0 ? `${formatNumber(tokensPerSecond)} $RIA/sec online` : 'Tap to start';
    }
    
    // Epoch progress bar
    const epochFill = document.getElementById('epochFill');
    const epochLabel = document.getElementById('epochLabel');
    if (epochFill && epochLabel) {
        const pct = Math.max(0, (1 - monsterHP / monsterMaxHP)) * 100;
        epochFill.style.width = pct + '%';
        epochLabel.innerText = isBossStage ? `⚔️ SLASH EVENT` : `Epoch ${currentStage}`;
    }
    
    // Aura intensity based on TPS
    const aura = document.getElementById('nodeAura');
    if (aura) {
        const intensity = Math.min(tokensPerSecond / 5000, 1);
        aura.style.opacity = 0.3 + intensity * 0.7;
        aura.style.width = aura.style.height = (200 + intensity * 80) + 'px';
    }
    
    const btns = document.querySelectorAll('.upgrade-btn');
    const prices = document.querySelectorAll('.upgrade-price');
    const ownedLabels = document.querySelectorAll('.owned');
    
    upgrades.forEach((upgrade, index) => {
        const info = getPurchaseInfo(upgrade);
        if(btns[index]) {
            btns[index].disabled = !info.canAfford;
            prices[index].className = `upgrade-price ${info.canAfford ? 'cost-green' : 'cost-red'}`;
            prices[index].innerText = `Buy ${buyMultiplier === 'max' ? (info.amount > 1 ? info.amount : 'Max') : info.amount}: ${formatNumber(info.cost)}`;
            ownedLabels[index].innerText = `Owned: ${upgrade.count}`;
            btns[index].onclick = () => buyUpgrade(upgrade, info);
        }
    });
    
    const stakedAmountDisplay = document.getElementById('stakedAmount');
    if (stakedAmountDisplay) stakedAmountDisplay.innerText = `Staked: ${formatNumber(stakedTokens)} $RIA | Multiplier: x${stakingMultiplier.toFixed(2)}`;
    
    // Prestige UI Update
    const prestigeContainer = document.getElementById('prestigeContainer');
    if (prestigeContainer && (prestigeTokens > 0 || currentStage >= 10)) {
        prestigeContainer.style.display = 'block';
        const prestigeBtn = document.getElementById('prestigeBtn');
        const prestigeStats = document.getElementById('prestigeStats');
        const reward = Math.floor(currentStage / 10);
        if (prestigeBtn) {
            prestigeBtn.innerText = `Hard Fork (+${reward} Hashpower)`;
            prestigeBtn.disabled = reward <= 0;
        }
        if (prestigeStats) {
            prestigeStats.innerText = `Hashpower: ${prestigeTokens} (+${prestigeTokens * 50}% Global Boost)`;
        }
    }
    
    updateLeaderboard();
    updateMission();
    checkGoalReached();
}

function refreshUI() {
    updateHPBar();
    updateUI();
    lastUiRefresh = performance.now();
    pendingUiRefresh = false;
}

function requestUIRefresh(force = false) {
    const now = performance.now();
    if (force || now - lastUiRefresh >= UI_REFRESH_MS) {
        refreshUI();
        return;
    }

    pendingUiRefresh = true;
}

function recalculateStats() {
    let baseTps = upgrades.reduce((acc, curr) => acc + (curr.tps * curr.count), 0);
    stakingMultiplier = 1.0 + (stakedTokens / 1000000);
    if (stakingMultiplier > 10.0) stakingMultiplier = 10.0;
    prestigeMultiplier = 1.0 + (prestigeTokens * 0.5);
    
    tokensPerSecond = baseTps * stakingMultiplier * prestigeMultiplier;
    if (isDdosActive) tokensPerSecond *= 0.5;
    const totalUpgrades = upgrades.reduce((acc, curr) => acc + curr.count, 0);
    clickPower = (2 + Math.floor(totalUpgrades / 5)) * stakingMultiplier * prestigeMultiplier;
}

// Stage & Boss logic
function initStage() {
    isBossStage = (currentStage % 10 === 0);
    const healthMultiplier = isBossStage ? 5 : 1;
    monsterMaxHP = Math.floor(50 * Math.pow(1.2, currentStage - 1)) * healthMultiplier;
    monsterHP = monsterMaxHP;
    
    const bossLogo = document.querySelector('.node-logo');
    if(bossLogo) {
        bossLogo.style.filter = isBossStage ? 'invert(30%) sepia(100%) saturate(1000%) hue-rotate(330deg)' : 'brightness(0) invert(1)';
    }
    // Boss mode visual
    if (isBossStage) { aiCore.classList.add('boss-mode'); body_screenShake(); }
    else { aiCore.classList.remove('boss-mode'); }

    const stageNameElem = document.getElementById('stageName');
    if(stageNameElem) {
        if (isBossStage) {
            stageNameElem.innerHTML = `💎 Validator Slashing Event 💎`;
            updateEventBanner('Boss round: clear pending transactions before the slash timer ends');
        } else {
            stageNameElem.innerText = `Epoch ${currentStage}`;
            updateEventBanner('Tap the Rialo validator to process transactions');
        }
    }
    
    const bossTimerElem = document.getElementById('bossTimer');
    if (isBossStage) {
        bossTimeLeft = 30.0;
        bossTimerElem.style.display = 'block';
        bossTimerElem.innerText = `Next Slash: ${bossTimeLeft.toFixed(1)}s`;
    } else {
        bossTimerElem.style.display = 'none';
    }
    
    updateHPBar();
}

function updateHPBar() {
    const hpBar = document.getElementById('hpBar');
    const hpText = document.getElementById('hpText');
    if(!hpBar || !hpText) return;
    const pct = Math.max(0, (monsterHP / monsterMaxHP) * 100);
    hpBar.style.width = pct + '%';
    hpText.innerText = `${formatNumber(monsterHP)} / ${formatNumber(monsterMaxHP)} Tx`;
}

const PARTICLE_COLORS = ['#3b82f6','#10b981','#f59e0b','#a855f7','#ec4899','#06b6d4'];
function createParticles(x, y, isCrit = false) {
    const count = isCrit ? 20 : 10;
    for(let i=0; i<count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const color = isCrit ? '#fbbf24' : PARTICLE_COLORS[Math.floor(Math.random()*PARTICLE_COLORS.length)];
        p.style.background = color;
        p.style.boxShadow = `0 0 8px ${color}`;
        p.style.width = (isCrit ? 8 : 5) + 'px';
        p.style.height = p.style.width;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        const angle = Math.random() * Math.PI * 2;
        const dist = (isCrit ? 90 : 55) + Math.random() * 50;
        p.style.setProperty('--tx', Math.cos(angle)*dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle)*dist + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), isCrit ? 900 : 600);
    }
    if (isCrit) {
        const flash = document.createElement('div');
        flash.className = 'crit-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }
}

function dealDamage(amount, x, y, isCrit) {
    monsterHP -= amount;
    tokens += amount;
    stats.totalEarned += amount;
    if (x !== null && y !== null) {
        createFloatingNumber(x, y, amount, isCrit);
    }
    
    if (monsterHP <= 0) {
        const bonus = Math.floor(monsterMaxHP * 0.5);
        tokens += bonus;
        stats.totalEarned += bonus;
        stats.epochsCleared++;
        if (isBossStage) { stats.bossesDefeated++; body_screenShake(); }
        showToast(`Epoch cleared: +${formatNumber(bonus)} $RIA bonus`);
        
        currentStage++;
        initStage();
        checkAchievements();
    }
    requestUIRefresh(x !== null && y !== null);
}

function body_screenShake() {
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 300);
}

aiCore.addEventListener('mousedown', (e) => {
    playPop();
    stats.totalTaps++;
    combo += 0.1; if(combo > 5.0) combo = 5.0; comboTimer = 2.0;
    if (combo > stats.bestCombo) stats.bestCombo = combo;
    
    // Fever detection
    rapidTaps++;
    rapidTapTimer = 3.0;
    if (!feverMode && rapidTaps >= FEVER_THRESHOLD) {
        feverMode = true; feverTimer = FEVER_DURATION; rapidTaps = 0;
        document.body.classList.add('fever-active');
        showToast('🔥🔥🔥 FEVER MODE! x5 EVERYTHING! 🔥🔥🔥');
    }
    
    const critChance = overclockActive ? 0.3 : (feverMode ? 0.25 : 0.1);
    let isCrit = Math.random() < critChance;
    if (isCrit) stats.critHits++;
    const overclockMult = overclockActive ? 3 : 1;
    const feverMult = feverMode ? 5 : 1;
    const actualPower = clickPower * combo * (isCrit ? 5 : 1) * overclockMult * feverMult;
    
    dealDamage(actualPower, e.clientX, e.clientY, isCrit);
    createParticles(e.clientX, e.clientY, isCrit);
    aiCore.classList.add('tapped'); setTimeout(() => aiCore.classList.remove('tapped'), 100);
    
    if (feverMode) {
        comboDisplay.style.opacity = 1; comboDisplay.innerText = `🔥 FEVER x5! 🔥`;
        comboDisplay.style.color = '#ef4444';
    } else if (combo >= 1.5) {
        comboDisplay.style.opacity = 1; comboDisplay.innerText = `Combo x${combo.toFixed(1)}! 🔥`;
        comboDisplay.style.color = '#f59e0b';
    }
    checkAchievements();
});

aiCore.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    for(let i=0; i<e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        aiCore.dispatchEvent(new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY }));
    }
}, {passive: false});

function createFloatingNumber(x, y, amount, isCrit = false) {
    const el = document.createElement('div');
    el.className = 'floating-number';
    if (isCrit) { el.classList.add('crit'); el.innerText = '⚡ CRIT +' + formatNumber(amount) + ' $RIA'; }
    else if (overclockActive) { el.classList.add('overclock'); el.innerText = '🔥 +' + formatNumber(amount) + ' $RIA'; }
    else { el.classList.add('normal'); el.innerText = '+' + formatNumber(amount) + ' $RIA'; }
    const offsetX = (Math.random() - 0.5) * 60;
    el.style.left = (x + offsetX - 40) + 'px'; el.style.top = (y - 30 - Math.random()*20) + 'px';
    document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
}

function buyUpgrade(upgrade, info) {
    if (tokens >= info.cost) {
        playBuy(); tokens -= info.cost; upgrade.count += info.amount;
        recalculateStats(); renderUpgrades(); updateUI(); saveGame();
        showToast(`${upgrade.name.replace(/^[^\w]+/, '')} online: +${formatNumber(upgrade.tps * info.amount)} $RIA/sec`);
    }
}

// Controls
document.querySelectorAll('.buy-mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.buy-mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        buyMultiplier = e.target.dataset.amount;
        renderUpgrades();
        updateUI();
    });
});

// Save Load
function saveGame() {
    const saveState = {
        tokens, stakedTokens, prestigeTokens, goalReached, currentStage, monsterHP,
        lastSaveTime: Date.now(), upgrades: upgrades.map(u => u.count),
        stats, achievementsDone: achievements.filter(a => a.done).map(a => a.id)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
}

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    let savedMonsterHP = null;
    if (saved) {
        try {
            const data = JSON.parse(saved);
            tokens = typeof data.tokens === 'number' ? data.tokens : 0;
            stakedTokens = typeof data.stakedTokens === 'number' ? data.stakedTokens : 0;
            prestigeTokens = typeof data.prestigeTokens === 'number' ? data.prestigeTokens : 0;
            goalReached = Boolean(data.goalReached);
            currentStage = typeof data.currentStage === 'number' ? data.currentStage : 1;
            savedMonsterHP = typeof data.monsterHP === 'number' ? data.monsterHP : null;
            if (data.upgrades) upgrades.forEach((u, i) => { if(data.upgrades[i] !== undefined) u.count = data.upgrades[i]; });
            recalculateStats();
            // Offline earnings are now handled by the offlineModal
        } catch(e) {
            console.warn('Unable to load saved game:', e);
        }
    }
    initStage();
    if(savedMonsterHP !== null) {
        monsterHP = Math.min(Math.max(savedMonsterHP, 1), monsterMaxHP);
    }
    refreshUI();
}

// Auto-save handled by saveGameWithIndicator below

// Game Loop
let lastTime = Date.now();
setInterval(() => {
    const now = Date.now(); const dt = (now - lastTime) / 1000; lastTime = now;
    if(comboTimer > 0) { comboTimer -= dt; if(comboTimer <= 0) { combo = 1; comboDisplay.style.opacity = 0; } }
    
    // Rapid tap decay
    if (rapidTapTimer > 0) { rapidTapTimer -= dt; if (rapidTapTimer <= 0) { rapidTaps = 0; } }
    
    // Fever countdown
    if (feverMode) {
        feverTimer -= dt;
        if (feverTimer <= 0) {
            feverMode = false; feverTimer = 0;
            document.body.classList.remove('fever-active');
            comboDisplay.style.color = '#f59e0b';
            showToast('Fever ended! Keep tapping fast to trigger again.');
        }
    }
    
    // Overclock countdown
    if (overclockActive) {
        overclockCooldown -= dt;
        if (overclockCooldown <= 0) {
            overclockActive = false; overclockCooldown = OVERCLOCK_COOLDOWN;
            aiCore.classList.remove('overclock-on');
            updateSkillBtn();
            showToast('Overclock ended — cooldown 40s');
        } else { updateSkillBtn(); }
    } else if (overclockCooldown > 0) {
        overclockCooldown = Math.max(0, overclockCooldown - dt);
        updateSkillBtn();
    }
    
    if (isBossStage && bossTimeLeft > 0 && monsterHP > 0) {
        bossTimeLeft -= dt;
        const bossTimerElem = document.getElementById('bossTimer');
        if (bossTimeLeft <= 0) {
            bossTimeLeft = 0;
            currentStage--; if(currentStage < 1) currentStage = 1;
            initStage();
            requestUIRefresh(true);
        } else {
            bossTimerElem.innerText = `Next Slash: ${bossTimeLeft.toFixed(1)}s`;
        }
    }
    
    if (tokensPerSecond > 0 && monsterHP > 0) { 
        dealDamage(tokensPerSecond * dt, null, null, false); 
    } else if (pendingUiRefresh) {
        requestUIRefresh();
    }
}, 50);

loadGame();
renderUpgrades();
updateUI();

// Overclock skill
function updateSkillBtn() {
    const btn = document.getElementById('overclockBtn');
    if (!btn) return;
    if (overclockActive) {
        btn.innerText = `⚡ OVERCLOCK ACTIVE ${overclockCooldown.toFixed(0)}s`;
        btn.className = 'skill-btn active';
    } else if (overclockCooldown > 0) {
        btn.innerText = `⚡ Overclock (${overclockCooldown.toFixed(0)}s)`;
        btn.className = 'skill-btn cooldown';
        btn.disabled = true;
    } else {
        btn.innerText = '⚡ Overclock!';
        btn.className = 'skill-btn';
        btn.disabled = false;
    }
}
const overclockBtn = document.getElementById('overclockBtn');
if (overclockBtn) {
    overclockBtn.addEventListener('click', () => {
        if (overclockActive || overclockCooldown > 0) return;
        overclockActive = true; overclockCooldown = OVERCLOCK_DURATION;
        aiCore.classList.add('overclock-on');
        showToast('⚡ OVERCLOCK! 3x power + 30% crit for 8s!');
        updateSkillBtn();
    });
}
updateSkillBtn();

// Features
const copyScoreBtn = document.getElementById('copyScoreBtn');
if (copyScoreBtn) {
    copyScoreBtn.addEventListener('click', () => {
        const text = `🚀 *Rialo Network Tycoon* 🚀\n🛡️ Validated Epoch: ${currentStage}\n💰 Earned: ${formatNumber(tokens)} $RIA\n⚡ Max TPS: ${formatNumber(tokensPerSecond)}\nCan you run a better node?`;
        navigator.clipboard.writeText(text).then(() => {
            copyScoreBtn.innerText = '✅ Copied!';
            setTimeout(() => copyScoreBtn.innerText = '📋 Share to Discord', 2000);
        });
    });
}

const stakeBtn = document.getElementById('stakeBtn');
if (stakeBtn) {
    stakeBtn.addEventListener('click', () => {
        const amountToStake = Math.floor(tokens * 0.5);
        if (amountToStake > 0) {
            tokens -= amountToStake; stakedTokens += amountToStake;
            recalculateStats(); updateUI(); saveGame(); playPop();
            showToast(`Staked ${formatNumber(amountToStake)} $RIA`);
        }
    });
}

function updateLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if(!list) return;
    let all = [...bots, { name: "YOU (Validator)", score: tokens + stakedTokens, isPlayer: true }];
    all.sort((a, b) => b.score - a.score);
    let html = '';
    all.slice(0, 5).forEach((p, i) => {
        if(p.isPlayer) html += `<strong style="color: var(--accent);">${i+1}. ${p.name} - ${formatNumber(p.score)}</strong><br>`;
        else html += `${i+1}. ${p.name} - ${formatNumber(p.score)}<br>`;
    });
    list.innerHTML = html;
}

// Prestige Button — open custom modal
const prestigeBtn = document.getElementById('prestigeBtn');
if (prestigeBtn) {
    prestigeBtn.addEventListener('click', () => {
        const reward = Math.floor(currentStage / 10);
        if (reward > 0) {
            const forkModal = document.getElementById('forkModal');
            const forkGain = document.getElementById('forkGain');
            const forkDesc = document.getElementById('forkDesc');
            if (forkDesc) forkDesc.innerText = 'You will lose ALL $RIA, Staked $RIA, and Upgrades.';
            if (forkGain) forkGain.innerText = `+${reward} Hashpower (+${reward * 50}% permanent boost)`;
            if (forkModal) forkModal.classList.add('active');
        }
    });
}
const forkConfirmBtn = document.getElementById('forkConfirmBtn');
const forkCancelBtn = document.getElementById('forkCancelBtn');
if (forkCancelBtn) forkCancelBtn.onclick = () => document.getElementById('forkModal').classList.remove('active');
if (forkConfirmBtn) forkConfirmBtn.onclick = () => {
    const reward = Math.floor(currentStage / 10);
    prestigeTokens += reward;
    tokens = 0; stakedTokens = 0; currentStage = 1; monsterHP = 50; monsterMaxHP = 50;
    upgrades.forEach(u => u.count = 0);
    saveGame(); location.reload();
};

// Settings Modal
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const resetBtn = document.getElementById('resetBtn');

if(settingsBtn) settingsBtn.onclick = () => settingsModal.classList.add('active');
if(closeSettingsBtn) closeSettingsBtn.onclick = () => settingsModal.classList.remove('active');
if(keepPlayingBtn) keepPlayingBtn.onclick = () => winModal.classList.remove('active');

// Reset — use custom modal
if(resetBtn) {
    resetBtn.onclick = () => {
        settingsModal.classList.remove('active');
        document.getElementById('resetModal').classList.add('active');
    };
}
const resetCancelBtn = document.getElementById('resetCancelBtn');
const resetConfirmBtn = document.getElementById('resetConfirmBtn');
if (resetCancelBtn) resetCancelBtn.onclick = () => document.getElementById('resetModal').classList.remove('active');
if (resetConfirmBtn) resetConfirmBtn.onclick = () => {
    localStorage.removeItem(SAVE_KEY); location.reload();
};

// DDOS Mini Game
setInterval(() => {
    if (!isBossStage && !isDdosActive && Math.random() < 0.15 && currentStage > 2) startDdos();
}, 30000);

function startDdos() {
    isDdosActive = true; recalculateStats(); updateUI();
    updateEventBanner('DDoS Attack: clear 5 threats to restore full income');
    showToast('DDoS Attack: tap all threats');
    const alertDiv = document.createElement('div'); alertDiv.className = 'ddos-alert'; document.body.appendChild(alertDiv);
    const ddosCounter = document.createElement('div'); ddosCounter.className = 'ddos-counter'; ddosCounter.innerText = 'Threats: 5/5'; document.body.appendChild(ddosCounter);
    let bugsLeft = 5;
    for(let i=0; i<5; i++) {
        const ddosBug = document.createElement('div'); ddosBug.className = 'ddos-bug'; ddosBug.innerText = '👾';
        ddosBug.style.left = (Math.random() * (window.innerWidth - 100)) + 'px'; ddosBug.style.top = (Math.random() * (window.innerHeight - 100)) + 'px';
        document.body.appendChild(ddosBug);
        const interval = setInterval(() => { ddosBug.style.left = (Math.random() * (window.innerWidth - 100)) + 'px'; ddosBug.style.top = (Math.random() * (window.innerHeight - 100)) + 'px'; }, 800);
        ddosBug.onmousedown = (e) => {
            clearInterval(interval); ddosBug.remove(); bugsLeft--; playPop();
            ddosCounter.innerText = `Threats: ${bugsLeft}/5`;
            if(bugsLeft <= 0) {
                isDdosActive = false; alertDiv.remove(); ddosCounter.remove(); recalculateStats(); updateUI();
                const reward = tokensPerSecond * 10; tokens += reward; updateUI(); saveGame();
                updateEventBanner('Threats cleared. Validator income restored.');
                showToast(`DDoS cleared: +${formatNumber(reward)} $RIA`);
            }
        };
        ddosBug.addEventListener('touchstart', (e) => { e.preventDefault(); ddosBug.onmousedown(e.touches[0]); }, {passive: false});
    }
    setTimeout(() => {
        if (isDdosActive) {
            isDdosActive = false; if(alertDiv.parentNode) alertDiv.remove();
            if(ddosCounter.parentNode) ddosCounter.remove();
            document.querySelectorAll('.ddos-bug').forEach(e => e.remove());
            recalculateStats(); updateUI();
            updateEventBanner('DDoS ended. Income restored.');
        }
    }, 10000);
}

// ===== NEW FEATURES =====

// Achievement System
function checkAchievements() {
    let newUnlocks = [];
    achievements.forEach(a => {
        if (!a.done && a.check()) {
            a.done = true;
            newUnlocks.push(a);
        }
    });
    if (newUnlocks.length > 0) {
        newUnlocks.forEach(a => showToast(`🏆 Achievement: ${a.name}`));
        const banner = document.getElementById('achievementBanner');
        if (banner) {
            const latest = newUnlocks[newUnlocks.length - 1];
            banner.style.display = 'block';
            banner.innerHTML = `🏆 ${latest.name}<br><span style="font-size:0.78rem;color:#fbbf24;font-weight:400">${latest.desc}</span>`;
            clearTimeout(checkAchievements._timer);
            checkAchievements._timer = setTimeout(() => { banner.style.display = 'none'; }, 5000);
        }
    }
}

// Stats Modal
const statsBtn = document.getElementById('statsBtn');
const statsModal = document.getElementById('statsModal');
const closeStatsBtn = document.getElementById('closeStatsBtn');
if (statsBtn) statsBtn.onclick = () => { renderStats(); statsModal.classList.add('active'); };
if (closeStatsBtn) closeStatsBtn.onclick = () => statsModal.classList.remove('active');

function renderStats() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    const unlocked = achievements.filter(a => a.done).length;
    grid.innerHTML = [
        ['Total Taps', formatNumber(stats.totalTaps)],
        ['Total Earned', formatNumber(stats.totalEarned) + ' $RIA'],
        ['Best Combo', 'x' + stats.bestCombo.toFixed(1)],
        ['Epochs Cleared', stats.epochsCleared],
        ['Bosses Defeated', stats.bossesDefeated],
        ['Critical Hits', stats.critHits],
        ['DDoS Cleared', stats.ddosCleared],
        ['Achievements', unlocked + '/' + achievements.length],
    ].map(([label, val]) => `<div class="stat-item"><div class="stat-label">${label}</div><div class="stat-value">${val}</div></div>`).join('');
}

// Save indicator wraps saveGame
const saveIndicator = document.getElementById('saveIndicator');
function saveGameWithIndicator() {
    saveGame();
    if (saveIndicator) {
        saveIndicator.classList.add('show');
        clearTimeout(saveGameWithIndicator._t);
        saveGameWithIndicator._t = setTimeout(() => saveIndicator.classList.remove('show'), 1500);
    }
}
setInterval(saveGameWithIndicator, 5000);

// Patch loadGame to restore stats
(function patchLoad() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.stats) Object.assign(stats, data.stats);
            if (data.achievementsDone) {
                data.achievementsDone.forEach(id => {
                    const a = achievements.find(x => x.id === id);
                    if (a) a.done = true;
                });
            }
        } catch(e) {}
    }
})();

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        const rect = aiCore.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        aiCore.dispatchEvent(new MouseEvent('mousedown', { clientX: cx, clientY: cy }));
    }
    if ((e.code === 'KeyO') && !e.repeat) {
        e.preventDefault();
        const ob = document.getElementById('overclockBtn');
        if (ob && !ob.disabled) ob.click();
    }
});

// Offline Earnings Modal
(function checkOfflineEarnings() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        if (typeof data.lastSaveTime === 'number' && tokensPerSecond > 0) {
            const offlineSeconds = Math.min(Math.max((Date.now() - data.lastSaveTime) / 1000, 0), 12 * 60 * 60);
            if (offlineSeconds >= 30) {
                const earned = tokensPerSecond * offlineSeconds;
                const timeStr = offlineSeconds >= 3600 ? (offlineSeconds/3600).toFixed(1) + 'h'
                    : offlineSeconds >= 60 ? Math.floor(offlineSeconds/60) + 'm'
                    : Math.floor(offlineSeconds) + 's';
                const offlineModal = document.getElementById('offlineModal');
                const offlineTime = document.getElementById('offlineTimeText');
                const offlineEarned = document.getElementById('offlineEarnedDisplay');
                const offlineClaim = document.getElementById('offlineClaimBtn');
                if (offlineModal && offlineTime && offlineEarned && offlineClaim) {
                    offlineTime.innerText = `Your validators ran for ${timeStr} while you were away.`;
                    offlineEarned.innerText = `+${formatNumber(earned)} $RIA`;
                    offlineModal.classList.add('active');
                    offlineClaim.onclick = () => {
                        tokens += earned;
                        stats.totalEarned += earned;
                        offlineModal.classList.remove('active');
                        updateUI(); saveGame();
                        showToast(`Collected ${formatNumber(earned)} $RIA from offline`);
                    };
                }
            }
        }
    } catch(e) {}
})();

// Music Toggle
const musicBtn = document.getElementById('musicBtn');
function startMusic() {
    initAudio();
    if (musicOsc) return;
    musicOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    musicOsc.type = 'sine'; musicOsc.frequency.value = 110;
    gain.gain.value = 0.03;
    musicOsc.connect(gain); gain.connect(audioCtx.destination);
    musicOsc.start();
}
function stopMusic() {
    if (musicOsc) { musicOsc.stop(); musicOsc = null; }
}
if (musicBtn) {
    musicBtn.onclick = () => {
        musicEnabled = !musicEnabled;
        if (musicEnabled) { startMusic(); musicBtn.innerText = '🔊'; }
        else { stopMusic(); musicBtn.innerText = '🔇'; }
    };
}

// DDoS stats tracking
const _origStartDdos = startDdos;

// ===== RANDOM NODE MOVEMENT =====
// Node วิ่งสุ่มทั่วหน้าจอ — ยิ่ง TPS สูง ยิ่งเร็ว
(function randomNodeMovement() {
    const nodeWrapper = document.querySelector('.node-wrapper');
    if (!nodeWrapper) return;
    
    // ตั้งตำแหน่งเริ่มต้นกลางจอ
    nodeWrapper.style.top = (window.innerHeight / 2 - 100) + 'px';
    nodeWrapper.style.left = (window.innerWidth / 2 - 90) + 'px';
    
    function moveNode() {
        const speed = Math.min(tokensPerSecond / 2000, 1);
        const interval = 1400 - speed * 800; // 1.4s → 0.6s
        
        // สุ่มตำแหน่งทั่วหน้าจอ (เว้นขอบ 100px)
        const margin = 100;
        const maxX = window.innerWidth - 200 - margin;
        const maxY = window.innerHeight - 250 - margin;
        const newX = margin + Math.random() * maxX;
        const newY = margin + Math.random() * maxY;
        
        nodeWrapper.style.transitionDuration = (interval / 1000 * 0.85).toFixed(2) + 's';
        nodeWrapper.style.top = newY + 'px';
        nodeWrapper.style.left = newX + 'px';
        
        setTimeout(moveNode, interval + Math.random() * 400);
    }
    
    setTimeout(moveNode, 1000);
})();

// ===== LUCKY BOX =====
// กล่องทองปรากฏสุ่มทุก 20-45 วินาที กดได้ bonus สุ่ม
(function luckyBoxSystem() {
    const rewards = [
        { label: '💰 Double Burst!', fn: () => { const r = tokensPerSecond * 5; tokens += r; stats.totalEarned += r; return `+${formatNumber(r)} $RIA`; } },
        { label: '⚡ Instant Overclock!', fn: () => { overclockActive = true; overclockCooldown = OVERCLOCK_DURATION; aiCore.classList.add('overclock-on'); updateSkillBtn(); return 'Overclock activated!'; } },
        { label: '🔥 Fever Trigger!', fn: () => { feverMode = true; feverTimer = FEVER_DURATION; document.body.classList.add('fever-active'); return 'FEVER MODE!'; } },
        { label: '💎 Jackpot!', fn: () => { const r = tokensPerSecond * 20; tokens += r; stats.totalEarned += r; return `+${formatNumber(r)} $RIA JACKPOT!`; } },
        { label: '🛡️ Epoch Skip!', fn: () => { monsterHP = 0; const bonus = Math.floor(monsterMaxHP * 0.5); tokens += bonus; stats.totalEarned += bonus; stats.epochsCleared++; currentStage++; initStage(); return `Epoch cleared + ${formatNumber(bonus)} $RIA`; } },
    ];
    
    function spawnBox() {
        const box = document.createElement('div');
        box.className = 'lucky-box';
        box.innerHTML = '🎁';
        box.style.left = (80 + Math.random() * (window.innerWidth - 160)) + 'px';
        box.style.top = (80 + Math.random() * (window.innerHeight - 200)) + 'px';
        document.body.appendChild(box);
        
        // ลอยเปลี่ยนตำแหน่งทุก 1.5 วินาที
        const moveInterval = setInterval(() => {
            box.style.left = (80 + Math.random() * (window.innerWidth - 160)) + 'px';
            box.style.top = (80 + Math.random() * (window.innerHeight - 200)) + 'px';
        }, 1500);
        
        const clickHandler = (e) => {
            e.stopPropagation();
            clearInterval(moveInterval);
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            const result = reward.fn();
            showToast(`🎁 ${reward.label} ${result}`);
            playBuy();
            box.remove();
            updateUI();
        };
        box.addEventListener('mousedown', clickHandler);
        box.addEventListener('touchstart', (e) => { e.preventDefault(); clickHandler(e); }, {passive: false});
        
        // หายไปหลัง 8 วินาที
        setTimeout(() => { clearInterval(moveInterval); if(box.parentNode) box.remove(); }, 8000);
        
        // สุ่มเวลา spawn ถัดไป
        setTimeout(spawnBox, (20 + Math.random() * 25) * 1000);
    }
    setTimeout(spawnBox, 15000);
})();

// ===== COIN RAIN =====
// ทุก 60-90 วินาที ฝนเหรียญตกลงมา กดเก็บได้
(function coinRainSystem() {
    function startRain() {
        if (tokensPerSecond <= 0) { setTimeout(startRain, 30000); return; }
        showToast('🌧️ Coin Rain! Tap the falling coins!');
        const coinValue = Math.max(Math.floor(tokensPerSecond * 0.5), 1);
        let collected = 0;
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const coin = document.createElement('div');
                coin.className = 'rain-coin';
                coin.innerText = '🪙';
                coin.style.left = (50 + Math.random() * (window.innerWidth - 100)) + 'px';
                coin.style.top = '-50px';
                document.body.appendChild(coin);
                
                const clickHandler = (e) => {
                    e.stopPropagation();
                    tokens += coinValue; stats.totalEarned += coinValue; collected++;
                    playPop();
                    coin.style.transform = 'scale(2)'; coin.style.opacity = '0';
                    setTimeout(() => coin.remove(), 200);
                    updateUI();
                };
                coin.addEventListener('mousedown', clickHandler);
                coin.addEventListener('touchstart', (e) => { e.preventDefault(); clickHandler(e); }, {passive: false});
                
                // ตกลงมาจากบนจอ
                setTimeout(() => { if(coin.parentNode) coin.remove(); }, 4000);
            }, i * 300);
        }
        
        setTimeout(() => {
            if (collected > 0) showToast(`🌧️ Collected ${collected} coins: +${formatNumber(collected * coinValue)} $RIA`);
        }, 5500);
        
        setTimeout(startRain, (60 + Math.random() * 30) * 1000);
    }
    setTimeout(startRain, 45000);
})();
