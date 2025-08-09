// Game state variables
let canvas, ctx;
let citizens = [];
let gameRunning = false;
let selectedCitizen = null;
let gameSpeed = 1;
let gameStartTime = Date.now();

// Game systems
let economy;
let policySystem;
let districtManager;
let gameEvents;
let lifeCycleManager;

// Game statistics
let gameStats = {
    totalPopulation: 100000,
    averageHappiness: 75,
    totalBudget: 50000000,
    unemploymentRate: 5,
    protestPercent: 0,
    birthRate: 2.1
};

// Game over state
let isGameOver = false;

// Event management system
class GameEvents {
    constructor() {
        this.events = [];
        this.maxEvents = 30;
        this.importantEvents = [];
    }

    addEvent(message, type = 'info') {
        const event = {
            id: Date.now(),
            message: message,
            timestamp: new Date().toLocaleTimeString('vi-VN'),
            type: this.getEventType(message, type)
        };

        this.events.unshift(event);

        if (this.events.length > this.maxEvents) {
            this.events.pop();
        }

        // Lưu sự kiện quan trọng
        if (event.type === 'warning' || event.type === 'critical') {
            this.importantEvents.unshift(event);
            if (this.importantEvents.length > 10) {
                this.importantEvents.pop();
            }
        }

        this.updateEventDisplay();
    }

    getEventType(message, type) {
        if (type !== 'info') return type;

        if (message.includes('⚠️') || message.includes('biểu tình') || message.includes('GAME OVER')) return 'warning';
        if (message.includes('🏭') || message.includes('🏫') || message.includes('🏥')) return 'construction';
        if (message.includes('📈') || message.includes('📊') || message.includes('💰')) return 'economic';
        if (message.includes('👶') || message.includes('💒') || message.includes('⚰️')) return 'life';
        if (message.includes('🎉') || message.includes('🎵') || message.includes('⚽')) return 'entertainment';
        return 'info';
    }

    updateEventDisplay() {
        const eventsContainer = document.getElementById('events');
        if (!eventsContainer) return;

        eventsContainer.innerHTML = '';

        this.events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = `event-item ${event.type}`;
            eventDiv.innerHTML = `
                <div style="font-size: 11px; color: #666;">${event.timestamp}</div>
                <div style="font-size: 13px;">${event.message}</div>
            `;
            eventsContainer.appendChild(eventDiv);
        });
    }

    clear() {
        this.events = [];
        this.importantEvents = [];
        this.updateEventDisplay();
    }
}

// Initialize game
function initGame() {
    console.log('Initializing Advanced Social Simulation Game...');

    // Get canvas
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    ctx = canvas.getContext('2d');

    // Initialize game systems
    economy = new Economy();
    policySystem = new PolicySystem();
    districtManager = new DistrictManager();
    gameEvents = new GameEvents();
    lifeCycleManager = new LifeCycleManager();

    // Make systems globally available
    window.economy = economy;
    window.policySystem = policySystem;
    window.districtManager = districtManager;
    window.gameEvents = gameEvents;
    window.lifeCycleManager = lifeCycleManager;

    // Create initial population
    createInitialPopulation();

    // Setup event listeners
    setupEventListeners();

    // Start game loop
    gameRunning = true;
    isGameOver = false;
    requestAnimationFrame(gameLoop);

    // Initial UI update
    updateUI();

    gameEvents.addEvent('🎮 Trò chơi mô phỏng xã hội nâng cao đã bắt đầu!', 'info');
    gameEvents.addEvent(`👥 Tạo dân số ban đầu: ${citizens.length.toLocaleString('vi-VN')} người`, 'info');

    console.log(`Game initialized successfully with ${citizens.length} citizens!`);
}

function createInitialPopulation() {
    citizens = [];
    const populationPerDistrict = 25000; // Tổng 100,000 dân

    Object.keys(districtManager.districts).forEach(districtId => {
        const district = districtManager.districts[districtId];

        for (let i = 0; i < populationPerDistrict; i++) {
            const x = district.x + Math.random() * district.width;
            const y = district.y + Math.random() * district.height;

            const citizen = new AdvancedCitizen(x, y, districtId);
            citizens.push(citizen);
        }
    });

    // Make citizens globally available
    window.citizens = citizens;

    console.log(`Created ${citizens.length} citizens`);
}

function setupEventListeners() {
    // Policy sliders
    const sliders = [
        { id: 'taxSlider', display: 'taxRate', method: 'updateTaxRate' },
        { id: 'educationSlider', display: 'educationBudget', method: 'updateEducationBudget' },
        { id: 'healthSlider', display: 'healthBudget', method: 'updateHealthBudget' },
        { id: 'securitySlider', display: 'securityBudget', method: 'updateSecurityBudget' },
        { id: 'infrastructureSlider', display: 'infrastructureBudget', method: 'updateInfrastructureBudget' }
    ];

    sliders.forEach(slider => {
        const element = document.getElementById(slider.id);
        if (element) {
            element.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value);
                if (policySystem[slider.method]) {
                    policySystem[slider.method](newValue);
                }
                const displayElement = document.getElementById(slider.display);
                if (displayElement) {
                    displayElement.textContent = newValue;
                }
            });
        }
    });

    // Game speed control
    const speedSlider = document.getElementById('speedSlider');
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            gameSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = gameSpeed + 'x';
        });
    }

    // District selection
    const districtSelect = document.getElementById('districtSelect');
    if (districtSelect) {
        districtSelect.addEventListener('change', (e) => {
            districtManager.selectDistrict(e.target.value);
        });
    }

    // Building buttons
    const buildingButtons = [
        { id: 'buildFactory', method: 'createFactory', cost: 2000000 },
        { id: 'buildSchool', method: 'createSchool', cost: 1500000 },
        { id: 'buildHospital', method: 'createHospital', cost: 3000000 },
        { id: 'buildPark', method: 'createPark', cost: 800000 },
        { id: 'buildShoppingMall', method: 'createShoppingMall', cost: 2500000 }
    ];

    buildingButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('click', () => {
                const selectedDistrict = districtManager.getSelectedDistrict();
                if (economy.totalBudget >= button.cost) {
                    if (economy[button.method]) {
                        if (economy[button.method](selectedDistrict)) {
                            updateUI();
                        }
                    }
                } else {
                    gameEvents.addEvent(`❌ Không đủ ngân sách! Cần $${button.cost.toLocaleString('vi-VN')}`, 'warning');
                }
            });
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

// Event organization functions
function organizeEvent(eventType) {
    const eventCosts = {
        'music_festival': 500000,
        'sport_event': 300000,
        'cultural_festival': 400000,
        'fireworks': 200000,
        'free_food': 800000
    };

    const cost = eventCosts[eventType];
    if (economy.totalBudget >= cost) {
        economy.totalBudget -= cost;

        // Tác động tích cực lên dân
        const happinessBonus = {
            'music_festival': 15,
            'sport_event': 10,
            'cultural_festival': 12,
            'fireworks': 8,
            'free_food': 20
        };

        const bonus = happinessBonus[eventType];
        citizens.forEach(citizen => {
            citizen.happiness = Math.min(100, citizen.happiness + bonus * (0.5 + Math.random() * 0.5));
            if (eventType === 'free_food') {
                citizen.needs.food = Math.min(100, citizen.needs.food + 50);
            }
            if (eventType === 'music_festival' || eventType === 'cultural_festival') {
                citizen.needs.entertainment = Math.min(100, citizen.needs.entertainment + 30);
            }
        });

        const eventNames = {
            'music_festival': '🎵 Lễ hội âm nhạc',
            'sport_event': '⚽ Giải thể thao',
            'cultural_festival': '🎭 Lễ hội văn hóa',
            'fireworks': '🎆 Bắn pháo hoa',
            'free_food': '🍕 Phát thức ăn miễn phí'
        };

        gameEvents.addEvent(`${eventNames[eventType]} đã được tổ chức thành công! Dân vui vẻ hơn!`, 'entertainment');
        updateUI();
    } else {
        gameEvents.addEvent(`❌ Không đủ ngân sách để tổ chức sự kiện! Cần $${cost.toLocaleString('vi-VN')}`, 'warning');
    }
}

function selectCitizenAt(x, y) {
    selectedCitizen = null;
    let minDistance = Infinity;

    // Tìm dân gần nhất (chỉ kiểm tra 1000 dân đầu tiên để tối ưu hiệu suất)
    const citizensToCheck = citizens.slice(0, 1000);
    for (let citizen of citizensToCheck) {
        const distance = Math.sqrt((citizen.x - x) ** 2 + (citizen.y - y) ** 2);
        if (distance < 15 && distance < minDistance) {
            selectedCitizen = citizen;
            minDistance = distance;
        }
    }

    updateCitizenInfo();
}

function updateCitizenInfo() {
    const infoDiv = document.getElementById('selectedCitizenInfo');
    if (!infoDiv) return;

    if (selectedCitizen) {
        const info = selectedCitizen.getDetailedInfo();
        infoDiv.innerHTML = `
            <div><strong>👤 ${info.job} (${info.lifeStage})</strong></div>
            <div>📍 ${info.district} | 🏠 ${info.location}</div>
            <div>🎂 ${info.age} tuổi (${info.gender === 'male' ? 'Nam' : 'Nữ'})</div>
            <div>🎓 ${getEducationLabel(info.education)}</div>
            <div>💰 $${info.income.toLocaleString('vi-VN')}/tháng</div>
            <div>😊 Hạnh phúc: ${info.happiness}% | 🏥 Sức khỏe: ${info.health}%</div>
            <div>👫 ${getMaritalStatusLabel(info.maritalStatus)}</div>
            ${info.children > 0 ? `<div>👶 Con: ${info.children} người</div>` : ''}
            <div>🎭 ${info.personality}</div>
            <div>🏃 ${getActivityLabel(info.activity)}</div>
            <div>⏰ Tuổi thọ tối đa: ${info.maxLifespan} năm</div>
            <div style="margin-top: 10px;"><strong>Nhu cầu:</strong></div>
            <div>🍽️ Thực phẩm: ${info.needs.food}%</div>
            <div>🎉 Giải trí: ${info.needs.entertainment}%</div>
            <div>👥 Xã hội: ${info.needs.social}%</div>
            <div>😴 Nghỉ ngơi: ${info.needs.rest}%</div>
            <div>🛡️ An toàn: ${info.needs.safety}%</div>
            ${info.isProtesting ? '<div style="color: red; font-weight: bold;">🛡️ ĐANG BIỂU TÌNH!</div>' : ''}
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

function getMaritalStatusLabel(status) {
    const labels = {
        'single': 'Độc thân',
        'married': 'Đã kết hôn',
        'divorced': 'Đã ly hôn',
        'widowed': 'Góa vợ/chồng'
    };
    return labels[status] || status;
}

function getActivityLabel(activity) {
    const labels = {
        'idle': 'Nghỉ ngơi',
        'walking': 'Đi bộ',
        'working': 'Làm việc',
        'school': 'Đi học',
        'shopping': 'Mua sắm',
        'socializing': 'Giao lưu',
        'protesting': 'Biểu tình',
        'entertainment': 'Giải trí',
        'family_time': 'Thời gian gia đình',
        'sleep': 'Ngủ',
        'breakfast': 'Ăn sáng',
        'dinner': 'Ăn tối'
    };
    return labels[activity] || activity;
}

function gameLoop() {
    if (!gameRunning || isGameOver) return;

    // Update game systems
    const policies = policySystem.getCurrentPolicies();

    // Update citizens (chỉ update 1000 dân mỗi frame để tối ưu)
    const batchSize = Math.min(1000, citizens.length);
    const startIndex = Math.floor(Math.random() * Math.max(1, citizens.length - batchSize));

    for (let i = startIndex; i < startIndex + batchSize && i < citizens.length; i++) {
        const citizen = citizens[i];
        if (citizen && citizen.update) {
            citizen.update(Date.now(), policies, gameSpeed);
        }
    }

    // Update economy
    economy.updateEconomy(citizens, policies);

    // Update life cycle management
    lifeCycleManager.update(citizens, gameSpeed);

    // Update districts
    districtManager.updateDistrictPopulation(citizens);

    // Update game statistics
    updateGameStats();

    // Check game over condition
    checkGameOverCondition();

    // Render everything
    render();

    // Update UI periodically
    if (Math.random() < 0.05) { // 5% chance each frame
        updateUI();
    }

    // Random events
    handleRandomEvents();

    // Continue game loop
    if (gameRunning && !isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function updateGameStats() {
    gameStats.totalPopulation = citizens.length;

    if (citizens.length > 0) {
        // Calculate average happiness
        const totalHappiness = citizens.reduce((sum, citizen) => sum + citizen.happiness, 0);
        gameStats.averageHappiness = Math.floor(totalHappiness / citizens.length);

        // Calculate protest percentage
        const protestingCitizens = citizens.filter(c => c.isProtesting).length;
        gameStats.protestPercent = ((protestingCitizens / citizens.length) * 100).toFixed(1);

        // Calculate unemployment rate
        const unemployedCount = citizens.filter(c => c.job.name === 'Thất nghiệp').length;
        gameStats.unemploymentRate = ((unemployedCount / citizens.length) * 100).toFixed(1);
    }

    // Get economic data
    const economicData = economy.getEconomicData();
    gameStats.totalBudget = economicData.totalBudget;

    // Get life cycle data
    const lifeStats = lifeCycleManager.getStatistics();
    gameStats.birthRate = lifeStats.birthRate;
}

function checkGameOverCondition() {
    const protestPercent = parseFloat(gameStats.protestPercent);

    if (protestPercent > 50 && !isGameOver) {
        isGameOver = true;
        gameRunning = false;

        gameEvents.addEvent(`🚨 GAME OVER! ${protestPercent.toFixed(1)}% dân số đang biểu tình!`, 'critical');

        // Show game over modal
        const modal = document.getElementById('gameOverModal');
        if (modal) {
            modal.style.display = 'flex';
        }

        console.log('Game Over - Too many protests');
    }
}

function restartGame() {
    // Hide modal
    const modal = document.getElementById('gameOverModal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Reset game state
    isGameOver = false;
    citizens = [];
    gameSpeed = 1;
    document.getElementById('speedSlider').value = 1;
    document.getElementById('speedValue').textContent = '1x';

    // Clear events
    gameEvents.clear();

    // Reinitialize game
    initGame();
}

function handleRandomEvents() {
    if (Math.random() < 0.0005 * gameSpeed) { // Tăng tần suất với game speed
        const randomEvents = [
            () => {
                const districts = Object.keys(districtManager.districts);
                const district = districts[Math.floor(Math.random() * districts.length)];
                economy.simulateFactoryShutdown(district);
            },
            () => {
                gameEvents.addEvent('🌟 Phát hiện mỏ dầu mới! Ngân sách tăng $5,000,000', 'economic');
                economy.totalBudget += 5000000;
            },
            () => {
                gameEvents.addEvent('🌡️ Sóng nhiệt kỷ lục ảnh hưởng đến sức khỏe dân', 'warning');
                citizens.forEach(citizen => {
                    if (Math.random() < 0.1) {
                        citizen.health = Math.max(0, citizen.health - 10);
                    }
                });
            },
            () => {
                lifeCycleManager.triggerLifeEvent('baby_boom');
            },
            () => {
                lifeCycleManager.triggerLifeEvent('epidemic', citizens.length);
            },
            () => {
                gameEvents.addEvent('🎓 Trường đại học mở chương trình học bổng miễn phí!', 'education');
                citizens.forEach(citizen => {
                    if (citizen.age < 30 && Math.random() < 0.05) {
                        citizen.pursueEducation();
                    }
                });
            },
            () => {
                gameEvents.addEvent('💼 Công ty công nghệ lớn mở văn phòng mới!', 'economic');
                const techJobs = citizens.filter(c => c.job.name === 'Thất nghiệp' && c.education === 'university');
                techJobs.slice(0, 100).forEach(citizen => {
                    citizen.job = { name: 'Lập trình viên', salary: 1200, type: 'technology' };
                    citizen.income = citizen.calculateIncome();
                });
            }
        ];

        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        event();
    }
}

function render() {
    // Clear canvas với gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw districts first
    districtManager.renderDistricts(ctx);

    // Draw citizens (chỉ vẽ 2000 dân ngẫu nhiên để tối ưu hiệu suất)
    const citizensToRender = citizens.length > 2000 ?
        citizens.filter(() => Math.random() < 0.02) : // 2% citizens if too many
        citizens;

    citizensToRender.forEach(citizen => {
        if (citizen && citizen.render) {
            citizen.render(ctx);
        }
    });

    // Highlight selected citizen
    if (selectedCitizen) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(selectedCitizen.x - 5, selectedCitizen.y - 5, 10, 10);

        // Draw info bubble
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(selectedCitizen.x + 10, selectedCitizen.y - 20, 150, 25);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`${selectedCitizen.job.name}, ${selectedCitizen.age}t`, selectedCitizen.x + 15, selectedCitizen.y - 5);
    }

    // Draw protest areas
    drawProtestAreas();

    // Draw population density heatmap
    drawPopulationStats();
}

function drawProtestAreas() {
    const protestingCitizens = citizens.filter(c => c.isProtesting);

    if (protestingCitizens.length > 0) {
        // Group protesters by location
        const protestGroups = {};
        protestingCitizens.forEach(citizen => {
            const key = `${Math.floor(citizen.x / 50)}-${Math.floor(citizen.y / 50)}`;
            if (!protestGroups[key]) {
                protestGroups[key] = [];
            }
            protestGroups[key].push(citizen);
        });

        // Draw protest areas
        Object.values(protestGroups).forEach(group => {
            if (group.length >= 10) { // Chỉ vẽ khu vực có ít nhất 10 người biểu tình
                const centerX = group.reduce((sum, c) => sum + c.x, 0) / group.length;
                const centerY = group.reduce((sum, c) => sum + c.y, 0) / group.length;

                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 3;
                ctx.setLineDash([10, 5]);
                ctx.beginPath();
                ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#FF0000';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(`BIỂU TÌNH (${group.length})`, centerX - 50, centerY - 45);
            }
        });
    }
}

function drawPopulationStats() {
    // Vẽ thống kê dân số ở góc trên bên phải
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 250, 10, 240, 120);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('📊 Thống kê nhanh', canvas.width - 240, 30);

    ctx.font = '12px Arial';
    const quickStats = [
        `👥 Dân số: ${citizens.length.toLocaleString('vi-VN')}`,
        `😊 Hạnh phúc TB: ${gameStats.averageHappiness}%`,
        `🛡️ Biểu tình: ${gameStats.protestPercent}%`,
        `💼 Thất nghiệp: ${gameStats.unemploymentRate}%`,
        `⚡ Tốc độ: ${gameSpeed}x`
    ];

    quickStats.forEach((stat, index) => {
        ctx.fillText(stat, canvas.width - 240, 50 + index * 15);
    });
}

function updateUI() {
    // Update main statistics
    document.getElementById('population').textContent = gameStats.totalPopulation.toLocaleString('vi-VN');
    document.getElementById('budget').textContent = '$' + gameStats.totalBudget.toLocaleString('vi-VN');
    document.getElementById('happiness').textContent = gameStats.averageHappiness + '%';
    document.getElementById('unemployment').textContent = gameStats.unemploymentRate + '%';
    document.getElementById('birthRate').textContent = gameStats.birthRate;

    // Update protest percentage with warning
    const protestElement = document.getElementById('protestPercent');
    if (protestElement) {
        protestElement.textContent = gameStats.protestPercent + '%';

        // Add warning class if protest percentage is high
        const protestValue = parseFloat(gameStats.protestPercent);
        if (protestValue > 30) {
            protestElement.parentElement.classList.add('protest-warning');
        } else {
            protestElement.parentElement.classList.remove('protest-warning');
        }
    }

    // Update life statistics
    const lifeStats = lifeCycleManager.getStatistics();
    updateElement('totalFamilies', lifeStats.totalFamilies || 0);
    updateElement('todayBirths', lifeStats.todayBirths || 0);
    updateElement('todayDeaths', lifeStats.todayDeaths || 0);
    updateElement('todayMarriages', lifeStats.todayMarriages || 0);
    updateElement('averageLifespan', Math.floor(lifeStats.averageLifespan || 65));

    // Update economic statistics
    const economicData = economy.getEconomicData();
    updateElement('monthlyTax', '$' + (economicData.taxRevenue / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    updateElement('monthlyExpense', '$' + ((economicData.totalBudget * 0.1) / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    updateElement('inflation', economicData.inflationRate.toFixed(1) + '%');
    updateElement('growth', economicData.economicGrowth.toFixed(1) + '%');
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Make functions globally available
window.organizeEvent = organizeEvent;
window.restartGame = restartGame;

// Export for debugging
window.gameDebug = {
    citizens,
    economy,
    policySystem,
    districtManager,
    gameEvents,
    lifeCycleManager,
    gameStats
};
