// ============================================================
// CONFIGURABLE ROLES - Edit this array to change cycling titles
// ============================================================
const professionalRoles = [
    "AI & ML Engineer",
    "Full Stack Developer",
    "Cybersecurity Enthusiast",
    "Python Developer",
    "React.js Developer",
    "IoT & Hardware Tinkerer",
    "Cloud Computing Learner",
    "Problem Solver"
];
// ============================================================

// Typing animation that cycles through roles repeatedly
(function initTypingAnimation() {
    const typedTextEl = document.getElementById('typed-text');
    if (!typedTextEl) return;

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const pauseAfterType = 1800;
    const pauseAfterDelete = 400;

    function type() {
        const currentRole = professionalRoles[roleIndex];

        if (!isDeleting) {
            typedTextEl.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(type, pauseAfterType);
                return;
            }
            setTimeout(type, typeSpeed);
        } else {
            typedTextEl.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % professionalRoles.length;
                setTimeout(type, pauseAfterDelete);
                return;
            }
            setTimeout(type, deleteSpeed);
        }
    }

    type();
})();

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Hamburger keyboard support (Enter / Space)
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        }
    });
}

// Close mobile menu when clicking on a link
if (hamburger && navMenu) {
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Smooth scrolling for navigation links (with guard against href="#")
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return; // guard against bare "#"
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll + Back to Top visibility
const navbar = document.querySelector('.navbar');
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    // Navbar effect
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }

    // Back to top button
    if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

// Back to Top click
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Skill items stagger animation on scroll
const skillsSection = document.querySelector('.skills');
if (skillsSection) {
    let animationFrame = null;
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.skill-item');
                items.forEach((item, i) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    item.style.transition = `all 0.5s ease ${i * 80}ms`;
                    if (animationFrame) cancelAnimationFrame(animationFrame);
                    animationFrame = requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    });
                });
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillsObserver.observe(skillsSection);

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        skillsObserver.disconnect();
    });
}

// Active navigation link highlighting on scroll
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ============================================================
// EmailJS Contact Form
// ============================================================
// EmailJS configuration for contact form functionality
// IMPORTANT: Keep these credentials secure and don't commit to public repos!
const EMAILJS_PUBLIC_KEY = 'IAVjyo3oGet_ZQ8DP';   // EmailJS public key
const EMAILJS_SERVICE_ID = 'service_g6jiupf';     // EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_5eovos1';   // EmailJS template ID

function showFormStatus(message, type) {
    const statusEl = document.getElementById('form-status');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + type;
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
    }, 5000);
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = this.querySelector('input[name="from_name"]').value;
        const email = this.querySelector('input[name="from_email"]').value;
        const subject = this.querySelector('input[name="subject"]').value;
        const message = this.querySelector('textarea[name="message"]').value;

        if (!name || !email || !subject || !message) {
            showFormStatus('Please fill in all fields.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormStatus('Please enter a valid email address.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Check if EmailJS SDK loaded
        if (typeof emailjs === 'undefined') {
            showFormStatus('Email service is unavailable. Please email me directly at vivekkumarorigional@gmail.com', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        emailjs.init(EMAILJS_PUBLIC_KEY);
        console.log('Sending with:', {
            service: EMAILJS_SERVICE_ID,
            template: EMAILJS_TEMPLATE_ID,
            publicKey: EMAILJS_PUBLIC_KEY
        });
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                showFormStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            })
            .catch(function(err) {
                console.error('EmailJS detailed error:', {
                    status: err.status,
                    text: err.text,
                    error: err
                });
                showFormStatus('Failed to send. Please email me directly at vivekkumarorigional@gmail.com', 'error');
            })
            .finally(function() {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    });
}

// Preloader - hide after page loads
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});
