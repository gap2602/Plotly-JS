var ct_path = "https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/district.csv";

Plotly.d3.csv(ct_path, function(data) {

  const m_cl_dark = "#1a84b8";
  const m_cl_light = "#25a3e0";
  const fm_cl_dark = "#b81a84";
  const fm_cl_light = "#e025a3";

  function createDropdownYear(data, default_value, selector) {
    const uniqueYears = [...new Set(data.map(d => d.year))];
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    uniqueYears.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.text = year;

      if (year == defaultValue) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
  }

  function createDropdownDt(data, default_value, selector) {
    const uniqueDts = [...new Set(data.map(d => d.dt_num))];
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    uniqueDts.forEach(dt => {
      const option = document.createElement('option');
      option.value = dt;
      option.text = "เขตสุขภาพที่ " + dt;
      if (dt == defaultValue) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
  }

  function createDropdownType(data, default_value, selector) {
    const uniqueTypes = [...new Set(data.map(d => d.type))];
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    uniqueTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.text = type == 0 ? "เมื่อแรกเกิด (at birth)" : "เมื่ออายุ 60 ปี";
      if (type == defaultValue) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
  }

  function updateBarChart(data, year, dt, type, sex, colorLeft, colorRight, selector) {
    const sexLabel = sex === 'male' ? "ชาย" : sex === 'female' ? "หญิง" : "รวมเพศ";
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex && d.dt_num == dt); 

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
    hoverinfo: 'y',
    hovertemplate: '<b>เพศ</b>: ' + sexLabel + '<br><b>%{x}</b>: %{y:.1f}<extra></extra>'
  };
  
    const layout = {
      xaxis: {
        fixedrange: true
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
      hovermode: 'closest',
      hoverlabel: {
        font: {
          color: 'black',
          family: 'IBM Plex Sans Thai',
        },
        borderColor: 'black',
      },
      plot_bgcolor: '#f0f1f3',
      paper_bgcolor: '#f0f1f3',
    };
  
    Plotly.newPlot(selector, [trace], layout, {displayModeBar: false});
  };

  function updateCardValue(data, year, dt, type, sex, metric, color, selector) {
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex && d.dt_num == dt); 
    document.getElementById(selector).innerHTML = parseFloat(filteredData[0][metric]).toFixed(1);
    document.getElementById(selector).style.color = color;
  };

  

  createDropdownYear(data, 2562, 'year-dd-dt');
  createDropdownDt(data, 1, 'dt-dd');
  createDropdownType(data, 0, 'type-dd');

  const year = document.getElementById('year-dd-dt').value;
  const dt = document.getElementById('dt-dd').value;
  const ageType = document.getElementById('type-dd').value;

  updateBarChart(data, year, dt, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
  updateBarChart(data, year, dt, 60, 'male', m_cl_dark, m_cl_light, "dt-male-at-60");
  updateBarChart(data, year, dt, 0, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-birth");
  updateBarChart(data, year, dt, 60, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-60");
  updateCardValue(data, year, dt, 0, 'male', 'LE', m_cl_dark, "dt-male-at-birth-le");
  updateCardValue(data, year, dt, 0, 'male', 'HALE', m_cl_light, "dt-male-at-birth-hale");
  updateCardValue(data, year, dt, 60, 'male', 'LE', m_cl_dark, "dt-male-at-60-le");
  updateCardValue(data, year, dt, 60, 'male', 'HALE', m_cl_light, "dt-male-at-60-hale");
  updateCardValue(data, year, dt, 0, 'female', 'LE', fm_cl_dark, "dt-female-at-birth-le");
  updateCardValue(data, year, dt, 0, 'female', 'HALE', fm_cl_light, "dt-female-at-birth-hale");
  updateCardValue(data, year, dt, 60, 'female', 'LE', fm_cl_dark, "dt-female-at-60-le");
  updateCardValue(data, year, dt, 60, 'female', 'HALE', fm_cl_light, "dt-female-at-60-hale");
  
  document.getElementById('year-dd-dt').addEventListener('change', (event) => {
    document.getElementById("section-name-dt").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ระดับประเทศปี พ.ศ. " + event.target.value + " (หน่วย: ปี)";
    updateBarChart(data, event.target.value, dt, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
    updateBarChart(data, event.target.value, dt, 60, 'male', m_cl_dark, m_cl_light, "dt-male-at-60");
    updateBarChart(data, event.target.value, dt, 0, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-birth");
    updateBarChart(data, event.target.value, dt, 60, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-60");
    updateCardValue(data, event.target.value, dt, 0, 'male', 'LE', m_cl_dark, "dt-male-at-birth-le");
    updateCardValue(data, event.target.value, dt, 0, 'male', 'HALE', m_cl_light, "dt-male-at-birth-hale");
    updateCardValue(data, event.target.value, dt, 60, 'male', 'LE', m_cl_dark, "dt-male-at-60-le");
    updateCardValue(data, event.target.value, dt, 60, 'male', 'HALE', m_cl_light, "dt-male-at-60-hale");
    updateCardValue(data, event.target.value, dt, 0, 'female', 'LE', fm_cl_dark, "dt-female-at-birth-le");
    updateCardValue(data, event.target.value, dt, 0, 'female', 'HALE', fm_cl_light, "dt-female-at-birth-hale");
    updateCardValue(data, event.target.value, dt, 60, 'female', 'LE', fm_cl_dark, "dt-female-at-60-le");
    updateCardValue(data, event.target.value, dt, 60, 'female', 'HALE', fm_cl_light, "dt-female-at-60-hale");
  });

  document.getElementById('dt-dd').addEventListener('change', (event) => {
    document.getElementById("content-name-1-dt").innerHTML = "ภาพรวมเขตสุขภาพ " + event.target.value;
    updateBarChart(data, year, event.target.value, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
    updateBarChart(data, year, event.target.value, 60, 'male', m_cl_dark, m_cl_light, "dt-male-at-60");
    updateBarChart(data, year, event.target.value, 0, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-birth");
    updateBarChart(data, year, event.target.value, 60, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-60");
    updateCardValue(data, year, event.target.value, 0, 'male', 'LE', m_cl_dark, "dt-male-at-birth-le");
    updateCardValue(data, year, event.target.value, 0, 'male', 'HALE', m_cl_light, "dt-male-at-birth-hale");
    updateCardValue(data, year, event.target.value, 60, 'male', 'LE', m_cl_dark, "dt-male-at-60-le");
    updateCardValue(data, year, event.target.value, 60, 'male', 'HALE', m_cl_light, "dt-male-at-60-hale");
    updateCardValue(data, year, event.target.value, 0, 'female', 'LE', fm_cl_dark, "dt-female-at-birth-le");
    updateCardValue(data, year, event.target.value, 0, 'female', 'HALE', fm_cl_light, "dt-female-at-birth-hale");
    updateCardValue(data, year, event.target.value, 60, 'female', 'LE', fm_cl_dark, "dt-female-at-60-le");
    updateCardValue(data, year, event.target.value, 60, 'female', 'HALE', fm_cl_light, "dt-female-at-60-hale");
  });

  document.getElementById('type-dd').addEventListener('change', (event) => {

  });

});

Plotly.d3.csv("https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/province.csv").then(pvData => {
    Plotly.d3.csv("https://raw.githubusercontent.com/gap2602/Plotly-JS/main/data/area%20code.csv").then(codeData => {

      const pvMap = {};
      pvData.forEach(d => {
        pvMap[d.eng_province] = d;
      });
  
      const joinedData = codeData.map(d2 => {
        const d1 = pvMap[d2.eng_province];
        return {
            eng_province: d2.eng_province,
            propertyFromData1: d1 ? d1.propertyFromData1 : null,
            propertyFromData2: d2.propertyFromData2
        };
      });
  
      console.log(joinedData);
    });
  });

document.getElementById('captureButton').addEventListener('click', function() {
    html2canvas(document.getElementById('dt-block')).then(function(canvas) {
        var imgData = canvas.toDataURL('image/png');

        var link = document.createElement('a');
        link.download = 'captured_image.png';
        link.href = imgData;
        link.click();
    });
});
