// ========== ЭКРАН ЗАГРУЗКИ ==========
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const progressFill = document.getElementById('progressFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const mainContent = document.getElementById('mainContent');
  const loaderParticles = document.getElementById('loaderParticles');

  function getParticleSize() {
    const width = window.innerWidth;
    if (width < 480) return 2;
    if (width < 768) return 3;
    return 4;
  }

  function getParticleCount() {
    const width = window.innerWidth;
    if (width < 480) return 15;
    if (width < 768) return 25;
    return 35;
  }

  function createLoaderParticles() {
    loaderParticles.innerHTML = '';
    const count = getParticleCount();
    const size = getParticleSize();
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('loader-particle');
      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 2}s;
        animation-duration: ${2 + Math.random() * 3}s;
      `;
      loaderParticles.appendChild(particle);
    }
  }

  createLoaderParticles();
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    if (!loader.classList.contains('hidden')) {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(createLoaderParticles, 200);
    }
  });

  document.body.style.overflow = 'hidden';
  
  let progress = 0;
  const totalSteps = 100;
  let step = 0;

  function updateProgress() {
    if (step >= totalSteps) {
      finishLoading();
      return;
    }

    step++;
    const ease = 1 - Math.pow(1 - step / totalSteps, 3);
    progress = Math.round(ease * 100);
    
    progressFill.style.width = progress + '%';
    loaderPercent.textContent = progress + '%';

    const delay = 20 + Math.random() * 40;
    setTimeout(updateProgress, delay);
  }

  function finishLoading() {
    progressFill.style.width = '100%';
    loaderPercent.textContent = '100%';
    
    setTimeout(() => {
      loader.classList.add('hidden');
      mainContent.classList.add('visible');
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
      initInteractiveBackground();
      initCustomCursor();
      initRevealOnScroll();
      initCounters();
      initSmoothScroll();
      initMobileMenu();
    }, 300);
  }

  setTimeout(updateProgress, 100);
});

// ========== ИНТЕРАКТИВНЫЙ ФОН ==========
function initInteractiveBackground() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Система частиц
  let particles = [];
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  // Орбы, которые двигаются за мышью
  const orbs = document.querySelectorAll('.orb');

  function getOptimalParticleCount() {
    const width = window.innerWidth;
    if (width < 480) return 25;
    if (width < 768) return 40;
    if (width < 1024) return 55;
    return 75;
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const count = getOptimalParticleCount();
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.3 + 0.05;
      this.connections = [];
    }
    update(mx, my) {
      // Частицы слегка притягиваются к курсору
      const dx = mx - this.x;
      const dy = my - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 200;
      
      if (distance < maxDistance) {
        const force = (1 - distance / maxDistance) * 0.02;
        this.speedX += dx * force;
        this.speedY += dy * force;
      }
      
      // Ограничение скорости
      const maxSpeed = 1.5;
      const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
      if (currentSpeed > maxSpeed) {
        this.speedX = (this.speedX / currentSpeed) * maxSpeed;
        this.speedY = (this.speedY / currentSpeed) * maxSpeed;
      }
      
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Зацикливание
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
      
      // Трение
      this.speedX *= 0.99;
      this.speedY *= 0.99;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(199, 255, 80, ${this.opacity})`;
      ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', resize);

  // Отслеживание мыши для фона
  document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
    
    // Двигаем орбы за мышью
    if (orbs.length > 0) {
      const xPercent = e.clientX / window.innerWidth;
      const yPercent = e.clientY / window.innerHeight;
      
      if (orbs[0]) {
        orbs[0].style.transform = `translate(${(xPercent - 0.5) * 30}px, ${(yPercent - 0.5) * 30}px)`;
      }
      if (orbs[1]) {
        orbs[1].style.transform = `translate(${(xPercent - 0.5) * -25}px, ${(yPercent - 0.5) * -25}px)`;
      }
      if (orbs[2]) {
        orbs[2].style.transform = `translate(${(xPercent - 0.5) * 20}px, ${(yPercent - 0.5) * 20}px)`;
      }
    }
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Плавное движение мыши
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    
    // Обновление и отрисовка частиц
    particles.forEach(p => {
      p.update(mouseX, mouseY);
      p.draw();
    });
    
    // Отрисовка соединений между частицами
    ctx.strokeStyle = 'rgba(199, 255, 80, 0.04)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Отрисовка связей от курсора к ближайшим частицам
    for (let i = 0; i < particles.length; i++) {
      const dx = mouseX - particles[i].x;
      const dy = mouseY - particles[i].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        ctx.strokeStyle = `rgba(199, 255, 80, ${0.15 * (1 - distance / 150)})`;
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(particles[i].x, particles[i].y);
        ctx.stroke();
      }
    }
    
    requestAnimationFrame(animate);
  }
  animate();
}

// ========== КАСТОМНЫЙ КУРСОР (ПОЛНОСТЬЮ ПЕРЕРАБОТАН) ==========
function initCustomCursor() {
  // Только для десктопов
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // Создаём элементы курсора
  const dot = document.createElement('div');
  dot.classList.add('cursor-dot');
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.classList.add('cursor-ring');
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let ringX = mouseX;
  let ringY = mouseY;

  // Отслеживание мыши
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Точка следует мгновенно
    dotX = mouseX;
    dotY = mouseY;
    dot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;
  });

  // Анимация кольца (плавное следование)
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX - 15}px, ${ringY - 15}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Эффекты при наведении
  const hoverElements = document.querySelectorAll('a, button, .card, .work-card, .step, .cta-button, .card-link, .contact-link, .nav-link');
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('hover');
      dot.style.transform = `translate(${dotX - 5}px, ${dotY - 5}px) scale(1.5)`;
      dot.style.background = '#fff';
    });
    
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('hover');
      dot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px) scale(1)`;
      dot.style.background = 'var(--accent)';
    });
  });

  // Скрываем курсор при выходе за пределы окна
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

// ========== REVEAL ПРИ ПРОКРУТКЕ ==========
function initRevealOnScroll() {
  const elements = document.querySelectorAll('.reveal-element');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ========== СЧЁТЧИКИ ЦИФР ==========
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 1500;
        const startTime = performance.now();
        
        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = Math.floor(progress * target);
          el.textContent = current;
          
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        }
        
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(c => observer.observe(c));
}

// ========== ПЛАВНЫЙ СКРОЛЛ ==========
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        const nav = document.getElementById('mainNav');
        if (nav) nav.classList.remove('active');
      }
    });
  });
}

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  
  if (!menuToggle || !nav) return;
  
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('active');
  });
  
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && e.target !== menuToggle) {
      nav.classList.remove('active');
    }
  });
  
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.classList.remove('active');
      nav.style.display = '';
    }
  });
}