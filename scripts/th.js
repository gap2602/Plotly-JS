var ct_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/country.csv";

Plotly.d3.csv(ct_path, function(data) {

  const b_cl_dark = "#84b81a";
  const b_cl_light = "#a3e025";
  const m_cl_dark = "#1a84b8";
  const m_cl_light = "#25a3e0";
  const fm_cl_dark = "#b81a84";
  const fm_cl_light = "#e025a3";

  function createDropdown(data, selector) {
    const uniqueYears = [...new Set(data.map(d => d.year))];
    const dropdown = document.getElementById(selector);
    uniqueYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.text = year;
      dropdown.appendChild(option);
    });
  }

  function createBarChart(data, year, type, sex, colorLeft, colorRight, selector) {
    const sexLabel = sex === 'male' ? "ชาย" : sex === 'female' ? "หญิง" : "รวมเพศ";
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex); 
  
    const trace = {
    x: ['<b>LE</b>', '<b>HALE</b>'],
    y: [filteredData[0].LE, filteredData[0].HALE],
    type: 'bar',
    text: ['<b>'+parseFloat(filteredData[0].LE).toFixed(1)+'</b>', '<b>'+parseFloat(filteredData[0].HALE).toFixed(1)+'</b>'], 
    textposition: 'outside',
    textangle: 0,
    textfont: {
      size: 14,
      color: [colorLeft, colorRight],
    },
    marker: {
      color: [colorLeft, colorRight],
      lineWidth: 0,
    },
    hovertemplate: '<b>เพศ</b>: ' + sexLabel + '<br><b>%{x}</b>: %{y:.1f}<extra></extra>'
  };
  
    const layout = {
      xaxis: {
        fixedrange: true,
      },
      yaxis: {
        showgrid: false,
        visible: false,
        fixedrange: true,
        range: [0, 100], // Set y-axis range
      },
      margin: {l: 70, r: 70, t: 20, b: 20},
      bargap: 0,
      font: {
        family: 'IBM Plex Sans Thai', // Assuming you have this font loaded in your HTML
      },
      hovermode: 'closest',
      hoverlabel: {
        font: {
          color: 'black',
          family: 'IBM Plex Sans Thai',
        },
        borderColor: 'black',
      },
      plot_bgcolor: '#f7f8f8',
      paper_bgcolor: '#f7f8f8',
    };
  
    Plotly.newPlot(selector, [trace], layout, {displayModeBar: false});
  };

  function updateCardValue(data, year, type, sex, metric, color, selector) {
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex); 
    document.getElementById(selector).innerHTML = parseFloat(filteredData[0][metric]).toFixed(1);
    document.getElementById(selector).style.color = color;
  };

  

  createDropdown(data, 'year-dd-th');
  createBarChart(data, 2562, 0, 'bothsex', b_cl_dark, b_cl_light,'both-at-birth');
  createBarChart(data, 2562, 60, 'bothsex', b_cl_dark, b_cl_light,'both-at-60');
  createBarChart(data, 2562, 0, 'male', m_cl_dark, m_cl_light,'male-at-birth');
  createBarChart(data, 2562, 60, 'male', m_cl_dark, m_cl_light,'male-at-60');
  createBarChart(data, 2562, 0, 'female', fm_cl_dark, fm_cl_light,'female-at-birth');
  createBarChart(data, 2562, 60, 'female', fm_cl_dark, fm_cl_light,'female-at-60');
  updateCardValue(data, 2562, 0, 'bothsex', 'LE', b_cl_dark, 'both-at-birth-le');
  updateCardValue(data, 2562, 0, 'bothsex', 'HALE', b_cl_dark, 'both-at-birth-hale');
  updateCardValue(data, 2562, 60, 'bothsex', 'LE', b_cl_dark, 'both-at-60-le');
  updateCardValue(data, 2562, 60, 'bothsex', 'HALE', b_cl_dark, 'both-at-60-hale');
  updateCardValue(data, 2562, 0, 'male', 'LE', m_cl_dark, 'male-at-birth-le');
  updateCardValue(data, 2562, 0, 'male', 'HALE', m_cl_dark, 'male-at-birth-hale');
  updateCardValue(data, 2562, 60, 'male', 'LE', m_cl_dark, 'male-at-60-le');
  updateCardValue(data, 2562, 60, 'male', 'HALE', m_cl_dark, 'male-at-60-hale');
  updateCardValue(data, 2562, 0, 'female', 'LE', fm_cl_dark, 'female-at-birth-le');
  updateCardValue(data, 2562, 0, 'female', 'HALE', fm_cl_dark, 'female-at-birth-hale');
  updateCardValue(data, 2562, 60, 'female', 'LE', fm_cl_dark, 'female-at-60-le');
  updateCardValue(data, 2562, 60, 'female', 'HALE', fm_cl_dark, 'female-at-60-hale');
  
  document.getElementById('year-dd-th').addEventListener('change', (event) => {
    document.getElementById("section-name-thailand").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ระดับประเทศปี พ.ศ. " + event.target.value + " (หน่วย: ปี)";
    createBarChart(data, event.target.value, 0, 'bothsex', b_cl_dark, b_cl_light, 'both-at-birth');
    createBarChart(data, event.target.value, 60, 'bothsex', b_cl_dark, b_cl_light, 'both-at-60');
    createBarChart(data, event.target.value, 0, 'male', m_cl_dark, m_cl_light,'male-at-birth');
    createBarChart(data, event.target.value, 60, 'male', m_cl_dark, m_cl_light,'male-at-60');
    createBarChart(data, event.target.value, 0, 'female', fm_cl_dark, fm_cl_light,'female-at-birth');
    createBarChart(data, event.target.value, 60, 'female', fm_cl_dark, fm_cl_light,'female-at-60');
    updateCardValue(data, event.target.value, 0, 'bothsex', 'LE', b_cl_dark, 'both-at-birth-le');
    updateCardValue(data, event.target.value, 0, 'bothsex', 'HALE', b_cl_dark, 'both-at-birth-hale');
    updateCardValue(data, event.target.value, 60, 'bothsex', 'LE', b_cl_dark, 'both-at-60-le');
    updateCardValue(data, event.target.value, 60, 'bothsex', 'HALE', b_cl_dark, 'both-at-60-hale');
    updateCardValue(data, event.target.value, 0, 'male', 'LE', m_cl_dark, 'male-at-birth-le');
    updateCardValue(data, event.target.value, 0, 'male', 'HALE', m_cl_dark, 'male-at-birth-hale');
    updateCardValue(data, event.target.value, 60, 'male', 'LE', m_cl_dark, 'male-at-60-le');
    updateCardValue(data, event.target.value, 60, 'male', 'HALE', m_cl_dark, 'male-at-60-hale');
    updateCardValue(data, event.target.value, 0, 'female', 'LE', fm_cl_dark, 'female-at-birth-le');
    updateCardValue(data, event.target.value, 0, 'female', 'HALE', fm_cl_dark, 'female-at-birth-hale');
    updateCardValue(data, event.target.value, 60, 'female', 'LE', fm_cl_dark, 'female-at-60-le');
    updateCardValue(data, event.target.value, 60, 'female', 'HALE', fm_cl_dark, 'female-at-60-hale');
  });

document.getElementById('xport').addEventListener("click", async() => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data.filter(d => d.year == 2562));
  XLSX.utils.book_append_sheet(wb, ws, "test");
  XLSX.writeFile(wb, "SheetJSESMTest.xlsx");
});

});


