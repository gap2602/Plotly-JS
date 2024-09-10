const dtData = JSON.parse(sessionStorage.getItem("dtData"));
const pvData = JSON.parse(sessionStorage.getItem("pvData"));
var minYear = Math.min(...dtData.map(d => d.year));
var maxYear = Math.max(...dtData.map(d => d.year));
document.getElementById("header").innerHTML = 'อายุคาดเฉลี่ย และอายุคาดเฉลี่ยของการมีสุขภาวะของประชากรไทย พ.ศ. '+minYear+'-'+maxYear+' ระดับประเทศและจังหวัด';

const filters = {
    year: '2562',
    dt: 1,
    ageType: 0
  };

const m_cl_dark = "#1a84b8";
const m_cl_light = "#25a3e0";
const fm_cl_dark = "#b81a84";
const fm_cl_light = "#e025a3";

function createDropdownYear(data, default_value, selector) {
    const uniqueYears = [...new Set(data.map(d => d.year))];
    const sortYear = uniqueYears.map(Number).sort(function(a, b){return a-b});
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    sortYear.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.text = year;
    dropdown.appendChild(option);
    });
    $(dropdown).select2({
        placeholder: 'เลือกปี พ.ศ.'
    });
    // Set default value if provided
    if (default_value) {
        $(dropdown).val(default_value).trigger('change');
    }
};

function createDropdownDt(data, default_value, selector) {
    const uniqueDts = [...new Set(data.map(d => d.dt_num))];
    const sortDts = uniqueDts.map(Number).sort(function(a, b){return a-b});
    const dropdown = document.getElementById(selector);
    sortDts.forEach(dt => {
    const option = document.createElement('option');
    option.value = dt;
    option.text = "เขตสุขภาพที่ " + dt;
    dropdown.appendChild(option);
    });
    $(dropdown).select2({
        placeholder: 'เลือกเขตสุขภาพ'
    });
    // Set default value if provided
    if (default_value) {
        $(dropdown).val(default_value).trigger('change');
    }
};

function createDropdownType(default_value, selector) {
    const uniqueTypes = [0, 60];
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    uniqueTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.text = type == 0 ? "เมื่อแรกเกิด (at birth)" : "เมื่ออายุ 60 ปี";
    dropdown.appendChild(option);
    });
    $(dropdown).select2({
        placeholder: 'เลือกการคำนวณ'
    });
    // Set default value if provided
    if (default_value) {
        $(dropdown).val(default_value).trigger('change');
    }
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
        bordercolor: 'black',
    },
    plot_bgcolor: '#f0f1f3',
    paper_bgcolor: '#f0f1f3',
    };

    Plotly.newPlot(selector, [trace], layout, {displayModeBar: false});
};

function updateHBarChart(data, year, dt, type, sex, colorLE, colorHALE, selector) {
    const filteredData = data.filter(d => d.year == year && d.dt_num == dt && d.type == type && d.sex == sex); 

    const trace1 = {
        x: [filteredData[0].HALE],
        y: ["เขตสุขภาพ " + dt],
        type: 'bar',
        orientation: 'h',
        text: ['<b>'+parseFloat(filteredData[0].HALE).toFixed(1)+'</b>'], 
        textposition: 'outside',
        textangle: 0,
        textfont: {
            size: 14,
            color: [colorHALE],
        },
        marker: {
            color: [colorHALE],
            lineWidth: 0,
        },
        hovertemplate: '%{y}: %{x:.1f}<extra></extra>'
    };

    const trace2 = {
        x: [filteredData[0].LE],
        y: ["เขตสุขภาพ " + dt],
        type: 'bar',
        orientation: 'h',
        text: ['<b>'+parseFloat(filteredData[0].LE).toFixed(1)+'</b>'], 
        textposition: 'outside',
        textangle: 0,
        textfont: {
            size: 14,
            color: [colorLE],
        },
        marker: {
            color: [colorLE],
            lineWidth: 0,
        },
        hovertemplate: '%{y}: %{x:.1f}<extra></extra>'
    };

    const layout = {
    xaxis: {
        range: [0, 100],
        fixedrange: true,
        showticklabels: false,
        showgrid: false,
        title: ''
    },
    yaxis: {
        showgrid: false,
        visible: true,
        fixedrange: true
    },
    margin: {l: 70, r: 0, t: 0, b: 0},
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
        bordercolor: 'black',
    },
    plot_bgcolor: '#f0f1f3',
    paper_bgcolor: '#f0f1f3',
    height: 60,
    showlegend: false
    };

    Plotly.newPlot(selector, [trace1,trace2], layout, {displayModeBar: false});
};

function updateHBarChartPV(data, year, dt, type, sex, colorLE, colorHALE, selector) {
    const filteredData = data.filter(d => d.year == year && d.area_code == dt && d.type == type && d.sex == sex);

    const trace1 = {
        x: filteredData.map(d => d.HALE),
        y: filteredData.map(d => d.th_province),
        type: 'bar',
        orientation: 'h',
        text: filteredData.map(d => '<b>' + parseFloat(d.HALE).toFixed(1) + '</b>'), 
        textposition: 'outside',
        textangle: 0,
        textfont: {
            size: 14,
            color: colorHALE,
        },
        marker: {
            color: colorHALE,
            lineWidth: 0,
        },
        width: 0.5,
        hovertemplate: '%{y}: %{x:.1f}<extra></extra>'
    };

    const trace2 = {
        x: filteredData.map(d => d.LE),
        y: filteredData.map(d => d.th_province),
        type: 'bar',
        orientation: 'h',
        text: filteredData.map(d => '<b>' + parseFloat(d.LE).toFixed(1) + '</b>'), 
        textposition: 'outside',
        textangle: 0,
        textfont: {
            size: 14,
            color: colorLE,
        },
        marker: {
            color: colorLE,
            lineWidth: 0,
        },
        width: 0.5,
        hovertemplate: '%{y}: %{x:.1f}<extra></extra>'
    };
    
    var space = 0;
    if (filteredData.length == 1) {
        space = 60;
    }

    const layout = {
    xaxis: {
        range: [0, 100],
        fixedrange: true,
        showticklabels: false,
        showgrid: false,
        zeroline: false
    },
    yaxis: {
        showgrid: false,
        visible: true,
        fixedrange: true,
    },
    margin: {l: 100, r: 0, t: space, b: space},
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
        bordercolor: 'black',
    },
    plot_bgcolor: '#f0f1f3',
    paper_bgcolor: '#f0f1f3',
    showlegend: false,
    barmode: 'group',
    bargap: 0.20,
    bargroupgap: 0.0,
    autosize: true,
    };

    Plotly.newPlot(selector, [trace1,trace2], layout, {displayModeBar: false});
};

function updateCardValue(data, year, dt, type, sex, metric, color, selector) {
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex && d.dt_num == dt); 
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
        link.download = 'อายุคาดเฉลี่ยของเขตสุขภาพที่ '+filters.dt +'.'+format;
        link.click();
        
    }).catch(error => {
        console.error('Error capturing element:', error);
    });
};

createDropdownYear(dtData, 2562, 'year-dd-dt');
createDropdownDt(dtData, 1, 'dt-dd');
createDropdownType(0, 'type-dd');

updateBarChart(dtData, filters.year, filters.dt, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
updateBarChart(dtData, filters.year, filters.dt, 60, 'male', m_cl_dark, m_cl_light, "dt-male-at-60");
updateBarChart(dtData, filters.year, filters.dt, 0, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-birth");
updateBarChart(dtData, filters.year, filters.dt, 60, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-60");
updateCardValue(dtData, filters.year, filters.dt, 0, 'male', 'LE', m_cl_dark, "dt-male-at-birth-le");
updateCardValue(dtData, filters.year, filters.dt, 0, 'male', 'HALE', m_cl_light, "dt-male-at-birth-hale");
updateCardValue(dtData, filters.year, filters.dt, 60, 'male', 'LE', m_cl_dark, "dt-male-at-60-le");
updateCardValue(dtData, filters.year, filters.dt, 60, 'male', 'HALE', m_cl_light, "dt-male-at-60-hale");
updateCardValue(dtData, filters.year, filters.dt, 0, 'female', 'LE', fm_cl_dark, "dt-female-at-birth-le");
updateCardValue(dtData, filters.year, filters.dt, 0, 'female', 'HALE', fm_cl_light, "dt-female-at-birth-hale");
updateCardValue(dtData, filters.year, filters.dt, 60, 'female', 'LE', fm_cl_dark, "dt-female-at-60-le");
updateCardValue(dtData, filters.year, filters.dt, 60, 'female', 'HALE', fm_cl_light, "dt-female-at-60-hale");
updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-dt');
updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-dt');
updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-pv');
updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-pv');

$('#year-dd-dt').on('change', function(e) {
    filters.year = $(this).val() || [];
    var selectedText = $(this).find(':selected').text();
    document.getElementById("section-name-dt").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ระดับประเทศปี พ.ศ. " + selectedText + " (หน่วย: ปี)";
    updateBarChart(dtData, filters.year, filters.dt, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
    updateBarChart(dtData, filters.year, filters.dt, 60, 'male', m_cl_dark, m_cl_light, "dt-male-at-60");
    updateBarChart(dtData, filters.year, filters.dt, 0, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-birth");
    updateBarChart(dtData, filters.year, filters.dt, 60, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-60");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'male', 'LE', m_cl_dark, "dt-male-at-birth-le");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'male', 'HALE', m_cl_light, "dt-male-at-birth-hale");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'male', 'LE', m_cl_dark, "dt-male-at-60-le");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'male', 'HALE', m_cl_light, "dt-male-at-60-hale");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'female', 'LE', fm_cl_dark, "dt-female-at-birth-le");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'female', 'HALE', fm_cl_light, "dt-female-at-birth-hale");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'female', 'LE', fm_cl_dark, "dt-female-at-60-le");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'female', 'HALE', fm_cl_light, "dt-female-at-60-hale");
    updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-dt');
    updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-dt');
    updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-pv');
    updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-pv');
});

$('#dt-dd').on('change', function(e) {
    filters.dt = $(this).val() || [];
    var selectedText = $(this).find(':selected').text();
    document.getElementById("name-title-1").innerHTML = "ภาพรวม" + selectedText;
    updateBarChart(dtData, filters.year, filters.dt, 0, 'male', m_cl_dark, m_cl_light, "dt-male-at-birth");
    updateBarChart(dtData, filters.year, filters.dt, 60, 'male', m_cl_dark, m_cl_light, "dt-male-at-60");
    updateBarChart(dtData, filters.year, filters.dt, 0, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-birth");
    updateBarChart(dtData, filters.year, filters.dt, 60, 'female', fm_cl_dark, fm_cl_light, "dt-female-at-60");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'male', 'LE', m_cl_dark, "dt-male-at-birth-le");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'male', 'HALE', m_cl_light, "dt-male-at-birth-hale");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'male', 'LE', m_cl_dark, "dt-male-at-60-le");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'male', 'HALE', m_cl_light, "dt-male-at-60-hale");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'female', 'LE', fm_cl_dark, "dt-female-at-birth-le");
    updateCardValue(dtData, filters.year, filters.dt, 0, 'female', 'HALE', fm_cl_light, "dt-female-at-birth-hale");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'female', 'LE', fm_cl_dark, "dt-female-at-60-le");
    updateCardValue(dtData, filters.year, filters.dt, 60, 'female', 'HALE', fm_cl_light, "dt-female-at-60-hale");
    updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-dt');
    updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-dt');
    updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-pv');
    updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-pv');
});

$('#type-dd').on('change', function(e) {
    filters.ageType = $(this).val() || [];
    var selectedText = $(this).find(':selected').text();
    document.getElementById("name-title-2").innerHTML = "เปรียบเทียบจังหวัดภายในเขตสุขภาพ - " + selectedText;
    updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-dt');
    updateHBarChart(dtData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-dt');
    updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-male-pv');
    updateHBarChartPV(pvData, filters.year, filters.dt, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-female-pv');
});

const image = document.getElementById('download-image');
const dropdown = document.getElementById('download-dd');

image.addEventListener('click', function() {
      dropdown.classList.toggle('show');
});

const imageChart = document.getElementById('download-image-chart');
const dropdownChart = document.getElementById('download-dd-chart');

imageChart.addEventListener('click', function() {
    dropdownChart.classList.toggle('show-chart');
});

const imageChart2 = document.getElementById('download-image-chart-2');
const dropdownChart2 = document.getElementById('download-dd-chart-2');

imageChart2.addEventListener('click', function() {
    dropdownChart2.classList.toggle('show-chart-2');
});

  // Close the dropdown if the user clicks outside of it
window.addEventListener('click', function(event) {
    if (!event.target.matches('#download-image')) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }

    if (!event.target.matches('#download-image-chart')) {
        if (dropdownChart.classList.contains('show-chart')) {
            dropdownChart.classList.remove('show-chart');
        }
    }

    if (!event.target.matches('#download-image-chart-2')) {
        if (dropdownChart2.classList.contains('show-chart-2')) {
            dropdownChart2.classList.remove('show-chart-2');
        }
    }
});

document.getElementById('download-csv').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent the default link behavior
    
    const dtData = JSON.parse(sessionStorage.getItem('dtData'));
    const pvData = JSON.parse(sessionStorage.getItem('pvData'));
    const filteredDtData = dtData.filter(d => d.year == filters.year && d.dt_num == filters.dt);
    const filteredPvData = pvData.filter(d => d.year == filters.year && d.type == filters.ageType && d.area_code == filters.dt); 
    const filteredPvData2 = filteredPvData.map(x => ({ year: x.year, area_code: x.area_code, type: x.type, sex: x.sex, 
                                                        th_province: x.th_province, LE: x.LE, HALE: x.HALE}));
    
    const columnMapping = {
      'year': 'ปี พ.ศ.',
      'sex': 'เพศ',
      'type': 'การคำนวณ',
      'dt_num': 'เขตสุขภาพ',
      'th_province':'จังหวัด',
      'area_code': 'เขตสุขภาพ'
    };
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
    const transformedDtData = transformData(filteredDtData, columnMapping, valueMapping);
    const transformedPvData = transformData(filteredPvData2, columnMapping, valueMapping);

    const workbook = XLSX.utils.book_new();

  // Convert your data to worksheets
    const worksheet1 = XLSX.utils.json_to_sheet(transformedDtData);
    const worksheet2 = XLSX.utils.json_to_sheet(transformedPvData);

    // Add the worksheets to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'เขตสุขภาพที่ '+filters.dt);
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'จังหวัด');

    // Generate Excel file and force download
    XLSX.writeFile(workbook, 'อายุคาดเฉลี่ยในเขตสุขภาพที่ '+filters.dt+' ปี พ.ศ.'+filters.year+'.xlsx' || 'อายุคาดเฉลี่ยในเขตสุขภาพ');

  });

  document.getElementById('capture-button-jpg').addEventListener('click', function() {
    downloadImage('jpg', 'content');
  });
  document.getElementById('capture-button-png').addEventListener('click', function() {
    downloadImage('png', 'content');
  });
  document.getElementById('capture-button-jpg-chart').addEventListener('click', function() {
    downloadImage('jpg', 'dt-block');
  });
  document.getElementById('capture-button-png-chart').addEventListener('click', function() {
    downloadImage('png', 'dt-block');
  });
  document.getElementById('capture-button-jpg-chart-2').addEventListener('click', function() {
    downloadImage('jpg', 'pv-block');
  });
  document.getElementById('capture-button-png-char-2').addEventListener('click', function() {
    downloadImage('png', 'pv-block');
  });

