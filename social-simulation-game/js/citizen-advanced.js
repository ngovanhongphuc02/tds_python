class AdvancedCitizen {
    constructor(x, y, district, age = null, parents = null) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.x = x;
        this.y = y;
        this.district = district;

        // Thuộc tính cơ bản
        this.age = age || (Math.floor(Math.random() * 50) + 18); // 18-67 tuổi ban đầu
        this.gender = Math.random() > 0.5 ? 'male' : 'female';
        this.education = this.generateEducation();
        this.personality = this.generatePersonality();
        this.job = this.assignJob();

        // Gia đình và mối quan hệ
        this.maritalStatus = 'single'; // single, married, divorced, widowed
        this.spouse = null;
        this.children = [];
        this.parents = parents || [];
        this.family = null;

        // Thuộc tính trạng thái
        this.happiness = Math.floor(Math.random() * 40) + 60;
        this.income = this.calculateIncome();
        this.health = Math.floor(Math.random() * 30) + 70;
        this.isProtesting = false;
        this.protestCooldown = 0;

        // Chu kỳ sống (1 phút thực = 1 năm trong game)
        this.birthTime = Date.now();
        this.maxLifespan = this.calculateLifespan(); // 40-90 phút
        this.lifeStage = this.getLifeStage();

        // Thuộc tính di chuyển và hoạt động
        this.targetX = x;
        this.targetY = y;
        this.speed = 1 + Math.random();
        this.activity = 'idle';
        this.activityTimer = 0;
        this.currentLocation = 'home';

        // Lịch trình hàng ngày (chu kỳ 24 phút = 1 ngày)
        this.schedule = this.createDailySchedule();
        this.scheduleIndex = 0;
        this.dailyTimer = 0;

        // Nhu cầu cá nhân
        this.needs = {
            food: 100,
            entertainment: 70,
            social: 80,
            rest: 100,
            safety: 90
        };

        // Kinh nghiệm sống
        this.lifeEvents = [];
        this.skills = this.generateSkills();
        this.desires = this.generateDesires();
    }

    generateEducation() {
        const ageEducationMap = {
            '18-25': { basic: 0.2, high_school: 0.4, college: 0.3, university: 0.1 },
            '26-40': { basic: 0.3, high_school: 0.35, college: 0.25, university: 0.1 },
            '41-60': { basic: 0.4, high_school: 0.4, college: 0.15, university: 0.05 },
            '60+': { basic: 0.6, high_school: 0.3, college: 0.08, university: 0.02 }
        };

        let ageGroup = '26-40';
        if (this.age <= 25) ageGroup = '18-25';
        else if (this.age <= 40) ageGroup = '26-40';
        else if (this.age <= 60) ageGroup = '41-60';
        else ageGroup = '60+';

        const probabilities = ageEducationMap[ageGroup];
        const rand = Math.random();
        let cumulative = 0;

        for (const [level, prob] of Object.entries(probabilities)) {
            cumulative += prob;
            if (rand <= cumulative) return level;
        }
        return 'basic';
    }

    generatePersonality() {
        const traits = ['patient', 'impatient', 'optimistic', 'pessimistic',
                       'hardworking', 'lazy', 'social', 'introverted',
                       'ambitious', 'content', 'creative', 'practical',
                       'adventurous', 'cautious', 'generous', 'frugal'];

        return {
            primary: traits[Math.floor(Math.random() * traits.length)],
            secondary: traits[Math.floor(Math.random() * traits.length)],
            protestTendency: Math.random() * 100,
            adaptability: Math.random() * 100,
            familyOriented: Math.random() * 100,
            careerFocused: Math.random() * 100,
            socialness: Math.random() * 100
        };
    }

    assignJob() {
        const jobs = [
            // Nông nghiệp
            { name: 'Nông dân', salary: 400, education: 'basic', type: 'agriculture', ageRange: [18, 70] },
            { name: 'Chăn nuôi', salary: 420, education: 'basic', type: 'agriculture', ageRange: [20, 65] },
            { name: 'Ngư dân', salary: 450, education: 'basic', type: 'agriculture', ageRange: [18, 60] },

            // Công nghiệp
            { name: 'Công nhân nhà máy', salary: 550, education: 'high_school', type: 'industrial', ageRange: [18, 60] },
            { name: 'Thợ cơ khí', salary: 650, education: 'high_school', type: 'industrial', ageRange: [20, 65] },
            { name: 'Thợ điện', salary: 720, education: 'college', type: 'industrial', ageRange: [22, 60] },
            { name: 'Thợ hàn', salary: 580, education: 'high_school', type: 'industrial', ageRange: [18, 58] },

            // Dịch vụ
            { name: 'Nhân viên bán hàng', salary: 480, education: 'high_school', type: 'service', ageRange: [18, 55] },
            { name: 'Lái xe', salary: 520, education: 'high_school', type: 'service', ageRange: [21, 65] },
            { name: 'Thợ cắt tóc', salary: 450, education: 'basic', type: 'service', ageRange: [18, 60] },
            { name: 'Đầu bếp', salary: 580, education: 'high_school', type: 'service', ageRange: [20, 65] },
            { name: 'Phục vụ nhà hàng', salary: 350, education: 'basic', type: 'service', ageRange: [16, 50] },
            { name: 'Bảo vệ', salary: 420, education: 'high_school', type: 'service', ageRange: [22, 60] },
            { name: 'Lao công', salary: 380, education: 'basic', type: 'service', ageRange: [18, 65] },
            { name: 'Tài xế taxi', salary: 500, education: 'high_school', type: 'service', ageRange: [21, 65] },

            // Y tế
            { name: 'Y tá', salary: 750, education: 'college', type: 'healthcare', ageRange: [22, 60] },
            { name: 'Bác sĩ', salary: 1500, education: 'university', type: 'healthcare', ageRange: [28, 65] },
            { name: 'Dược sĩ', salary: 980, education: 'university', type: 'healthcare', ageRange: [24, 62] },
            { name: 'Kỹ thuật viên y tế', salary: 620, education: 'college', type: 'healthcare', ageRange: [20, 60] },

            // Giáo dục
            { name: 'Giáo viên mầm non', salary: 480, education: 'college', type: 'education', ageRange: [22, 60] },
            { name: 'Giáo viên tiểu học', salary: 650, education: 'college', type: 'education', ageRange: [22, 62] },
            { name: 'Giáo viên THPT', salary: 750, education: 'university', type: 'education', ageRange: [24, 62] },
            { name: 'Giảng viên đại học', salary: 1200, education: 'university', type: 'education', ageRange: [28, 65] },

            // Công nghệ
            { name: 'Lập trình viên', salary: 1200, education: 'university', type: 'technology', ageRange: [22, 55] },
            { name: 'Kỹ sư IT', salary: 1400, education: 'university', type: 'technology', ageRange: [24, 60] },
            { name: 'Nhân viên IT', salary: 800, education: 'college', type: 'technology', ageRange: [20, 55] },

            // Tài chính
            { name: 'Nhân viên ngân hàng', salary: 850, education: 'university', type: 'finance', ageRange: [22, 60] },
            { name: 'Kế toán', salary: 720, education: 'college', type: 'finance', ageRange: [22, 62] },
            { name: 'Chuyên viên tài chính', salary: 950, education: 'university', type: 'finance', ageRange: [24, 58] },

            // Xây dựng
            { name: 'Thợ xây', salary: 520, education: 'basic', type: 'construction', ageRange: [18, 60] },
            { name: 'Kiến trúc sư', salary: 1100, education: 'university', type: 'construction', ageRange: [26, 62] },
            { name: 'Kỹ sư xây dựng', salary: 950, education: 'university', type: 'construction', ageRange: [24, 60] },

            // Khác
            { name: 'Cảnh sát', salary: 680, education: 'high_school', type: 'public', ageRange: [20, 55] },
            { name: 'Lính cứu hỏa', salary: 650, education: 'high_school', type: 'public', ageRange: [20, 50] },
            { name: 'Luật sư', salary: 1600, education: 'university', type: 'legal', ageRange: [26, 65] },
            { name: 'Nhà báo', salary: 750, education: 'university', type: 'media', ageRange: [22, 60] },
            { name: 'Nghệ sĩ', salary: 450, education: 'college', type: 'arts', ageRange: [18, 70] },
            { name: 'Vận động viên', salary: 900, education: 'high_school', type: 'sports', ageRange: [16, 35] }
        ];

        // Kiểm tra tuổi nghỉ hưu
        if (this.age >= 65) {
            return { name: 'Về hưu', salary: 300, type: 'retired', ageRange: [65, 100] };
        }

        // Kiểm tra tuổi học
        if (this.age < 18) {
            return { name: 'Học sinh', salary: 0, type: 'student', ageRange: [6, 18] };
        }

        // Lọc công việc phù hợp với học vấn và tuổi tác
        const suitableJobs = jobs.filter(job => {
            const educationLevels = ['basic', 'high_school', 'college', 'university'];
            const citizenLevel = educationLevels.indexOf(this.education);
            const jobLevel = educationLevels.indexOf(job.education);
            const ageMatch = this.age >= job.ageRange[0] && this.age <= job.ageRange[1];

            return citizenLevel >= jobLevel && ageMatch;
        });

        // Tỷ lệ thất nghiệp dựa trên học vấn
        const unemploymentRate = {
            'basic': 0.12,
            'high_school': 0.08,
            'college': 0.05,
            'university': 0.03
        };

        if (Math.random() < unemploymentRate[this.education]) {
            return { name: 'Thất nghiệp', salary: 0, type: 'unemployed' };
        }

        return suitableJobs[Math.floor(Math.random() * suitableJobs.length)] ||
               { name: 'Thất nghiệp', salary: 0, type: 'unemployed' };
    }

    calculateLifespan() {
        let baseLifespan = 65; // 65 phút = 65 năm

        // Yếu tố tích cực
        if (this.education === 'university') baseLifespan += 8;
        else if (this.education === 'college') baseLifespan += 5;
        else if (this.education === 'high_school') baseLifespan += 2;

        if (this.personality.primary === 'optimistic') baseLifespan += 5;
        if (this.personality.primary === 'hardworking') baseLifespan += 3;
        if (this.job.type === 'healthcare') baseLifespan += 4;

        // Yếu tố tiêu cực
        if (this.personality.primary === 'pessimistic') baseLifespan -= 3;
        if (this.job.type === 'industrial') baseLifespan -= 2;
        if (this.personality.primary === 'lazy') baseLifespan -= 2;

        // Random factor
        baseLifespan += (Math.random() - 0.5) * 20;

        return Math.max(40, Math.min(90, baseLifespan));
    }

    getLifeStage() {
        if (this.age < 18) return 'child';
        if (this.age < 25) return 'young_adult';
        if (this.age < 45) return 'adult';
        if (this.age < 65) return 'middle_age';
        return 'elderly';
    }

    createDailySchedule() {
        const baseSchedule = [
            { time: 6, activity: 'wake_up', location: 'home', duration: 1 },
            { time: 7, activity: 'breakfast', location: 'home', duration: 1 },
        ];

        if (this.lifeStage === 'child') {
            baseSchedule.push(
                { time: 8, activity: 'school', location: 'school', duration: 8 },
                { time: 16, activity: 'play', location: 'park', duration: 2 }
            );
        } else if (this.job.name !== 'Thất nghiệp' && this.job.name !== 'Về hưu') {
            baseSchedule.push(
                { time: 8, activity: 'work', location: 'workplace', duration: 8 },
                { time: 16, activity: 'commute_home', location: 'home', duration: 1 }
            );
        } else if (this.job.name === 'Về hưu') {
            baseSchedule.push(
                { time: 9, activity: 'leisure', location: 'park', duration: 3 },
                { time: 14, activity: 'social', location: 'community_center', duration: 2 }
            );
        } else {
            baseSchedule.push(
                { time: 9, activity: 'job_search', location: 'job_center', duration: 4 },
                { time: 14, activity: 'skill_training', location: 'library', duration: 3 }
            );
        }

        baseSchedule.push(
            { time: 18, activity: 'dinner', location: 'home', duration: 1 },
            { time: 19, activity: 'family_time', location: 'home', duration: 2 },
            { time: 21, activity: 'entertainment', location: 'entertainment', duration: 2 },
            { time: 23, activity: 'sleep', location: 'home', duration: 7 }
        );

        return baseSchedule;
    }

    generateSkills() {
        const skills = ['communication', 'leadership', 'technical', 'creative',
                       'analytical', 'manual', 'social', 'entrepreneurial'];
        const citizenSkills = {};

        skills.forEach(skill => {
            citizenSkills[skill] = Math.random() * 100;

            // Bonus từ giáo dục
            if (this.education === 'university') citizenSkills[skill] += 20;
            else if (this.education === 'college') citizenSkills[skill] += 10;

            // Bonus từ kinh nghiệm làm việc
            const workExperience = Math.max(0, this.age - 18);
            citizenSkills[skill] += workExperience * 0.5;

            citizenSkills[skill] = Math.min(100, citizenSkills[skill]);
        });

        return citizenSkills;
    }

    generateDesires() {
        const possibleDesires = ['marriage', 'children', 'career_advancement',
                               'higher_education', 'travel', 'own_business',
                               'artistic_pursuits', 'community_service'];

        const desires = [];
        const numDesires = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numDesires; i++) {
            const desire = possibleDesires[Math.floor(Math.random() * possibleDesires.length)];
            if (!desires.includes(desire)) {
                desires.push(desire);
            }
        }

        return desires;
    }

    update(gameTime, policies, gameSpeed) {
        // Tăng tuổi theo thời gian thực
        const ageInMinutes = (Date.now() - this.birthTime) / (60000 / gameSpeed);
        this.age = Math.floor(18 + ageInMinutes);

        // Kiểm tra tuổi thọ
        if (ageInMinutes >= this.maxLifespan) {
            this.die();
            return;
        }

        // Cập nhật giai đoạn cuộc sống
        this.lifeStage = this.getLifeStage();

        // Cập nhật hoạt động hàng ngày
        this.updateDailyActivity(gameTime, gameSpeed);

        // Cập nhật tâm lý và sức khỏe
        this.updateMood(policies);
        this.updateHealth();
        this.updateNeeds(gameSpeed);

        // Xử lý các quyết định cuộc sống
        this.makeLifeDecisions();

        // Cập nhật di chuyển
        this.updateMovement();

        // Kiểm tra điều kiện biểu tình
        this.checkProtestConditions(policies);

        if (this.protestCooldown > 0) this.protestCooldown--;
    }

    updateDailyActivity(gameTime, gameSpeed) {
        this.dailyTimer += gameSpeed;

        // 1 ngày game = 24 phút thực
        const dayLength = 24 * 60 * 1000 / gameSpeed;
        const timeInDay = (this.dailyTimer % dayLength) / dayLength * 24;

        // Tìm hoạt động hiện tại
        let currentActivity = this.schedule[0];
        for (let i = 0; i < this.schedule.length; i++) {
            const activity = this.schedule[i];
            const nextActivity = this.schedule[(i + 1) % this.schedule.length];

            if (timeInDay >= activity.time && timeInDay < (nextActivity.time || 24)) {
                currentActivity = activity;
                break;
            }
        }

        if (this.activity !== currentActivity.activity) {
            this.activity = currentActivity.activity;
            this.currentLocation = currentActivity.location;
            this.setLocationTarget(currentActivity.location);
        }
    }

    setLocationTarget(location) {
        const locations = {
            'home': this.getDistrictCenter(),
            'workplace': this.getWorkplaceLocation(),
            'school': this.getSchoolLocation(),
            'park': this.getParkLocation(),
            'entertainment': this.getEntertainmentLocation(),
            'shopping': this.getShoppingLocation(),
            'community_center': this.getCommunityCenter()
        };

        const target = locations[location] || this.getDistrictCenter();
        this.targetX = target.x + (Math.random() - 0.5) * 50;
        this.targetY = target.y + (Math.random() - 0.5) * 50;
    }

    getDistrictCenter() {
        const district = window.districtManager?.districts[this.district];
        if (district) {
            return {
                x: district.x + district.width / 2,
                y: district.y + district.height / 2
            };
        }
        return { x: 400, y: 300 };
    }

    getWorkplaceLocation() {
        const district = window.districtManager?.districts[this.district];
        if (district) {
            if (this.job.type === 'industrial') {
                return {
                    x: district.x + district.width * 0.8,
                    y: district.y + district.height * 0.3
                };
            } else if (this.job.type === 'agriculture') {
                return {
                    x: district.x + district.width * 0.2,
                    y: district.y + district.height * 0.8
                };
            }
        }
        return this.getDistrictCenter();
    }

    getSchoolLocation() {
        const district = window.districtManager?.districts[this.district];
        if (district) {
            return {
                x: district.x + district.width * 0.3,
                y: district.y + district.height * 0.2
            };
        }
        return this.getDistrictCenter();
    }

    getParkLocation() {
        const district = window.districtManager?.districts[this.district];
        if (district) {
            return {
                x: district.x + district.width * 0.5,
                y: district.y + district.height * 0.7
            };
        }
        return this.getDistrictCenter();
    }

    getEntertainmentLocation() {
        return {
            x: 500 + (Math.random() - 0.5) * 200,
            y: 300 + (Math.random() - 0.5) * 100
        };
    }

    getShoppingLocation() {
        return {
            x: 300 + (Math.random() - 0.5) * 100,
            y: 200 + (Math.random() - 0.5) * 100
        };
    }

    getCommunityCenter() {
        return {
            x: 600 + (Math.random() - 0.5) * 100,
            y: 400 + (Math.random() - 0.5) * 100
        };
    }

    updateMood(policies) {
        // Tác động cơ bản của chính sách
        const taxImpact = policies.taxRate > 25 ? -(policies.taxRate - 25) * 0.8 : 0;
        const serviceImpact = (policies.educationBudget + policies.healthBudget + policies.securityBudget) * 0.15;

        // Tác động của nhu cầu cá nhân
        const needsImpact = (Object.values(this.needs).reduce((a, b) => a + b, 0) / 5 - 50) * 0.2;

        // Tác động của hoạt động
        let activityImpact = 0;
        if (this.activity === 'entertainment') activityImpact = 5;
        if (this.activity === 'family_time') activityImpact = 3;
        if (this.activity === 'work' && this.job.salary > 0) activityImpact = 2;

        // Tác động của giai đoạn cuộc sống
        let lifeStageImpact = 0;
        if (this.lifeStage === 'young_adult') lifeStageImpact = 2;
        if (this.lifeStage === 'elderly' && this.health < 50) lifeStageImpact = -5;

        // Cập nhật hạnh phúc
        let newHappiness = this.happiness + (taxImpact + serviceImpact + needsImpact + activityImpact + lifeStageImpact) * 0.1;
        this.happiness = Math.max(0, Math.min(100, newHappiness));
    }

    updateHealth() {
        let healthChange = 0;

        // Ảnh hưởng của tuổi tác
        if (this.age > 50) {
            healthChange -= (this.age - 50) * 0.02;
        }

        // Ảnh hưởng của công việc
        if (this.job.type === 'industrial') healthChange -= 0.1;
        if (this.job.type === 'healthcare') healthChange += 0.05;

        // Ảnh hưởng của hạnh phúc
        if (this.happiness > 70) healthChange += 0.1;
        else if (this.happiness < 30) healthChange -= 0.2;

        // Ảnh hưởng của nhu cầu
        if (this.needs.rest < 30) healthChange -= 0.15;
        if (this.needs.food < 20) healthChange -= 0.25;

        this.health = Math.max(0, Math.min(100, this.health + healthChange));

        // Tử vong do sức khỏe kém
        if (this.health <= 0) {
            this.die();
        }
    }

    updateNeeds(gameSpeed) {
        // Giảm nhu cầu theo thời gian
        this.needs.food = Math.max(0, this.needs.food - 0.5 * gameSpeed);
        this.needs.rest = Math.max(0, this.needs.rest - 0.3 * gameSpeed);
        this.needs.entertainment = Math.max(0, this.needs.entertainment - 0.2 * gameSpeed);
        this.needs.social = Math.max(0, this.needs.social - 0.15 * gameSpeed);
        this.needs.safety = Math.max(0, this.needs.safety - 0.1 * gameSpeed);

        // Phục hồi nhu cầu dựa trên hoạt động
        if (this.activity === 'breakfast' || this.activity === 'dinner') {
            this.needs.food = Math.min(100, this.needs.food + 30);
        }
        if (this.activity === 'sleep') {
            this.needs.rest = Math.min(100, this.needs.rest + 40);
        }
        if (this.activity === 'entertainment') {
            this.needs.entertainment = Math.min(100, this.needs.entertainment + 25);
        }
        if (this.activity === 'socializing' || this.activity === 'family_time') {
            this.needs.social = Math.min(100, this.needs.social + 20);
        }
    }

    makeLifeDecisions() {
        // Quyết định kết hôn
        if (this.maritalStatus === 'single' && this.age >= 22 && this.age <= 40) {
            if (this.desires.includes('marriage') && Math.random() < 0.001) {
                this.seekMarriage();
            }
        }

        // Quyết định sinh con
        if (this.maritalStatus === 'married' && this.spouse && this.age >= 20 && this.age <= 45) {
            if (this.desires.includes('children') && this.children.length < 3 && Math.random() < 0.0005) {
                this.haveBaby();
            }
        }

        // Quyết định thay đổi công việc
        if (this.job.name === 'Thất nghiệp' && Math.random() < 0.01) {
            this.seekEmployment();
        }

        // Quyết định nâng cấp giáo dục
        if (this.age < 30 && this.desires.includes('higher_education') && Math.random() < 0.0001) {
            this.pursueEducation();
        }
    }

    seekMarriage() {
        // Tìm đối tác phù hợp trong cùng quận
        const eligiblePartners = window.citizens?.filter(citizen => {
            return citizen.id !== this.id &&
                   citizen.district === this.district &&
                   citizen.maritalStatus === 'single' &&
                   citizen.gender !== this.gender &&
                   Math.abs(citizen.age - this.age) <= 10 &&
                   citizen.desires.includes('marriage');
        });

        if (eligiblePartners && eligiblePartners.length > 0) {
            const partner = eligiblePartners[Math.floor(Math.random() * eligiblePartners.length)];
            this.marry(partner);
        }
    }

    marry(partner) {
        this.maritalStatus = 'married';
        this.spouse = partner.id;
        partner.maritalStatus = 'married';
        partner.spouse = this.id;

        // Tạo gia đình mới
        const family = new Family(this, partner);
        this.family = family.id;
        partner.family = family.id;

        // Tăng hạnh phúc
        this.happiness = Math.min(100, this.happiness + 15);
        partner.happiness = Math.min(100, partner.happiness + 15);

        // Thêm sự kiện
        window.gameEvents?.addEvent(`💒 ${this.job.name} ${this.age} tuổi và ${partner.job.name} ${partner.age} tuổi đã kết hôn tại ${this.district}!`);

        // Cập nhật thống kê
        if (window.lifeStats) {
            window.lifeStats.todayMarriages++;
        }
    }

    haveBaby() {
        if (this.spouse) {
            const partner = window.citizens?.find(c => c.id === this.spouse);
            if (partner) {
                const baby = this.createChild(partner);
                this.children.push(baby.id);
                partner.children.push(baby.id);

                // Tăng hạnh phúc
                this.happiness = Math.min(100, this.happiness + 10);
                partner.happiness = Math.min(100, partner.happiness + 10);

                // Thêm sự kiện
                window.gameEvents?.addEvent(`👶 Một em bé đã chào đời trong gia đình tại ${this.district}!`);

                // Cập nhật thống kê
                if (window.lifeStats) {
                    window.lifeStats.todayBirths++;
                }
            }
        }
    }

    createChild(partner) {
        const district = this.district;
        const x = this.x + (Math.random() - 0.5) * 20;
        const y = this.y + (Math.random() - 0.5) * 20;

        const child = new AdvancedCitizen(x, y, district, 0, [this, partner]);
        window.citizens?.push(child);

        return child;
    }

    seekEmployment() {
        const newJob = this.assignJob();
        if (newJob.name !== 'Thất nghiệp') {
            this.job = newJob;
            this.income = this.calculateIncome();
            this.happiness = Math.min(100, this.happiness + 20);

            window.gameEvents?.addEvent(`💼 ${this.job.name} ${this.age} tuổi đã tìm được việc làm mới!`);
        }
    }

    pursueEducation() {
        const educationLevels = ['basic', 'high_school', 'college', 'university'];
        const currentIndex = educationLevels.indexOf(this.education);

        if (currentIndex < educationLevels.length - 1) {
            this.education = educationLevels[currentIndex + 1];
            this.job = this.assignJob();
            this.income = this.calculateIncome();
            this.happiness = Math.min(100, this.happiness + 10);

            window.gameEvents?.addEvent(`🎓 Một dân đã hoàn thành bậc học ${this.education}!`);
        }
    }

    die() {
        // Thêm sự kiện tử vong
        const cause = this.health <= 0 ? 'bệnh tật' : 'tuổi già';
        window.gameEvents?.addEvent(`⚰️ ${this.job.name} ${this.age} tuổi đã qua đời vì ${cause} tại ${this.district}`);

        // Cập nhật thống kê
        if (window.lifeStats) {
            window.lifeStats.todayDeaths++;
        }

        // Xử lý gia đình
        if (this.spouse) {
            const partner = window.citizens?.find(c => c.id === this.spouse);
            if (partner) {
                partner.maritalStatus = 'widowed';
                partner.spouse = null;
                partner.happiness = Math.max(0, partner.happiness - 30);
            }
        }

        // Loại bỏ khỏi danh sách dân
        const citizenIndex = window.citizens?.findIndex(c => c.id === this.id);
        if (citizenIndex >= 0) {
            window.citizens.splice(citizenIndex, 1);
        }
    }

    checkProtestConditions(policies) {
        if (this.protestCooldown > 0) return;

        const protestThreshold = 20;
        const taxTooHigh = policies.taxRate > 35;
        const unhappy = this.happiness < 25;
        const unemployed = this.job.name === 'Thất nghiệp';
        const hasProtestTendency = this.personality.protestTendency > 50;
        const needsNotMet = Object.values(this.needs).some(need => need < 20);

        let protestProbability = 0;
        if (taxTooHigh) protestProbability += 0.3;
        if (unhappy) protestProbability += 0.4;
        if (unemployed) protestProbability += 0.2;
        if (needsNotMet) protestProbability += 0.2;
        if (hasProtestTendency) protestProbability += 0.3;

        protestProbability = Math.min(1.0, protestProbability);

        if (protestProbability > 0.5 && Math.random() < protestProbability * 0.01) {
            this.startProtest();
        }
    }

    startProtest() {
        this.isProtesting = true;
        this.protestCooldown = 500;
        this.activity = 'protesting';

        // Di chuyển đến trung tâm để biểu tình
        this.targetX = 600 + (Math.random() - 0.5) * 100;
        this.targetY = 350 + (Math.random() - 0.5) * 100;

        window.gameEvents?.addEvent(`🛡️ ${this.job.name} ${this.age} tuổi tại ${this.district} tham gia biểu tình phản đối!`);
    }

    updateMovement() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 2) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    calculateIncome() {
        let baseIncome = this.job.salary || 0;

        // Điều chỉnh thu nhập theo tính cách và kỹ năng
        if (this.personality.primary === 'hardworking') baseIncome *= 1.25;
        if (this.personality.primary === 'lazy') baseIncome *= 0.75;
        if (this.personality.primary === 'ambitious') baseIncome *= 1.15;

        // Bonus theo tuổi và kinh nghiệm
        const experience = Math.max(0, this.age - 18);
        baseIncome += experience * 5;

        // Bonus theo kỹ năng
        const skillBonus = Object.values(this.skills).reduce((a, b) => a + b, 0) / 8;
        baseIncome += skillBonus * 2;

        return Math.floor(baseIncome);
    }

    render(ctx) {
        // Màu sắc dựa trên tình trạng và giai đoạn cuộc sống
        let color = '#4CAF50'; // Xanh lá - bình thường

        if (this.isProtesting) {
            color = '#F44336'; // Đỏ - đang biểu tình
        } else if (this.lifeStage === 'child') {
            color = '#FFEB3B'; // Vàng - trẻ em
        } else if (this.lifeStage === 'elderly') {
            color = '#9E9E9E'; // Xám - người già
        } else if (this.happiness < 30) {
            color = '#FF9800'; // Cam - không vui
        } else if (this.job.name === 'Thất nghiệp') {
            color = '#795548'; // Nâu - thất nghiệp
        } else if (this.maritalStatus === 'married') {
            color = '#E91E63'; // Hồng - đã kết hôn
        }

        // Kích thước dựa trên tuổi tác
        let size = 4;
        if (this.lifeStage === 'child') size = 2;
        else if (this.lifeStage === 'young_adult') size = 3;
        else if (this.lifeStage === 'elderly') size = 3;

        // Vẽ dân
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(this.x - size/2), Math.floor(this.y - size/2), size, size);

        // Hiển thị biểu tượng hoạt động
        ctx.font = '8px Arial';
        if (this.activity === 'working' && this.currentLocation === 'workplace') {
            ctx.fillStyle = '#2196F3';
            ctx.fillText('💼', Math.floor(this.x) + 2, Math.floor(this.y) - 2);
        } else if (this.activity === 'school') {
            ctx.fillStyle = '#4CAF50';
            ctx.fillText('📚', Math.floor(this.x) + 2, Math.floor(this.y) - 2);
        } else if (this.activity === 'entertainment') {
            ctx.fillStyle = '#FF9800';
            ctx.fillText('🎉', Math.floor(this.x) + 2, Math.floor(this.y) - 2);
        } else if (this.isProtesting) {
            ctx.fillStyle = '#F44336';
            ctx.fillText('🛡️', Math.floor(this.x) + 2, Math.floor(this.y) - 3);
        } else if (this.maritalStatus === 'married') {
            ctx.fillStyle = '#E91E63';
            ctx.fillText('💕', Math.floor(this.x) + 2, Math.floor(this.y) - 2);
        }

        // Hiển thị sức khỏe thấp
        if (this.health < 30) {
            ctx.fillStyle = '#F44336';
            ctx.fillText('🏥', Math.floor(this.x) - 8, Math.floor(this.y) - 2);
        }
    }

    getDetailedInfo() {
        return {
            id: this.id,
            age: this.age,
            gender: this.gender,
            education: this.education,
            job: this.job.name,
            income: this.income,
            happiness: Math.floor(this.happiness),
            health: Math.floor(this.health),
            personality: `${this.personality.primary}, ${this.personality.secondary}`,
            district: this.district,
            activity: this.activity,
            location: this.currentLocation,
            lifeStage: this.lifeStage,
            maritalStatus: this.maritalStatus,
            children: this.children.length,
            isProtesting: this.isProtesting,
            needs: {
                food: Math.floor(this.needs.food),
                entertainment: Math.floor(this.needs.entertainment),
                social: Math.floor(this.needs.social),
                rest: Math.floor(this.needs.rest),
                safety: Math.floor(this.needs.safety)
            },
            desires: this.desires,
            maxLifespan: Math.floor(this.maxLifespan)
        };
    }
}

// Family class để quản lý gia đình
class Family {
    constructor(parent1, parent2) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.parents = [parent1.id, parent2.id];
        this.children = [];
        this.createdAt = Date.now();
        this.familyName = `Gia đình ${parent1.job.name}-${parent2.job.name}`;
    }

    addChild(childId) {
        this.children.push(childId);
    }

    getSize() {
        return this.parents.length + this.children.length;
    }
}
