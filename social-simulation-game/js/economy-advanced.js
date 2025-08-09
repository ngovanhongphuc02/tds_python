class Economy {
    constructor() {
        this.totalBudget = 50000000; // 50 triệu USD
        this.taxRevenue = 0;
        this.monthlyExpenses = 0;
        this.expenses = {
            education: 0,
            healthcare: 0,
            infrastructure: 0,
            security: 0,
            welfare: 0
        };
        this.unemploymentRate = 5;
        this.inflationRate = 2.1;
        this.economicGrowth = 3.2;
        this.gdpPerCapita = 15000;

        // Dữ liệu kinh tế theo quận
        this.districtEconomy = {
            district1: { businesses: 500, unemployment: 3, averageIncome: 1200, factories: 20 },
            district2: { businesses: 800, unemployment: 4, averageIncome: 900, factories: 50 },
            district3: { businesses: 600, unemployment: 6, averageIncome: 800, factories: 15 },
            district4: { businesses: 200, unemployment: 8, averageIncome: 600, factories: 5 }
        };

        // Chỉ số kinh tế
        this.economicIndicators = {
            stockMarket: 1000,
            employmentGrowth: 2.5,
            businessConfidence: 75,
            consumerSpending: 80
        };
    }

    calculateTaxRevenue(citizens, taxRate) {
        this.taxRevenue = 0;
        citizens.forEach(citizen => {
            if (citizen.job.name !== 'Thất nghiệp' && citizen.job.name !== 'Học sinh') {
                this.taxRevenue += citizen.income * (taxRate / 100) * 12;
            }
        });
        return this.taxRevenue;
    }

    updateEconomy(citizens, policies) {
        // Tính toán doanh thu thuế
        this.calculateTaxRevenue(citizens, policies.taxRate);

        // Tính toán chi tiêu
        this.calculateExpenses(policies);

        // Cập nhật ngân sách
        const netIncome = this.taxRevenue - this.monthlyExpenses * 12;
        this.totalBudget += netIncome / 12; // Cập nhật hàng tháng

        // Đảm bảo ngân sách không âm
        this.totalBudget = Math.max(0, this.totalBudget);

        // Tính tỷ lệ thất nghiệp
        this.updateUnemploymentRate(citizens);

        // Tác động của chính sách lên kinh tế
        this.updateEconomicIndicators(policies, citizens);
        this.updateDistrictEconomy(policies);

        // Xử lý nợ nần nếu ngân sách âm
        if (this.totalBudget <= 0) {
            this.handleBankruptcy(citizens);
        }
    }

    calculateExpenses(policies) {
        const baseBudget = this.totalBudget;

        this.expenses.education = baseBudget * (policies.educationBudget / 100);
        this.expenses.healthcare = baseBudget * (policies.healthBudget / 100);
        this.expenses.security = baseBudget * (policies.securityBudget / 100);
        this.expenses.infrastructure = baseBudget * (policies.infrastructureBudget / 100);
        this.expenses.welfare = baseBudget * 0.05; // 5% cho phúc lợi xã hội

        this.monthlyExpenses = Object.values(this.expenses).reduce((a, b) => a + b, 0) / 12;
    }

    updateUnemploymentRate(citizens) {
        const workingAge = citizens.filter(c => c.age >= 18 && c.age < 65);
        const unemployed = workingAge.filter(c => c.job.name === 'Thất nghiệp');
        this.unemploymentRate = workingAge.length > 0 ? (unemployed.length / workingAge.length) * 100 : 0;
    }

    updateEconomicIndicators(policies, citizens) {
        // Tác động của thuế lên tăng trưởng
        if (policies.taxRate > 40) {
            this.economicGrowth = Math.max(-2, this.economicGrowth - 0.1);
            this.economicIndicators.businessConfidence = Math.max(20, this.economicIndicators.businessConfidence - 1);
        } else if (policies.taxRate < 25) {
            this.economicGrowth = Math.min(8, this.economicGrowth + 0.05);
            this.economicIndicators.businessConfidence = Math.min(100, this.economicIndicators.businessConfidence + 0.5);
        }

        // Tác động của đầu tư giáo dục
        if (policies.educationBudget > 30) {
            this.economicGrowth = Math.min(8, this.economicGrowth + 0.02);
            this.gdpPerCapita += 10;
        }

        // Tác động của đầu tư y tế
        if (policies.healthBudget > 25) {
            this.economicIndicators.consumerSpending = Math.min(100, this.economicIndicators.consumerSpending + 0.5);
        }

        // Tác động của an ninh
        if (policies.securityBudget < 10) {
            this.economicIndicators.businessConfidence = Math.max(20, this.economicIndicators.businessConfidence - 0.8);
        }

        // Lạm phát dao động
        this.inflationRate += (Math.random() - 0.5) * 0.3;
        this.inflationRate = Math.max(0, Math.min(15, this.inflationRate));

        // Cập nhật chỉ số chứng khoán
        this.economicIndicators.stockMarket += (this.economicGrowth - 3) * 10 + (Math.random() - 0.5) * 50;
        this.economicIndicators.stockMarket = Math.max(500, this.economicIndicators.stockMarket);

        // Tính toán GDP per capita
        const totalIncome = citizens.reduce((sum, citizen) => sum + citizen.income * 12, 0);
        this.gdpPerCapita = citizens.length > 0 ? totalIncome / citizens.length : 15000;
    }

    updateDistrictEconomy(policies) {
        Object.keys(this.districtEconomy).forEach(district => {
            const econ = this.districtEconomy[district];

            // Tác động của thuế
            if (policies.taxRate > 35) {
                econ.businesses = Math.max(0, econ.businesses - 0.5);
                econ.unemployment = Math.min(25, econ.unemployment + 0.1);
            } else if (policies.taxRate < 20) {
                econ.businesses = Math.min(econ.businesses * 1.5, econ.businesses + 1);
                econ.unemployment = Math.max(1, econ.unemployment - 0.1);
            }

            // Tác động của đầu tư hạ tầng
            if (policies.infrastructureBudget > 25) {
                econ.averageIncome = Math.min(2000, econ.averageIncome + 5);
                econ.businesses = Math.min(econ.businesses * 1.2, econ.businesses + 2);
            }
        });
    }

    handleBankruptcy(citizens) {
        window.gameEvents?.addEvent('💸 KHỦNG HOẢNG TÀI CHÍNH! Ngân sách đã cạn kiệt!', 'critical');

        // Giảm chất lượng dịch vụ công
        citizens.forEach(citizen => {
            citizen.happiness = Math.max(0, citizen.happiness - 20);
            citizen.health = Math.max(0, citizen.health - 10);
        });

        // Tăng tỷ lệ thất nghiệp
        const publicWorkers = citizens.filter(c => c.job.type === 'public' || c.job.type === 'education' || c.job.type === 'healthcare');
        publicWorkers.slice(0, Math.floor(publicWorkers.length * 0.2)).forEach(citizen => {
            citizen.job = { name: 'Thất nghiệp', salary: 0, type: 'unemployed' };
            citizen.income = 0;
        });
    }

    createFactory(district) {
        const cost = 2000000;
        if (this.totalBudget >= cost) {
            this.totalBudget -= cost;
            const econ = this.districtEconomy[district];
            econ.factories += 1;
            econ.businesses += 3;
            econ.unemployment = Math.max(0, econ.unemployment - 1.5);

            window.gameEvents?.addEvent(`🏭 Đã xây dựng nhà máy mới tại ${district}. Tạo thêm 200 việc làm!`, 'construction');
            return true;
        }
        return false;
    }

    createSchool(district) {
        const cost = 1500000;
        if (this.totalBudget >= cost) {
            this.totalBudget -= cost;
            const econ = this.districtEconomy[district];
            econ.averageIncome += 50;

            window.gameEvents?.addEvent(`🏫 Đã xây dựng trường học mới tại ${district}. Nâng cao trình độ giáo dục!`, 'construction');
            return true;
        }
        return false;
    }

    createHospital(district) {
        const cost = 3000000;
        if (this.totalBudget >= cost) {
            this.totalBudget -= cost;

            window.gameEvents?.addEvent(`🏥 Đã xây dựng bệnh viện mới tại ${district}. Cải thiện chăm sóc sức khỏe!`, 'construction');
            return true;
        }
        return false;
    }

    createPark(district) {
        const cost = 800000;
        if (this.totalBudget >= cost) {
            this.totalBudget -= cost;

            window.gameEvents?.addEvent(`🌳 Đã xây dựng công viên mới tại ${district}. Cải thiện môi trường sống!`, 'construction');
            return true;
        }
        return false;
    }

    createShoppingMall(district) {
        const cost = 2500000;
        if (this.totalBudget >= cost) {
            this.totalBudget -= cost;
            const econ = this.districtEconomy[district];
            econ.businesses += 10;
            econ.unemployment = Math.max(0, econ.unemployment - 1);

            window.gameEvents?.addEvent(`🛒 Đã xây dựng trung tâm thương mại tại ${district}. Thúc đẩy kinh tế địa phương!`, 'construction');
            return true;
        }
        return false;
    }

    simulateFactoryShutdown(district) {
        const econ = this.districtEconomy[district];
        if (econ.factories > 0) {
            econ.factories -= 1;
            econ.businesses = Math.max(0, econ.businesses - 3);
            econ.unemployment = Math.min(25, econ.unemployment + 2);

            window.gameEvents?.addEvent(`⚠️ Nhà máy tại ${district} đã đóng cửa do khó khăn kinh tế!`, 'warning');
        }
    }

    implementEconomicPolicy(policyType, value) {
        switch (policyType) {
            case 'stimulus_package':
                this.totalBudget -= 10000000;
                this.economicGrowth += 1.5;
                window.gameEvents?.addEvent(`💰 Gói kích thích kinh tế $10M đã được triển khai!`, 'economic');
                break;

            case 'minimum_wage_increase':
                window.citizens?.forEach(citizen => {
                    if (citizen.income < 500) {
                        citizen.income = 500;
                    }
                });
                window.gameEvents?.addEvent(`📈 Tăng lương tối thiểu lên $500/tháng!`, 'economic');
                break;

            case 'trade_agreement':
                this.economicGrowth += 0.8;
                this.totalBudget += 5000000;
                window.gameEvents?.addEvent(`🤝 Ký kết hiệp định thương mại mới!`, 'economic');
                break;
        }
    }

    getEconomicData() {
        return {
            totalBudget: Math.floor(this.totalBudget),
            taxRevenue: Math.floor(this.taxRevenue),
            monthlyExpenses: Math.floor(this.monthlyExpenses),
            unemploymentRate: Math.floor(this.unemploymentRate * 10) / 10,
            economicGrowth: Math.floor(this.economicGrowth * 10) / 10,
            inflationRate: Math.floor(this.inflationRate * 10) / 10,
            gdpPerCapita: Math.floor(this.gdpPerCapita),
            districtEconomy: this.districtEconomy,
            economicIndicators: this.economicIndicators
        };
    }
}
