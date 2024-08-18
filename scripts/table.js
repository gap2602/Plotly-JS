const pvData = JSON.parse(sessionStorage.getItem("pvData"));

const filters = {
    year: '2562',
    dt: [1],
    pv: ['กรุงเทพมหานคร'],
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
    const uniqueDts = [...new Set(data.map(d => d.area_code))];
    const sortDts = uniqueDts.map(Number).sort(function(a, b){return a-b});
    const dropdown = document.getElementById(selector);
    const defaultValue = default_value;
    sortDts.forEach(dt => {
    const option = document.createElement('option');
    option.value = dt;
    option.text = "เขตสุขภาพที่ " + dt;
    if (defaultValue.includes(dt)) {
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

    if (defaultValue.includes(pv)) {
        option.selected = true;
    }
    dropdown.appendChild(option);
    });
};

function updateTable(data, year, dtList, pvList, selector) {
    const dtListStr = dtList.map((d) => d.toString())
    const filteredData = data.filter(d => d.year == year && (dtListStr.includes(d.area_code) || pvList.includes(d.th_province))); 
    const sortData = filteredData.sort((a,b)=> (parseInt(a.area_code) - parseInt(b.area_code) || 
                                                a.th_province.localeCompare(b.th_province) || parseInt(a.type) - parseInt(b.type) ||
                                                b.sex.localeCompare(a.sex)));
    
    const keyValue = ['area_code', 'th_province', 'type', 'sex', 'LE', 'HALE', 'LE-HALE'];
    const keyText = ['เขตสุขภาพ', 'จังหวัด', 'การคำนวณ', 'เพศ', 'LE', 'HALE', 'LE-HALE'];
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

    var checkDT = '0';
    var checkPV = '';
    var checkType = '60';
    var checkSex = 'female'; 

    sortData.forEach(item => {
        const row = document.createElement('tr');
        
        keyValue.forEach(key => {
            const cell = document.createElement('td');

            if (key == 'area_code') {
                if (item[key] == checkDT) {
                    cell.textContent = "";
                    row.appendChild(cell);
                } else {
                    cell.textContent = 'เขตสุขภาพ' + item[key];
                    row.appendChild(cell);
                    checkDT = item[key]
                }
            } else if (key == 'th_province') {
                if (item[key] == checkPV) {
                    cell.textContent = "";
                    row.appendChild(cell);
                } else {
                    cell.textContent = item[key];
                    row.appendChild(cell);
                    checkPV = item[key]
                }
            } else if (key == 'type') {
                if (item[key] == checkType) {
                    cell.textContent = "";
                    row.appendChild(cell);
                } else {
                    cell.textContent = item[key] == 0 ? 'เมื่อแรกเกิด (at birth)' : 'เมื่ออายุ 60 ปี';
                    row.appendChild(cell);
                    checkType = item[key]
                }
            } else if (key == 'sex') {
                if (item[key] == checkSex) {
                    cell.textContent = "";
                    row.appendChild(cell);
                } else {
                    cell.textContent = item[key] == 'male' ? 'เพศชาย' : 'เพศหญิง';
                    row.appendChild(cell);
                    checkSex = item[key]
                }
            } else {
                cell.textContent = parseFloat(item[key]).toFixed(1);
                row.appendChild(cell);
            }
            
        });
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody); 

    const oldTable = document.getElementById(selector).querySelector('table');
    if (oldTable) {
        document.getElementById(selector).removeChild(oldTable);
    }
    
    document.getElementById(selector).appendChild(table);
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
        link.download = 'อายุคาดเฉลี่ยตามข้อมูลที่เลือก';
        link.click();
        
    }).catch(error => {
        console.error('Error capturing element:', error);
    });
};

createDropdownYear(pvData, filters.year, 'year-dd-table');
createDropdownDt(pvData, filters.dt, 'dt-dd-table');
createDropdownPV(pvData, filters.pv, 'pv-dd-table');

updateTable(pvData, filters.year, filters.dt, filters.pv, 'table-block');

document.getElementById('year-dd-table').addEventListener('change', (event) => {
    filters.year = event.target.value;
    updateTable(pvData, filters.year, filters.dt, filters.pv, 'table-block');
});

const selectElementDT = document.getElementById('dt-dd-table');
selectElementDT.addEventListener('change', (event) => {
    filters.dt = Array.from(selectElementDT.selectedOptions).map(option => option.value);
    updateTable(pvData, filters.year, filters.dt, filters.pv, 'table-block');
});

const selectElementPV = document.getElementById('pv-dd-table');
selectElementPV.addEventListener('change', (event) => {
    filters.pv = Array.from(selectElementPV.selectedOptions).map(option => option.value);
    updateTable(pvData, filters.year, filters.dt, filters.pv, 'table-block');

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
    const dtListStr = filters.dt.map((d) => d.toString())
    const filteredData = pvData.filter(d => d.year == filters.year && (dtListStr.includes(d.area_code) || filters.pv.includes(d.th_province)));
    console.log(filteredData);
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
        link.setAttribute('download', 'อายุคาดเฉลี่ยตามข้อมูลที่เลือก.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  });

  document.getElementById('capture-button-jpg').addEventListener('click', function() {
    downloadImage('jpg', 'table-block');
  });
  document.getElementById('capture-button-png').addEventListener('click', function() {
    downloadImage('png', 'table-block');
  });