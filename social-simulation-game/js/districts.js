class DistrictManager {
    constructor() {
        this.districts = {
            district1: {
                name: 'Quận 1 (Trung tâm)',
                x: 200, y: 150, width: 200, height: 150,
                type: 'commercial',
                population: 0,
                businesses: 15,
                facilities: {
                    schools: 3,
                    hospitals: 2,
                    factories: 5,
                    parks: 2
                },
                characteristics: {
                    landPrice: 'high',
                    trafficDensity: 'high',
                    pollutionLevel: 'medium'
                }
            },
            district2: {
                name: 'Quận 2 (Công nghiệp)',
                x: 450, y: 150, width: 250, height: 150,
                type: 'industrial',
                population: 0,
                businesses: 25,
                facilities: {
                    schools: 2,
                    hospitals: 1,
                    factories: 15,
                    parks: 1
                },
                characteristics: {
                    landPrice: 'medium',
                    trafficDensity: 'medium',
                    pollutionLevel: 'high'
                }
            },
            district3: {
                name: 'Quận 3 (Dân cư)',
                x: 200, y: 350, width: 300, height: 150,
                type: 'residential',
                population: 0,
                businesses: 20,
                facilities: {
                    schools: 5,
                    hospitals: 3,
                    factories: 2,
                    parks: 8
                },
                characteristics: {
                    landPrice: 'medium',
                    trafficDensity: 'low',
                    pollutionLevel: 'low'
                }
            },
            district4: {
                name: 'Quận 4 (Nông nghiệp)',
                x: 550, y: 350, width: 200, height: 150,
                type: 'agricultural',
                population: 0,
                businesses: 10,
                facilities: {
                    schools: 1,
                    hospitals: 1,
                    factories: 1,
                    parks: 3
                },
                characteristics: {
                    landPrice: 'low',
                    trafficDensity: 'low',
                    pollutionLevel: 'very_low'
                }
            }
        };

        this.selectedDistrict = 'district1';
        this.districtPolicies = {}; // Chính sách riêng cho từng quận

        this.initializeDistrictPolicies();
    }

    initializeDistrictPolicies() {
        Object.keys(this.districts).forEach(districtId => {
            this.districtPolicies[districtId] = {
                taxMultiplier: 1.0, // Hệ số điều chỉnh thuế
                developmentFocus: 'balanced', // commercial, industrial, residential, agricultural
                restrictions: [], // Các hạn chế đặc biệt
                incentives: [] // Ưu đãi đặc biệt
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
    }

    applyDistrictPolicy(districtId, policyType, value) {
        if (!this.districts[districtId]) return false;

        const district = this.districts[districtId];
        const policy = this.districtPolicies[districtId];

        switch (policyType) {
            case 'tax_incentive':
                policy.taxMultiplier = value;
                gameEvents.addEvent(`💰 Áp dụng ưu đãi thuế ${(1-value)*100}% tại ${district.name}`);
                break;

            case 'development_focus':
                policy.developmentFocus = value;
                this.applyDevelopmentFocus(districtId, value);
                break;

            case 'pollution_control':
                this.implementPollutionControl(districtId);
                break;

            case 'traffic_management':
                this.implementTrafficManagement(districtId);
                break;
        }

        return true;
    }

    applyDevelopmentFocus(districtId, focus) {
        const district = this.districts[districtId];

        switch (focus) {
            case 'commercial':
                district.businesses = Math.floor(district.businesses * 1.2);
                gameEvents.addEvent(`🏪 ${district.name} tập trung phát triển thương mại`);
                break;

            case 'industrial':
                district.facilities.factories = Math.floor(district.facilities.factories * 1.3);
                gameEvents.addEvent(`🏭 ${district.name} tập trung phát triển công nghiệp`);
                break;

            case 'residential':
                district.facilities.parks = Math.floor(district.facilities.parks * 1.5);
                gameEvents.addEvent(`🏘️ ${district.name} tập trung phát triển khu dân cư`);
                break;

            case 'agricultural':
                if (district.type === 'agricultural') {
                    gameEvents.addEvent(`🚜 ${district.name} tăng cường phát triển nông nghiệp`);
                }
                break;
        }
    }

    implementPollutionControl(districtId) {
        const district = this.districts[districtId];

        if (district.characteristics.pollutionLevel === 'high') {
            district.characteristics.pollutionLevel = 'medium';
        } else if (district.characteristics.pollutionLevel === 'medium') {
            district.characteristics.pollutionLevel = 'low';
        }

        gameEvents.addEvent(`🌱 Triển khai biện pháp kiểm soát ô nhiễm tại ${district.name}`);
    }

    implementTrafficManagement(districtId) {
        const district = this.districts[districtId];

        if (district.characteristics.trafficDensity === 'high') {
            district.characteristics.trafficDensity = 'medium';
        }

        gameEvents.addEvent(`🚦 Cải thiện hệ thống giao thông tại ${district.name}`);
    }

    buildFacility(districtId, facilityType) {
        if (!this.districts[districtId]) return false;

        const district = this.districts[districtId];
        const costs = {
            school: 80000,
            hospital: 120000,
            factory: 100000,
            park: 40000
        };

        if (economy.totalBudget >= costs[facilityType]) {
            economy.totalBudget -= costs[facilityType];

            if (facilityType === 'schools') {
                district.facilities.schools++;
            } else if (facilityType === 'hospitals') {
                district.facilities.hospitals++;
            } else if (facilityType === 'factories') {
                district.facilities.factories++;
            } else if (facilityType === 'parks') {
                district.facilities.parks++;
            }

            this.applyFacilityEffects(districtId, facilityType);
            return true;
        }

        return false;
    }

    applyFacilityEffects(districtId, facilityType) {
        const district = this.districts[districtId];

        switch (facilityType) {
            case 'schools':
                // Tăng trình độ giáo dục trong khu vực
                gameEvents.addEvent(`🏫 Xây dựng trường học mới tại ${district.name} - Nâng cao giáo dục địa phương!`);
                break;

            case 'hospitals':
                // Cải thiện sức khỏe cộng đồng
                gameEvents.addEvent(`🏥 Xây dựng bệnh viện mới tại ${district.name} - Cải thiện chăm sóc sức khỏe!`);
                break;

            case 'factories':
                // Tạo việc làm nhưng tăng ô nhiễm
                gameEvents.addEvent(`🏭 Xây dựng nhà máy mới tại ${district.name} - Tạo thêm việc làm!`);
                if (district.characteristics.pollutionLevel === 'low') {
                    district.characteristics.pollutionLevel = 'medium';
                } else if (district.characteristics.pollutionLevel === 'medium') {
                    district.characteristics.pollutionLevel = 'high';
                }
                break;

            case 'parks':
                // Cải thiện môi trường và hạnh phúc
                gameEvents.addEvent(`🌳 Xây dựng công viên mới tại ${district.name} - Cải thiện môi trường sống!`);
                if (district.characteristics.pollutionLevel === 'high') {
                    district.characteristics.pollutionLevel = 'medium';
                } else if (district.characteristics.pollutionLevel === 'medium') {
                    district.characteristics.pollutionLevel = 'low';
                }
                break;
        }
    }

    getDistrictEffects(districtId) {
        const district = this.districts[districtId];
        const policy = this.districtPolicies[districtId];

        return {
            taxMultiplier: policy.taxMultiplier,
            happinessBonus: this.calculateHappinessBonus(district),
            jobAvailability: this.calculateJobAvailability(district),
            pollutionPenalty: this.calculatePollutionPenalty(district),
            educationBonus: this.calculateEducationBonus(district),
            healthBonus: this.calculateHealthBonus(district)
        };
    }

    calculateHappinessBonus(district) {
        let bonus = 0;

        // Parks increase happiness
        bonus += district.facilities.parks * 2;

        // Pollution decreases happiness
        switch (district.characteristics.pollutionLevel) {
            case 'high': bonus -= 10; break;
            case 'medium': bonus -= 5; break;
            case 'low': bonus += 0; break;
            case 'very_low': bonus += 5; break;
        }

        // Traffic affects happiness
        switch (district.characteristics.trafficDensity) {
            case 'high': bonus -= 5; break;
            case 'medium': bonus -= 2; break;
            case 'low': bonus += 2; break;
        }

        return bonus;
    }

    calculateJobAvailability(district) {
        return district.businesses + district.facilities.factories * 3;
    }

    calculatePollutionPenalty(district) {
        switch (district.characteristics.pollutionLevel) {
            case 'high': return -15;
            case 'medium': return -8;
            case 'low': return -2;
            case 'very_low': return 0;
            default: return 0;
        }
    }

    calculateEducationBonus(district) {
        return district.facilities.schools * 3;
    }

    calculateHealthBonus(district) {
        return district.facilities.hospitals * 5;
    }

    renderDistricts(ctx) {
        Object.entries(this.districts).forEach(([id, district]) => {
            // Vẽ ranh giới quận
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(district.x, district.y, district.width, district.height);

            // Màu nền dựa trên loại quận
            ctx.globalAlpha = 0.2;
            switch (district.type) {
                case 'commercial':
                    ctx.fillStyle = '#2196F3';
                    break;
                case 'industrial':
                    ctx.fillStyle = '#FF5722';
                    break;
                case 'residential':
                    ctx.fillStyle = '#4CAF50';
                    break;
                case 'agricultural':
                    ctx.fillStyle = '#8BC34A';
                    break;
            }
            ctx.fillRect(district.x, district.y, district.width, district.height);
            ctx.globalAlpha = 1;

            // Hiển thị tên quận
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.fillText(district.name, district.x + 10, district.y + 25);

            // Hiển thị dân số
            ctx.font = '12px Arial';
            ctx.fillText(`Dân số: ${district.population}`, district.x + 10, district.y + 45);

            // Hiển thị cơ sở hạ tầng
            this.renderFacilities(ctx, district);
        });
    }

    renderFacilities(ctx, district) {
        let yOffset = 65;
        const facilities = district.facilities;

        // Vẽ biểu tượng cơ sở
        if (facilities.schools > 0) {
            ctx.fillText(`🏫 ${facilities.schools}`, district.x + 10, district.y + yOffset);
            yOffset += 15;
        }
        if (facilities.hospitals > 0) {
            ctx.fillText(`🏥 ${facilities.hospitals}`, district.x + 10, district.y + yOffset);
            yOffset += 15;
        }
        if (facilities.factories > 0) {
            ctx.fillText(`🏭 ${facilities.factories}`, district.x + 10, district.y + yOffset);
            yOffset += 15;
        }
        if (facilities.parks > 0) {
            ctx.fillText(`🌳 ${facilities.parks}`, district.x + 10, district.y + yOffset);
        }
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
}

// Helper function for citizen movement
function getDistrictBounds(districtId) {
    const districtManager = window.districtManager;
    if (districtManager && districtManager.districts[districtId]) {
        return districtManager.districts[districtId];
    }

    // Default bounds if district not found
    return { x: 100, y: 100, width: 200, height: 200 };
}
