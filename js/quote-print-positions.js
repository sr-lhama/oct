(() => {
  // Coordinates are centers in the garment photo, measured from the viewer's top left.
  const front = [
    { name: 'Full front', inches: [12, 12], center: [50, 43] },
    { name: 'Upper chest', inches: [12, 4], center: [50, 36] },
    { name: 'Right chest', inches: [4, 4], center: [36, 28] },
    { name: 'Left chest', inches: [4, 4], center: [64, 28] },
    { name: 'Lower left (front view)', inches: [5, 5], center: [32, 79] },
    { name: 'Lower right (front view)', inches: [5, 5], center: [68, 79] },
    { name: 'Vertical left (front view)', inches: [3, 12], center: [31, 66] },
    { name: 'Vertical right (front view)', inches: [3, 12], center: [69, 66] },
    { name: 'Lower front', inches: [12, 4], center: [50, 83] },
    { name: 'Above pocket', inches: [4, 3], center: [64, 29], note: 'For garments with a chest pocket' },
  ];
  const back = [
    { name: 'Center back', inches: [12, 12], center: [50, 38] },
    { name: 'Top back', inches: [12, 4], center: [50, 26] },
    { name: 'Vertical back right', inches: [3, 12], center: [31, 66] },
    { name: 'Vertical back left', inches: [3, 12], center: [69, 66] },
    { name: 'Lower back', inches: [12, 4], center: [50, 83] },
  ];
  const other = {
    front: [
      { name: 'Both chest sides', inches: [3.5, 3.5], center: [50, 28], double: true },
      { name: 'Centered front', inches: [8, 8], center: [50, 28] },
    ],
    back: [
      { name: 'Below collar', inches: [4, 2], center: [50, 22] },
      { name: 'Small back', inches: [6, 6], center: [50, 37] },
      { name: 'Medium back', inches: [8, 10], center: [50, 43] },
      { name: 'Full back', inches: [10, 12], center: [50, 47] },
      { name: 'Custom back size', inches: [8, 10], center: [50, 47] },
    ],
  };
  // The same requested print dimensions are drawn against each garment's photo.
  const garmentPreviews = {
    'Team 365 TT21 Polo': {
      front: {
        'Full front': { center: [50, 60] },
        'Upper chest': { center: [50, 48] },
        'Right chest': { center: [36, 35] },
        'Left chest': { center: [64, 35] },
        'Above pocket': { center: [64, 35] },
        'Both chest sides': { center: [50, 35] },
        'Centered front': { center: [50, 52] },
      },
      back: {
        'Below collar': { center: [50, 24] },
        'Top back': { center: [50, 28] },
      },
    },
    'Gildan 18500 Hoodie': {
      front: {
        'Full front': { center: [50, 49], scale: 0.78 },
        'Upper chest': { center: [50, 51], scale: 0.85 },
        'Right chest': { center: [36, 34] },
        'Left chest': { center: [64, 34] },
        'Above pocket': { center: [64, 55] },
        'Both chest sides': { center: [50, 34] },
        'Centered front': { center: [50, 51], scale: 0.86 },
        'Vertical left (front view)': { center: [34, 48], scale: 0.83 },
        'Vertical right (front view)': { center: [66, 48], scale: 0.83 },
      },
      back: {
        'Below collar': { center: [50, 34] },
        'Top back': { center: [50, 39] },
        'Small back': { center: [50, 44] },
        'Medium back': { center: [50, 49] },
        'Center back': { center: [50, 51] },
        'Full back': { center: [50, 53] },
        'Custom back size': { center: [50, 50] },
      },
    },
  };
  const artworkScale = 3.1;
  const dimensions = ({ inches }) => inches.join(' × ') + ' in';

  const capPositions = { front: { name: 'Cap front' }, back: { name: 'Cap back' } };
  const isCap = product => product === 'Flexfit 110M5' || product === 'Custom Cap';
  const isCapPosition = position => position === capPositions.front || position === capPositions.back;

  function setup(form) {
    const bySide = { front, back };
    for (const [side, positions] of Object.entries(bySide)) {
      const select = form.elements[side];
      const list = document.createElement('optgroup');
      list.label = 'Placement guide';
      positions.forEach(position => list.append(new Option(position.name, position.name)));
      const additional = document.createElement('optgroup');
      additional.label = 'Other available positions';
      other[side].forEach(position => additional.append(new Option(position.name, position.name)));
      const capOption = new Option(capPositions[side].name, capPositions[side].name);
      select.append(list, additional, capOption);

      const table = form.querySelector('[data-placement-table="' + side + '"]');
      for (const position of positions) {
        const row = table.insertRow();
        const cell = document.createElement('th');
        cell.scope = 'row';
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'placement-choice';
        option.textContent = position.name;
        option.addEventListener('click', () => {
          select.value = position.name;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          form.querySelector('#quote-garment-preview').scrollIntoView({ block: 'start' });
        });
        cell.append(option);
        if (position.note) {
          const note = document.createElement('small');
          note.textContent = position.note;
          cell.append(note);
        }
        row.append(cell);
        row.insertCell().textContent = dimensions(position);
      }
    }

    return (side, name) => capPositions[side].name === name
      ? capPositions[side]
      : [...bySide[side], ...other[side]].find(position => position.name === name);
  }

  function apply(marker, position, product, side) {
    marker.hidden = !position || isCapPosition(position);
    if (marker.hidden) return;
    const preview = garmentPreviews[product]?.[side]?.[position.name];
    const [x, y] = preview?.center ?? position.center;
    const scale = artworkScale * (preview?.scale ?? 1);
    marker.dataset.position = position.double ? 'both_chest' : 'single';
    marker.style.setProperty('--print-x', x + '%');
    marker.style.setProperty('--print-y', y + '%');
    marker.style.setProperty('--print-w', (position.double ? 39 : position.inches[0] * scale) + '%');
    marker.style.setProperty('--print-h', position.inches[1] * scale + '%');
  }

  window.octQuotePositions = { setup, apply, dimensions, isCap, isCapPosition };
})();
