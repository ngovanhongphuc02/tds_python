class LifeCycleManager {
    constructor() {
        this.families = [];
        this.statistics = {
            totalBirths: 0,
            totalDeaths: 0,
            totalMarriages: 0,
            todayBirths: 0,
            todayDeaths: 0,
            todayMarriages: 0,
            averageLifespan: 65,
            birthRate: 2.1,
            deathRate: 1.8
        };

        this.dailyResetTimer = 0;
    }

    update(citizens, gameSpeed) {
        this.updateDailyTimer(gameSpeed);
        this.calculateStatistics(citizens);
        this.manageFamilies(citizens);
        this.handlePopulationGrowth(citizens);
    }

    updateDailyTimer(gameSpeed) {
        this.dailyResetTimer += gameSpeed;

        // Reset thống kê hàng ngày (mỗi 24 phút thực = 1 ngày game)
        if (this.dailyResetTimer >= 24 * 60 * 1000) {
            this.dailyResetTimer = 0;
            this.resetDailyStats();
        }
    }

    resetDailyStats() {
        this.statistics.todayBirths = 0;
        this.statistics.todayDeaths = 0;
        this.statistics.todayMarriages = 0;
    }

    calculateStatistics(citizens) {
        if (!citizens || citizens.length === 0) return;

        // Tính tuổi thọ trung bình
        const totalAge = citizens.reduce((sum, citizen) => sum + citizen.age, 0);
        this.statistics.averageLifespan = Math.floor(totalAge / citizens.length);

        // Tính tỷ lệ sinh và tử
        const marriedCouples = this.countMarriedCouples(citizens);
        const children = citizens.filter(c => c.lifeStage === 'child').length;
        const totalPopulation = citizens.length;

        this.statistics.birthRate = (children / totalPopulation * 100).toFixed(1);
        this.statistics.deathRate = (this.statistics.totalDeaths / totalPopulation * 100).toFixed(1);
    }

    countMarriedCouples(citizens) {
        const marriedCount = citizens.filter(c => c.maritalStatus === 'married').length;
        return Math.floor(marriedCount / 2);
    }

    manageFamilies(citizens) {
        // Cập nhật thông tin gia đình
        this.families = this.families.filter(family => {
            const familyMembers = citizens.filter(c => c.family === family.id);
            return familyMembers.length > 0;
        });

        // Đếm tổng số gia đình
        const uniqueFamilies = new Set();
        citizens.forEach(citizen => {
            if (citizen.family) {
                uniqueFamilies.add(citizen.family);
            }
        });

        this.statistics.totalFamilies = uniqueFamilies.size;
    }

    handlePopulationGrowth(citizens) {
        // Tự động tạo dân mới nếu dân số giảm quá thấp
        if (citizens.length < 50000) {
            this.createNewCitizens(citizens, 100);
        }

        // Kiểm soát dân số quá cao
        if (citizens.length > 150000) {
            this.implementBirthControl();
        }
    }

    createNewCitizens(citizens, count) {
        const districts = ['district1', 'district2', 'district3', 'district4'];

        for (let i = 0; i < count; i++) {
            const district = districts[Math.floor(Math.random() * districts.length)];
            const districtBounds = window.districtManager?.districts[district] ||
                                 { x: 200, y: 200, width: 200, height: 200 };

            const x = districtBounds.x + Math.random() * districtBounds.width;
            const y = districtBounds.y + Math.random() * districtBounds.height;

            // Tạo dân với độ tuổi ngẫu nhiên
            const age = Math.floor(Math.random() * 50) + 18;
            const newCitizen = new AdvancedCitizen(x, y, district, age);

            citizens.push(newCitizen);
        }

        window.gameEvents?.addEvent(`👥 ${count} người dân mới đã di cư đến thành phố!`);
    }

    implementBirthControl() {
        // Giảm tỷ lệ sinh con khi dân số quá cao
        window.gameEvents?.addEvent(`⚠️ Dân số quá cao! Tự động áp dụng chính sách kế hoạch hóa gia đình.`);

        // Có thể thêm logic giảm tỷ lệ sinh con ở đây
    }

    triggerLifeEvent(eventType, citizenCount) {
        switch (eventType) {
            case 'baby_boom':
                this.babyBoomEvent();
                break;
            case 'epidemic':
                this.epidemicEvent(citizenCount);
                break;
            case 'mass_migration':
                this.massMigrationEvent();
                break;
            case 'aging_population':
                this.agingPopulationEvent();
                break;
        }
    }

    babyBoomEvent() {
        window.gameEvents?.addEvent(`👶 BOOM SINH! Chính sách khuyến khích sinh con đã có hiệu quả!`);

        // Tăng cơ hội sinh con cho các cặp vợ chồng
        if (window.citizens) {
            window.citizens.forEach(citizen => {
                if (citizen.maritalStatus === 'married' &&
                    citizen.age >= 20 && citizen.age <= 45 &&
                    Math.random() < 0.1) {
                    citizen.haveBaby();
                }
            });
        }
    }

    epidemicEvent(population) {
        const affectedCount = Math.floor(population * 0.05); // 5% dân số
        window.gameEvents?.addEvent(`🦠 Dịch bệnh bùng phát! Ước tính ${affectedCount} người có thể bị ảnh hưởng.`);

        // Giảm sức khỏe toàn dân
        if (window.citizens) {
            window.citizens.forEach(citizen => {
                citizen.health = Math.max(0, citizen.health - Math.random() * 30);
                citizen.happiness = Math.max(0, citizen.happiness - 10);
            });
        }
    }

    massMigrationEvent() {
        const migrantCount = Math.floor(Math.random() * 5000) + 2000;
        window.gameEvents?.addEvent(`🚚 Có ${migrantCount} người di cư đến thành phố tìm việc làm!`);

        this.createNewCitizens(window.citizens, migrantCount);
    }

    agingPopulationEvent() {
        window.gameEvents?.addEvent(`👴 Xã hội đang già hóa! Cần tăng cường chính sách chăm sóc người già.`);

        // Tăng tuổi tác trung bình và giảm tỷ lệ sinh
        if (window.citizens) {
            window.citizens.forEach(citizen => {
                if (citizen.lifeStage === 'adult') {
                    citizen.maxLifespan += 5; // Tăng tuổi thọ
                }
            });
        }
    }

    getStatistics() {
        return { ...this.statistics };
    }

    recordBirth() {
        this.statistics.totalBirths++;
        this.statistics.todayBirths++;
    }

    recordDeath() {
        this.statistics.totalDeaths++;
        this.statistics.todayDeaths++;
    }

    recordMarriage() {
        this.statistics.totalMarriages++;
        this.statistics.todayMarriages++;
    }
}

// Export để sử dụng trong main
window.LifeCycleManager = LifeCycleManager;
