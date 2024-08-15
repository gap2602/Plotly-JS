const pvData = JSON.parse(sessionStorage.getItem("pvData"));
const mapData = JSON.parse(sessionStorage.getItem("mapData"));

const filters = {
    year: '2562',
    dt: 1,
    metric: 'LE',
    ageType: 0,
    sex: 'male'
};

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

function createDropdownDt(data, default_value, selector) {
    const uniqueDT = [0, ...new Set(data.map(d => d.area_code))];
    const sortDT = uniqueDT.map(Number).sort(function(a, b){return a-b});
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    sortDT.forEach(dt => {
    const option = document.createElement('option');
    option.value = dt;
    option.text = dt != 0 ? "เขตสุขภาพที่ " + dt : "ทุกเขตสุขภาพ";
    if (dt == defaultValue) {
        option.selected = true;
    }
    dropdown.appendChild(option);
    });
};

function createDropdownMetric(default_value, selector) {
    const uniqueMetric = ['LE','HALE'];
    const dropdown = document.getElementById(selector);
    uniqueMetric.forEach(m => {
    const option = document.createElement('option');
    const defaultValue = default_value;
    option.value = m;
    option.text = m;
    if (m == defaultValue) {
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

function updateMap(data, year, dt, metric, type, sex, selector) {
    const filteredData = dt == 0
    ? data.filter((d) => d.year == year && d.type == type && d.sex === sex)
    : data.filter((d) => d.year == year && d.area_code == dt && d.type == type && d.sex == sex);

    const dataGeo = [
        {
            type: 'choropleth',
            geojson: mapData,
            locations: filteredData.map(d => parseInt(d.post_code)),
            z: filteredData.map(d => parseFloat(d[metric])),
            locationmode: 'geojson-id',
            colorscale: 'Viridis',
            // color: metric,
            // coloraxis: {
            //   min: Math.min(filteredData[metric]),
            //   max: Math.max(filteredData[metric]),
            //   cmin: '#EFE9F4',
            //   cmax: '#5078F2' 
            // },
            // colorbar: {
            //   len: 0.7,
            //   xanchor: 'right',
            //   x: 0.93,
            //   yanchor: 'middle',
            //   y: 0.5,
            //   thickness: 20,
            //   title: {
            //     text: metric, // Replace with actual metric name
            //     font: { weight: 'bold' }
            //   }
            // },
            // customdata: ['th_province'], // Assuming your data has a `th_province` column
            // hovertemplate: 'จังหวัด: %{customdata[0]}<br>' + metric + ': %{z:.1f}'
        }
];
    

    const layout = {
    margin: { r: 0, t: 0, l: 0, b: 0 },
    font: { family: 'IBM Plex Sans Thai', size: 16 },
    paper_bgcolor: '#f0f1f3',
      geo: { fitbounds: 'locations', visible: true }
    };

    // if (dt != 0) {
    //   const textData = filteredData.map((row) => `<b>${row.th_province}</b>`);
    //   const trace2 = ({
    //     lat: filteredData['lat'],
    //     lon: filteredData['lon'],
    //     mode: 'text',
    //     text: textData,
    //     textfont: { family: 'IBM Plex Sans Thai', size: 14, color: 'black' },
    //     hoverinfo: 'skip'
    //   });
    //   dataGeo.push(trace2);
    // }

    Plotly.newPlot(selector, dataGeo, layout, {displayModeBar: false});
};

function updateTable(data, year, dt, metric, type, sex, selector) {
    const filteredData = dt == 0
    ? data.filter((d) => d.year == year && d.type == type && d.sex === sex)
    : data.filter((d) => d.year == year && d.area_code == dt && d.type == type && d.sex == sex);
    const sortData = filteredData.sort((a,b)=> (parseInt(a.area_code) - parseInt(b.area_code) || 
                                                a.th_province.localeCompare(b.th_province)));

    var checkDT = '0';
    var pvList = [];
    var valueList = [];
    for (let row = 0; row < sortData.length; row++) {
        if (sortData[row]['area_code'] != checkDT) {
            pvList.push('เขตสุขภาพ ' + sortData[row]['area_code']);
            valueList.push('');
            checkDT = sortData[row]['area_code'];
        }
        pvList.push(sortData[row]['th_province']);
        valueList.push(parseFloat(sortData[row][metric]).toFixed(1));
    }

    const keyText = ['จังหวัดในเขตสุขภาพ', metric +' (หน่วย: ปี)'];
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    keyText.forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
      });
    thead.appendChild(headerRow);

    for (let i = 0; i < pvList.length; i++) {
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        cell1.textContent = pvList[i];
        cell2.textContent = valueList[i];
        if (valueList[i] == '') {
            row.classList.add('indented-row');
        }
        row.appendChild(cell1);
        row.appendChild(cell2);
        tbody.appendChild(row);    
    }

    table.appendChild(thead);
    table.appendChild(tbody); 

    const oldTable = document.getElementById(selector).querySelector('table');
    if (oldTable) {
        document.getElementById(selector).removeChild(oldTable);
    }
    
    document.getElementById(selector).appendChild(table);
}

createDropdownYear(pvData, 2562, 'year-dd-map');
createDropdownDt(pvData, 1, 'dt-dd-map');
createDropdownMetric('LE', 'metric-dd-map');
createDropdownType(pvData, 0, 'type-dd-map');
createDropdownSex('male', 'sex-dd-map');

// updateMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');

document.getElementById('year-dd-map').addEventListener('change', (event) => {
    filters.year = event.target.value;
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('dt-dd-map').addEventListener('change', (event) => {
    filters.dt = event.target.value;
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('metric-dd-map').addEventListener('change', (event) => {
    filters.metric = event.target.value;
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('type-dd-map').addEventListener('change', (event) => {
    filters.ageType = event.target.value;
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('sex-dd-map').addEventListener('change', (event) => {
    filters.sex = event.target.value;
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

function updateLeafletMap(data, year, dt, metric, type, sex, selector) {
    const filteredData = dt == 0
    ? data.filter((d) => d.year == year && d.type == type && d.sex === sex)
    : data.filter((d) => d.year == year && d.area_code == dt && d.type == type && d.sex == sex);

    var joinData = [];
    filteredData.forEach((d) => {
        var lookupVar = d.post_code;
        var geoData = mapData.features.filter((d) => d.id == lookupVar);
        geoData[0]['properties'][metric] = parseFloat(d[metric]);
        geoData[0]['properties']['lat'] = parseFloat(d['lat']);
        geoData[0]['properties']['lon'] = parseFloat(d['lon']);
        joinData.push(geoData[0]);
    }); 

    var map = L.map(selector).setView([13,102], 5);
            
    // L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map);

    var geojsonLayer = L.geoJson(joinData).addTo(map);
    map.attributionControl.setPrefix(false);
    map.fitBounds(geojsonLayer.getBounds());

    function getColor(d) {
        return d > 90 ? '#800026' :
               d > 80 ? '#BD0026' :
               d > 70 ? '#E31A1C' :
               d > 60 ? '#FC4E2A' :
               d > 50 ? '#FD8D3C' :
               d > 40 ? '#FEB24C' :
               d > 30 ? '#FED976' :
               d > 20 ? '#FFEDA0' :
               d > 10 ? '#FFFFCC' :
                        '#FFFFFF';
    };

    function style(feature) {
        return {
            fillColor: getColor(feature.properties.LE),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    
    L.geoJson(joinData, {style: style}).addTo(map);
    // L.choropleth(joinData, {
    //     valueProperty: function (feature) {
    //         return feature.properties.LE
    //       }, // which property in the features to use
    //     scale: ['white', 'red'], // chroma.js scale - include as many as you like
    //     steps: 5, // number of breaks or steps in range
    //     mode: 'q', // q for quantile, e for equidistant, k for k-means
    //     style: {
    //         color: '#fff', // border color
    //         weight: 2,
    //         fillOpacity: 0.8
    //     },
    //     onEachFeature: function(feature, layer) {
    //         layer.bindPopup(feature.properties.value)
    //     }
    // }).addTo(map)
};

updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
