// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function round(x,d=2) {
  var p = Math.pow(10.0,d);

  return Math.round(x*p)/p;
}

function update_and_display() {
  nugget = parseFloat(d3.select("#vm_nugget").property("value"));
  sill = parseFloat(d3.select("#vm_sill").property("value"));
  range = parseFloat(d3.select("#vm_range").property("value")); 
  console.log('nugget',nugget);
  console.log('sill',sill);
  console.log('range',range);
  ret = compute_distances(samples,mainlocation);
  dsamples = ret[0];
  dx = ret[1];

  ret = fill_Ab(dsamples,dx);
  A = ret[0];
  b = ret[1];

  x = gauss_solver(A, b);

  $('#distance_matrix_div').html(generate_distance_table(dsamples, dx, "distance_matrix"));
}

function generate_distance_table(sd, ps, id) {
  var i,j;
  var n = ps.length;

  console.log('length:',n);
  var html = `
  <table class="table" id="{0}">
    <thead>
      <tr>
        <th scope="col">#</th>`.format(id);
  for(i=0;i<n;i++) {
    html += '<th scope="col">SP' + (i+1) + '</th>';
  }
  html += `
      </tr>
    </thead>
    <tbody>`;

  for(i=0;i<n;i++) {
    html += '<tr><th scope="row">SP{0}</th>'.format((i+1));
    for(j=0;j<n;j++) {
        html += '<td id="{2}_cell{0}{1}">{3}</td>'.format(i,j,id,round(sd[i][j],2));
    }
    html += "</tr>";
  }
  html += '</tbody><tfoot><tr><th scope="row">P?</th>';
  for(j=0;j<n;j++) {
      html += '<td id="{1}_cell{0}">{2}</td>'.format(j,id,round(ps[j],2));
  }
  html += "</tr></tfoot></table>";

  return html;
}
