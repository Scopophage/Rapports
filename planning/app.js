// Application data
const planningData = {
  "title": "Planning des Missions d'Alternance",
  "periode": "Septembre 2024 - Août 2025",
  "missions": [
    {
      "nom": "Mission GLPI - Inventaire",
      "couleur": "#2196F3",
      "phases": [
        {"nom": "Recensement matériel", "debut": "2024-09-01", "fin": "2024-09-30", "duree": 30},
        {"nom": "Excel collaboratif", "debut": "2025-01-01", "fin": "2025-01-31", "duree": 31},
        {"nom": "Relances et corrections", "debut": "2025-01-01", "fin": "2025-06-30", "duree": 181},
        {"nom": "Vérifications et installations", "debut": "2025-06-01", "fin": "2025-08-31", "duree": 92}
      ]
    },
    {
      "nom": "Mission KPI - Outil Python",
      "couleur": "#4CAF50",
      "phases": [
        {"nom": "Développement outil Python", "debut": "2024-09-01", "fin": "2025-02-15", "duree": 168},
        {"nom": "Intégration APIs", "debut": "2024-10-01", "fin": "2025-01-31", "duree": 123}
      ]
    },
    {
      "nom": "Mission Grafana - Supervision",
      "couleur": "#FF9800",
      "phases": [
        {"nom": "Conception scripts", "debut": "2025-02-01", "fin": "2025-06-30", "duree": 149},
        {"nom": "Configuration LDAP/SSL", "debut": "2025-03-01", "fin": "2025-05-31", "duree": 92},
        {"nom": "Script Centreon", "debut": "2025-07-01", "fin": "2025-08-31", "duree": 62},
        {"nom": "Déploiement sur télés", "debut": "2025-07-15", "fin": "2025-08-31", "duree": 47}
      ]
    },
    {
      "nom": "Support Utilisateurs",
      "couleur": "#9E9E9E",
      "phases": [
        {"nom": "Préparation matériel", "debut": "2024-09-01", "fin": "2025-08-31", "duree": 365},
        {"nom": "Réponse tickets", "debut": "2024-09-01", "fin": "2025-08-31", "duree": 365}
      ]
    }
  ],
  "charges_mensuelles": [
    {"mois": "Sept 2024", "GLPI": 30, "KPI": 20, "Grafana": 0, "Support": 15, "total": 65},
    {"mois": "Oct 2024", "GLPI": 0, "KPI": 20, "Grafana": 0, "Support": 15, "total": 35},
    {"mois": "Nov 2024", "GLPI": 0, "KPI": 20, "Grafana": 0, "Support": 15, "total": 35},
    {"mois": "Déc 2024", "GLPI": 0, "KPI": 20, "Grafana": 0, "Support": 15, "total": 35},
    {"mois": "Jan 2025", "GLPI": 25, "KPI": 20, "Grafana": 0, "Support": 15, "total": 60},
    {"mois": "Fév 2025", "GLPI": 25, "KPI": 20, "Grafana": 25, "Support": 15, "total": 85},
    {"mois": "Mars 2025", "GLPI": 25, "KPI": 0, "Grafana": 25, "Support": 15, "total": 65},
    {"mois": "Avr 2025", "GLPI": 25, "KPI": 0, "Grafana": 25, "Support": 15, "total": 65},
    {"mois": "Mai 2025", "GLPI": 25, "KPI": 0, "Grafana": 25, "Support": 15, "total": 65},
    {"mois": "Juin 2025", "GLPI": 25, "KPI": 0, "Grafana": 25, "Support": 15, "total": 65},
    {"mois": "Juil 2025", "GLPI": 20, "KPI": 0, "Grafana": 30, "Support": 15, "total": 65},
    {"mois": "Août 2025", "GLPI": 20, "KPI": 0, "Grafana": 30, "Support": 15, "total": 65}
  ],
  "statistiques": {
    "duree_totale": 365,
    "nombre_missions": 4,
    "nombre_phases": 12,
    "pic_activite": {"mois": "Février 2025", "charge": 85}
  }
};

// Global state
let filteredMissions = new Set(['GLPI', 'KPI', 'Grafana', 'Support']);
let tooltip = null;

// Utility functions
function parseDate(dateStr) {
  return new Date(dateStr);
}

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getMissionKey(missionName) {
  if (missionName.includes('GLPI')) return 'GLPI';
  if (missionName.includes('KPI')) return 'KPI';
  if (missionName.includes('Grafana')) return 'Grafana';
  if (missionName.includes('Support')) return 'Support';
  return 'Other';
}

// Tab navigation
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Update active states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      // Initialize chart for active tab
      switch (targetTab) {
        case 'gantt':
          renderGanttChart();
          break;
        case 'timeline':
          renderTimelineChart();
          break;
        case 'charges':
          renderChargesChart();
          break;
        case 'stats':
          renderPieChart();
          break;
      }
    });
  });
}

// Legend filtering
function initLegendFiltering() {
  const legendItems = document.querySelectorAll('.legend-item');
  
  legendItems.forEach(item => {
    item.addEventListener('click', () => {
      const mission = item.getAttribute('data-mission');
      
      if (filteredMissions.has(mission)) {
        filteredMissions.delete(mission);
        item.classList.remove('active');
      } else {
        filteredMissions.add(mission);
        item.classList.add('active');
      }
      
      // Update current chart
      const activeTab = document.querySelector('.tab-panel.active').id;
      if (activeTab === 'gantt') {
        renderGanttChart();
      }
    });
  });
}

// Tooltip functionality
function initTooltip() {
  tooltip = document.getElementById('tooltip');
}

function showTooltip(event, content) {
  tooltip.innerHTML = content;
  tooltip.classList.add('visible');
  
  const rect = tooltip.getBoundingClientRect();
  const x = event.pageX + 10;
  const y = event.pageY - rect.height - 10;
  
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

// Gantt Chart
function renderGanttChart() {
  const svg = document.getElementById('gantt-chart');
  svg.innerHTML = '';
  
  const margin = { top: 20, right: 20, bottom: 60, left: 200 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  // Time scale
  const startDate = new Date('2024-09-01');
  const endDate = new Date('2025-08-31');
  const timeScale = width / (endDate - startDate);
  
  // Create main group
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
  svg.appendChild(g);
  
  // Draw time axis
  drawTimeAxis(g, startDate, endDate, width, height);
  
  // Collect all phases
  let allPhases = [];
  planningData.missions.forEach(mission => {
    mission.phases.forEach(phase => {
      const missionKey = getMissionKey(mission.nom);
      if (filteredMissions.has(missionKey)) {
        allPhases.push({
          ...phase,
          mission: mission.nom,
          couleur: mission.couleur,
          missionKey: missionKey
        });
      }
    });
  });
  
  // Draw phases
  const barHeight = 25;
  const barSpacing = 35;
  
  allPhases.forEach((phase, index) => {
    const startX = (parseDate(phase.debut) - startDate) * timeScale;
    const endX = (parseDate(phase.fin) - startDate) * timeScale;
    const barWidth = endX - startX;
    const y = index * barSpacing;
    
    // Create bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', startX);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', phase.couleur);
    rect.setAttribute('class', 'chart-bar');
    rect.setAttribute('data-mission', phase.missionKey);
    
    // Add tooltip
    rect.addEventListener('mouseenter', (e) => {
      const content = `
        <strong>${phase.mission}</strong><br>
        ${phase.nom}<br>
        ${formatDate(parseDate(phase.debut))} - ${formatDate(parseDate(phase.fin))}<br>
        Durée: ${phase.duree} jours
      `;
      showTooltip(e, content);
    });
    
    rect.addEventListener('mouseleave', hideTooltip);
    
    g.appendChild(rect);
    
    // Add phase label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', -10);
    text.setAttribute('y', y + barHeight / 2 + 4);
    text.setAttribute('class', 'chart-text');
    text.setAttribute('text-anchor', 'end');
    text.textContent = phase.nom;
    g.appendChild(text);
  });
}

function drawTimeAxis(g, startDate, endDate, width, height) {
  // Main axis line
  const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axisLine.setAttribute('x1', 0);
  axisLine.setAttribute('y1', height);
  axisLine.setAttribute('x2', width);
  axisLine.setAttribute('y2', height);
  axisLine.setAttribute('class', 'chart-axis');
  g.appendChild(axisLine);
  
  // Month markers
  const months = [
    'Sept 2024', 'Oct 2024', 'Nov 2024', 'Déc 2024',
    'Jan 2025', 'Fév 2025', 'Mars 2025', 'Avr 2025',
    'Mai 2025', 'Juin 2025', 'Juil 2025', 'Août 2025'
  ];
  
  const monthDates = [
    new Date('2024-09-01'), new Date('2024-10-01'), new Date('2024-11-01'), new Date('2024-12-01'),
    new Date('2025-01-01'), new Date('2025-02-01'), new Date('2025-03-01'), new Date('2025-04-01'),
    new Date('2025-05-01'), new Date('2025-06-01'), new Date('2025-07-01'), new Date('2025-08-01')
  ];
  
  const timeScale = width / (endDate - startDate);
  
  monthDates.forEach((date, index) => {
    const x = (date - startDate) * timeScale;
    
    // Grid line
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', x);
    gridLine.setAttribute('y1', 0);
    gridLine.setAttribute('x2', x);
    gridLine.setAttribute('y2', height);
    gridLine.setAttribute('class', 'chart-grid');
    g.appendChild(gridLine);
    
    // Month label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + 5);
    text.setAttribute('y', height + 20);
    text.setAttribute('class', 'chart-label');
    text.textContent = months[index];
    g.appendChild(text);
  });
}

// Timeline Chart
function renderTimelineChart() {
  const svg = document.getElementById('timeline-chart');
  svg.innerHTML = '';
  
  const margin = { top: 20, right: 20, bottom: 60, left: 250 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  const startDate = new Date('2024-09-01');
  const endDate = new Date('2025-08-31');
  const timeScale = width / (endDate - startDate);
  
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
  svg.appendChild(g);
  
  drawTimeAxis(g, startDate, endDate, width, height);
  
  // Get main phases only
  const mainPhases = [
    { nom: 'GLPI - Recensement', debut: '2024-09-01', fin: '2024-09-30', couleur: '#2196F3' },
    { nom: 'KPI - Développement', debut: '2024-09-01', fin: '2025-02-15', couleur: '#4CAF50' },
    { nom: 'GLPI - Excel & Relances', debut: '2025-01-01', fin: '2025-06-30', couleur: '#2196F3' },
    { nom: 'Grafana - Scripts', debut: '2025-02-01', fin: '2025-06-30', couleur: '#FF9800' },
    { nom: 'GLPI - Finalisation', debut: '2025-06-01', fin: '2025-08-31', couleur: '#2196F3' },
    { nom: 'Grafana - Déploiement', debut: '2025-07-01', fin: '2025-08-31', couleur: '#FF9800' },
    { nom: 'Support - Continu', debut: '2024-09-01', fin: '2025-08-31', couleur: '#9E9E9E' }
  ];
  
  const barHeight = 30;
  const barSpacing = 50;
  
  mainPhases.forEach((phase, index) => {
    const startX = (parseDate(phase.debut) - startDate) * timeScale;
    const endX = (parseDate(phase.fin) - startDate) * timeScale;
    const barWidth = endX - startX;
    const y = index * barSpacing + 20;
    
    // Create bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', startX);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', phase.couleur);
    rect.setAttribute('class', 'chart-bar');
    rect.setAttribute('rx', 4);
    
    rect.addEventListener('mouseenter', (e) => {
      const content = `
        <strong>${phase.nom}</strong><br>
        ${formatDate(parseDate(phase.debut))} - ${formatDate(parseDate(phase.fin))}
      `;
      showTooltip(e, content);
    });
    
    rect.addEventListener('mouseleave', hideTooltip);
    
    g.appendChild(rect);
    
    // Add label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', -10);
    text.setAttribute('y', y + barHeight / 2 + 4);
    text.setAttribute('class', 'chart-text');
    text.setAttribute('text-anchor', 'end');
    text.textContent = phase.nom;
    g.appendChild(text);
  });
}

// Monthly Charges Chart
function renderChargesChart() {
  const svg = document.getElementById('charges-chart');
  svg.innerHTML = '';
  
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
  svg.appendChild(g);
  
  const barWidth = width / planningData.charges_mensuelles.length * 0.8;
  const barSpacing = width / planningData.charges_mensuelles.length;
  const maxTotal = Math.max(...planningData.charges_mensuelles.map(d => d.total));
  const yScale = height / maxTotal;
  
  const colors = {
    'GLPI': '#2196F3',
    'KPI': '#4CAF50',
    'Grafana': '#FF9800',
    'Support': '#9E9E9E'
  };
  
  // Draw Y axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', 0);
  yAxis.setAttribute('y1', 0);
  yAxis.setAttribute('x2', 0);
  yAxis.setAttribute('y2', height);
  yAxis.setAttribute('class', 'chart-axis');
  g.appendChild(yAxis);
  
  // Draw X axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('y1', height);
  xAxis.setAttribute('x2', width);
  xAxis.setAttribute('y2', height);
  xAxis.setAttribute('class', 'chart-axis');
  g.appendChild(xAxis);
  
  planningData.charges_mensuelles.forEach((month, monthIndex) => {
    const x = monthIndex * barSpacing + (barSpacing - barWidth) / 2;
    let currentY = height;
    
    // Stack bars
    ['GLPI', 'KPI', 'Grafana', 'Support'].forEach(mission => {
      const value = month[mission];
      if (value > 0) {
        const barHeight = value * yScale;
        currentY -= barHeight;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', currentY);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', colors[mission]);
        rect.setAttribute('class', 'chart-bar');
        
        rect.addEventListener('mouseenter', (e) => {
          const content = `
            <strong>${month.mois}</strong><br>
            ${mission}: ${value} jours<br>
            Total: ${month.total} jours
          `;
          showTooltip(e, content);
        });
        
        rect.addEventListener('mouseleave', hideTooltip);
        
        g.appendChild(rect);
        
        // Add value label if space allows
        if (barHeight > 15) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', x + barWidth / 2);
          text.setAttribute('y', currentY + barHeight / 2 + 4);
          text.setAttribute('class', 'chart-text');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', 'white');
          text.setAttribute('font-size', '10px');
          text.textContent = value;
          g.appendChild(text);
        }
      }
    });
    
    // Month label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + barWidth / 2);
    text.setAttribute('y', height + 20);
    text.setAttribute('class', 'chart-label');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = month.mois;
    g.appendChild(text);
  });
  
  // Y axis labels
  for (let i = 0; i <= maxTotal; i += 20) {
    const y = height - (i * yScale);
    
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', -5);
    tick.setAttribute('y1', y);
    tick.setAttribute('x2', 0);
    tick.setAttribute('y2', y);
    tick.setAttribute('class', 'chart-axis');
    g.appendChild(tick);
    
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', -10);
    label.setAttribute('y', y + 4);
    label.setAttribute('class', 'chart-label');
    label.setAttribute('text-anchor', 'end');
    label.textContent = i;
    g.appendChild(label);
  }
}

// Pie Chart
function renderPieChart() {
  const svg = document.getElementById('pie-chart');
  svg.innerHTML = '';
  
  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 20;
  
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${width / 2}, ${height / 2})`);
  svg.appendChild(g);
  
  // Calculate total days per mission
  const missionTotals = {
    'GLPI': 334, // Sum of all GLPI phases
    'KPI': 291,  // Sum of all KPI phases  
    'Grafana': 350, // Sum of all Grafana phases
    'Support': 730  // Support runs continuously (365*2 for both phases)
  };
  
  const total = Object.values(missionTotals).reduce((sum, val) => sum + val, 0);
  const colors = {
    'GLPI': '#2196F3',
    'KPI': '#4CAF50',
    'Grafana': '#FF9800',
    'Support': '#9E9E9E'
  };
  
  let currentAngle = 0;
  
  Object.entries(missionTotals).forEach(([mission, value]) => {
    const angle = (value / total) * 2 * Math.PI;
    const x1 = Math.cos(currentAngle) * radius;
    const y1 = Math.sin(currentAngle) * radius;
    const x2 = Math.cos(currentAngle + angle) * radius;
    const y2 = Math.sin(currentAngle + angle) * radius;
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    path.setAttribute('d', pathData);
    path.setAttribute('fill', colors[mission]);
    path.setAttribute('class', 'chart-bar');
    
    const percentage = ((value / total) * 100).toFixed(1);
    path.addEventListener('mouseenter', (e) => {
      const content = `
        <strong>Mission ${mission}</strong><br>
        ${value} jours<br>
        ${percentage}% du total
      `;
      showTooltip(e, content);
    });
    
    path.addEventListener('mouseleave', hideTooltip);
    
    g.appendChild(path);
    
    // Add label
    const labelAngle = currentAngle + angle / 2;
    const labelRadius = radius * 0.7;
    const labelX = Math.cos(labelAngle) * labelRadius;
    const labelY = Math.sin(labelAngle) * labelRadius;
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', labelX);
    text.setAttribute('y', labelY + 4);
    text.setAttribute('class', 'chart-text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-size', '12px');
    text.textContent = `${percentage}%`;
    g.appendChild(text);
    
    currentAngle += angle;
  });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initLegendFiltering();
  initTooltip();
  
  // Initialize default view (Gantt)
  renderGanttChart();
});