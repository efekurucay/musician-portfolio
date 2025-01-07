// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const heroText = document.querySelector('.artist-info h1');
const sections = document.querySelectorAll('section');
const tracks = document.querySelectorAll('.track');
const nav = document.querySelector('nav');

// Theme Management
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Mobil Menü
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

function initializeTheme() {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon(currentTheme);
    } else {
        const theme = prefersDarkScheme.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// Performans optimizasyonu için throttle fonksiyonu
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Mouse hareketi için optimize edilmiş fonksiyon
const handleMouseMove = throttle((e) => {
    if (!isMobile()) {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        requestAnimationFrame(() => {
            updateFloatingElements(mouseX, mouseY);

            if (heroText) {
                const textShadowX = mouseX * 20;
                const textShadowY = mouseY * 20;
                heroText.style.transform = `translate(${mouseX * 30}px, ${mouseY * 30}px)`;
                heroText.style.textShadow = `
                    ${textShadowX}px ${textShadowY}px 30px var(--accent-light),
                    ${-textShadowX}px ${-textShadowY}px 30px var(--accent)
                `;
            }
        });
    }
}, 16);

// Scroll için optimize edilmiş fonksiyon
const handleScroll = throttle(() => {
    const scrolled = window.pageYOffset;
    const wave = document.querySelector('.wave-animation');
    
    requestAnimationFrame(() => {
        if (wave) {
            wave.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        updateScrollProgress();
    });
}, 16);

// Event listener'ları optimize et
document.addEventListener('mousemove', handleMouseMove, { passive: true });
window.addEventListener('scroll', handleScroll, { passive: true });

// 3D Card Effect
document.querySelectorAll('.track').forEach(card => {
    const trackInner = card.querySelector('.track-inner');
    
    card.addEventListener('mousemove', e => {
        if (isMobile()) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        trackInner.style.transform = 
            `translateZ(50px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        trackInner.style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
    });

    // Mobil için touch olayları
    card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
    });

    card.addEventListener('touchend', () => {
        card.style.transform = 'scale(1)';
    });
});

// Enhanced Wave Animation
function initWaveAnimation() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = 100;
    let animationFrameId;

    const waves = [{
        y: height / 2,
        length: 0.01,
        amplitude: 20,
        frequency: 0.01,
        color: getComputedStyle(document.documentElement).getPropertyValue('--accent')
    }]; // Tek dalga ile basitleştirdik

    let increment = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        waves.forEach(wave => {
            ctx.beginPath();
            ctx.moveTo(0, height / 2);

            for (let i = 0; i < width; i += 2) { // Her 2 pikselde bir çizim
                ctx.lineTo(
                    i,
                    wave.y + 
                    Math.sin(i * wave.length + increment) * 
                    wave.amplitude * 
                    Math.sin(increment)
                );
            }

            ctx.strokeStyle = wave.color;
            ctx.stroke();
        });

        increment += 0.02;
        animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Resize event'ini throttle et
    const handleResize = throttle(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = 100;
    }, 250);

    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup fonksiyonu
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    };
}

// Enhanced Floating Elements Animation
function updateFloatingElements(mouseX, mouseY) {
    const floatingElements = document.querySelectorAll('.floating-element');
    const floatingNotes = document.querySelectorAll('.floating-note');

    floatingElements.forEach((element, index) => {
        const speed = element.getAttribute('data-speed');
        const x = mouseX * 100 * speed;
        const y = mouseY * 100 * speed;
        const rotation = Math.sin(Date.now() * 0.001 + index) * 15;
        
        element.style.transform = `
            translate(${x}px, ${y}px) 
            rotate(${rotation}deg) 
            scale(${1 + Math.sin(Date.now() * 0.002 + index) * 0.1})
        `;
    });

    floatingNotes.forEach((note, index) => {
        const x = mouseX * 50 * (index + 1);
        const y = mouseY * 50 * (index + 1);
        const rotation = Math.cos(Date.now() * 0.002 + index) * 20;
        
        note.style.transform = `
            translate(${x}px, ${y}px) 
            rotate(${rotation}deg)
            scale(${1 + Math.sin(Date.now() * 0.001 + index) * 0.2})
        `;
    });
}

// Enhanced scroll animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.style.transitionDelay = `${Math.random() * 0.5}s`;
        }
    });
}, observerOptions);

// Observe elements for animation
sections.forEach(section => observer.observe(section));
tracks.forEach(track => observer.observe(track));

// Theme Toggle
themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    // Tema değişim animasyonu
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
});

// Scroll Progress Bar
function updateScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.width = `${scrollPercent}%`;
}

// 3D Parallax Effect
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 1024) {
        const layers = document.querySelectorAll('.layer');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        layers.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            const x = mouseX * 100 * speed;
            const y = mouseY * 100 * speed;
            layer.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    const cleanup = initWaveAnimation();

    // Başlangıç animasyonlarını optimize et
    requestAnimationFrame(() => {
        if (heroText) {
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0) scale(1)';
            heroText.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }

        const floatingElements = document.querySelectorAll('.floating-element, .floating-note');
        floatingElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '0.2';
                element.style.transform = 'scale(1) translateY(0)';
                element.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }, 100 + (index * 50)); // Delay'i azalttık
        });
    });

    // Enhanced animation classes
    document.body.insertAdjacentHTML('beforeend', `
        <style>
            .animate-in {
                animation: fadeInUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            
            @keyframes fadeInUp {
                0% {
                    opacity: 0;
                    transform: translateY(50px) scale(0.9);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            section, .track {
                opacity: 0;
                transform: translateY(50px) scale(0.9);
            }
        </style>
    `);
});

// System theme change handler
prefersDarkScheme.addListener((e) => {
    const theme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
});

// Mobil Menü
function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.className = 'fas fa-times';
        document.body.style.overflow = 'hidden';
    } else {
        icon.className = 'fas fa-bars';
        document.body.style.overflow = '';
    }
}

mobileMenuBtn.addEventListener('click', toggleMobileMenu);

// Mobil menüde link tıklandığında menüyü kapat
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});

// Mobil cihazlarda 3D efektleri devre dışı bırak
function isMobile() {
    return window.innerWidth <= 768;
}

// Track hover efektlerini mobil için düzenle
document.querySelectorAll('.track').forEach(card => {
    const trackInner = card.querySelector('.track-inner');
    
    card.addEventListener('mousemove', e => {
        if (isMobile()) return;
        
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        trackInner.style.transform = 
            `translateZ(50px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        trackInner.style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
    });

    // Mobil için touch olayları
    card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
    });

    card.addEventListener('touchend', () => {
        card.style.transform = 'scale(1)';
    });
}); 