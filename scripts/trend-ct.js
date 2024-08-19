const ctData = JSON.parse(sessionStorage.getItem("ctData"));
var minYear = Math.min(...ctData.map(d => d.year));
var maxYear = Math.max(...ctData.map(d => d.year));
document.getElementById("header").innerHTML = 'อายุคาดเฉลี่ย และอายุคาดเฉลี่ยของการมีสุขภาวะของประชากรไทย พ.ศ. '+minYear+'-'+maxYear+' ระดับประเทศและจังหวัด';


const filters = {
    ageType: 0
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
        height: 465
    };

    Plotly.newPlot(selector, traceData, layout, {displayModeBar: false});
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
      link.download = 'แนวโน้มอายุคาดเฉลี่ยระดับประเทศ';
      link.click();
      
  }).catch(error => {
      console.error('Error capturing element:', error);
  });
};

createDropdownType(ctData, filters.ageType, 'type-dd-trend-ct');
createLineChart(ctData, filters.ageType, 'LE', 'le-trend-ct');
createLineChart(ctData, filters.ageType, 'HALE', 'hale-trend-ct');

$('#type-dd-trend-ct').on('change', function(e) {
  filters.ageType = $(this).val() || [];
    createLineChart(ctData, filters.ageType, 'LE', 'le-trend-ct');
    createLineChart(ctData, filters.ageType, 'HALE', 'hale-trend-ct');
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
  
  const data = JSON.parse(sessionStorage.getItem('ctData'));
  const filteredData = data.filter(d => d.type == filters.ageType);
  const columnMapping = {
    'year': 'ปี พ.ศ.',
    'sex': 'เพศ',
    'type': 'การคำนวณ'
  };

  // Define value mapping
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
  const transformedData = transformData(filteredData, columnMapping, valueMapping);

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
      link.setAttribute('download', 'แนวโน้มอายุคาดเฉลี่ยระดับประเทศ.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
});

  document.getElementById('capture-button-jpg').addEventListener('click', function() {
    downloadImage('jpg', 'line-chart-block');
  });
  document.getElementById('capture-button-png').addEventListener('click', function() {
    downloadImage('png', 'line-chart-block');
  });
