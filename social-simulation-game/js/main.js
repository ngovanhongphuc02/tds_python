// Game state variables
let canvas, ctx;
let citizens = [];
let gameRunning = false;
let selectedCitizen = null;

// Game systems
let economy;
let policySystem;
let districtManager;
let gameEvents;

// Game statistics
let gameStats = {
    totalPopulation: 0,
    averageHappiness: 75,
    totalBudget: 1000000,
    unemploymentRate: 5
};

// Event management system
class GameEvents {
    constructor() {
        this.events = [];
        this.maxEvents = 20;
    }

    addEvent(message) {
        const event = {
            id: Date.now(),
            message: message,
            timestamp: new Date().toLocaleTimeString('vi-VN'),
            type: this.getEventType(message)
        };

        this.events.unshift(event);

        if (this.events.length > this.maxEvents) {
            this.events.pop();
        }

        this.updateEventDisplay();
    }

    getEventType(message) {
        if (message.includes('⚠️') || message.includes('biểu tình')) return 'warning';
        if (message.includes('🏭') || message.includes('🏫') || message.includes('🏥')) return 'construction';
        if (message.includes('📈') || message.includes('📊')) return 'economic';
        return 'info';
    }

    updateEventDisplay() {
        const eventsContainer = document.getElementById('events');
        eventsContainer.innerHTML = '';

        this.events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = `event-item ${event.type}`;
            eventDiv.innerHTML = `
                <div style="font-size: 12px; color: #666;">${event.timestamp}</div>
                <div>${event.message}</div>
            `;
            eventsContainer.appendChild(eventDiv);
        });
    }

    clear() {
        this.events = [];
        this.updateEventDisplay();
    }
}

// Initialize game
function initGame() {
    console.log('Initializing Social Simulation Game...');

    // Get canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Initialize game systems
    economy = new Economy();
    policySystem = new PolicySystem();
    districtManager = new DistrictManager();
    gameEvents = new GameEvents();

    // Create initial population
    createInitialPopulation();

    // Setup event listeners
    setupEventListeners();

    // Start game loop
    gameRunning = true;
    gameLoop();

    // Initial UI update
    updateUI();

    gameEvents.addEvent('🎮 Trò chơi mô phỏng xã hội đã bắt đầu!');
    gameEvents.addEvent('👥 Tạo dân số ban đầu thành công!');

    console.log('Game initialized successfully!');
}

function createInitialPopulation() {
    citizens = [];
    const populationPerDistrict = 25; // Tổng 100 dân

    Object.keys(districtManager.districts).forEach(districtId => {
        const district = districtManager.districts[districtId];

        for (let i = 0; i < populationPerDistrict; i++) {
            const x = district.x + Math.random() * district.width;
            const y = district.y + Math.random() * district.height;

            const citizen = new Citizen(x, y, districtId);
            citizens.push(citizen);
        }
    });

    console.log(`Created ${citizens.length} citizens`);
}

function setupEventListeners() {
    // Tax slider
    const taxSlider = document.getElementById('taxSlider');
    taxSlider.addEventListener('input', (e) => {
        const newRate = parseInt(e.target.value);
        policySystem.updateTaxRate(newRate);
        document.getElementById('taxRate').textContent = newRate;
    });

    // Education budget slider
    const educationSlider = document.getElementById('educationSlider');
    educationSlider.addEventListener('input', (e) => {
        const newBudget = parseInt(e.target.value);
        policySystem.updateEducationBudget(newBudget);
        document.getElementById('educationBudget').textContent = newBudget;
    });

    // Health budget slider
    const healthSlider = document.getElementById('healthSlider');
    healthSlider.addEventListener('input', (e) => {
        const newBudget = parseInt(e.target.value);
        policySystem.updateHealthBudget(newBudget);
        document.getElementById('healthBudget').textContent = newBudget;
    });

    // District selection
    const districtSelect = document.getElementById('districtSelect');
    districtSelect.addEventListener('change', (e) => {
        districtManager.selectDistrict(e.target.value);
    });

    // Building buttons
    document.getElementById('buildFactory').addEventListener('click', () => {
        const selectedDistrict = districtManager.getSelectedDistrict();
        if (economy.createFactory(selectedDistrict)) {
            updateUI();
        } else {
            gameEvents.addEvent('❌ Không đủ ngân sách để xây nhà máy!');
        }
    });

    document.getElementById('buildSchool').addEventListener('click', () => {
        const selectedDistrict = districtManager.getSelectedDistrict();
        if (economy.createSchool(selectedDistrict)) {
            updateUI();
        } else {
            gameEvents.addEvent('❌ Không đủ ngân sách để xây trường học!');
        }
    });

    document.getElementById('buildHospital').addEventListener('click', () => {
        const selectedDistrict = districtManager.getSelectedDistrict();
        if (economy.createHospital(selectedDistrict)) {
            updateUI();
        } else {
            gameEvents.addEvent('❌ Không đủ ngân sách để xây bệnh viện!');
        }
    });

    // Canvas click for citizen selection
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        selectCitizenAt(x, y);
    });
}

function selectCitizenAt(x, y) {
    selectedCitizen = null;

    for (let citizen of citizens) {
        const distance = Math.sqrt((citizen.x - x) ** 2 + (citizen.y - y) ** 2);
        if (distance < 10) {
            selectedCitizen = citizen;
            break;
        }
    }

    updateCitizenInfo();
}

function updateCitizenInfo() {
    const infoDiv = document.getElementById('selectedCitizenInfo');

    if (selectedCitizen) {
        const info = selectedCitizen.getInfo();
        infoDiv.innerHTML = `
            <div><strong>👤 ${info.job}</strong></div>
            <div>📍 ${info.district}</div>
            <div>🎂 ${info.age} tuổi (${info.gender === 'male' ? 'Nam' : 'Nữ'})</div>
            <div>🎓 ${getEducationLabel(info.education)}</div>
            <div>💰 ${info.income.toLocaleString('vi-VN')}$/tháng</div>
            <div>😊 Hạnh phúc: ${info.happiness}%</div>
            <div>🏥 Sức khỏe: ${info.health}%</div>
            <div>🎭 Tính cách: ${info.personality}</div>
            <div>🏃 Hoạt động: ${getActivityLabel(info.activity)}</div>
            ${info.isProtesting ? '<div style="color: red;">🛡️ ĐANG BIỂU TÌNH!</div>' : ''}
        `;
    } else {
        infoDiv.innerHTML = 'Click vào dân để xem thông tin chi tiết';
    }
}

function getEducationLabel(education) {
    const labels = {
        'basic': 'Cơ bản',
        'high_school': 'Phổ thông',
        'college': 'Cao đẳng',
        'university': 'Đại học'
    };
    return labels[education] || education;
}

function getActivityLabel(activity) {
    const labels = {
        'idle': 'Nghỉ ngơi',
        'walking': 'Đi bộ',
        'working': 'Làm việc',
        'shopping': 'Mua sắm',
        'socializing': 'Giao lưu',
        'protesting': 'Biểu tình'
    };
    return labels[activity] || activity;
}

function gameLoop() {
    if (!gameRunning) return;

    // Update game systems
    const policies = policySystem.getCurrentPolicies();

    // Update citizens
    citizens.forEach(citizen => {
        citizen.update(Date.now(), policies);
    });

    // Update economy
    economy.updateEconomy(citizens, policies);

    // Update districts
    districtManager.updateDistrictPopulation(citizens);

    // Update game statistics
    updateGameStats();

    // Render everything
    render();

    // Update UI periodically
    if (Math.random() < 0.1) { // 10% chance each frame
        updateUI();
    }

    // Random events
    handleRandomEvents();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

function updateGameStats() {
    gameStats.totalPopulation = citizens.length;

    // Calculate average happiness
    const totalHappiness = citizens.reduce((sum, citizen) => sum + citizen.happiness, 0);
    gameStats.averageHappiness = Math.floor(totalHappiness / citizens.length);

    // Get economic data
    const economicData = economy.getEconomicData();
    gameStats.totalBudget = economicData.totalBudget;
    gameStats.unemploymentRate = economicData.unemploymentRate;
}

function handleRandomEvents() {
    if (Math.random() < 0.001) { // 0.1% chance per frame
        const randomEvents = [
            () => {
                const district = Object.keys(districtManager.districts)[Math.floor(Math.random() * 4)];
                economy.simulateFactoryShutdown(district);
            },
            () => {
                gameEvents.addEvent('🌟 Phát hiện mỏ dầu mới! Ngân sách tăng 200,000$');
                economy.totalBudget += 200000;
            },
            () => {
                gameEvents.addEvent('🌡️ Thời tiết khắc nghiệt ảnh hưởng đến sản xuất nông nghiệp');
                citizens.forEach(citizen => {
                    if (citizen.job.type === 'agriculture') {
                        citizen.happiness -= 5;
                    }
                });
            },
            () => {
                gameEvents.addEvent('🎊 Lễ hội văn hóa thành công! Dân vui vẻ hơn');
                citizens.forEach(citizen => {
                    citizen.happiness += Math.random() * 10;
                });
            }
        ];

        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        event();
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw districts first
    districtManager.renderDistricts(ctx);

    // Draw citizens
    citizens.forEach(citizen => {
        citizen.render(ctx);
    });

    // Highlight selected citizen
    if (selectedCitizen) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(selectedCitizen.x - 2, selectedCitizen.y - 2, 8, 8);
    }

    // Draw protest areas
    drawProtestAreas();
}

function drawProtestAreas() {
    const protestingCitizens = citizens.filter(c => c.isProtesting);

    if (protestingCitizens.length > 0) {
        // Draw protest circle
        const centerX = protestingCitizens.reduce((sum, c) => sum + c.x, 0) / protestingCitizens.length;
        const centerY = protestingCitizens.reduce((sum, c) => sum + c.y, 0) / protestingCitizens.length;

        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw protest text
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`BIỂU TÌNH (${protestingCitizens.length})`, centerX - 40, centerY - 35);
    }
}

function updateUI() {
    // Update population
    document.getElementById('population').textContent = gameStats.totalPopulation.toLocaleString('vi-VN');

    // Update budget
    document.getElementById('budget').textContent = '$' + gameStats.totalBudget.toLocaleString('vi-VN');

    // Update happiness
    document.getElementById('happiness').textContent = gameStats.averageHappiness + '%';

    // Update unemployment
    document.getElementById('unemployment').textContent = gameStats.unemploymentRate.toFixed(1) + '%';

    // Update job statistics
    updateJobStats();
}

function updateJobStats() {
    const jobCount = {};

    citizens.forEach(citizen => {
        const jobName = citizen.job.name;
        if (jobCount[jobName]) {
            jobCount[jobName]++;
        } else {
            jobCount[jobName] = 1;
        }
    });

    const jobList = document.getElementById('jobList');
    jobList.innerHTML = '';

    // Sort jobs by count
    const sortedJobs = Object.entries(jobCount).sort((a, b) => b[1] - a[1]);

    sortedJobs.forEach(([jobName, count]) => {
        const jobDiv = document.createElement('div');
        jobDiv.className = 'job-item';
        jobDiv.innerHTML = `
            <span>${jobName}</span>
            <span>${count} người</span>
        `;
        jobList.appendChild(jobDiv);
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Export for debugging
window.gameDebug = {
    citizens,
    economy,
    policySystem,
    districtManager,
    gameEvents,
    gameStats
};
