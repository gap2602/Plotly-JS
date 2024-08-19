const pvData = JSON.parse(sessionStorage.getItem("pvData"));
var minYear = Math.min(...pvData.map(d => d.year));
var maxYear = Math.max(...pvData.map(d => d.year));
document.getElementById("header").innerHTML = 'อายุคาดเฉลี่ย และอายุคาดเฉลี่ยของการมีสุขภาวะของประชากรไทย พ.ศ. '+minYear+'-'+maxYear+' ระดับประเทศและจังหวัด';


const filters = {
    dt: 1,
    ageType: 0,
    sex: 'male'
  };

function createDropdownDt(data, default_value, selector) {
    const uniqueDts = [...new Set(data.map(d => d.area_code))];
    const sortDts = uniqueDts.map(Number).sort(function(a, b){return a-b});
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
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
        placeholder: 'เลือกปีเพศ'
    });
    // Set default value if provided
    if (default_value) {
        $(dropdown).val(default_value).trigger('change');
    }
};

function createLineChart(data, dt, type, sex, metric, selector) {
    
    const filteredData = data.filter(d => d.area_code == dt && d.type == type && d.sex == sex);
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

    const layout = {
        title: '<b>แนวโน้มอายุคาดเฉลี่ย ('+metric+')</b>',
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
        height: 465,
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
        link.download = 'แนวโน้มอายุคาดเฉลี่ยระดับเขตสุขภาพ';
        link.click();
        
    }).catch(error => {
        console.error('Error capturing element:', error);
    });
};

createDropdownDt(pvData, filters.dt, 'dt-dd-trend-dt');
createDropdownType(pvData, filters.ageType, 'type-dd-trend-dt');
createDropdownSex(filters.sex, 'sex-dd-trend-dt');
createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');


$('#dt-dd-trend-dt').on('change', function(e) {
    filters.dt = $(this).val() || [];
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');
});

$('#type-dd-trend-dt').on('change', function(e) {
    filters.ageType = $(this).val() || [];
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');
});

$('#sex-dd-trend-dt').on('change', function(e) {
    filters.sex = $(this).val() || [];
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');
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
  
    const dtData = JSON.parse(sessionStorage.getItem('dtData'));
    const pvData = JSON.parse(sessionStorage.getItem('pvData'));
    const filteredDtData = dtData.filter(d => d.dt_num == filters.dt && d.type == filters.ageType && d.sex == filters.sex);
    const filteredPvData = pvData.filter(d => d.area_code == filters.dt && d.type == filters.ageType && d.sex == filters.sex); 
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
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'เขตสุขภาพที่ '+ filters.dt);
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'จังหวัด');

    // Generate Excel file and force download
    XLSX.writeFile(workbook, 'อายุคาดเฉลี่ยในเขตสุขภาพที่ '+filters.dt+'.xlsx' || 'อายุคาดเฉลี่ยในเขตสุขภาพ');

});

document.getElementById('capture-button-jpg').addEventListener('click', function() {
downloadImage('jpg', 'line-chart-block');
});
document.getElementById('capture-button-png').addEventListener('click', function() {
downloadImage('png', 'line-chart-block');
});
