// Activate sidebar navigation
// أضف هذا الكود في بداية ملف script.js الحالي

// التحقق من حالة تسجيل الدخول
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('justbus_logged_in');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // إذا لم يكن مسجل الدخول، توجيه إلى صفحة تسجيل الدخول
        window.location.href = 'login.html';
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // أولاً: التحقق من تسجيل الدخول
    checkLoginStatus();
    
    // ثم: تنفيذ الكود الأصلي...
    
    // الكود الأصلي يبدأ من هنا:
    const menuItems = document.querySelectorAll('.menu li a');
    // ... (بقية الكود الأصلي)
    
    // أخيراً: إضافة وظيفة تسجيل الخروج
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if(confirm('Are you sure you want to logout?')) {
            // مسح حالة تسجيل الدخول
            sessionStorage.removeItem('justbus_logged_in');
            localStorage.removeItem('justbus_admin_email');
            localStorage.removeItem('justbus_admin_password');
            
            // التوجيه إلى صفحة تسجيل الدخول
            window.location.href = 'login.html';
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu li a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove active class from all items
            menuItems.forEach(i => i.parentElement.classList.remove('active'));
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            // You can add code here to load dynamic content based on the link
            const sectionName = this.textContent.trim();
            alert(`Clicked: ${sectionName} (This is a demo, actual content would load here)`);
        });
    });

    // Notifications button
    const notifBtn = document.querySelector('.notif-btn');
    notifBtn.addEventListener('click', function() {
        alert('Notifications panel would open here (3 unread notifications)');
    });

    // Add new route button
    const addBtn = document.querySelector('.add-btn');
    addBtn.addEventListener('click', function() {
        alert('Form to add a new route would open here');
    });

    // View comments buttons in ratings table
    const viewCommentBtns = document.querySelectorAll('.view-comments-btn');
    viewCommentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const driverName = this.closest('tr').querySelector('td').textContent;
            alert(`Viewing anonymous comments for driver: ${driverName}\n(Data would be fetched from database)`);
        });
    });

    // Logout button functionality
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if(confirm('Are you sure you want to logout?')) {
            alert('Logging out...');
            // Add actual logout logic here
        }
    });

    // Simulate live data updates every 30 seconds
    function updateLiveData() {
        // In a real app, you would fetch live data from the server here
        console.log('Updating live data... (simulation)');
        
        // Update active buses count randomly for demo
        const activeBuses = document.querySelector('.card-info h3');
        const current = parseInt(activeBuses.textContent);
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = Math.max(8, Math.min(15, current + change));
        activeBuses.textContent = newValue;
    }
    
    // Update every 30 seconds
    setInterval(updateLiveData, 30000);
    
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('keyup', function(e) {
        if(e.key === 'Enter') {
            const query = this.value;
            if(query.trim() !== '') {
                alert(`Searching for: ${query}\nResults would display here`);
                this.value = '';
            }
        }
    });
});