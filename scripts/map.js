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

function createDropdownDt(data, default_value, selector) {
    const uniqueDT = [0, ...new Set(data.map(d => d.area_code))];
    const sortDT = uniqueDT.map(Number).sort(function(a, b){return a-b});
    const dropdown = document.getElementById(selector);
    sortDT.forEach(dt => {
    const option = document.createElement('option');
    option.value = dt;
    option.text = dt != 0 ? "เขตสุขภาพที่ " + dt : "ทุกเขตสุขภาพ";
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

function createDropdownMetric(default_value, selector) {
    const uniqueMetric = ['LE','HALE'];
    const dropdown = document.getElementById(selector);
    uniqueMetric.forEach(m => {
    const option = document.createElement('option');
    option.value = m;
    option.text = m;
    dropdown.appendChild(option);
    });
    $(dropdown).select2({
        placeholder: 'เลือกประเภทอายุคาดเฉลี่ย'
    });
    // Set default value if provided
    if (default_value) {
        $(dropdown).val(default_value).trigger('change');
    }
};

function createDropdownType(data, default_value, selector) {
    const uniqueTypes = [...new Set(data.map(d => d.type))];
    const dropdown = document.getElementById(selector);
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

function interpolateColor(value, valueMin, valueMax, colorMin, colorMax) {
    // Ensure value is within the range
    value = Math.max(valueMin, Math.min(value, valueMax));
  
    // Calculate the factor (0 to 1) based on where the value falls in the range
    if (value == valueMin && value == valueMax) {
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
        if (pvList[i].startsWith('เขต')) {
            cell1.classList.add('indented-row');
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
        link.download = filters.dt == 0 ? 'อายุคาดเฉลี่ยของทุกเขตสุขภาพ' : 'อายุคาดเฉลี่ยของเขตสุขภาพที่ '+filters.dt +'.'+format;
        link.click();
        
    }).catch(error => {
        console.error('Error capturing element:', error);
    });
};

createDropdownYear(pvData, 2562, 'year-dd-map');
createDropdownDt(pvData, 1, 'dt-dd-map');
createDropdownMetric('LE', 'metric-dd-map');
createDropdownType(pvData, 0, 'type-dd-map');
createDropdownSex('male', 'sex-dd-map');

updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');


$('#year-dd-map').on('change', function(e) {
    filters.year = $(this).val() || [];
    var selectedText = $(this).find(':selected').text();
    document.getElementById("section-name-map").innerHTML = "อายุคาดเฉลี่ย (LE) และอายุคาดเฉลี่ยของการมีสุขภาวะ (HALE) ปี พ.ศ. " + selectedText + " (หน่วย: ปี)";
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

$('#dt-dd-map').on('change', function(e) {
    filters.dt = $(this).val() || [];
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

$('#metric-dd-map').on('change', function(e) {
    filters.metric = $(this).val() || [];
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

$('#type-dd-map').on('change', function(e) {
    filters.ageType = $(this).val() || [];
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
});

$('#sex-dd-map').on('change', function(e) {
    filters.sex = $(this).val() || [];
    updateLeafletMap(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map');
    updateTable(pvData, filters.year, filters.dt, filters.metric, filters.ageType, filters.sex, 'map-table');
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
    const filteredData = filters.dt == 0
    ? pvData.filter((d) => d.year == filters.year && d.type == filters.ageType && d.sex === filters.sex)
    : pvData.filter((d) => d.year == filters.year && d.area_code == filters.dt && d.type == filters.ageType && d.sex == filters.sex);
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
    map.invalidateSize();
    downloadImage('jpg', 'map-table');
  });
  document.getElementById('capture-button-png').addEventListener('click', function() {
    downloadImage('png', 'map-table');
  });