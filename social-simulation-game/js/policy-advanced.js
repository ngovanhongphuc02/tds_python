class PolicySystem {
    constructor() {
        this.taxRate = 15;
        this.educationBudget = 25;
        this.healthBudget = 20;
        this.securityBudget = 15;
        this.infrastructureBudget = 20;

        this.policyHistory = [];
        this.policyEffects = {};
        this.activePolicies = new Set();

        this.initializePolicyEffects();
    }

    initializePolicyEffects() {
        this.policyEffects = {
            tax: {
                low: { happiness: 'increased', budget: 'decreased', description: 'Thuế thấp tăng hạnh phúc nhưng giảm ngân sách' },
                medium: { happiness: 'stable', budget: 'stable', description: 'Thuế vừa phải duy trì cân bằng' },
                high: { happiness: 'decreased', budget: 'increased', protest: 'possible', description: 'Thuế cao gây bất mãn' },
                extreme: { happiness: 'severely_decreased', budget: 'increased', protest: 'likely', description: 'Thuế cực cao gây phản ứng mạnh' }
            },
            education: {
                low: { longTermGrowth: 'decreased', description: 'Thiếu đầu tư giáo dục ảnh hưởng tương lai' },
                high: { longTermGrowth: 'increased', innovation: 'increased', description: 'Đầu tư giáo dục tạo nền tảng phát triển' }
            },
            healthcare: {
                low: { health: 'decreased', productivity: 'decreased', description: 'Y tế kém giảm năng suất' },
                high: { health: 'increased', happiness: 'increased', description: 'Y tế tốt cải thiện cuộc sống' }
            },
            security: {
                low: { safety: 'decreased', crime: 'increased', description: 'An ninh yếu tăng tỷ lệ tội phạm' },
                high: { safety: 'increased', happiness: 'increased', description: 'An ninh tốt tăng cảm giác an toàn' }
            },
            infrastructure: {
                low: { efficiency: 'decreased', business: 'decreased', description: 'Hạ tầng kém cản trở phát triển' },
                high: { efficiency: 'increased', business: 'increased', description: 'Hạ tầng tốt thúc đẩy kinh tế' }
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

    updateSecurityBudget(newBudget) {
        const oldBudget = this.securityBudget;
        this.securityBudget = Math.max(0, Math.min(40, newBudget));

        this.recordPolicyChange('security', oldBudget, this.securityBudget);
        this.evaluateSecurityEffects();

        return this.securityBudget;
    }

    updateInfrastructureBudget(newBudget) {
        const oldBudget = this.infrastructureBudget;
        this.infrastructureBudget = Math.max(0, Math.min(40, newBudget));

        this.recordPolicyChange('infrastructure', oldBudget, this.infrastructureBudget);
        this.evaluateInfrastructureEffects();

        return this.infrastructureBudget;
    }

    recordPolicyChange(type, oldValue, newValue) {
        this.policyHistory.push({
            timestamp: Date.now(),
            type: type,
            from: oldValue,
            to: newValue,
            change: newValue - oldValue
        });

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

        if (level === 'high' || level === 'extreme') {
            window.gameEvents?.addEvent(`⚠️ Thuế ${this.taxRate}% có thể gây bất mãn! ${effects.description}`, 'warning');
        } else if (level === 'low') {
            window.gameEvents?.addEvent(`📈 Thuế thấp ${this.taxRate}% khuyến khích hoạt động kinh tế!`, 'economic');
        }
    }

    evaluateEducationEffects() {
        if (this.educationBudget > 35) {
            window.gameEvents?.addEvent(`🎓 Đầu tư mạnh vào giáo dục ${this.educationBudget}% sẽ nâng cao chất lượng nhân lực!`, 'education');
        } else if (this.educationBudget < 15) {
            window.gameEvents?.addEvent(`📚 Ngân sách giáo dục thấp ${this.educationBudget}% có thể ảnh hưởng đến tương lai!`, 'warning');
        }
    }

    evaluateHealthEffects() {
        if (this.healthBudget > 30) {
            window.gameEvents?.addEvent(`🏥 Đầu tư cao vào y tế ${this.healthBudget}% cải thiện sức khỏe cộng đồng!`, 'healthcare');
        } else if (this.healthBudget < 15) {
            window.gameEvents?.addEvent(`⚕️ Ngân sách y tế thấp ${this.healthBudget}% có thể gây ra vấn đề sức khỏe!`, 'warning');
        }
    }

    evaluateSecurityEffects() {
        if (this.securityBudget > 25) {
            window.gameEvents?.addEvent(`🛡️ Đầu tư an ninh cao ${this.securityBudget}% tăng cường trật tự xã hội!`, 'security');
        } else if (this.securityBudget < 10) {
            window.gameEvents?.addEvent(`🚨 Ngân sách an ninh thấp ${this.securityBudget}% có thể tăng tội phạm!`, 'warning');
        }
    }

    evaluateInfrastructureEffects() {
        if (this.infrastructureBudget > 30) {
            window.gameEvents?.addEvent(`🏗️ Đầu tư hạ tầng cao ${this.infrastructureBudget}% thúc đẩy phát triển!`, 'infrastructure');
        } else if (this.infrastructureBudget < 15) {
            window.gameEvents?.addEvent(`🛣️ Ngân sách hạ tầng thấp ${this.infrastructureBudget}% cản trở phát triển!`, 'warning');
        }
    }

    implementSpecialPolicy(policyName) {
        switch (policyName) {
            case 'universal_healthcare':
                if (!this.activePolicies.has('universal_healthcare')) {
                    this.healthBudget = Math.min(50, this.healthBudget + 15);
                    this.activePolicies.add('universal_healthcare');
                    window.gameEvents?.addEvent('🏥 Triển khai y tế toàn dân miễn phí!', 'policy');
                }
                break;

            case 'free_education':
                if (!this.activePolicies.has('free_education')) {
                    this.educationBudget = Math.min(50, this.educationBudget + 10);
                    this.activePolicies.add('free_education');
                    window.gameEvents?.addEvent('🎓 Triển khai giáo dục miễn phí toàn dân!', 'policy');
                }
                break;

            case 'green_energy':
                if (!this.activePolicies.has('green_energy')) {
                    this.activePolicies.add('green_energy');
                    window.gameEvents?.addEvent('🌱 Chuyển đổi sang năng lượng xanh!', 'policy');
                }
                break;
        }
    }

    calculateOverallImpact() {
        let overallHappiness = 50;
        let economicImpact = 0;

        // Tác động của thuế
        if (this.taxRate > 35) {
            overallHappiness -= (this.taxRate - 35) * 0.8;
        } else if (this.taxRate < 20) {
            overallHappiness += (20 - this.taxRate) * 0.5;
        }

        // Tác động tích cực của dịch vụ công
        overallHappiness += (this.educationBudget - 20) * 0.3;
        overallHappiness += (this.healthBudget - 20) * 0.4;
        overallHappiness += (this.securityBudget - 15) * 0.2;
        overallHappiness += (this.infrastructureBudget - 20) * 0.25;

        // Tính tác động kinh tế
        if (this.taxRate > 40) {
            economicImpact -= (this.taxRate - 40) * 0.1;
        }
        economicImpact += (this.educationBudget - 20) * 0.05;
        economicImpact += (this.infrastructureBudget - 20) * 0.08;

        return {
            happiness: Math.max(0, Math.min(100, overallHappiness)),
            economicGrowth: economicImpact
        };
    }

    getCurrentPolicies() {
        return {
            taxRate: this.taxRate,
            educationBudget: this.educationBudget,
            healthBudget: this.healthBudget,
            securityBudget: this.securityBudget,
            infrastructureBudget: this.infrastructureBudget,
            activePolicies: Array.from(this.activePolicies)
        };
    }

    getPolicyEffectiveness() {
        const total = this.taxRate + this.educationBudget + this.healthBudget + this.securityBudget + this.infrastructureBudget;

        return {
            budgetUtilization: total,
            policyBalance: Math.abs(50 - total/5), // Càng gần 0 càng cân bằng
            specialPolicies: this.activePolicies.size
        };
    }
}
