(() => {
  const section = document.querySelector('.oct-home-reviews');
  if (!section) return;
  const track = section.querySelector('.oct-review-track');
  const cards = [...track.children];
  const nav = section.querySelector('.oct-reviews-nav');
  const pagination = section.querySelector('.oct-review-pages');
  const [previous, next] = nav.querySelectorAll('button');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let columns = 0;
  let active = 0;
  let dots = [];
  let offsets = [];

  function update() {
    active = offsets.reduce((closest, left, index) =>
      Math.abs(left - track.scrollLeft) < Math.abs(offsets[closest] - track.scrollLeft)
        ? index : closest, 0);
    previous.disabled = active === 0;
    next.disabled = active === offsets.length - 1;
    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === active)));
  }

  function go(index) {
    const left = offsets[index];
    if (left === undefined) return;
    track.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  function measure() {
    const perPage = Number(getComputedStyle(track).getPropertyValue('--columns'));
    const edge = cards[0].offsetLeft;
    const max = track.scrollWidth - track.clientWidth;
    offsets = cards.filter((_, index) => index % perPage === 0)
      .map(card => Math.min(max, card.offsetLeft - edge));
    if (perPage !== columns) {
      columns = perPage;
      dots = offsets.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to review page ' + (index + 1));
        dot.addEventListener('click', () => go(index));
        return dot;
      });
      pagination.replaceChildren(...dots);
    }
    nav.hidden = pagination.hidden = offsets.length < 2;
    update();
  }

  previous.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  track.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(measure).observe(track);
  measure();
})();
