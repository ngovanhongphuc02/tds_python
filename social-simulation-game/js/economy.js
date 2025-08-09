class Economy {
    constructor() {
        this.totalBudget = 1000000;
        this.taxRevenue = 0;
        this.expenses = {
            education: 0,
            healthcare: 0,
            infrastructure: 0,
            welfare: 0
        };
        this.unemploymentRate = 5;
        this.inflationRate = 2;
        this.economicGrowth = 3;

        // Dữ liệu kinh tế theo quận
        this.districtEconomy = {
            district1: { businesses: 15, unemployment: 3, averageIncome: 800 },
            district2: { businesses: 25, unemployment: 4, averageIncome: 600 },
            district3: { businesses: 20, unemployment: 6, averageIncome: 500 },
            district4: { businesses: 10, unemployment: 8, averageIncome: 400 }
        };
    }

    calculateTaxRevenue(citizens, taxRate) {
        this.taxRevenue = 0;
        citizens.forEach(citizen => {
            if (citizen.job.name !== 'Thất nghiệp') {
                this.taxRevenue += citizen.income * (taxRate / 100) * 12; // Thu thuế cả năm
            }
        });
        return this.taxRevenue;
    }

    updateEconomy(citizens, policies) {
        // Tính toán doanh thu thuế
        this.calculateTaxRevenue(citizens, policies.taxRate);

        // Tính toán chi tiêu
        this.expenses.education = this.totalBudget * (policies.educationBudget / 100);
        this.expenses.healthcare = this.totalBudget * (policies.healthBudget / 100);

        // Cập nhật ngân sách
        const netIncome = this.taxRevenue - Object.values(this.expenses).reduce((a, b) => a + b, 0);
        this.totalBudget += netIncome;

        // Tính tỷ lệ thất nghiệp
        const unemployedCount = citizens.filter(c => c.job.name === 'Thất nghiệp').length;
        this.unemploymentRate = (unemployedCount / citizens.length) * 100;

        // Tác động của chính sách lên kinh tế
        this.updateEconomicIndicators(policies);
        this.updateDistrictEconomy(policies);
    }

    updateEconomicIndicators(policies) {
        // Thuế cao làm giảm tăng trưởng
        if (policies.taxRate > 35) {
            this.economicGrowth = Math.max(0, this.economicGrowth - 0.1);
        } else if (policies.taxRate < 20) {
            this.economicGrowth = Math.min(8, this.economicGrowth + 0.05);
        }

        // Đầu tư giáo dục thúc đẩy tăng trưởng dài hạn
        if (policies.educationBudget > 35) {
            this.economicGrowth = Math.min(8, this.economicGrowth + 0.03);
        }

        // Lạm phát dao động
        this.inflationRate += (Math.random() - 0.5) * 0.5;
        this.inflationRate = Math.max(0, Math.min(10, this.inflationRate));
    }

    updateDistrictEconomy(policies) {
        // Cập nhật kinh tế theo từng quận
        Object.keys(this.districtEconomy).forEach(district => {
            const econ = this.districtEconomy[district];

            // Tác động của thuế
            if (policies.taxRate > 30) {
                econ.businesses = Math.max(0, econ.businesses - 0.1);
                econ.unemployment = Math.min(20, econ.unemployment + 0.2);
            }

            // Tác động của đầu tư giáo dục
            if (policies.educationBudget > 30) {
                econ.averageIncome = Math.min(1200, econ.averageIncome + 2);
            }
        });
    }

    createFactory(district) {
        if (this.totalBudget >= 100000) {
            this.totalBudget -= 100000;
            const econ = this.districtEconomy[district];
            econ.businesses += 1;
            econ.unemployment = Math.max(0, econ.unemployment - 2);

            gameEvents.addEvent(`🏭 Đã xây dựng nhà máy mới tại ${district}. Tạo thêm 50 việc làm!`);
            return true;
        }
        return false;
    }

    createSchool(district) {
        if (this.totalBudget >= 80000) {
            this.totalBudget -= 80000;
            const econ = this.districtEconomy[district];
            econ.averageIncome += 20;

            gameEvents.addEvent(`🏫 Đã xây dựng trường học mới tại ${district}. Nâng cao trình độ dân trí!`);
            return true;
        }
        return false;
    }

    createHospital(district) {
        if (this.totalBudget >= 120000) {
            this.totalBudget -= 120000;

            gameEvents.addEvent(`🏥 Đã xây dựng bệnh viện mới tại ${district}. Cải thiện sức khỏe cộng đồng!`);
            return true;
        }
        return false;
    }

    simulateFactoryShutdown(district) {
        const econ = this.districtEconomy[district];
        if (econ.businesses > 0) {
            econ.businesses -= 1;
            econ.unemployment = Math.min(25, econ.unemployment + 3);

            gameEvents.addEvent(`⚠️ Nhà máy tại ${district} đã đóng cửa! Tỷ lệ thất nghiệp tăng cao!`);
        }
    }

    getEconomicData() {
        return {
            totalBudget: Math.floor(this.totalBudget),
            taxRevenue: Math.floor(this.taxRevenue),
            unemploymentRate: Math.floor(this.unemploymentRate * 10) / 10,
            economicGrowth: Math.floor(this.economicGrowth * 10) / 10,
            inflationRate: Math.floor(this.inflationRate * 10) / 10,
            districtEconomy: this.districtEconomy
        };
    }
}
