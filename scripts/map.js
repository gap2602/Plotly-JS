const pvData = JSON.parse(sessionStorage.getItem("pvData"));

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

function updateMap(data, year, dt, metric, type, sex) {
    const filteredData = dt == 0
      ? data.filter((d) => d.year == year && d.type == type && d.sex === sex)
      : data.filter((d) => d.year == year && d.area_code == dt && d.type == type && d.sex == sex);
  
    const geojson = thai_json; // Assuming you have `thai_json` defined elsewhere
  
    const trace = {
      type: 'choropleth',
      geojson: geojson,
      locations: 'post_code',
      featureidkey: "properties.id",
      color: metric,
      coloraxis: {
        min: filteredData[metric].min(),
        max: filteredData[metric].max(),
        cmin: '#EFE9F4',
        cmax: '#5078F2' // Adjust color range as needed
      },
      colorbar: {
        len: 0.7,
        xanchor: 'right',
        x: 0.93,
        yanchor: 'middle',
        y: 0.5,
        thickness: 20,
        title: {
          text: metric, // Replace with actual metric name
          font: { weight: 'bold' }
        }
      },
      customdata: ['th_province'], // Assuming your data has a `th_province` column
      hovertemplate: 'จังหวัด: %{customdata[0]}<br>' + metric + ': %{z:.1f}'
    };
  
    const layout = {
      margin: { r: 0, t: 0, l: 0, b: 0 },
      font: { family: 'IBM Plex Sans Thai', size: 16 },
      paper_bgcolor: '#f0f1f3',
      geo: { fitbounds: 'locations', visible: true }
    };
  
    const fig = new plotly.Plotly.Figure({ data: [trace], layout: layout });
  
    if (dt !== 'all') {
      const textData = filteredData.map((row) => `<b>${row.th_province}</b>`);
      fig.addScattergeo({
        lat: filteredData['lat'],
        lon: filteredData['lon'],
        mode: 'text',
        text: textData,
        textfont: { family: 'IBM Plex Sans Thai', size: 14, color: 'black' },
        hoverinfo: 'skip'
      });
    }
  
    return fig;
  };

createDropdownYear(pvData, 2562, 'year-dd-map');
createDropdownDt(pvData, 1, 'dt-dd-map');
createDropdownMetric('LE', 'metric-dd-map');
createDropdownType(pvData, 0, 'type-dd-map');
createDropdownSex('male', 'sex-dd-map');
