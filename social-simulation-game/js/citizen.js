class Citizen {
    constructor(x, y, district) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.x = x;
        this.y = y;
        this.district = district;

        // Thuộc tính cơ bản
        this.age = Math.floor(Math.random() * 60) + 18;
        this.gender = Math.random() > 0.5 ? 'male' : 'female';
        this.education = this.generateEducation();
        this.personality = this.generatePersonality();
        this.job = this.assignJob();

        // Thuộc tính trạng thái
        this.happiness = Math.floor(Math.random() * 40) + 60;
        this.income = this.calculateIncome();
        this.health = Math.floor(Math.random() * 30) + 70;
        this.isProtesting = false;
        this.protestCooldown = 0;

        // Thuộc tính di chuyển
        this.targetX = x;
        this.targetY = y;
        this.speed = 1 + Math.random();
        this.activity = 'idle';
        this.activityTimer = 0;

        // Lịch trình hàng ngày
        this.schedule = this.createDailySchedule();
        this.currentScheduleIndex = 0;
    }

    generateEducation() {
        const rand = Math.random();
        if (rand < 0.3) return 'basic';      // 30% - Học vấn cơ bản
        if (rand < 0.6) return 'high_school'; // 30% - Phổ thông
        if (rand < 0.85) return 'college';    // 25% - Cao đẳng
        return 'university';                  // 15% - Đại học
    }

    generatePersonality() {
        const traits = ['patient', 'impatient', 'optimistic', 'pessimistic',
                       'hardworking', 'lazy', 'social', 'introverted',
                       'ambitious', 'content', 'creative', 'practical'];

        return {
            primary: traits[Math.floor(Math.random() * traits.length)],
            secondary: traits[Math.floor(Math.random() * traits.length)],
            protestTendency: Math.random() * 100, // Kh경향ết tham gia biểu tình
            adaptability: Math.random() * 100     // Khả năng thích응
        };
    }

    assignJob() {
        const jobs = [
            // Ngành nông nghiệp
            { name: 'Nông dân', salary: 300, education: 'basic', type: 'agriculture' },
            { name: 'Chăn nuôi', salary: 320, education: 'basic', type: 'agriculture' },

            // Ngành công nghiệp
            { name: 'Công nhân nhà máy', salary: 450, education: 'high_school', type: 'industrial' },
            { name: 'Thợ cơ khí', salary: 500, education: 'high_school', type: 'industrial' },
            { name: 'Thợ điện', salary: 520, education: 'college', type: 'industrial' },

            // Ngành dịch vụ
            { name: 'Nhân viên bán hàng', salary: 400, education: 'high_school', type: 'service' },
            { name: 'Lái xe', salary: 380, education: 'high_school', type: 'service' },
            { name: 'Thợ cắt tóc', salary: 350, education: 'basic', type: 'service' },
            { name: 'Đầu bếp', salary: 420, education: 'high_school', type: 'service' },
            { name: 'Phục vụ nhà hàng', salary: 300, education: 'basic', type: 'service' },

            // Ngành y tế
            { name: 'Y tá', salary: 600, education: 'college', type: 'healthcare' },
            { name: 'Bác sĩ', salary: 1200, education: 'university', type: 'healthcare' },
            { name: 'Dược sĩ', salary: 800, education: 'university', type: 'healthcare' },

            // Ngành giáo dục
            { name: 'Giáo viên tiểu học', salary: 550, education: 'college', type: 'education' },
            { name: 'Giáo viên THPT', salary: 650, education: 'university', type: 'education' },
            { name: 'Giảng viên đại học', salary: 900, education: 'university', type: 'education' },

            // Ngành công nghệ
            { name: 'Lập trình viên', salary: 1000, education: 'university', type: 'technology' },
            { name: 'Kỹ sư IT', salary: 1100, education: 'university', type: 'technology' },

            // Ngành tài chính
            { name: 'Nhân viên ngân hàng', salary: 700, education: 'university', type: 'finance' },
            { name: 'Kế toán', salary: 600, education: 'college', type: 'finance' },

            // Ngành xây dựng
            { name: 'Thợ xây', salary: 400, education: 'basic', type: 'construction' },
            { name: 'Kiến trúc sư', salary: 950, education: 'university', type: 'construction' },

            // Ngành khác
            { name: 'Cảnh sát', salary: 550, education: 'high_school', type: 'public' },
            { name: 'Lính cứu hỏa', salary: 520, education: 'high_school', type: 'public' },
            { name: 'Luật sư', salary: 1300, education: 'university', type: 'legal' },
            { name: 'Nhà báo', salary: 650, education: 'university', type: 'media' },
            { name: 'Nghệ sĩ', salary: 400, education: 'college', type: 'arts' },
            { name: 'Vận động viên', salary: 800, education: 'high_school', type: 'sports' },
            { name: 'Thợ sửa xe', salary: 450, education: 'high_school', type: 'service' },
            { name: 'Bán thức ăn nhanh', salary: 280, education: 'basic', type: 'service' },
            { name: 'Bán nước', salary: 250, education: 'basic', type: 'service' }
        ];

        // Lọc công việc phù hợp với học vấn
        const suitableJobs = jobs.filter(job => {
            const educationLevels = ['basic', 'high_school', 'college', 'university'];
            const citizenLevel = educationLevels.indexOf(this.education);
            const jobLevel = educationLevels.indexOf(job.education);
            return citizenLevel >= jobLevel;
        });

        if (Math.random() < 0.1 && this.age > 60) {
            return { name: 'Về hưu', salary: 200, type: 'retired' };
        }

        if (Math.random() < 0.05) {
            return { name: 'Thất nghiệp', salary: 0, type: 'unemployed' };
        }

        return suitableJobs[Math.floor(Math.random() * suitableJobs.length)] || jobs[0];
    }

    calculateIncome() {
        let baseIncome = this.job.salary || 0;

        // Điều chỉnh thu nhập theo tính cách
        if (this.personality.primary === 'hardworking') baseIncome *= 1.2;
        if (this.personality.primary === 'lazy') baseIncome *= 0.8;
        if (this.personality.primary === 'ambitious') baseIncome *= 1.1;

        return Math.floor(baseIncome);
    }

    createDailySchedule() {
        const baseSchedule = [
            { time: 6, activity: 'wake_up', duration: 1 },
            { time: 7, activity: 'breakfast', duration: 1 },
        ];

        if (this.job.name !== 'Thất nghiệp' && this.job.name !== 'Về hưu') {
            baseSchedule.push(
                { time: 8, activity: 'work', duration: 8 },
                { time: 16, activity: 'home', duration: 1 }
            );
        }

        baseSchedule.push(
            { time: 18, activity: 'dinner', duration: 1 },
            { time: 19, activity: 'leisure', duration: 3 },
            { time: 22, activity: 'sleep', duration: 8 }
        );

        return baseSchedule;
    }

    update(gameTime, policies) {
        this.updateActivity(gameTime);
        this.updateMood(policies);
        this.updateMovement();
        this.checkProtestConditions(policies);

        if (this.protestCooldown > 0) this.protestCooldown--;
    }

    updateActivity(gameTime) {
        this.activityTimer++;

        if (this.activityTimer > 100) { // Thay đổi hoạt động mỗi 100 frame
            this.activityTimer = 0;
            const activities = ['idle', 'walking', 'working', 'shopping', 'socializing'];
            this.activity = activities[Math.floor(Math.random() * activities.length)];

            // Đặt mục tiêu di chuyển mới
            this.setNewTarget();
        }
    }

    updateMood(policies) {
        // Tác động của thuế
        const taxImpact = policies.taxRate > 25 ? -(policies.taxRate - 25) * 0.5 : 0;

        // Tác động của giáo dục và y tế
        const serviceImpact = (policies.educationBudget + policies.healthBudget) * 0.2;

        // Tác động của tính cách
        let personalityImpact = 0;
        if (this.personality.primary === 'optimistic') personalityImpact = 5;
        if (this.personality.primary === 'pessimistic') personalityImpact = -5;

        // Cập nhật hạnh phúc
        let newHappiness = this.happiness + taxImpact + serviceImpact + personalityImpact * 0.1;
        this.happiness = Math.max(0, Math.min(100, newHappiness));
    }

    checkProtestConditions(policies) {
        if (this.protestCooldown > 0) return;

        const protestThreshold = 30;
        const taxTooHigh = policies.taxRate > 30;
        const unhappy = this.happiness < 30;
        const hasProtestTendency = this.personality.protestTendency > 60;

        if (taxTooHigh && unhappy && hasProtestTendency && Math.random() < 0.1) {
            this.startProtest();
        }
    }

    startProtest() {
        this.isProtesting = true;
        this.protestCooldown = 300; // 5 phút cooldown
        this.activity = 'protesting';

        // Tìm khu vực trung tâm để biểu tình
        this.targetX = 500 + (Math.random() - 0.5) * 100;
        this.targetY = 300 + (Math.random() - 0.5) * 100;

        // Thêm sự kiện biểu tình
        gameEvents.addEvent(`🛡️ Dân ${this.job.name} tại ${this.district} bắt đầu biểu tình phản đối thuế cao!`);
    }

    setNewTarget() {
        // Di chuyển trong phạm vi quận của mình
        const districtBounds = getDistrictBounds(this.district);
        this.targetX = districtBounds.x + Math.random() * districtBounds.width;
        this.targetY = districtBounds.y + Math.random() * districtBounds.height;
    }

    updateMovement() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 2) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            // Đã đến đích, đặt mục tiêu mới
            this.setNewTarget();
        }
    }

    render(ctx) {
        // Màu sắc dựa trên tình trạng
        let color = '#4CAF50'; // Xanh lá - bình thường

        if (this.isProtesting) {
            color = '#F44336'; // Đỏ - đang biểu tình
        } else if (this.happiness < 30) {
            color = '#FF9800'; // Cam - không vui
        } else if (this.job.name === 'Thất nghiệp') {
            color = '#9E9E9E'; // Xám - thất nghiệp
        }

        // Vẽ dân dạng pixel
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), 4, 4);

        // Hiển thị biểu tượng hoạt động
        if (this.activity === 'working') {
            ctx.fillStyle = '#2196F3';
            ctx.fillRect(Math.floor(this.x) + 1, Math.floor(this.y) - 2, 2, 1);
        } else if (this.isProtesting) {
            ctx.fillStyle = '#F44336';
            ctx.fillRect(Math.floor(this.x), Math.floor(this.y) - 3, 4, 1);
        }
    }

    getInfo() {
        return {
            id: this.id,
            age: this.age,
            gender: this.gender,
            education: this.education,
            job: this.job.name,
            income: this.income,
            happiness: Math.floor(this.happiness),
            health: this.health,
            personality: `${this.personality.primary}, ${this.personality.secondary}`,
            district: this.district,
            activity: this.activity,
            isProtesting: this.isProtesting
        };
    }
}
