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

    if (year == defaultValue) {
        option.selected = true;
    }
    dropdown.appendChild(option);
    });
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

function createDropdownType(default_value, selector) {
    const uniqueTypes = [0, 60];
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
        x: [filteredData[0].HALE],
        y: [pv],
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
        y: [pv],
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

function updateCardValue(data, year, pv, type, sex, metric, color, selector) {
    const filteredData = data.filter(d => d.year == year && d.type == type && d.sex == sex && d.th_province == pv); 
    document.getElementById(selector).innerHTML = parseFloat(filteredData[0][metric]).toFixed(1);
    document.getElementById(selector).style.color = color;
};

createDropdownYear(pvData, filters.year, 'year-dd-pv');
createDropdownPV(pvData, filters.intPV, 'pv-dd');
createDropdownPV(pvData, filters.intPV, 'pv-cp-dd');
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

document.getElementById('year-dd-pv').addEventListener('change', (event) => {
    filters.year = event.target.value;
    document.getElementById("section-name-pv").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ระดับประเทศปี พ.ศ. " + event.target.value + " (หน่วย: ปี)";
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

document.getElementById('pv-dd').addEventListener('change', (event) => {
    filters.intPV = event.target.value;
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

document.getElementById('type-dd-pv').addEventListener('change', (event) => {
    filters.ageType = event.target.value;
    document.getElementById("content-name-2-pv").innerHTML = "เปรียบเทียบระหว่างจังหวัด - " + event.target.options[event.target.selectedIndex].text;
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'male', m_cl_dark, m_cl_light, 'pv-1-male-pv');
    updateHBarChartPV(pvData, filters.year, filters.intPV, filters.ageType, 'female', fm_cl_dark, fm_cl_light, 'pv-1-female-pv');
});