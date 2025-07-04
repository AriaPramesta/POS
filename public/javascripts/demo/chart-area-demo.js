Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Format angka menjadi Rupiah (support negatif)
function formatRupiah(number) {
  var isNegative = Number(number) < 0;
  number = Math.abs(number);

  var number_string = number.toString().replace(/[^,\d]/g, ''),
    split = number_string.split(','),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    var separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
  return (isNegative ? '-Rp' : 'Rp') + rupiah;
}

// Area Chart
var ctx = document.getElementById("myAreaChart");

// (Opsional) Ubah warna titik earnings negatif
const colors = dataEarnings.map(value =>
  value < 0 ? 'rgba(231, 76, 60, 1)' : 'rgba(78, 115, 223, 1)'
);

var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: dataLabels, // Array label bulan
    datasets: [{
      label: "Pendapatan",
      lineTension: 0.3,
      backgroundColor: "rgba(78, 115, 223, 0.05)",
      borderColor: "rgba(78, 115, 223, 1)",
      pointRadius: 4,
      pointBackgroundColor: colors, // warna per titik
      pointBorderColor: colors,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: colors,
      pointHoverBorderColor: colors,
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: dataEarnings // Array angka earnings (bisa positif/negatif)
    }]
  },
  options: {
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 25,
        bottom: 0
      }
    },
    scales: {
      xAxes: [{
        time: {
          unit: 'date'
        },
        gridLines: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxTicksLimit: 7
        }
      }],
      yAxes: [{
        ticks: {
          maxTicksLimit: 5,
          padding: 10,
          callback: function (value) {
            return formatRupiah(value);
          }
        },
        gridLines: {
          color: "rgb(234, 236, 244)",
          zeroLineColor: "rgba(0, 0, 0, 0.4)", // garis 0 lebih tegas
          zeroLineWidth: 2,
          drawBorder: false,
          borderDash: [2],
          zeroLineBorderDash: [2]
        }
      }]
    },
    legend: {
      display: false
    },
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      titleMarginBottom: 10,
      titleFontColor: '#6e707e',
      titleFontSize: 14,
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: 'index',
      caretPadding: 10,
      callbacks: {
        label: function (tooltipItem, chart) {
          var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
          return datasetLabel + ': ' + formatRupiah(tooltipItem.yLabel);
        }
      }
    }
  }
});