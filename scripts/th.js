const ct_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/country.csv";
const dt_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/district.csv";
const pv_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/province.csv";
const ac_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/area%20code.csv";
const ll_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/province_lat_lon.csv";
const pv_map = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/thailand_map.geojson";

Plotly.d3.csv(dt_path, function(dtData) {
  Plotly.d3.csv(pv_path, function(pvData) {
    Plotly.d3.csv(ac_path, function(acData) {
      Plotly.d3.csv(ll_path, function(llData) {
        
        const map1 = new Map(acData.map(d => [d.post_code, d]));
        const map2 = new Map(llData.map(d => [d.post_code, d]));
        // Left join data from file1 and file2
        const joinedData = pvData.map(d1 => ({
        ...d1,
        ...map1.get(d1.post_code) || {}
        }));

        const joinedDataLL = joinedData.map(d2 => ({
          ...d2,
          ...map2.get(d2.post_code) || {}
          }));
  
        sessionStorage.setItem('dtData', JSON.stringify(dtData));
        sessionStorage.setItem('pvData', JSON.stringify(joinedDataLL));
      });
    });
  });    
});

Plotly.d3.json(pv_map, function(mapData) {
  sessionStorage.setItem('mapData', JSON.stringify(mapData));
});

Plotly.d3.csv(ct_path, function(ctData) {
  sessionStorage.setItem('ctData', JSON.stringify(ctData));

  const b_cl_dark = "#84b81a";
  const b_cl_light = "#a3e025";
  const m_cl_dark = "#1a84b8";
  const m_cl_light = "#25a3e0";
  const fm_cl_dark = "#b81a84";
  const fm_cl_light = "#e025a3";

  const filters = { year: 2562};

  const data = JSON.parse(sessionStorage.getItem('ctData'));

  function createDropdown(data, default_value, selector) {
    const uniqueYears = [...new Set(data.map(d => d.year))];
    const sortYear = uniqueYears.map(Number).sort(function(a, b){return a-b});
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    sortYear.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.text = year;

    if (year == defaultValue) {
        option.selected = true;
    }
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

  createDropdown(data, filters.year, 'year-dd-th');
  createBarChart(data, filters.year, 0, 'bothsex', b_cl_dark, b_cl_light,'both-at-birth');
  createBarChart(data, filters.year, 60, 'bothsex', b_cl_dark, b_cl_light,'both-at-60');
  createBarChart(data, filters.year, 0, 'male', m_cl_dark, m_cl_light,'male-at-birth');
  createBarChart(data, filters.year, 60, 'male', m_cl_dark, m_cl_light,'male-at-60');
  createBarChart(data, filters.year, 0, 'female', fm_cl_dark, fm_cl_light,'female-at-birth');
  createBarChart(data, filters.year, 60, 'female', fm_cl_dark, fm_cl_light,'female-at-60');
  updateCardValue(data, filters.year, 0, 'bothsex', 'LE', b_cl_dark, 'both-at-birth-le');
  updateCardValue(data, filters.year, 0, 'bothsex', 'HALE', b_cl_dark, 'both-at-birth-hale');
  updateCardValue(data, filters.year, 60, 'bothsex', 'LE', b_cl_dark, 'both-at-60-le');
  updateCardValue(data, filters.year, 60, 'bothsex', 'HALE', b_cl_dark, 'both-at-60-hale');
  updateCardValue(data, filters.year, 0, 'male', 'LE', m_cl_dark, 'male-at-birth-le');
  updateCardValue(data, filters.year, 0, 'male', 'HALE', m_cl_dark, 'male-at-birth-hale');
  updateCardValue(data, filters.year, 60, 'male', 'LE', m_cl_dark, 'male-at-60-le');
  updateCardValue(data, filters.year, 60, 'male', 'HALE', m_cl_dark, 'male-at-60-hale');
  updateCardValue(data, filters.year, 0, 'female', 'LE', fm_cl_dark, 'female-at-birth-le');
  updateCardValue(data, filters.year, 0, 'female', 'HALE', fm_cl_dark, 'female-at-birth-hale');
  updateCardValue(data, filters.year, 60, 'female', 'LE', fm_cl_dark, 'female-at-60-le');
  updateCardValue(data, filters.year, 60, 'female', 'HALE', fm_cl_dark, 'female-at-60-hale');

  document.getElementById('year-dd-th').addEventListener('change', (event) => {
    filters.year = event.target.value;
    document.getElementById("section-name-thailand").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ระดับประเทศปี พ.ศ. " + filters.year + " (หน่วย: ปี)";
    createBarChart(data, filters.year, 0, 'bothsex', b_cl_dark, b_cl_light, 'both-at-birth');
    createBarChart(data, filters.year, 60, 'bothsex', b_cl_dark, b_cl_light, 'both-at-60');
    createBarChart(data, filters.year, 0, 'male', m_cl_dark, m_cl_light,'male-at-birth');
    createBarChart(data, filters.year, 60, 'male', m_cl_dark, m_cl_light,'male-at-60');
    createBarChart(data, filters.year, 0, 'female', fm_cl_dark, fm_cl_light,'female-at-birth');
    createBarChart(data, filters.year, 60, 'female', fm_cl_dark, fm_cl_light,'female-at-60');
    updateCardValue(data, filters.year, 0, 'bothsex', 'LE', b_cl_dark, 'both-at-birth-le');
    updateCardValue(data, filters.year, 0, 'bothsex', 'HALE', b_cl_dark, 'both-at-birth-hale');
    updateCardValue(data, filters.year, 60, 'bothsex', 'LE', b_cl_dark, 'both-at-60-le');
    updateCardValue(data, filters.year, 60, 'bothsex', 'HALE', b_cl_dark, 'both-at-60-hale');
    updateCardValue(data, filters.year, 0, 'male', 'LE', m_cl_dark, 'male-at-birth-le');
    updateCardValue(data, filters.year, 0, 'male', 'HALE', m_cl_dark, 'male-at-birth-hale');
    updateCardValue(data, filters.year, 60, 'male', 'LE', m_cl_dark, 'male-at-60-le');
    updateCardValue(data, filters.year, 60, 'male', 'HALE', m_cl_dark, 'male-at-60-hale');
    updateCardValue(data, filters.year, 0, 'female', 'LE', fm_cl_dark, 'female-at-birth-le');
    updateCardValue(data, filters.year, 0, 'female', 'HALE', fm_cl_dark, 'female-at-birth-hale');
    updateCardValue(data, filters.year, 60, 'female', 'LE', fm_cl_dark, 'female-at-60-le');
    updateCardValue(data, filters.year, 60, 'female', 'HALE', fm_cl_dark, 'female-at-60-hale');
  });
});

document.getElementById('xport').addEventListener("click", async() => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data.filter(d => d.year == 2562));
  XLSX.utils.book_append_sheet(wb, ws, "test");
  XLSX.writeFile(wb, "SheetJSESMTest.xlsx");
});
