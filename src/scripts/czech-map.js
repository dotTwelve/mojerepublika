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

  // Update info panel if a region is active
  const activeRegion = document.querySelector('.region.active');
  if (activeRegion) {
    const regionInfoEl = document.getElementById('region-info');
    const regionInfoStats = regionInfoEl?.querySelector('.region-info-stats');
    const regionId = activeRegion.dataset.region;
    const activeData = regionData[regionId];
    if (activeData && regionInfoStats) {
      regionInfoStats.innerHTML = Object.keys(metrics).map(key => {
        const m = metrics[key];
        const isCurrent = key === metric;
        return `<span${isCurrent ? ' style="font-weight:800"' : ''}><span class="stat-label">${m.label}:</span> <span class="stat-value">${m.format(activeData[key])} ${m.unit}</span></span>`;
      }).join('');
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

  // Region info panel
  const regionInfo = document.getElementById('region-info');
  const regionInfoName = regionInfo?.querySelector('.region-info-name');
  const regionInfoStats = regionInfo?.querySelector('.region-info-stats');

  function showRegionInfo(region) {
    const regionId = region.dataset.region;
    const data = regionData[regionId];
    if (!data || !regionInfo || !regionInfoName || !regionInfoStats) return;

    regionInfoName.textContent = data.name;
    regionInfoStats.innerHTML = Object.keys(metrics).map(key => {
      const m = metrics[key];
      return `<span><span class="stat-label">${m.label}:</span> <span class="stat-value">${m.format(data[key])} ${m.unit}</span></span>`;
    }).join('');
    regionInfo.classList.remove('hidden');
  }

  function hideRegionInfo() {
    regionInfo?.classList.add('hidden');
    container?.querySelector('svg')?.classList.remove('has-active');
  }

  // Click to select region (desktop)
  const svgEl = container?.querySelector('svg');
  regions.forEach(region => {
    region.addEventListener('click', () => {
      const wasActive = region.classList.contains('active');
      regions.forEach(r => r.classList.remove('active'));
      if (!wasActive) {
        region.classList.add('active');
        region.parentNode.appendChild(region);
        svgEl?.classList.add('has-active');
        showRegionInfo(region);
      } else {
        hideRegionInfo();
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
      tooltip?.classList.remove('visible');
    });

    // Touch support
    region.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const wasActive = region.classList.contains('active');
      regions.forEach(r => r.classList.remove('active'));
      if (!wasActive) {
        region.classList.add('active');
        region.parentNode.appendChild(region);
        svgEl?.classList.add('has-active');
        showRegionInfo(region);
      } else {
        hideRegionInfo();
      }
    }, { passive: false });
  });

  // Deselect when clicking/touching outside map
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('region') && !e.target.closest('.map-header')) {
      regions.forEach(r => r.classList.remove('active'));
      hideRegionInfo();
    }
  });
  document.addEventListener('touchstart', (e) => {
    if (!e.target.classList.contains('region') && !e.target.closest('.map-header')) {
      regions.forEach(r => r.classList.remove('active'));
      hideRegionInfo();
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
