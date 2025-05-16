// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Back to top button
  const backToTopBtn = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  