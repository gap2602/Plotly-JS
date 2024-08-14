const pvData = JSON.parse(sessionStorage.getItem("pvData"));

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
    if (dt == defaultValue) {
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
        height: 480,
    };

    Plotly.newPlot(selector, traceData, layout, {displayModeBar: false});
};

createDropdownDt(pvData, 1, 'dt-dd-trend-dt');
createDropdownType(pvData, filters.ageType, 'type-dd-trend-dt');
createDropdownSex('male', 'sex-dd-trend-dt');
createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');

document.getElementById('dt-dd-trend-dt').addEventListener('change', (event) => {
    filters.dt = event.target.value;
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');
});

document.getElementById('type-dd-trend-dt').addEventListener('change', (event) => {
    filters.ageType = event.target.value;
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');
});

document.getElementById('sex-dd-trend-dt').addEventListener('change', (event) => {
    filters.sex = event.target.value;
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'LE', 'le-trend-dt');
    createLineChart(pvData, filters.dt, filters.ageType, filters.sex, 'HALE', 'hale-trend-dt');
});