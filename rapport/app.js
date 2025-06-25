// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');
const overlay = document.getElementById('overlay');
const backToTop = document.getElementById('backToTop');
const progressFill = document.getElementById('progressFill');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// State
let isMenuOpen = false;
let currentSection = '';
let isScrolling = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupIntersectionObserver();
    updateProgressBar();
    highlightActiveSection();
    setupPrintFunctionality();
    
    // Show all sections immediately for better UX
    setTimeout(() => {
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.classList.add('visible');
                animateCardsInSection(section);
            }, index * 150);
        });
    }, 300);
}

function setupEventListeners() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    sidebarClose.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Back to top button
    backToTop.addEventListener('click', scrollToTop);
    
    // Scroll events - using throttled version for better performance
    window.addEventListener('scroll', throttle(handleScroll, 10));
    
    // Resize events
    window.addEventListener('resize', throttle(handleResize, 100));
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
}

function toggleMobileMenu() {
    if (isMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    isMenuOpen = true;
    sidebar.classList.add('active');
    overlay.classList.add('active');
    mobileMenuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first nav link for accessibility
    const firstNavLink = sidebar.querySelector('.nav-link');
    if (firstNavLink) {
        setTimeout(() => firstNavLink.focus(), 100);
    }
}

function closeMobileMenu() {
    isMenuOpen = false;
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    document.body.style.overflow = '';
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
        // Close mobile menu immediately for better UX
        if (isMenuOpen) {
            closeMobileMenu();
        }
        
        // Ensure target section is visible before scrolling
        targetSection.classList.add('visible');
        animateCardsInSection(targetSection);
        
        // Smooth scroll to section with better calculation
        setTimeout(() => {
            const headerOffset = 20;
            const targetPosition = targetSection.offsetTop - headerOffset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update active nav link
            updateActiveNavLink(targetId);
        }, isMenuOpen ? 300 : 0);
    }
}

function animateCardsInSection(section) {
    const cards = section.querySelectorAll('.card, .tool-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function updateActiveNavLink(sectionId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    currentSection = sectionId;
}

function handleScroll() {
    if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(() => {
            updateProgressBar();
            updateBackToTopButton();
            highlightActiveSection();
            isScrolling = false;
        });
    }
}

function updateProgressBar() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    ) - window.innerHeight;
    
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const clampedPercent = Math.min(Math.max(scrollPercent, 0), 100);
    
    if (progressFill) {
        progressFill.style.width = clampedPercent + '%';
    }
}

function updateBackToTopButton() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

function highlightActiveSection() {
    const scrollTop = (window.pageYOffset || document.documentElement.scrollTop) + 150;
    let activeSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
            activeSection = sectionId;
        }
    });
    
    if (activeSection && currentSection !== activeSection) {
        updateActiveNavLink(activeSection);
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleResize() {
    // Close mobile menu on resize to desktop and reset sidebar
    if (window.innerWidth > 768) {
        if (isMenuOpen) {
            closeMobileMenu();
        }
        // Ensure sidebar is properly positioned on desktop
        sidebar.style.transform = '';
    } else {
        // Ensure sidebar is hidden on mobile when not active
        if (!isMenuOpen) {
            sidebar.classList.remove('active');
        }
    }
    
    // Recalculate progress bar
    updateProgressBar();
}

function handleKeyboard(e) {
    // Close mobile menu on Escape key
    if (e.key === 'Escape' && isMenuOpen) {
        closeMobileMenu();
    }
    
    // Navigate sections with arrow keys when focused
    if (document.activeElement && document.activeElement.classList.contains('nav-link')) {
        const currentIndex = Array.from(navLinks).indexOf(document.activeElement);
        
        if (e.key === 'ArrowDown' && currentIndex < navLinks.length - 1) {
            e.preventDefault();
            navLinks[currentIndex + 1].focus();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            e.preventDefault();
            navLinks[currentIndex - 1].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.activeElement.click();
        }
    }
}

// Intersection Observer for section animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                animateCardsInSection(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
        
        // Initially set up cards for animation
        const cards = section.querySelectorAll('.card, .tool-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        });
    });
}

// Print functionality
function setupPrintFunctionality() {
    // Create print button
    const printButton = document.createElement('button');
    printButton.innerHTML = '🖨️ Imprimer';
    printButton.className = 'print-btn';
    printButton.setAttribute('aria-label', 'Imprimer le rapport');
    
    const printStyles = `
        .print-btn {
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: var(--color-secondary);
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            z-index: 998;
            box-shadow: var(--shadow-md);
            transition: all var(--transition-normal);
            display: none;
        }
        
        .print-btn:hover {
            background: var(--color-primary);
            transform: scale(1.05);
        }
        
        .print-btn:focus {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
        
        @media (min-width: 769px) {
            .print-btn {
                display: block;
            }
        }
        
        @media print {
            .print-btn {
                display: none !important;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    
    printButton.addEventListener('click', () => {
        // Prepare for print
        sections.forEach(section => {
            section.classList.add('visible');
            const cards = section.querySelectorAll('.card, .tool-card');
            cards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });
        
        // Print after brief delay to ensure everything is visible
        setTimeout(() => {
            window.print();
        }, 500);
    });
    
    document.body.appendChild(printButton);
}

// Performance optimization: throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Loading animation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-spinner"></div>
        <p>Chargement du rapport...</p>
    `;
    
    const loaderStyles = `
        .loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--color-background);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease-out;
        }
        
        .loader-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--color-border);
            border-top: 3px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .loader p {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
            margin: 0;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = loaderStyles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(loader);
    
    // Hide loader after content is loaded
    const hideLoader = () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.remove();
                }
                if (styleSheet.parentNode) {
                    styleSheet.remove();
                }
            }, 500);
        }, 800);
    };
    
    if (document.readyState === 'complete') {
        hideLoader();
    } else {
        window.addEventListener('load', hideLoader);
    }
}

// Smooth scrolling polyfill for older browsers
function smoothScrollPolyfill() {
    if (!('scrollBehavior' in document.documentElement.style)) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
        script.onload = function() {
            if (window.smoothscroll) {
                window.smoothscroll.polyfill();
            }
        };
        document.head.appendChild(script);
    }
}

// Accessibility improvements
function enhanceAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Aller au contenu principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.id = 'main-content';
    }
    
    // Improve focus management for mobile menu
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && isMenuOpen) {
            const focusable = sidebar.querySelectorAll(focusableElements);
            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];
            
            if (e.shiftKey && document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    });
}

// Initialize everything
showLoadingAnimation();
smoothScrollPolyfill();
enhanceAccessibility();

// Error handling
window.addEventListener('error', (e) => {
    console.warn('Une erreur est survenue:', e.error);
});

// Make sure all initialization happens after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
