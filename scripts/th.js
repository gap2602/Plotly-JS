const ct_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/country.csv";
const dt_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/district.csv";
const pv_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/province.csv";
const ac_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/area%20code.csv";
const ll_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/province_lat_lon.csv";
const pv_map = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/thailand_map.geojson";

d3.csv(dt_path).then(function(dtData) {
  d3.csv(pv_path).then(function(pvData) {
    d3.csv(ac_path).then(function(acData) {
      d3.csv(ll_path).then(function(llData) {
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

fetch(pv_map).then(response => response.json()).then(mapData => {
  sessionStorage.setItem('mapData', JSON.stringify(mapData));
})

let filters;
d3.csv(ct_path).then(function(ctData) {
  sessionStorage.setItem('ctData', JSON.stringify(ctData));

  const b_cl_dark = "#84b81a";
  const b_cl_light = "#a3e025";
  const m_cl_dark = "#1a84b8";
  const m_cl_light = "#25a3e0";
  const fm_cl_dark = "#b81a84";
  const fm_cl_light = "#e025a3";

  filters = { year: 2562};

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

  function downloadImage(format, id) {    
    const element = document.getElementById(id);
    html2canvas(element, {
      allowTaint: true,
      backgroundColor: '#f1f1f3',
      onclone: (document) => {
        // Force the cloned document to use the embedded font
        document.body.style.fontFamily = 'IBM Plex Sans Thai';
        document.body.style.fontWeight = '400';
      }
    }).then(canvas => {
      var dataUrl = canvas.toDataURL('image/'+format);
      if (format.toLowerCase() === 'jpg' && dataUrl.startsWith('data:image/png')) {
        dataUrl = canvas.toDataURL('image/jpeg');
      };
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'อายุคาดเฉลี่ยระดับประเทศ.'+format;
      link.click();
      
    }).catch(error => {
      console.error('Error capturing element:', error);
    });
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

  const image = document.getElementById('download-image');
  const dropdown = document.getElementById('download-dd');

  image.addEventListener('click', function() {
      dropdown.classList.toggle('show');
  });

  // Close the dropdown if the user clicks outside of it
  window.addEventListener('click', function(event) {
      if (!event.target.matches('#download-image')) {
          if (dropdown.classList.contains('show')) {
              dropdown.classList.remove('show');
          }
      }
  });

  document.getElementById('download-csv').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent the default link behavior
    
    const data = JSON.parse(sessionStorage.getItem('ctData'));
    const filteredData = data.filter(d => d.year == filters.year);
    const columnMapping = {
      'year': 'ปี พ.ศ.',
      'sex': 'เพศ',
      'type': 'การคำนวณ'
    };

    // Define value mapping
    const valueMapping = {
        'sex': {
            'male': 'ชาย',
            'female': 'หญิง',
            'bothsex': 'รวมเพศ'
        },
        'type': {
            '0':'เมื่อแรกเกิด',
            '60':'เมื่ออายุ 60 ปี'
        }
    };

    // Function to transform data
    function transformData(data, columnMapping, valueMapping) {
        return data.map(item => {
            const newItem = {};
            for (const [oldKey, value] of Object.entries(item)) {
                const newKey = columnMapping[oldKey] || oldKey;
                const newValue = valueMapping[oldKey] ? 
                    (valueMapping[oldKey][value] || value) : value;
                newItem[newKey] = newValue;
            }
            return newItem;
        });
    };

    // Transform the data
    const transformedData = transformData(filteredData, columnMapping, valueMapping);

    // Function to convert data to CSV format
    function jsonToCSV(jsonData) {
      if (jsonData.length === 0) {
          return '';
      }
      // Get headers
      const headers = Object.keys(jsonData[0]);
      // Create CSV rows
      const csvRows = [];
      // Add header row
      csvRows.push(headers.join(','));
      // Add data rows
      for (const row of jsonData) {
          const values = headers.map(header => {
              const escaped = ('' + row[header]).replace(/"/g, '\\"');
              return `"${escaped}"`;
          });
          csvRows.push(values.join(','));
      }
      // Combine CSV rows into a single string
      return csvRows.join('\n');
    }
    const csv = jsonToCSV(transformedData);
    // Create a Blob with the CSV data
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'อายุคาดเฉลี่ย(LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ(HALE) ระดับประเทศปี พ.ศ. '+filters.year+'.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  });

  document.getElementById('capture-button-jpg').addEventListener('click', function() {
    downloadImage('jpg', 'content');
  });
  document.getElementById('capture-button-png').addEventListener('click', function() {
    downloadImage('png', 'content');
  });

});

