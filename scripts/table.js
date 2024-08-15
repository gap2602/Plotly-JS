const pvData = JSON.parse(sessionStorage.getItem("pvData"));

const filters = {
    year: '2562',
    dt: [1,2],
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