// تعديل ملف login.js ليكون هكذا:
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const rememberCheckbox = document.getElementById('remember');
    
    const validCredentials = {
        email: 'admin@justbus.edu',
        password: 'admin123'
    };
    
    // التحقق إذا كان المستخدم مسجلاً بالفعل
    function checkIfAlreadyLoggedIn() {
        const isLoggedIn = sessionStorage.getItem('justbus_logged_in');
        
        if (isLoggedIn === 'true') {
            // إذا كان مسجلاً، توجيه مباشرة إلى لوحة التحكم
            window.location.href = 'Index.html';
            return true;
        }
        return false;
    }
    
    // التحقق من البيانات المحفوظة
    function checkSavedCredentials() {
        const savedEmail = localStorage.getItem('justbus_admin_email');
        const savedPassword = localStorage.getItem('justbus_admin_password');
        
        if (savedEmail && savedPassword) {
            emailInput.value = savedEmail;
            passwordInput.value = savedPassword;
            rememberCheckbox.checked = true;
        }
    }
    
    // تهيئة الصفحة
    function initializePage() {
        if (checkIfAlreadyLoggedIn()) return;
        checkSavedCredentials();
        setupEventListeners();
    }
    
    // إعداد مستمعي الأحداث
    function setupEventListeners() {
        // زر إظهار/إخفاء كلمة المرور
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.className = type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
        
        // تقديم النموذج
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();
                performLogin(email, password);
            }
        });
        
        // رابط نسيت كلمة المرور
        const forgotPasswordLink = document.querySelector('.forgot-password');
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
    
    // التحقق من صحة النموذج
    function validateForm() {
        let isValid = true;
        
        const email = emailInput.value.trim();
        if (!email) {
            showError('email-error', 'Please enter your email address');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email-error', 'Please enter a valid email address');
            isValid = false;
        } else {
            hideError('email-error');
        }
        
        const password = passwordInput.value.trim();
        if (!password) {
            showError('password-error', 'Please enter your password');
            isValid = false;
        } else if (password.length < 6) {
            showError('password-error', 'Password must be at least 6 characters');
            isValid = false;
        } else {
            hideError('password-error');
        }
        
        return isValid;
    }
    
    // تنفيذ عملية تسجيل الدخول
    function performLogin(email, password) {
        const loginBtn = loginForm.querySelector('.login-btn');
        const originalText = loginBtn.innerHTML;
        
        // عرض حالة التحميل
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        loginBtn.disabled = true;
        
        // محاكاة اتصال الخادم
        setTimeout(() => {
            if (email === validCredentials.email && password === validCredentials.password) {
                // حفظ حالة تسجيل الدخول
                sessionStorage.setItem('justbus_logged_in', 'true');
                
                // حفظ بيانات تسجيل الدخول إذا تم اختيار "تذكرني"
                if (rememberCheckbox.checked) {
                    localStorage.setItem('justbus_admin_email', email);
                    localStorage.setItem('justbus_admin_password', password);
                } else {
                    localStorage.removeItem('justbus_admin_email');
                    localStorage.removeItem('justbus_admin_password');
                }
                
                // تحديث واجهة المستخدم للإشارة إلى النجاح
                loginBtn.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
                loginBtn.style.backgroundColor = '#4CAF50';
                
                // التوجيه إلى لوحة التحكم بعد تأخير قصير
                setTimeout(() => {
                    window.location.href = 'Index.html';
                }, 1000);
                
            } else {
                // إعادة تعيين زر تسجيل الدخول
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
                
                // عرض رسالة خطأ
                if (email !== validCredentials.email) {
                    showError('email-error', 'Invalid email address');
                } else {
                    showError('password-error', 'Incorrect password. Please try again.');
                }
                
                // تأثير اهتزاز للإشارة إلى الخطأ
                loginForm.classList.add('shake');
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 500);
            }
        }, 1500);
    }
    
    // معالجة "نسيت كلمة المرور"
    function handleForgotPassword() {
        const email = prompt('Please enter your email address to reset your password:');
        if (email) {
            if (validateEmail(email)) {
                alert(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
            } else {
                alert('Please enter a valid email address.');
            }
        }
    }
    
    // التحقق من صحة البريد الإلكتروني
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // عرض رسالة خطأ
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // إخفاء رسالة الخطأ
    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    // إضافة تأثيرات CSS
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .shake {
                animation: shake 0.5s ease-in-out;
            }
            .error-message {
                color: #ff5252;
                font-size: 14px;
                margin-top: 5px;
                display: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // بدء التطبيق
    addStyles();
    initializePage();
});