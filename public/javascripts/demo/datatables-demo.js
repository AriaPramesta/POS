// Call the dataTables jQuery plugin
$(document).ready(function () {
  $('#dataTable').DataTable(
    {
      lengthMenu: [[3, 10, 100], [3, 10, 100]],
      pageLength: 3,
    }
  );
});
