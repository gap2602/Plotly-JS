const pvData = JSON.parse(sessionStorage.getItem("pvData"));

const filters = {
    year: '2562',
    intPV: 'กรุงเทพมหานคร',
    cpPV: [],
    ageType: 0
};

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

function createDropdownPV(data, default_value, selector) {
    const uniquePV = [...new Set(data.map(d => d.th_province))];
    const sortPV = uniquePV.sort();
    const dropdown = document.getElementById(selector);
    
    sortPV.forEach(pv => {
        const option = document.createElement('option');
        option.value = pv;
        option.text = pv;
        dropdown.appendChild(option);
    });

    // Initialize Select2
    $(dropdown).select2({
        placeholder: 'เลือกจังหวัด',
        maximumSelectionLength: 5,
        language: {
            maximumSelected: function (e) {
                return "คุณสามารถเลือกได้สูงสุด " + e.maximum + " จังหวัด";
            }
        }
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
};

function updateBarChart(data, year, pv, type, sex, colorLeft, colorRight, selector) {
    const sexLabel = sex === 'male' ? "ชาย" : sex === 'female' ? "หญิง" : "รวมเพศ";
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex && d.th_province == pv); 

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

function updateHBarChartPV(data, year, pv, type, sex, colorLE, colorHALE, selector) {

    const filteredData = data.filter(d => d.year == year && d.th_province == pv && d.type == type && d.sex == sex); 

    const trace1 = {
        x: filteredData.map(d => d.HALE),
        y: filteredData.map(d => d.th_province),
        type: 'bar',
        orientation: 'h',
        text: ['<b>'+parseFloat(filteredData[0].HALE).toFixed(1)+'</b>'], 
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
        hovertemplate: '%{y}: %{x:.1f}<extra></extra>'
    };

    const trace2 = {
        x: filteredData.map(d => d.LE),
        y: filteredData.map(d => d.th_province),
        type: 'bar',
        orientation: 'h',
        text: ['<b>'+parseFloat(filteredData[0].LE).toFixed(1)+'</b>'], 
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
        hovertemplate: '%{y}: %{x:.1f}<extra></extra>'
    };

    var layout = {
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
    margin: {l: 90, r: 0, t: 0, b: 0},
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

function updateHBarChartPVCP(data, year, pv, type, sex, colorLE, colorHALE, selector) {

    if (typeof pv === 'string') {
        var pv = [pv];
    }

    if (pv.length === 0) {
        var data = [{
            x: [],
            y: [],
            type: 'scatter'
        }];
        
        var layout = {
            xaxis: {
                showgrid: false,
                visible: false,
            },
            yaxis: {
                showgrid: false,
                visible: false,
            },
            plot_bgcolor: '#f0f1f3',
            paper_bgcolor: '#f0f1f3',
        };
        
        Plotly.newPlot(selector, data, layout, {displayModeBar: false});
        return;
    }

    const filteredData = data.filter(d => d.year == year && pv.includes(d.th_province) && d.type == type && d.sex == sex); 

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
        hovertemplate: '%{y}: %{x:.1f}<extra></extra>'
    };

    var layout = {
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
    margin: {l: 90, r: 0, t: 0, b: 0},
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
    showlegend: false
    };

    Plotly.newPlot(selector, [trace1,trace2], layout, {displayModeBar: false});
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
        link.download = 'อายุคาดเฉลี่ยระดับประเทศ เขตสุขภาพที่ '+filters.dt +'.'+format;
        link.click();
        
    }).catch(error => {
        console.error('Error capturing element:', error);
    });
};

// function limitOption(selector) {
//     var cpEle = document.getElementById(selector);
//     var cpValue = Array.from(cpEle.selectedOptions).map(option => option.value);
    
//     if (cpValue.length == 5) {
//         for (let i = 0; i < cpEle.options.length; i++) {
            
//             if (cpEle.options[i].selected) {
//             } else {
//                 cpEle.options[i].disabled = true;
//             }
//           } 
//     }
// };


function updateCardValue(data, year, pv, type, sex, metric, color, selector) {
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex && d.th_province == pv); 
    document.getElementById(selector).innerHTML = parseFloat(filteredData[0][metric]).toFixed(1);
    document.getElementById(selector).style.color = color;
};

createDropdownYear(pvData, filters.year, 'year-dd-pv');
createDropdownPV(pvData, filters.intPV, 'pv-dd');
createDropdownPV(pvData, filters.cpPV, 'pv-cp-dd');
createDropdownType(filters.ageType, 'type-dd-pv')

updateBarChart(pvData, filters.year, filters.intPV, 0, 'male', m_cl_dark, m_cl_light, "pv-1-male-at-birth");
updateBarChart(pvData, filters.year, filters.intPV, 60, 'male', m_cl_dark, m_cl_light, "pv-1-male-at-60");
updateBarChart(pvData, filters.year, filters.intPV, 0, 'female', fm_cl_dark, fm_cl_light, "pv-1-female-at-birth");
updateBarChart(pvData, filters.year, filters.intPV, 60, 'female', fm_cl_dark, fm_cl_light, "pv-1-female-at-60");
updateCardValue(pvData, filters.year, filters.intPV, 0, 'male', 'LE', m_cl_dark, "pv-1-male-at-birth-le");
updateCardValue(pvData, filters.year, filters.intPV, 0, 'male', 'HALE', m_cl_light, "pv-1-male-at-birth-hale");
updateCardValue(pvData, filters.year, filters.intPV, 60, 'male', 'LE', m_cl_dark, "pv-1-male-at-60-le");
updateCardValue(pvData, filters.year, filters.intPV, 60, 'male', 'HALE', m_cl_light, "pv-1-male-at-60-hale");
updateCardValue(pvData, filters.year, filters.intPV, 0, 'female', 'LE', fm_cl_dark, "pv-1-female-at-birth-le");
updateCardValue(pvData, filters.year, filters.intPV, 0, 'female', 'HALE', fm_cl_light, "pv-1-female-at-birth-hale");
updateCardValue(pvData, filters.year, filters.intPV, 60, 'female', 'LE', fm_cl_dark, "pv-1-female-at-60-le");
updateCardValue(pvData, filters.year, filters.intPV, 60, 'female', 'HALE', fm_cl_light, "pv-1-female-at-60-hale");
updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-1-male-pv');
updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-1-female-pv');
updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-cp-male-pv');
updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-cp-female-pv');


$('#year-dd-pv').on('change', function(e) {
    filters.year = $(this).val() || [];
    var selectedText = $(this).find(':selected').text();
    document.getElementById("section-name-pv").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ระดับประเทศปี พ.ศ. " + selectedText + " (หน่วย: ปี)";
    updateBarChart(pvData, filters.year, filters.intPV, 0, 'male', m_cl_dark, m_cl_light, "pv-1-male-at-birth");
    updateBarChart(pvData, filters.year, filters.intPV, 60, 'male', m_cl_dark, m_cl_light, "pv-1-male-at-60");
    updateBarChart(pvData, filters.year, filters.intPV, 0, 'female', fm_cl_dark, fm_cl_light, "pv-1-female-at-birth");
    updateBarChart(pvData, filters.year, filters.intPV, 60, 'female', fm_cl_dark, fm_cl_light, "pv-1-female-at-60");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'male', 'LE', m_cl_dark, "pv-1-male-at-birth-le");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'male', 'HALE', m_cl_light, "pv-1-male-at-birth-hale");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'male', 'LE', m_cl_dark, "pv-1-male-at-60-le");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'male', 'HALE', m_cl_light, "pv-1-male-at-60-hale");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'female', 'LE', fm_cl_dark, "pv-1-female-at-birth-le");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'female', 'HALE', fm_cl_light, "pv-1-female-at-birth-hale");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'female', 'LE', fm_cl_dark, "pv-1-female-at-60-le");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'female', 'HALE', fm_cl_light, "pv-1-female-at-60-hale");
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-1-male-pv');
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-1-female-pv');
    updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-cp-male-pv');
    updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-cp-female-pv');
});

$('#pv-dd').on('change', function(e) {
    filters.intPV = $(this).val() || [];
    document.getElementById("content-name-1-pv").innerHTML = "ภาพรวมจังหวัด " + event.target.value;
    updateBarChart(pvData, filters.year, filters.intPV, 0, 'male', m_cl_dark, m_cl_light, "pv-1-male-at-birth");
    updateBarChart(pvData, filters.year, filters.intPV, 60, 'male', m_cl_dark, m_cl_light, "pv-1-male-at-60");
    updateBarChart(pvData, filters.year, filters.intPV, 0, 'female', fm_cl_dark, fm_cl_light, "pv-1-female-at-birth");
    updateBarChart(pvData, filters.year, filters.intPV, 60, 'female', fm_cl_dark, fm_cl_light, "pv-1-female-at-60");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'male', 'LE', m_cl_dark, "pv-1-male-at-birth-le");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'male', 'HALE', m_cl_light, "pv-1-male-at-birth-hale");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'male', 'LE', m_cl_dark, "pv-1-male-at-60-le");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'male', 'HALE', m_cl_light, "pv-1-male-at-60-hale");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'female', 'LE', fm_cl_dark, "pv-1-female-at-birth-le");
    updateCardValue(pvData, filters.year, filters.intPV, 0, 'female', 'HALE', fm_cl_light, "pv-1-female-at-birth-hale");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'female', 'LE', fm_cl_dark, "pv-1-female-at-60-le");
    updateCardValue(pvData, filters.year, filters.intPV, 60, 'female', 'HALE', fm_cl_light, "pv-1-female-at-60-hale");
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-1-male-pv');
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-1-female-pv');
});


$('#pv-cp-dd').on('change', function(e) {
    filters.cpPV = $(this).val() || [];
    updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-cp-male-pv');
    updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-cp-female-pv');
});

$('#type-dd-pv').on('change', function(e) {
    filters.ageType = $(this).val() || [];
    var selectedText = $(this).find(':selected').text();
    document.getElementById("content-name-2-pv").innerHTML = "เปรียบเทียบระหว่างจังหวัด - " + selectedText;
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-1-male-pv');
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-1-female-pv');
    updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-cp-male-pv');
    updateHBarChartPVCP(pvData, filters.year, filters.cpPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-cp-female-pv');
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
    
    const pvData = JSON.parse(sessionStorage.getItem('pvData'));
    var allPV = filters.cpPV.map(x => x);
    allPV.push(filters.intPV)
    const filteredData = pvData.filter(d => d.year == filters.year && d.type == filters.ageType && allPV.includes(d.th_province));
    const filteredData2 = filteredData.map(x => ({ year: x.year, area_code: x.area_code, type: x.type, sex: x.sex, 
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
    const transformedData = transformData(filteredData2, columnMapping, valueMapping);

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
        link.setAttribute('download', 'อายุคาดเฉลี่ยระดับจังหวัดปี พ.ศ. '+filters.year+'.csv');
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
