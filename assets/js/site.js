(function() {
  // Setup showing image on about card hover
  const aboutCards = document.querySelectorAll('.about-cards .card');
  for (let i = 0; i < aboutCards.length; i++) {
    const card = aboutCards[i];
    card.addEventListener('mouseenter', function() {
      this.parentNode.parentNode.setAttribute('show', this.getAttribute('show'));
    });
    card.addEventListener('click', function() {
      this.parentNode.parentNode.setAttribute('show', this.getAttribute('show'));
    });
  }
})();
