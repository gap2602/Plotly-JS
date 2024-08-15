const pvData = JSON.parse(sessionStorage.getItem("pvData"));

const filters = {
    pv: ['กรุงเทพมหานคร'],
    ageType: 0,
    sex: 'male'
  };

  function createDropdownPV(data, default_value, selector) {
    const uniquePV = [...new Set(data.map(d => d.th_province))];
    const sortPV = uniquePV.sort();
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    sortPV.forEach(pv => {
    const option = document.createElement('option');
    option.value = pv;
    option.text = pv;

    if (pv == defaultValue) {
        option.selected = true;
    }
    dropdown.appendChild(option);
    });
};


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
};

function createDropdownSex(default_value, selector) {
    const uniqueSex = ['male','female'];
    const dropdown = document.getElementById(selector);
    uniqueSex.forEach(s => {
    const option = document.createElement('option');
    const defaultValue = default_value;
    option.value = s;
    option.text = s == 'male' ? "เพศชาย" : "เพศหญิง";
    if (s == defaultValue) {
        option.selected = true;
    }
    dropdown.appendChild(option);
    });
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

    var layout = {
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
        height: 480,
    };

    Plotly.newPlot(selector, traceData, layout, {displayModeBar: false});
};

createDropdownPV(pvData, filters.pv, 'pv-dd-trend-pv');
createDropdownType(pvData, filters.ageType, 'type-dd-trend-pv');
createDropdownSex(filters.sex, 'sex-dd-trend-pv');
createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');

const selectElement = document.getElementById('pv-dd-trend-pv');
selectElement.addEventListener('change', (event) => {
    filters.pv = Array.from(selectElement.selectedOptions).map(option => option.value);
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');
});

document.getElementById('type-dd-trend-pv').addEventListener('change', (event) => {
    filters.ageType = event.target.value;
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');
});

document.getElementById('sex-dd-trend-pv').addEventListener('change', (event) => {
    filters.sex = event.target.value;
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'LE', 'le-trend-pv');
    createLineChart(pvData, filters.pv, filters.ageType, filters.sex, 'HALE', 'hale-trend-pv');
});