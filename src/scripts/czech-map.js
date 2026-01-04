// Czech Map Choropleth Logic
import regionData from '../data/regionData.json';

const metrics = {
  density: { 
    label: 'Hustota', 
    unit: 'obyv./km²', 
    colorLow: '#dbeafe', 
    colorHigh: '#1e40af',
    format: (v) => v.toLocaleString('cs-CZ')
  },
  unemployment: { 
    label: 'Nezaměstnanost', 
    unit: '%', 
    colorLow: '#dcfce7', 
    colorHigh: '#dc2626',
    format: (v) => v.toFixed(1)
  },
  salary: { 
    label: 'Průměrná mzda', 
    unit: 'Kč', 
    colorLow: '#fef3c7', 
    colorHigh: '#16a34a',
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
}

function initCzechMap() {
  const container = document.querySelector('.czech-map-container');
  const tooltip = document.getElementById('map-tooltip');
  const tooltipName = tooltip?.querySelector('.tooltip-name');
  const tooltipValue = tooltip?.querySelector('.tooltip-value');
  const regions = document.querySelectorAll('.region');
  const buttons = document.querySelectorAll('.map-btn');
  
  // Button handlers
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateMap(btn.dataset.metric);
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
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tooltip.style.left = `${x + 15}px`;
        tooltip.style.top = `${y - 10}px`;
      }
    });
    
    region.addEventListener('mouseleave', () => {
      tooltip?.classList.remove('visible');
    });
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