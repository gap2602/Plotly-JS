var ct_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/district.csv";

Plotly.d3.csv(ct_path, function(data) {

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

  function createDropdownDt(data, selector) {
    const uniqueDts = [...new Set(data.map(d => d.dt_num))];
    const dropdown = document.getElementById(selector);
    uniqueDts.forEach(dt => {
      const option = document.createElement('option');
      option.value = dt;
      option.text = "เขตสุขภาพที่ " + dt;
      dropdown.appendChild(option);
    });
  }

  function createDropdownType(data, selector) {
    const uniqueTypes = [...new Set(data.map(d => d.type))];
    const dropdown = document.getElementById(selector);
    uniqueTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.text = type == 0 ? "เมื่อแรกเกิด (at birth)" : "เมื่ออายุ 60 ปี";
      dropdown.appendChild(option);
    });
  }

  function updateBarChart(data, year, dt, type, sex, colorLeft, colorRight, selector) {
    const sexLabel = sex === 'male' ? "ชาย" : sex === 'female' ? "หญิง" : "รวมเพศ";
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex && d.dt_num == dt); 
    console.log(typeof filteredData[0].LE)
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
      margin: {l: 20, r: 20, t: 20, b: 20},
      bargap: 0,
      font: {
        family: 'IBM Plex Sans Thai', // Assuming you have this font loaded in your HTML
      },
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

//   function updateCardValue(data, year, type, sex, metric, color, selector) {
//     const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex); 
//     document.getElementById(selector).innerHTML = filteredData[0][metric];
//     document.getElementById(selector).style.color = color;
//   };

  

  createDropdown(data, 'year-dd-dt');
  createDropdownDt(data, 'dt-dd');
  createDropdownType(data, 'type-dd');

  const year = document.getElementById('year-dd-dt').value;
  const dt = document.getElementById('dt-dd').value;
  const ageType = document.getElementById('type-dd').value;

//   updateBarChart(data, year, dt, ageType, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
  
  document.getElementById('year-dd-dt').addEventListener('change', (event) => {
    document.getElementById("section-name-dt").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ระดับประเทศปี พ.ศ. " + event.target.value + " (หน่วย: ปี)";
    updateBarChart(data, event.target.value, dt, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
  });

  document.getElementById('dt-dd').addEventListener('change', (event) => {
    updateBarChart(data, year, event.target.value, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
  });

  document.getElementById('type-dd').addEventListener('change', (event) => {

  });


});
