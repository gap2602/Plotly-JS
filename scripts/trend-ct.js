const ctData = JSON.parse(sessionStorage.getItem("ctData"));

const filters = {
    ageType: 0
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

function createLineChart(data, type, metric, selector) {
    
    const filteredData = data.filter(d => d.type == type);
    const yrange = type == 0 ? [60,90] : [0,30];

    let traceData = [];
    const uniqueGenders = [...new Set(filteredData.map(d => d.sex))];
    uniqueGenders.forEach(gender => {
        const sexLabel = gender == 'male' ? "ชาย" : gender == 'female' ? "หญิง" : "รวมเพศ";
        const filteredByGender = filteredData.filter(d => d.sex === gender);
        traceData.push({
            x: filteredByGender.map(d => d.year),
            y: filteredByGender.map(d => d[metric]),
            mode: 'lines+markers',
            line: { shape: 'spline' },
            name: sexLabel,
            customdata: filteredByGender.map(d => [d.sex == 'male' ? "ชาย" : d.sex  == 'female' ? "หญิง" : "รวมเพศ"]),
            hovertemplate: '%{customdata[0]}<extra></extra><br>ปี พ.ศ. %{x}<br>'+metric+': %{y:.1f}'
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
          orientation: 'h',
          xanchor: 'center',
          yanchor: 'bottom',
          x: 0.5,
          y: -0.2
        },
        hoverlabel: {
          font: { color: 'black', family: "IBM Plex Sans Thai" },
          bordercolor: 'black'
        },
        margin: { l: 50, r: 50, t: 50, b: 0 },
        font: { family: "IBM Plex Sans Thai" },
        plot_bgcolor: '#f0f1f3',
        paper_bgcolor: '#f0f1f3',
        showlegend: true,
        hovermode: 'closest',
    };

    Plotly.newPlot(selector, traceData, layout, {displayModeBar: false});
};

createDropdownType(ctData, filters.ageType, 'type-dd-trend-ct');
createLineChart(ctData, filters.ageType, 'LE', 'le-trend-ct');
createLineChart(ctData, filters.ageType, 'HALE', 'hale-trend-ct');

document.getElementById('type-dd-trend-ct').addEventListener('change', (event) => {
    filters.ageType = event.target.value;
    createLineChart(ctData, filters.ageType, 'LE', 'le-trend-ct');
    createLineChart(ctData, filters.ageType, 'HALE', 'hale-trend-ct');
});