/**
 * ملف JavaScript لموقع Grand Legacy
 * الإصدار النهائي - متكامل وخالي من الأخطاء
 */

// كائن التطبيق الرئيسي
const GrandLegacy = {
    // الإعدادات
    config: {
        debug: false,
        scrollOffset: 70,
        animationDuration: 300,
        loadingDelay: 800,
        countAnimationDuration: 2000
    },

    // الحالة
    state: {
        menuOpen: false,
        currentTab: 'police',
        currentFilter: 'all',
        scrolled: false,
        modalOpen: false
    },

    // عناصر DOM
    elements: {},

    // تهيئة التطبيق
    init() {
        console.log('🚀 جاري تهيئة موقع Grand Legacy...');
        
        // تجميع العناصر
        this.cacheElements();
        
        // إعداد الأحداث
        this.setupEvents();
        
        // تشغيل المكونات
        this.setupComponents();
        
        // تهيئة السنة الحالية
        this.initCurrentYear();
        
        // إخفاء شاشة التحميل
        this.hideLoading();
        
        console.log('✅ تم تهيئة الموقع بنجاح');
    },

    // تجميع عناصر DOM
    cacheElements() {
        this.elements = {
            // العناصر الأساسية
            loadingScreen: document.querySelector('.loading-screen'),
            menuToggle: document.querySelector('.menu-toggle'),
            navMenu: document.querySelector('.nav-menu'),
            navLinks: document.querySelectorAll('.nav-link'),
            
            // الأقسام
            sections: document.querySelectorAll('section'),
            
            // التبويبات
            tabButtons: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // التصفية
            filterButtons: document.querySelectorAll('.filter-btn'),
            jobCards: document.querySelectorAll('.job-card'),
            
            // الأعداد المتحركة
            statNumbers: document.querySelectorAll('.stat-number'),
            
            // المودال
            showAllLawsBtn: document.getElementById('showAllLaws'),
            lawsModal: document.getElementById('laws-modal'),
            modalClose: document.querySelector('.modal-close'),
            modalOverlay: document.querySelector('.modal-overlay'),
            
            // أزرار سريعة
            quickActions: document.querySelector('.quick-actions'),
            homeBtn: document.querySelector('.home-btn'),
            discordBtn: document.querySelector('.discord-btn'),
            
            // روابط الفوتر
            footerLinks: document.querySelectorAll('.footer-links a')
        };
    },

    // إعداد الأحداث
    setupEvents() {
        // حدث زر القائمة
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // أحداث روابط التنقل
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // أحداث أزرار التبويبات
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleTabClick(e));
        });

        // أحداث أزرار التصفية
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // حدث التمرير
        window.addEventListener('scroll', () => this.handleScroll());
        
        // حدث تغيير حجم النافذة
        window.addEventListener('resize', () => this.handleResize());
        
        // حدث تحميل الصفحة
        window.addEventListener('load', () => this.handleLoad());
        
        // أحداث المودال
        if (this.elements.showAllLawsBtn) {
            this.elements.showAllLawsBtn.addEventListener('click', () => this.openModal());
        }
        
        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', () => this.closeModal());
        }
        
        // أحداث لوحة المفاتيح للمودال
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // أحداث الفوتر
        this.elements.footerLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleFooterLinkClick(e));
        });
    },

    // إعداد المكونات
    setupComponents() {
        // تفعيل التبويب الأول
        this.activateTab('police');
        
        // تفعيل الزر الأول في التصفية
        this.activateFilter('all');
        
        // التحقق من التمرير الأولي
        this.checkScroll();
        
        // تهيئة الأعداد المتحركة
        this.initCounterAnimation();
    },

    // التحكم في القائمة
    toggleMenu() {
        this.state.menuOpen = !this.state.menuOpen;
        
        const navMenu = this.elements.navMenu;
        const menuToggle = this.elements.menuToggle;
        
        if (navMenu) {
            navMenu.classList.toggle('active', this.state.menuOpen);
            navMenu.setAttribute('aria-hidden', !this.state.menuOpen);
        }
        
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', this.state.menuOpen);
        }
        
        // إدارة حالة الجسم لمنع التمرير على الجوال
        document.body.classList.toggle('menu-open', this.state.menuOpen);
        
        // التركيز على القائمة عند فتحها
        if (this.state.menuOpen && navMenu) {
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
        }
    },

    // التعامل مع نقرات التنقل
    handleNavClick(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const targetId = link.getAttribute('href');
        
        // إغلاق القائمة إذا كانت مفتوحة
        if (this.state.menuOpen) {
            this.toggleMenu();
        }
        
        // التمرير السلس للقسم
        this.scrollToSection(targetId);
        
        // تحديث حالة الرابط النشط
        this.updateActiveNavLink(link);
    },

    // التمرير السلس للقسم
    scrollToSection(sectionId) {
        const targetElement = document.querySelector(sectionId);
        
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - this.config.scrollOffset;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    },

    // تحديث رابط التنقل النشط
    updateActiveNavLink(activeLink) {
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
        });
        
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-current', 'page');
    },

    // التعامل مع التبويبات
    handleTabClick(e) {
        const button = e.currentTarget;
        const tabId = button.getAttribute('data-tab');
        
        this.activateTab(tabId);
    },

    // تفعيل تبويب
    activateTab(tabId) {
        // تحديث الأزرار
        this.elements.tabButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });
        
        // تحديث المحتويات
        this.elements.tabContents.forEach(content => {
            const isActive = content.id === tabId;
            content.classList.toggle('active', isActive);
            content.setAttribute('aria-hidden', !isActive);
        });
        
        this.state.currentTab = tabId;
    },

    // التعامل مع التصفية
    handleFilterClick(e) {
        const button = e.currentTarget;
        const filter = button.getAttribute('data-filter');
        
        this.activateFilter(filter);
    },

    // تفعيل التصفية
    activateFilter(filter) {
        // تحديث الأزرار
        this.elements.filterButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-filter') === filter;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });
        
        // تصفية البطاقات
        this.filterJobCards(filter);
        
        this.state.currentFilter = filter;
    },

    // تصفية بطاقات الوظائف
    filterJobCards(filter) {
        this.elements.jobCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;
            
            card.style.display = shouldShow ? 'block' : 'none';
            
            // إضافة تأثير مرئي
            if (shouldShow) {
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }
        });
    },

    // التعامل مع التمرير
    handleScroll() {
        this.checkScroll();
        this.updateQuickActions();
    },

    // التحقق من حالة التمرير
    checkScroll() {
        const scrolled = window.scrollY > 100;
        
        if (scrolled !== this.state.scrolled) {
            this.state.scrolled = scrolled;
            
            const header = document.querySelector('.header');
            if (header) {
                header.classList.toggle('scrolled', scrolled);
            }
        }
    },

    // تحديث أزرار التنقل السريع
    updateQuickActions() {
        const quickActions = this.elements.quickActions;
        if (!quickActions) return;
        
        const scrolled = window.scrollY > 300;
        quickActions.style.opacity = scrolled ? '1' : '0';
        quickActions.style.visibility = scrolled ? 'visible' : 'hidden';
    },

    // التعامل مع تغيير الحجم
    handleResize() {
        // إغلاق القائمة إذا كانت مفتوحة في وضع سطح المكتب
        if (window.innerWidth > 767 && this.state.menuOpen) {
            this.toggleMenu();
        }
        
        // إعادة حساب المواضع إذا لزم الأمر
        this.updateQuickActions();
    },

    // التعامل مع تحميل الصفحة
    handleLoad() {
        // إضافة تأثيرات بعد التحميل
        document.body.classList.add('loaded');
        
        // تشغيل الأعداد المتحركة
        this.startCountAnimation();
    },

    // إخفاء شاشة التحميل
    hideLoading() {
        setTimeout(() => {
            if (this.elements.loadingScreen) {
                this.elements.loadingScreen.classList.add('hidden');
                
                setTimeout(() => {
                    this.elements.loadingScreen.style.display = 'none';
                    
                    // نقل التركيز إلى المحتوى الرئيسي
                    const mainContent = document.getElementById('main-content');
                    if (mainContent) {
                        mainContent.setAttribute('tabindex', '-1');
                        mainContent.focus();
                    }
                }, this.config.animationDuration);
            }
        }, this.config.loadingDelay);
    },

    // تهيئة السنة الحالية
    initCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    },

    // تهيئة الأعداد المتحركة
    initCounterAnimation() {
        // تأخير حتى يكون المستخدم قد رأى المحتوى
        setTimeout(() => {
            this.startCountAnimation();
        }, 500);
    },

    // تشغيل الأعداد المتحركة
    startCountAnimation() {
        this.elements.statNumbers.forEach(stat => {
            this.animateCounter(stat);
        });
    },

    // تحريك العداد
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count') || element.textContent);
        const duration = this.config.countAnimationDuration;
        const stepTime = Math.max(Math.floor(duration / target), 20);
        let current = 0;
        
        const timer = setInterval(() => {
            current += Math.ceil(target / (duration / stepTime));
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = current.toLocaleString();
        }, stepTime);
    },

    // التحكم في المودال
    openModal() {
        this.state.modalOpen = true;
        const modal = this.elements.lawsModal;
        
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            
            // منع التمرير خلف المودال
            document.body.style.overflow = 'hidden';
            
            // التركيز على زر الإغلاق
            setTimeout(() => {
                const closeBtn = modal.querySelector('.modal-close');
                if (closeBtn) closeBtn.focus();
            }, 100);
        }
    },

    closeModal() {
        this.state.modalOpen = false;
        const modal = this.elements.lawsModal;
        
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            
            // إعادة التمرير
            document.body.style.overflow = '';
            
            // إعادة التركيز إلى الزر الذي فتح المودال
            if (this.elements.showAllLawsBtn) {
                this.elements.showAllLawsBtn.focus();
            }
        }
    },

    // التعامل مع مفاتيح لوحة المفاتيح
    handleKeydown(e) {
        // زر ESC لإغلاق المودال
        if (e.key === 'Escape' && this.state.modalOpen) {
            this.closeModal();
        }
        
        // Tab للتنقل المحصور في المودال
        if (e.key === 'Tab' && this.state.modalOpen) {
            this.handleTabInModal(e);
        }
    },

    // التعامل مع Tab داخل المودال
    handleTabInModal(e) {
        const modal = this.elements.lawsModal;
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // إذا كان Shift + Tab على أول عنصر
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
        // إذا كان Tab على آخر عنصر
        else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    },

    // التعامل مع روابط الفوتر
    handleFooterLinkClick(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (href === '#') {
            // عرض رسالة للمحتوى غير المتاح
            this.showComingSoonMessage();
        } else if (href.startsWith('#')) {
            // روابط داخلية
            this.scrollToSection(href);
        }
    },

    // عرض رسالة "قريباً"
    showComingSoonMessage() {
        const message = document.createElement('div');
        message.className = 'coming-soon-message';
        message.innerHTML = `
            <div class="message-content">
                <i class="fas fa-clock"></i>
                <p>هذا المحتوى قيد التطوير وسيكون متاحاً قريباً!</p>
                <button class="btn btn-primary">حسناً</button>
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = message.querySelector('.message-content');
        content.style.cssText = `
            background: var(--bg-card);
            padding: var(--space-xl);
            border-radius: var(--radius-lg);
            text-align: center;
            max-width: 400px;
            margin: 20px;
            border: 1px solid var(--primary-color);
        `;
        
        const closeBtn = message.querySelector('.btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(message);
        });
        
        message.addEventListener('click', (e) => {
            if (e.target === message) {
                document.body.removeChild(message);
            }
        });
        
        document.body.appendChild(message);
        
        // التركيز على زر الإغلاق
        setTimeout(() => closeBtn.focus(), 100);
    },

    // التحقق من دعم المتصفح
    checkBrowserSupport() {
        const supports = {
            flexbox: 'flexWrap' in document.documentElement.style,
            grid: 'grid' in document.documentElement.style,
            intersectionObserver: 'IntersectionObserver' in window
        };
        
        if (!supports.flexbox || !supports.grid) {
            console.warn('⚠️ المتصفح قديم وقد لا يعرض التصميم بشكل صحيح');
            document.documentElement.classList.add('legacy-browser');
        }
        
        return supports;
    },

    // تسجيل الأخطاء
    logError(error, context = '') {
        console.error(`❌ خطأ في Grand Legacy ${context}:`, error);
        
        // يمكن إضافة إرسال الأخطاء إلى خدمة تتبع هنا
        if (this.config.debug) {
            // عرض رسالة خطأ للمستخدم في وضع التطوير
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: #F44336;
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                max-width: 300px;
            `;
            errorMsg.textContent = `خطأ: ${error.message}`;
            document.body.appendChild(errorMsg);
            
            setTimeout(() => {
                if (errorMsg.parentNode) {
                    document.body.removeChild(errorMsg);
                }
            }, 5000);
        }
    }
};

// تهيئة التطبيق بعد تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        // التحقق من دعم المتصفح
        GrandLegacy.checkBrowserSupport();
        
        // تهيئة التطبيق
        GrandLegacy.init();
        
        // جعل الكائن متاحاً عالمياً للتصحيح
        window.GrandLegacy = GrandLegacy;
        
    } catch (error) {
        GrandLegacy.logError(error, 'التهيئة');
        
        // عرض رسالة خطأ للمستخدم
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--bg-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
            text-align: center;
        `;
        
        errorContainer.innerHTML = `
            <div style="max-width: 600px;">
                <h2 style="color: var(--primary-color); margin-bottom: 20px;">عذراً، حدث خطأ</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    حدث خطأ غير متوقع أثناء تحميل الموقع. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً.
                </p>
                <button onclick="window.location.reload()" style="
                    background: var(--primary-color);
                    color: var(--secondary-color);
                    border: none;
                    padding: 10px 30px;
                    border-radius: 5px;
                    font-family: var(--font-family);
                    font-size: 16px;
                    cursor: pointer;
                ">
                    تحديث الصفحة
                </button>
            </div>
        `;
        
        document.body.appendChild(errorContainer);
    }
});

// معالجة الأخطاء غير المعالجة
window.addEventListener('error', (event) => {
    GrandLegacy.logError(event.error, 'غير معالج');
    return false;
});

// معالجة الوعود المرفوضة
window.addEventListener('unhandledrejection', (event) => {
    GrandLegacy.logError(event.reason, 'وعد مرفوض');
});