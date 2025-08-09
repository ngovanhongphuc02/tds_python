class DistrictManager {
    constructor() {
        this.districts = {
            district1: {
                name: 'Quận 1 (Trung tâm)',
                x: 50, y: 50, width: 280, height: 200,
                type: 'commercial',
                population: 0,
                businesses: 500,
                facilities: {
                    schools: 8,
                    hospitals: 5,
                    factories: 20,
                    parks: 6,
                    shoppingMalls: 3
                },
                characteristics: {
                    landPrice: 'very_high',
                    trafficDensity: 'very_high',
                    pollutionLevel: 'medium',
                    crimeRate: 'low',
                    developmentLevel: 'high'
                },
                specialFeatures: ['financial_district', 'government_buildings']
            },
            district2: {
                name: 'Quận 2 (Công nghiệp)',
                x: 350, y: 50, width: 350, height: 200,
                type: 'industrial',
                population: 0,
                businesses: 800,
                facilities: {
                    schools: 4,
                    hospitals: 2,
                    factories: 50,
                    parks: 2,
                    shoppingMalls: 1
                },
                characteristics: {
                    landPrice: 'medium',
                    trafficDensity: 'high',
                    pollutionLevel: 'high',
                    crimeRate: 'medium',
                    developmentLevel: 'medium'
                },
                specialFeatures: ['industrial_zone', 'port']
            },
            district3: {
                name: 'Quận 3 (Dân cư)',
                x: 50, y: 270, width: 400, height: 200,
                type: 'residential',
                population: 0,
                businesses: 600,
                facilities: {
                    schools: 12,
                    hospitals: 6,
                    factories: 15,
                    parks: 15,
                    shoppingMalls: 4
                },
                characteristics: {
                    landPrice: 'medium',
                    trafficDensity: 'medium',
                    pollutionLevel: 'low',
                    crimeRate: 'low',
                    developmentLevel: 'high'
                },
                specialFeatures: ['family_neighborhoods', 'schools_district']
            },
            district4: {
                name: 'Quận 4 (Nông nghiệp)',
                x: 470, y: 270, width: 280, height: 200,
                type: 'agricultural',
                population: 0,
                businesses: 200,
                facilities: {
                    schools: 3,
                    hospitals: 1,
                    factories: 5,
                    parks: 8,
                    shoppingMalls: 1
                },
                characteristics: {
                    landPrice: 'low',
                    trafficDensity: 'low',
                    pollutionLevel: 'very_low',
                    crimeRate: 'very_low',
                    developmentLevel: 'low'
                },
                specialFeatures: ['farms', 'rural_tourism']
            }
        };

        this.selectedDistrict = 'district1';
        this.districtPolicies = {};
        this.districtProjects = {};

        this.initializeDistrictPolicies();
    }

    initializeDistrictPolicies() {
        Object.keys(this.districts).forEach(districtId => {
            this.districtPolicies[districtId] = {
                taxMultiplier: 1.0,
                developmentFocus: 'balanced',
                restrictions: [],
                incentives: [],
                zoning: 'mixed_use'
            };

            this.districtProjects[districtId] = {
                ongoing: [],
                completed: [],
                planned: []
            };
        });
    }

    updateDistrictPopulation(citizens) {
        // Reset population count
        Object.values(this.districts).forEach(district => {
            district.population = 0;
        });

        // Count citizens in each district
        citizens.forEach(citizen => {
            if (this.districts[citizen.district]) {
                this.districts[citizen.district].population++;
            }
        });

        // Update district characteristics based on population density
        this.updateDistrictCharacteristics();
    }

    updateDistrictCharacteristics() {
        Object.entries(this.districts).forEach(([districtId, district]) => {
            const density = district.population / (district.width * district.height) * 10000;

            // Cập nhật mức độ giao thông dựa trên mật độ dân số
            if (density > 15) {
                district.characteristics.trafficDensity = 'very_high';
            } else if (density > 10) {
                district.characteristics.trafficDensity = 'high';
            } else if (density > 5) {
                district.characteristics.trafficDensity = 'medium';
            } else {
                district.characteristics.trafficDensity = 'low';
            }

            // Cập nhật tỷ lệ tội phạm
            const securityBudget = window.policySystem?.securityBudget || 15;
            const baseCrime = density > 12 ? 'high' : density > 8 ? 'medium' : 'low';

            if (securityBudget > 25) {
                district.characteristics.crimeRate = this.reduceCrimeLevel(baseCrime);
            } else if (securityBudget < 10) {
                district.characteristics.crimeRate = this.increaseCrimeLevel(baseCrime);
            } else {
                district.characteristics.crimeRate = baseCrime;
            }
        });
    }

    reduceCrimeLevel(currentLevel) {
        const levels = ['very_low', 'low', 'medium', 'high', 'very_high'];
        const currentIndex = levels.indexOf(currentLevel);
        return levels[Math.max(0, currentIndex - 1)];
    }

    increaseCrimeLevel(currentLevel) {
        const levels = ['very_low', 'low', 'medium', 'high', 'very_high'];
        const currentIndex = levels.indexOf(currentLevel);
        return levels[Math.min(levels.length - 1, currentIndex + 1)];
    }

    applyDistrictPolicy(districtId, policyType, value) {
        if (!this.districts[districtId]) return false;

        const district = this.districts[districtId];
        const policy = this.districtPolicies[districtId];

        switch (policyType) {
            case 'zoning_change':
                policy.zoning = value;
                this.applyZoningChange(districtId, value);
                break;

            case 'tax_incentive':
                policy.taxMultiplier = value;
                window.gameEvents?.addEvent(`💰 Áp dụng ưu đãi thuế ${(1-value)*100}% tại ${district.name}`, 'policy');
                break;

            case 'development_focus':
                policy.developmentFocus = value;
                this.applyDevelopmentFocus(districtId, value);
                break;

            case 'environmental_protection':
                this.implementEnvironmentalProtection(districtId);
                break;

            case 'smart_city_initiative':
                this.implementSmartCityInitiative(districtId);
                break;
        }

        return true;
    }

    applyZoningChange(districtId, zoning) {
        const district = this.districts[districtId];

        switch (zoning) {
            case 'residential_only':
                district.characteristics.pollutionLevel = this.reducePollutionLevel(district.characteristics.pollutionLevel);
                window.gameEvents?.addEvent(`🏘️ ${district.name} chuyển đổi thành khu dân cư thuần túy`, 'policy');
                break;

            case 'commercial_focus':
                district.businesses = Math.floor(district.businesses * 1.3);
                window.gameEvents?.addEvent(`🏪 ${district.name} tập trung phát triển thương mại`, 'policy');
                break;

            case 'industrial_zone':
                district.facilities.factories = Math.floor(district.facilities.factories * 1.4);
                district.characteristics.pollutionLevel = this.increasePollutionLevel(district.characteristics.pollutionLevel);
                window.gameEvents?.addEvent(`🏭 ${district.name} mở rộng khu công nghiệp`, 'policy');
                break;
        }
    }

    implementEnvironmentalProtection(districtId) {
        const district = this.districts[districtId];

        district.characteristics.pollutionLevel = this.reducePollutionLevel(district.characteristics.pollutionLevel);
        district.facilities.parks = Math.floor(district.facilities.parks * 1.5);

        window.gameEvents?.addEvent(`🌱 Triển khai chương trình bảo vệ môi trường tại ${district.name}`, 'environmental');
    }

    implementSmartCityInitiative(districtId) {
        const district = this.districts[districtId];

        district.characteristics.trafficDensity = this.reduceTrafficLevel(district.characteristics.trafficDensity);
        district.characteristics.developmentLevel = 'very_high';

        window.gameEvents?.addEvent(`🤖 Triển khai sáng kiến thành phố thông minh tại ${district.name}`, 'technology');
    }

    reducePollutionLevel(currentLevel) {
        const levels = ['very_low', 'low', 'medium', 'high', 'very_high'];
        const currentIndex = levels.indexOf(currentLevel);
        return levels[Math.max(0, currentIndex - 1)];
    }

    increasePollutionLevel(currentLevel) {
        const levels = ['very_low', 'low', 'medium', 'high', 'very_high'];
        const currentIndex = levels.indexOf(currentLevel);
        return levels[Math.min(levels.length - 1, currentIndex + 1)];
    }

    reduceTrafficLevel(currentLevel) {
        const levels = ['low', 'medium', 'high', 'very_high'];
        const currentIndex = levels.indexOf(currentLevel);
        return levels[Math.max(0, currentIndex - 1)];
    }

    buildFacility(districtId, facilityType) {
        if (!this.districts[districtId]) return false;

        const district = this.districts[districtId];

        switch (facilityType) {
            case 'school':
                district.facilities.schools++;
                this.applyFacilityEffects(districtId, 'school');
                break;
            case 'hospital':
                district.facilities.hospitals++;
                this.applyFacilityEffects(districtId, 'hospital');
                break;
            case 'factory':
                district.facilities.factories++;
                this.applyFacilityEffects(districtId, 'factory');
                break;
            case 'park':
                district.facilities.parks++;
                this.applyFacilityEffects(districtId, 'park');
                break;
            case 'shopping_mall':
                district.facilities.shoppingMalls++;
                this.applyFacilityEffects(districtId, 'shopping_mall');
                break;
        }

        return true;
    }

    applyFacilityEffects(districtId, facilityType) {
        const district = this.districts[districtId];

        switch (facilityType) {
            case 'school':
                window.gameEvents?.addEvent(`🏫 Trường học mới tại ${district.name} nâng cao giáo dục địa phương!`, 'construction');
                break;

            case 'hospital':
                window.gameEvents?.addEvent(`🏥 Bệnh viện mới tại ${district.name} cải thiện chăm sóc sức khỏe!`, 'construction');
                break;

            case 'factory':
                district.businesses += 5;
                district.characteristics.pollutionLevel = this.increasePollutionLevel(district.characteristics.pollutionLevel);
                window.gameEvents?.addEvent(`🏭 Nhà máy mới tại ${district.name} tạo thêm việc làm!`, 'construction');
                break;

            case 'park':
                district.characteristics.pollutionLevel = this.reducePollutionLevel(district.characteristics.pollutionLevel);
                window.gameEvents?.addEvent(`🌳 Công viên mới tại ${district.name} cải thiện môi trường!`, 'construction');
                break;

            case 'shopping_mall':
                district.businesses += 15;
                window.gameEvents?.addEvent(`🛒 Trung tâm thương mại mới tại ${district.name} thúc đẩy kinh tế!`, 'construction');
                break;
        }
    }

    renderDistricts(ctx) {
        Object.entries(this.districts).forEach(([id, district]) => {
            // Vẽ ranh giới quận
            ctx.strokeStyle = id === this.selectedDistrict ? '#FF6B6B' : '#333';
            ctx.lineWidth = id === this.selectedDistrict ? 3 : 2;
            ctx.strokeRect(district.x, district.y, district.width, district.height);

            // Màu nền dựa trên loại và đặc điểm quận
            ctx.globalAlpha = 0.15;
            let baseColor = '#4CAF50';

            switch (district.type) {
                case 'commercial':
                    baseColor = '#2196F3';
                    break;
                case 'industrial':
                    baseColor = '#FF5722';
                    break;
                case 'residential':
                    baseColor = '#4CAF50';
                    break;
                case 'agricultural':
                    baseColor = '#8BC34A';
                    break;
            }

            // Điều chỉnh màu dựa trên ô nhiễm
            if (district.characteristics.pollutionLevel === 'high' || district.characteristics.pollutionLevel === 'very_high') {
                baseColor = '#795548'; // Nâu đậm cho ô nhiễm cao
            }

            ctx.fillStyle = baseColor;
            ctx.fillRect(district.x, district.y, district.width, district.height);
            ctx.globalAlpha = 1;

            // Hiển thị thông tin quận
            this.renderDistrictInfo(ctx, district);

            // Hiển thị các đặc điểm đặc biệt
            this.renderDistrictFeatures(ctx, district);
        });
    }

    renderDistrictInfo(ctx, district) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(district.name, district.x + 10, district.y + 25);

        ctx.font = '12px Arial';
        const info = [
            `👥 Dân số: ${district.population.toLocaleString('vi-VN')}`,
            `🏢 Doanh nghiệp: ${district.businesses}`,
            `📊 Phát triển: ${this.getCharacteristicLabel(district.characteristics.developmentLevel)}`,
            `🌿 Ô nhiễm: ${this.getCharacteristicLabel(district.characteristics.pollutionLevel)}`
        ];

        info.forEach((text, index) => {
            ctx.fillText(text, district.x + 10, district.y + 45 + index * 15);
        });
    }

    renderDistrictFeatures(ctx, district) {
        const facilities = district.facilities;
        let yOffset = 110;

        // Vẽ các cơ sở hạ tầng
        const facilityIcons = {
            schools: '🏫',
            hospitals: '🏥',
            factories: '🏭',
            parks: '🌳',
            shoppingMalls: '🛒'
        };

        Object.entries(facilityIcons).forEach(([facility, icon]) => {
            if (facilities[facility] > 0) {
                ctx.font = '12px Arial';
                ctx.fillText(`${icon} ${facilities[facility]}`, district.x + 10, district.y + yOffset);
                yOffset += 15;
            }
        });

        // Hiển thị cảnh báo nếu có vấn đề
        this.renderDistrictWarnings(ctx, district, yOffset);
    }

    renderDistrictWarnings(ctx, district, startY) {
        const warnings = [];

        if (district.characteristics.pollutionLevel === 'very_high') {
            warnings.push('⚠️ Ô nhiễm nghiêm trọng');
        }
        if (district.characteristics.crimeRate === 'high' || district.characteristics.crimeRate === 'very_high') {
            warnings.push('🚨 Tỷ lệ tội phạm cao');
        }
        if (district.characteristics.trafficDensity === 'very_high') {
            warnings.push('🚦 Ùn tắc giao thông');
        }

        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 11px Arial';
        warnings.forEach((warning, index) => {
            ctx.fillText(warning, district.x + 10, district.y + startY + index * 15);
        });
    }

    getCharacteristicLabel(level) {
        const labels = {
            'very_low': 'Rất thấp',
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao',
            'very_high': 'Rất cao'
        };
        return labels[level] || level;
    }

    getDistrictInfo(districtId) {
        return this.districts[districtId];
    }

    getSelectedDistrict() {
        return this.selectedDistrict;
    }

    selectDistrict(districtId) {
        if (this.districts[districtId]) {
            this.selectedDistrict = districtId;
            return true;
        }
        return false;
    }

    getDistrictStatistics() {
        const stats = {};

        Object.entries(this.districts).forEach(([id, district]) => {
            stats[id] = {
                population: district.population,
                businesses: district.businesses,
                totalFacilities: Object.values(district.facilities).reduce((a, b) => a + b, 0),
                developmentScore: this.calculateDevelopmentScore(district),
                environmentScore: this.calculateEnvironmentScore(district),
                safetyScore: this.calculateSafetyScore(district)
            };
        });

        return stats;
    }

    calculateDevelopmentScore(district) {
        const facilityScore = Object.values(district.facilities).reduce((a, b) => a + b, 0) * 2;
        const businessScore = district.businesses / 10;
        const infraScore = district.characteristics.developmentLevel === 'very_high' ? 100 :
                          district.characteristics.developmentLevel === 'high' ? 80 :
                          district.characteristics.developmentLevel === 'medium' ? 60 : 40;

        return Math.min(100, (facilityScore + businessScore + infraScore) / 3);
    }

    calculateEnvironmentScore(district) {
        const pollutionPenalty = {
            'very_low': 0,
            'low': 10,
            'medium': 30,
            'high': 60,
            'very_high': 90
        };

        const parkBonus = district.facilities.parks * 5;
        const factoryPenalty = district.facilities.factories * 2;

        return Math.max(0, Math.min(100, 100 - (pollutionPenalty[district.characteristics.pollutionLevel] || 0) - factoryPenalty + parkBonus));
    }

    calculateSafetyScore(district) {
        const crimePenalty = {
            'very_low': 0,
            'low': 10,
            'medium': 30,
            'high': 60,
            'very_high': 90
        };

        const securityBudget = window.policySystem?.securityBudget || 15;
        const securityBonus = securityBudget * 2;

        return Math.max(0, Math.min(100, 100 - (crimePenalty[district.characteristics.crimeRate] || 0) + securityBonus));
    }
}

// Helper function for citizen movement
function getDistrictBounds(districtId) {
    const districtManager = window.districtManager;
    if (districtManager && districtManager.districts[districtId]) {
        return districtManager.districts[districtId];
    }

    return { x: 100, y: 100, width: 200, height: 200 };
}
