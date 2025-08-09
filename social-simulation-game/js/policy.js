class PolicySystem {
    constructor() {
        this.taxRate = 15; // Thuế suất ban đầu
        this.educationBudget = 30; // % ngân sách cho giáo dục
        this.healthBudget = 25; // % ngân sách cho y tế

        this.policyHistory = [];
        this.policyEffects = {};

        this.initializePolicyEffects();
    }

    initializePolicyEffects() {
        this.policyEffects = {
            // Hiệu ứng thuế thu nhập
            tax: {
                low: { // 0-20%
                    budget: 'decreased',
                    happiness: 'increased',
                    economicGrowth: 'increased',
                    description: 'Thuế thấp khuyến khích đầu tư và tiêu dùng'
                },
                medium: { // 20-35%
                    budget: 'stable',
                    happiness: 'stable',
                    economicGrowth: 'stable',
                    description: 'Thuế ở mức cân bằng'
                },
                high: { // 35-50%
                    budget: 'increased',
                    happiness: 'decreased',
                    economicGrowth: 'decreased',
                    protest: 'possible',
                    description: 'Thuế cao gây bất mãn và giảm động lực làm việc'
                },
                extreme: { // >50%
                    budget: 'increased',
                    happiness: 'severely_decreased',
                    economicGrowth: 'severely_decreased',
                    protest: 'likely',
                    description: 'Thuế cực cao gây phản ứng dữ dội từ dân chúng'
                }
            },

            // Hiệu ứng ngân sách giáo dục
            education: {
                low: { // 0-20%
                    longTermGrowth: 'decreased',
                    jobQuality: 'decreased',
                    description: 'Thiếu đầu tư giáo dục làm giảm chất lượng nhân lực'
                },
                high: { // >35%
                    longTermGrowth: 'increased',
                    jobQuality: 'increased',
                    innovation: 'increased',
                    description: 'Đầu tư mạnh vào giáo dục tạo nền tảng phát triển bền vững'
                }
            },

            // Hiệu ứng ngân sách y tế
            healthcare: {
                low: {
                    health: 'decreased',
                    productivity: 'decreased',
                    description: 'Y tế kém làm giảm sức khỏe và năng suất lao động'
                },
                high: {
                    health: 'increased',
                    productivity: 'increased',
                    happiness: 'increased',
                    description: 'Y tế tốt cải thiện chất lượng cuộc sống'
                }
            }
        };
    }

    updateTaxRate(newRate) {
        const oldRate = this.taxRate;
        this.taxRate = Math.max(0, Math.min(60, newRate));

        this.recordPolicyChange('tax', oldRate, this.taxRate);
        this.evaluateTaxEffects();

        return this.taxRate;
    }

    updateEducationBudget(newBudget) {
        const oldBudget = this.educationBudget;
        this.educationBudget = Math.max(0, Math.min(50, newBudget));

        this.recordPolicyChange('education', oldBudget, this.educationBudget);
        this.evaluateEducationEffects();

        return this.educationBudget;
    }

    updateHealthBudget(newBudget) {
        const oldBudget = this.healthBudget;
        this.healthBudget = Math.max(0, Math.min(50, newBudget));

        this.recordPolicyChange('healthcare', oldBudget, this.healthBudget);
        this.evaluateHealthEffects();

        return this.healthBudget;
    }

    recordPolicyChange(type, oldValue, newValue) {
        this.policyHistory.push({
            timestamp: Date.now(),
            type: type,
            from: oldValue,
            to: newValue,
            change: newValue - oldValue
        });

        // Giữ lại 50 thay đổi gần nhất
        if (this.policyHistory.length > 50) {
            this.policyHistory.shift();
        }
    }

    evaluateTaxEffects() {
        let level;
        if (this.taxRate <= 20) level = 'low';
        else if (this.taxRate <= 35) level = 'medium';
        else if (this.taxRate <= 50) level = 'high';
        else level = 'extreme';

        const effects = this.policyEffects.tax[level];

        // Tạo thông báo về tác động
        if (level === 'high' || level === 'extreme') {
            gameEvents.addEvent(`⚠️ Thuế ${this.taxRate}% có thể gây bất mãn trong dân! ${effects.description}`);
        } else if (level === 'low') {
            gameEvents.addEvent(`📈 Thuế thấp ${this.taxRate}% khuyến khích hoạt động kinh tế!`);
        }
    }

    evaluateEducationEffects() {
        if (this.educationBudget > 35) {
            gameEvents.addEvent(`🎓 Đầu tư mạnh vào giáo dục ${this.educationBudget}% sẽ tăng chất lượng nhân lực!`);
        } else if (this.educationBudget < 20) {
            gameEvents.addEvent(`📚 Ngân sách giáo dục thấp ${this.educationBudget}% có thể ảnh hưởng đến tương lai!`);
        }
    }

    evaluateHealthEffects() {
        if (this.healthBudget > 35) {
            gameEvents.addEvent(`🏥 Đầu tư cao vào y tế ${this.healthBudget}% cải thiện sức khỏe cộng đồng!`);
        } else if (this.healthBudget < 15) {
            gameEvents.addEvent(`⚕️ Ngân sách y tế thấp ${this.healthBudget}% có thể gây ra vấn đề sức khỏe!`);
        }
    }

    // Tính toán tác động tổng hợp của chính sách
    calculateOverallImpact() {
        let overallHappiness = 50; // Baseline
        let economicImpact = 0;

        // Tác động của thuế
        if (this.taxRate > 30) {
            overallHappiness -= (this.taxRate - 30) * 0.8;
        } else if (this.taxRate < 20) {
            overallHappiness += (20 - this.taxRate) * 0.5;
        }

        // Tác động của giáo dục và y tế
        overallHappiness += (this.educationBudget - 20) * 0.3;
        overallHappiness += (this.healthBudget - 20) * 0.4;

        // Tính tác động kinh tế
        if (this.taxRate > 35) {
            economicImpact -= (this.taxRate - 35) * 0.1;
        }
        economicImpact += (this.educationBudget - 20) * 0.05;

        return {
            happiness: Math.max(0, Math.min(100, overallHappiness)),
            economicGrowth: economicImpact
        };
    }

    // Dự đoán tác động của chính sách mới
    predictPolicyImpact(policyType, newValue) {
        const predictions = {
            happiness: 0,
            budget: 0,
            unemployment: 0,
            protests: false
        };

        if (policyType === 'tax') {
            if (newValue > 30 && newValue > this.taxRate) {
                predictions.happiness = -(newValue - this.taxRate) * 2;
                predictions.budget = (newValue - this.taxRate) * 1000;
                if (newValue > 40) predictions.protests = true;
            }
        }

        return predictions;
    }

    getCurrentPolicies() {
        return {
            taxRate: this.taxRate,
            educationBudget: this.educationBudget,
            healthBudget: this.healthBudget
        };
    }
}
