(function() {
    // Navigation functions
    function toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        navMenu.classList.toggle('show');
        const isExpanded = navMenu.classList.contains('show');
        document.querySelector('.mobile-menu-btn').setAttribute('aria-expanded', isExpanded);
    }

    // Tab functionality
    function initTabs() {
        const tabTriggers = document.querySelectorAll('.tab-trigger');
        const tabContents = document.querySelectorAll('.tab-content');

        tabTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const targetTab = trigger.getAttribute('data-tab');
                const parentTabs = trigger.closest('.tabs');

                parentTabs.querySelectorAll('.tab-trigger').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                parentTabs.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                trigger.classList.add('active');
                trigger.setAttribute('aria-selected', 'true');
                const targetContent = parentTabs.querySelector(`#${targetTab}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Modal functions
    function openAuthModal(mode = 'login', role = null) {
        const modal = document.getElementById('authModal');
        const modalTabs = modal.querySelectorAll('.tab-trigger');
        const modalContents = modal.querySelectorAll('.tab-content');

        modalTabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        modalContents.forEach(c => c.classList.remove('active'));

        const targetTrigger = modal.querySelector(`[data-tab="${mode}"]`);
        const targetContent = modal.querySelector(`#${mode}`);
        
        if (targetTrigger && targetContent) {
            targetTrigger.classList.add('active');
            targetTrigger.setAttribute('aria-selected', 'true');
            targetContent.classList.add('active');
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        modal.querySelector('.form-input').focus();
        trapFocus(modal);
    }

    function closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        document.querySelectorAll('.btn-gradient').forEach(btn => btn.disabled = false);
    }

    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    function showError(inputId, message) {
        const errorElement = document.getElementById(`${inputId}-error`);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function clearErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 8;
    }

    function handleAuth(event, type) {
        event.preventDefault();
        
        const form = event.target;
        const submitButton = form.querySelector('.btn-gradient');
        submitButton.disabled = true;
        clearErrors(form);

        if (type === 'register') {
            const name = form.querySelector('#register-name').value.trim();
            const email = form.querySelector('#register-email').value.trim();
            const password = form.querySelector('#register-password').value;

            if (!name) {
                showError('register-name', 'Please enter your full name');
                submitButton.disabled = false;
                return;
            }

            if (!validateEmail(email)) {
                showError('register-email', 'Please enter a valid email address');
                submitButton.disabled = false;
                return;
            }

            if (!validatePassword(password)) {
                showError('register-password', 'Password must be at least 8 characters long');
                submitButton.disabled = false;
                return;
            }
        } else {
            const email = form.querySelector('#login-email').value.trim();
            const password = form.querySelector('#login-password').value;

            if (!validateEmail(email)) {
                showError('login-email', 'Please enter a valid email address');
                submitButton.disabled = false;
                return;
            }

            if (!password) {
                showError('login-password', 'Please enter your password');
                submitButton.disabled = false;
                return;
            }
        }

        console.log(`${type} submitted`);
        closeAuthModal();
        document.querySelector('.flash-messages').innerHTML = `
            <div class="flash-message success">
                ${type === 'login' ? 'Login' : 'Registration'} successful!
            </div>
        `;
    }

    // Search and sort functionality
    function triggerSearch() {
        const searchInput = document.querySelector('#search-input');
        const table = document.querySelector('#alumniTable');
        const tbody = table.querySelector('tbody');
        const originalRows = Array.from(tbody.querySelectorAll('tr'));
        const query = searchInput.value.toLowerCase();
        const loadingOverlay = document.querySelector('#loadingOverlay');

        loadingOverlay.classList.add('active');
        tbody.innerHTML = '';

        const filteredRows = originalRows.filter(row => {
            return Array.from(row.cells).some(cell =>
                cell.textContent.toLowerCase().includes(query)
            );
        });

        filteredRows.forEach(row => tbody.appendChild(row));
        setTimeout(() => loadingOverlay.classList.remove('active'), 300);
    }

    function sortTable(key, isAsc) {
        const table = document.querySelector('#alumniTable');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const loadingOverlay = document.querySelector('#loadingOverlay');
        const sortStatus = document.querySelector('#sort-status');
        const index = ['sr-no', 'name', 'role', 'company', 'domain'].indexOf(key);

        loadingOverlay.classList.add('active');

        rows.sort((a, b) => {
            let aValue = a.children[index].textContent;
            let bValue = b.children[index].textContent;
            if (key === 'sr-no') {
                aValue = parseInt(aValue);
                bValue = parseInt(bValue);
                return isAsc ? aValue - bValue : bValue - aValue;
            }
            return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });

        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
        sortStatus.textContent = `Sorted by ${key} in ${isAsc ? 'ascending' : 'descending'} order`;
        setTimeout(() => loadingOverlay.classList.remove('active'), 300);
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
        initTabs();

        // Close modal when clicking outside
        document.getElementById('authModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeAuthModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAuthModal();
            }
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Search input and clear button
        const searchInput = document.querySelector('#search-input');
        const clearSearch = document.querySelector('.clear-search');
        if (searchInput && clearSearch) {
            searchInput.addEventListener('input', triggerSearch);
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                triggerSearch();
                searchInput.focus();
            });
        }

        // Sorting
        const headers = document.querySelectorAll('.sort');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.dataset.sort;
                const isAsc = !header.classList.contains('asc');
                headers.forEach(h => {
                    h.classList.remove('asc', 'desc');
                    h.setAttribute('aria-sort', 'none');
                    h.querySelector('.sort-icon').textContent = '';
                });
                header.classList.add(isAsc ? 'asc' : 'desc');
                header.setAttribute('aria-sort', isAsc ? 'ascending' : 'descending');
                sortTable(sortKey, isAsc);
            });
        });

        // Export to CSV
        document.getElementById('exportBtn').addEventListener('click', () => {
            const table = document.querySelector('#alumniTable');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            if (!rows.length) {
                document.querySelector('.flash-messages').innerHTML = `
                    <div class="flash-message danger">
                        No data to export
                    </div>
                `;
                return;
            }
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.replace(/\s*[↑↓]/g, '').trim());
            const csv = [
                headers.join(','),
                ...rows.map(row =>
                    Array.from(row.cells).map(cell => `"${cell.textContent.replace(/"/g, '""')}"`).join(',')
                )
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'alumni-data.csv';
            a.click();
            URL.revokeObjectURL(url);
        });

        // Row selection
        const tbody = document.querySelector('#alumniTable tbody');
        tbody.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row) {
                row.classList.toggle('selected');
                row.focus();
            }
        });

        tbody.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.classList.toggle('selected');
            }
        });

        // Close flash messages
        document.querySelectorAll('.flash-message').forEach(message => {
            message.addEventListener('click', (e) => {
                if (e.target === message.querySelector('::after')) {
                    message.remove();
                }
            });
        });

        // Add animation classes on scroll
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.section, .table-container').forEach(el => {
            observer.observe(el);
        });

        // Simulate loading state
        const loadingOverlay = document.querySelector('#loadingOverlay');
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
        }, 1000);
    });
})();
