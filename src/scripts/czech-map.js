// Czech Map Choropleth Logic
import regionData from '../data/regionData.json';

const metrics = {
  density: {
    label: 'Hustota',
    unit: 'obyv./km²',
    colorLow: '#e0f2fe',
    colorHigh: '#0369A1',
    format: (v) => v.toLocaleString('cs-CZ')
  },
  unemployment: {
    label: 'Nezaměstnanost',
    unit: '%',
    colorLow: '#dcfce7',
    colorHigh: '#b91c1c',
    format: (v) => v.toFixed(1)
  },
  salary: {
    label: 'Průměrná mzda',
    unit: 'Kč',
    colorLow: '#ecfdf5',
    colorHigh: '#059669',
    format: (v) => v.toLocaleString('cs-CZ')
  }
};

let currentMetric = 'density';

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getMinMax(metric) {
  const values = Object.values(regionData).map(r => r[metric]);
  return { min: Math.min(...values), max: Math.max(...values) };
}

function getColor(value, min, max, colorLow, colorHigh) {
  const ratio = (value - min) / (max - min);
  const lowRgb = hexToRgb(colorLow);
  const highRgb = hexToRgb(colorHigh);
  const r = Math.round(lowRgb.r + ratio * (highRgb.r - lowRgb.r));
  const g = Math.round(lowRgb.g + ratio * (highRgb.g - lowRgb.g));
  const b = Math.round(lowRgb.b + ratio * (highRgb.b - lowRgb.b));
  return `rgb(${r}, ${g}, ${b})`;
}

// Move the sliding indicator to the active button
function moveIndicator(activeBtn, indicator) {
  if (!indicator || !activeBtn) return;
  indicator.style.width = `${activeBtn.offsetWidth}px`;
  indicator.style.transform = `translateX(${activeBtn.offsetLeft - 2}px)`;
}

function updateMap(metric) {
  currentMetric = metric;
  const regions = document.querySelectorAll('.region');
  const legendMin = document.querySelector('.legend-min');
  const legendMax = document.querySelector('.legend-max');
  const legendBar = document.querySelector('.legend-bar');

  const { min, max } = getMinMax(metric);
  const { colorLow, colorHigh, unit, format } = metrics[metric];

  regions.forEach(region => {
    const regionId = region.dataset.region;
    const data = regionData[regionId];
    if (data) {
      const value = data[metric];
      const color = getColor(value, min, max, colorLow, colorHigh);
      region.style.fill = color;
    }
  });

  if (legendBar) {
    legendBar.style.background = `linear-gradient(to right, ${colorLow}, ${colorHigh})`;
  }
  if (legendMin) legendMin.textContent = format(min) + ' ' + unit;
  if (legendMax) legendMax.textContent = format(max) + ' ' + unit;

  // Update pinned tooltip if a region is active
  const activeRegion = document.querySelector('.region.active');
  if (activeRegion) {
    const regionId = activeRegion.dataset.region;
    const data = regionData[regionId];
    const tooltipName = document.querySelector('.tooltip-name');
    const tooltipValue = document.querySelector('.tooltip-value');
    if (data && tooltipName && tooltipValue) {
      tooltipValue.textContent = format(data[metric]) + ' ' + unit;
    }
  }
}

function initCzechMap() {
  const container = document.querySelector('.czech-map-container');
  const tooltip = document.getElementById('map-tooltip');
  const tooltipName = tooltip?.querySelector('.tooltip-name');
  const tooltipValue = tooltip?.querySelector('.tooltip-value');
  const regions = document.querySelectorAll('.region');
  const buttons = document.querySelectorAll('.seg-btn');
  const indicator = document.querySelector('.seg-indicator');

  // Position indicator on initial active button
  const initialActive = document.querySelector('.seg-btn.active');
  if (initialActive && indicator) {
    // Wait for layout
    requestAnimationFrame(() => moveIndicator(initialActive, indicator));
  }

  // Button handlers
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      moveIndicator(btn, indicator);
      updateMap(btn.dataset.metric);
    });
  });

  // Show tooltip pinned to a region's center
  function showPinnedTooltip(region) {
    const regionId = region.dataset.region;
    const data = regionData[regionId];
    if (!data || !tooltipName || !tooltipValue || !tooltip || !container) return;

    const { unit, format } = metrics[currentMetric];
    tooltipName.textContent = data.name;
    tooltipValue.textContent = format(data[currentMetric]) + ' ' + unit;
    tooltip.classList.add('visible');

    // Position at region center
    const bbox = region.getBBox();
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    const viewBox = svgEl.viewBox.baseVal;
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;

    const cx = (bbox.x + bbox.width / 2) * scaleX;
    const cy = (bbox.y + bbox.height / 2) * scaleY;
    const tooltipWidth = tooltip.offsetWidth || 150;

    let x = cx - tooltipWidth / 2;
    if (x < 5) x = 5;
    if (x + tooltipWidth > svgRect.width - 5) x = svgRect.width - tooltipWidth - 5;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${cy - 40}px`;
  }

  // Click to select region (desktop)
  regions.forEach(region => {
    region.addEventListener('click', () => {
      const wasActive = region.classList.contains('active');
      regions.forEach(r => r.classList.remove('active'));
      if (!wasActive) {
        region.classList.add('active');
        region.parentNode.appendChild(region);
        showPinnedTooltip(region);
      } else {
        tooltip?.classList.remove('visible');
      }
    });
  });

  // Tooltip handlers
  regions.forEach(region => {
    region.addEventListener('mouseenter', (e) => {
      const regionId = e.target.dataset.region;
      const data = regionData[regionId];
      if (data && tooltipName && tooltipValue) {
        const { unit, format } = metrics[currentMetric];
        tooltipName.textContent = data.name;
        tooltipValue.textContent = format(data[currentMetric]) + ' ' + unit;
        tooltip?.classList.add('visible');
      }
    });

    region.addEventListener('mousemove', (e) => {
      const rect = container?.getBoundingClientRect();
      if (rect && tooltip) {
        const tooltipWidth = tooltip.offsetWidth || 150;
        let x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x + tooltipWidth + 20 > rect.width) {
          x = x - tooltipWidth - 15;
        } else {
          x = x + 15;
        }

        tooltip.style.left = `${Math.max(5, x)}px`;
        tooltip.style.top = `${y - 10}px`;
      }
    });

    region.addEventListener('mouseleave', () => {
      // Don't hide tooltip if this region is active (pinned)
      if (!region.classList.contains('active')) {
        tooltip?.classList.remove('visible');
      }
    });

    // Touch support
    region.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const wasActive = region.classList.contains('active');
      regions.forEach(r => r.classList.remove('active'));
      if (!wasActive) {
        region.classList.add('active');
        region.parentNode.appendChild(region);
        showPinnedTooltip(region);
      } else {
        tooltip?.classList.remove('visible');
      }
    }, { passive: false });
  });

  // Hide tooltip and deselect when clicking/touching outside map
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('region') && !e.target.closest('.map-header')) {
      regions.forEach(r => r.classList.remove('active'));
      tooltip?.classList.remove('visible');
    }
  });
  document.addEventListener('touchstart', (e) => {
    if (!e.target.classList.contains('region') && !e.target.closest('.map-header')) {
      regions.forEach(r => r.classList.remove('active'));
      tooltip?.classList.remove('visible');
    }
  });

  // Initialize with density
  updateMap('density');
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCzechMap);
} else {
  initCzechMap();
}
