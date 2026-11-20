(() => {
  const form = document.querySelector('[data-quote-form]');
  const count = document.querySelector('#artwork-count');
  const zoom = document.querySelector('#quote-preview-zoom');
  const gallery = document.querySelector('#octGarmentGallery');
  zoom.addEventListener('click', () => {
    const expanded = gallery.classList.toggle('is-enlarged');
    zoom.setAttribute('aria-expanded', String(expanded));
    zoom.textContent = expanded ? 'Reduce preview' : 'Enlarge preview';
  });
  const slots = [...form.querySelectorAll('[data-artwork-slot]')].map(slot => ({
    side: slot.dataset.artworkSlot,
    input: slot.querySelector('input'),
    status: slot.querySelector('[aria-live]'),
    preview: slot.querySelector('img'),
    remove: slot.querySelector('button'),
    view: slot.querySelector('[data-view-on-shirt]'),
    file: null,
    url: null,
    decoded: false,
    marker: form.querySelector('[data-marker=' + slot.dataset.artworkSlot + ']'),
    garment: form.querySelector('[data-oct-' + slot.dataset.artworkSlot + '-img]'),
  }));
  const limit = 10 * 1024 * 1024;
  const permitted = /\.(png|jpe?g|pdf)$/i;

  function refreshShirt(slot) {
    const garment = slot.garment;
    const hasPhoto = !garment.hidden && garment.complete && garment.naturalWidth > 0;
    if (hasPhoto) garment.parentElement.style.setProperty('--garment-ratio', garment.naturalWidth / garment.naturalHeight);
    const visible = hasPhoto && slot.decoded && !slot.marker.hidden;
    slot.marker.classList.toggle('has-artwork', visible);
    for (const print of slot.marker.querySelectorAll('[data-artwork-print]')) {
      print.hidden = !visible;
      if (visible) print.src = slot.url;
      else print.removeAttribute('src');
    }
    slot.view.hidden = !visible;
  }

  function render(slot, error) {
    const file = slot.input.files[0] ?? null;
    if (slot.file !== file) {
      if (slot.url) URL.revokeObjectURL(slot.url);
      slot.file = file;
      slot.url = null;
      slot.decoded = false;
      slot.preview.hidden = true;
      slot.preview.removeAttribute('src');
      if (file && /\.(png|jpe?g)$/i.test(file.name)) {
        slot.url = URL.createObjectURL(file);
        slot.preview.src = slot.url;
      }
    }
    slot.remove.hidden = !file;
    const side = slot.side === 'front' ? 'Front' : 'Back';
    slot.status.dataset.state = error ? 'error' : file ? 'attached' : 'empty';
    slot.status.textContent = error ?? (file
      ? side + ' file attached: ' + file.name + (/\.pdf$/i.test(file.name) ? ' · PDF saved with the request; shirt preview uses PNG or JPG.' : '')
      : slot.input.disabled ? 'Select a ' + slot.side + ' print placement to attach artwork.' : 'No ' + slot.side + ' file attached.');
    refreshShirt(slot);
  }

  function updateCount() {
    const attached = slots.filter(slot => slot.input.files.length);
    count.textContent = attached.length === 2 ? '2 files attached · Front and back'
      : attached.length === 1 ? '1 file attached · ' + (attached[0].side === 'front' ? 'Front only' : 'Back only')
      : '0 files attached';
  }

  for (const slot of slots) {
    slot.preview.addEventListener('load', () => {
      slot.decoded = true;
      slot.preview.hidden = false;
      refreshShirt(slot);
    });
    slot.preview.addEventListener('error', () => {
      if (!slot.url) return;
      slot.decoded = false;
      slot.preview.hidden = true;
      slot.status.textContent = 'File attached: ' + slot.file.name + ' · Image preview unavailable.';
      refreshShirt(slot);
    });
    slot.garment.addEventListener('load', () => refreshShirt(slot));
    slot.garment.addEventListener('error', () => refreshShirt(slot));
    slot.input.addEventListener('change', () => {
      const file = slot.input.files[0];
      let error;
      if (file && !permitted.test(file.name)) error = 'Choose a PNG, JPG, or PDF file.';
      else if (slots.reduce((total, entry) => total + (entry.input.files[0]?.size ?? 0), 0) > limit) {
        error = 'The two files must total 10 MB or less.';
      }
      if (error) slot.input.value = '';
      render(slot, error);
      updateCount();
    });
    slot.remove.addEventListener('click', () => {
      slot.input.value = '';
      render(slot);
      updateCount();
      slot.input.focus();
    });
  }

  function sync() {
    slots.forEach(slot => render(slot));
    updateCount();
  }
  form.addEventListener('oct:artwork-state', sync);
  form.addEventListener('oct:colorchange', () => slots.forEach(refreshShirt));
  form.addEventListener('reset', () => queueMicrotask(sync));
  sync();
})();
