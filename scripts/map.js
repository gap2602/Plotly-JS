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

function interpolateColor(value, valueMin, valueMax, colorMin, colorMax) {
    // Ensure value is within the range
    value = Math.max(valueMin, Math.min(value, valueMax));
  
    // Calculate the factor (0 to 1) based on where the value falls in the range
    if (value == valueMin) {
        var factor = 1;
    } else {
        var factor = (value - valueMin) / (valueMax - valueMin);
    }
  
    // Convert hex colors to RGB
    const rgbMin = hexToRgb(colorMin);
    const rgbMax = hexToRgb(colorMax);
  
    // Interpolate between the colors
    const r = Math.round(rgbMin[0] + factor * (rgbMax[0] - rgbMin[0]));
    const g = Math.round(rgbMin[1] + factor * (rgbMax[1] - rgbMin[1]));
    const b = Math.round(rgbMin[2] + factor * (rgbMax[2] - rgbMin[2]));
  
    // Convert back to hex
    return rgbToHex(r, g, b);
};
  
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
};
  
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

function createColorBar(selector, valueMin, valueMax, colorMin, colorMax, step) {
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
        console.error(`Element with selector "${selector}" not found`);
        return;
    }

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'stretch';
    container.style.justifyContent = 'flex-end';

    const colorBar = document.createElement('div');
    colorBar.style.width = '30px';
    colorBar.style.height = '400px';
    colorBar.style.background = `linear-gradient(to top, ${colorMin}, ${colorMax})`;

    const labelsContainer = document.createElement('div');
    labelsContainer.style.display = 'flex';
    labelsContainer.style.flexDirection = 'column';
    labelsContainer.style.justifyContent = 'flex-start';
    labelsContainer.style.marginRight = '5px';
    labelsContainer.style.height = '400px';
    labelsContainer.style.position = 'relative';

    const range = valueMax - valueMin;
    const pixelsPerUnit = 400 / range;

    for (let value = valueMin; value <= valueMax; value += step) {
        if (value > valueMax) break;  // Ensure we don't exceed the max value
        
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.right = '0';
        label.style.bottom = `${(value - valueMin) * pixelsPerUnit}px`;
        label.style.transform = 'translateY(50%)';
        label.style.fontSize = '12px';
        label.textContent = value;
        labelsContainer.appendChild(label);
    }

    container.appendChild(labelsContainer);
    container.appendChild(colorBar);

    targetElement.innerHTML = '';
    targetElement.appendChild(container);
};

let geojsonLayer;
let map = null;

function updateLeafletMap(data, year, dt, metric, type, sex, selector) {
    const filteredData = dt == 0
    ? data.filter((d) => d.year == year && d.type == type && d.sex === sex)
    : data.filter((d) => d.year == year && d.area_code == dt && d.type == type && d.sex == sex);

    var joinData = [];
    filteredData.forEach((d) => {
        var lookupVar = d.post_code;
        var geoData = mapData.features.filter((d) => d.id == lookupVar);
        geoData[0]['properties'][metric] = Math.round(parseFloat(d[metric])*10)/10;
        geoData[0]['properties']['lat'] = parseFloat(d['lat']);
        geoData[0]['properties']['lon'] = parseFloat(d['lon']);
        joinData.push(geoData[0]);
    });

    var minValue = Math.min(...joinData.map(d => d.properties[metric]));
    var maxValue = Math.max(...joinData.map(d => d.properties[[metric]]));

    if (map !== null) {
        map.off();
        map.remove();
    }

    map = L.map(selector).setView([13,102], 5);  
    // L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map);
    

    function style(feature) {
        return {
            fillColor: interpolateColor(feature.properties[metric], minValue, maxValue, '#EFE9F4', '#5078F2'),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '1',
            fillOpacity: 1
        };
    }

    geojsonLayer = L.geoJson(joinData, {
        style: style,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("จังหวัด: " + feature.properties.tname + "<br>" + metric + " : " + feature.properties[metric], {
                className: 'hoverdata'
              });
            layer.on({
                mouseover: function (e) {
                    this.openPopup();
                },
                mouseout: function (e) {
                    this.closePopup();
                },
            });
          }
    }).addTo(map);

    if (dt != 0) {
        joinData.forEach((d) => {
            var marker = new L.CircleMarker([d.properties.lat, d.properties.lon],{radius: 0, opacity: 0.1});
            marker.bindTooltip(d.properties.tname,{
                                                    permanent: true,
                                                    direction: 'center',
                                                    className: "labelstyle"
                                                  });
            marker.addTo(map);
        });
    };

    map.attributionControl.setPrefix(false);
    map.fitBounds(geojsonLayer.getBounds());
    createColorBar('#colorbar-container', minValue, maxValue, '#EFE9F4', '#5078F2', 1);
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

updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');

document.getElementById('year-dd-map').addEventListener('change', (event) => {
    filters.year = event.target.value;
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('dt-dd-map').addEventListener('change', (event) => {
    filters.dt = event.target.value;
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('metric-dd-map').addEventListener('change', (event) => {
    filters.metric = event.target.value;
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('type-dd-map').addEventListener('change', (event) => {
    filters.ageType = event.target.value;
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

document.getElementById('sex-dd-map').addEventListener('change', (event) => {
    filters.sex = event.target.value;
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});