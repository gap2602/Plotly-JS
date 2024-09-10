const pvData = JSON.parse(sessionStorage.getItem("pvData"));
var minYear = Math.min(...pvData.map(d => d.year));
var maxYear = Math.max(...pvData.map(d => d.year));
document.getElementById("header").innerHTML = 'อายุคาดเฉลี่ย และอายุคาดเฉลี่ยของการมีสุขภาวะของประชากรไทย พ.ศ. '+minYear+'-'+maxYear+' ระดับประเทศและจังหวัด';


const filters = {
    pv: ['กรุงเทพมหานคร'],
    ageType: 0,
    sex: 'male'
  };

  function createDropdownPV(data, default_value, selector) {
    const groupedPV = data.reduce((acc, item) => {
        const areaCode = item.area_code;
        acc[areaCode] = acc[areaCode] || new Set();
        acc[areaCode].add(item.th_province);
        return acc;
    }, {});
    const dropdown = document.getElementById(selector);
    for (const areaCode in groupedPV) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = 'เขต ' + areaCode;
    
        groupedPV[areaCode].forEach(pv => {
          const option = document.createElement('option');
          option.value = pv; // You can set a different value if needed
          option.text = pv;
          optgroup.appendChild(option);
        });
    
        dropdown.appendChild(optgroup);
      }
    // Initialize Select2
    $(dropdown).select2({
        placeholder: 'เลือกจังหวัด',
        maximumSelectionLength: 7,
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


function createDropdownType(data, default_value, selector) {
    const uniqueTypes = [...new Set(data.map(d => d.type))];
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

function createDropdownSex(default_value, selector) {
    const uniqueSex = ['male','female'];
    const dropdown = document.getElementById(selector);
    uniqueSex.forEach(s => {
    const option = document.createElement('option');
    const defaultValue = default_value;
    option.value = s;
    option.text = s == 'male' ? "เพศชาย" : "เพศหญิง";
    dropdown.appendChild(option);
    });
    $(dropdown).select2({
        placeholder: 'เลือกเพศ'
    });
    // Set default value if provided
    if (default_value) {
        $(dropdown).val(default_value).trigger('change');
    }
};

function createLineChart(data, pv, type, sex, metric, selector) {
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

    const filteredData = data.filter(d => pv.includes(d.th_province) && d.type == type && d.sex == sex);
    const yrange = type == 0 ? [60,90] : [0,30];

    let traceData = [];
    const uniquePVs = [...new Set(filteredData.map(d => d.th_province))];
    uniquePVs.forEach(pv => {
        const filteredByPV = filteredData.filter(d => d.th_province === pv);
        traceData.push({
            x: filteredByPV.map(d => d.year),
            y: filteredByPV.map(d => d[metric]),
            mode: 'lines+markers',
            line: { shape: 'spline' },
            name: pv,
            customdata: filteredByPV.map(d => [d.th_province, d.sex == 'male' ? "ชาย" : d.sex  == 'female' ? "หญิง" : "รวมเพศ"]),
            hovertemplate: '%{customdata[0]}<extra></extra><br>ปี พ.ศ. %{x}<br>%{customdata[1]}<br>'+metric+': %{y:.1f}'
        });
    });
    const metricThaiAdj = metric == 'HALE' ? 'ของการมีสุขภาวะ':'';
    const typeThaiAdj = type == 0 ? 'เมื่อแรกเกิด':'เมื่ออายุ 60 ปี';
    const typeEngAdj = type == 0 ? 'at birth':'at 60 years';
    const sexThaiAdj = sex == 'male' ? ' (เพศชาย)':' (เพศหญิง)';
    var layout = {
        title: '<b>แนวโน้มอายุคาดเฉลี่ย'+metricThaiAdj+typeThaiAdj+'<br>('+metric+' '+typeEngAdj+') เปรียบเทียบจังหวัด'+sexThaiAdj+'</b>',
        yaxis: {
          range: yrange,
        },
        xaxis: {
          range: [Math.min(...filteredData.map(d => d.year)) - 0.1, Math.max(...filteredData.map(d => d.year)) + 0.1],
          dtick: 1,
          fixedrange: true,
          showgrid: false,
          title: null
        },
        legend: {
          title : '',
          orientation: 'h',
          xanchor: 'center',
          yanchor: 'bottom',
          x: 0.5,
          y: -0.4
        },
        hoverlabel: {
          font: { color: 'black', family: "IBM Plex Sans Thai" },
          bordercolor: 'black'
        },
        margin: { l: 50, r: 50, t: 50, b: 10 },
        font: { family: "IBM Plex Sans Thai" },
        plot_bgcolor: '#f0f1f3',
        paper_bgcolor: '#f0f1f3',
        showlegend: true,
        hovermode: 'closest',
        height: 480,
    };

    Plotly.newPlot(selector, traceData, layout, {displayModeBar: false});
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
        link.download = 'แนวโน้มอายุคาดเฉลี่ยระดับจังหวัด'+'.'+format;
        link.click();
        
    }).catch(error => {
        console.error('Error capturing element:', error);
    });
};

createDropdownPV(pvData, filters.pv, 'pv-dd-trend-pv');
createDropdownType(pvData, filters.ageType, 'type-dd-trend-pv');
createDropdownSex(filters.sex, 'sex-dd-trend-pv');
createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');

$('#pv-dd-trend-pv').on('change', function(e) {
    filters.pv = $(this).val() || [];
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');
});

$('#type-dd-trend-pv').on('change', function(e) {
    filters.ageType = $(this).val() || [];
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');
});

$('#sex-dd-trend-pv').on('change', function(e) {
    filters.sex = $(this).val() || [];
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');
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
  
  const pvData = JSON.parse(sessionStorage.getItem('pvData'));
  const filteredData = pvData.filter(d => d.type == filters.ageType && filters.pv.includes(d.th_province) && d.sex == filters.sex);
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
        link.setAttribute('download', 'แนวโน้มอายุคาดเฉลี่ยระดับจังหวัด.csv');
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
document.getElementById('capture-button-jpg-chart').addEventListener('click', function() {
    downloadImage('jpg', 'le-trend-pv');
});
document.getElementById('capture-button-png-chart').addEventListener('click', function() {
    downloadImage('png', 'le-trend-pv');
});
document.getElementById('capture-button-jpg-chart-2').addEventListener('click', function() {
    downloadImage('jpg', 'hale-trend-pv');
});
document.getElementById('capture-button-png-chart-2').addEventListener('click', function() {
    downloadImage('png', 'hale-trend-pv');
});
