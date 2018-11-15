
function makeLine(coords,is_central=false) {
    return new fabric.Line(coords, {
      fill: (is_central)?'green':'blue',
      stroke: (is_central)?'green':'blue',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
  }

function moving_callback(e) {
  var point = e.target;
  //console.log('moving',point.name);

  for (i=0; i < point.lines.length; i++) {
    line = point.lines[i];
    extreme = point.extremes[i];
    if (extreme == 1) {
      line.set('x1',e.pointer.x);
      line.set('y1',e.pointer.y);
    } else {
      line.set('x2',e.pointer.x);
      line.set('y2',e.pointer.y);
    }
    //console.log(point.lines[i].name);
  }
  //activeObject.line.set('stroke','red');
  //activeObject.line.selectable = false;
  //activeObject.line.set('x1',e.pointer.x);
  //activeObject.line.set('y1',e.pointer.y);

  var distance = Math.sqrt((e.pointer.x - 300)*(e.pointer.x - 300) +
      (e.pointer.y - 300)*(e.pointer.y - 300));

  //activeObject.text.set('text','' + distance);
  canvas.renderAll();
}

function distance(x1,y1,x2,y2) {
  return Math.sqrt((x1 - x2)*(x1 - x2) +
      (y1 - y2)*(y1 - y2));
}


function add_point(name,x,y,is_central=false) {
  var new_point = new fabric.Circle({
      radius: 10, fill: 'red', left: x-5, top: y-5,objectCaching: false
      });
  new_point.set('selectable', true);
  new_point.name = name;
  new_point.is_central = is_central;
  new_point.lines = [];
  new_point.extremes = [];
  new_point.set('hasRotatingPoint',false);
  new_point.set('hasControls',false);

  //var line = makeLine([10,10,300,300]);
  //line.name ='line1';

  //var text = new fabric.Text('D=0.0', { left: 200, top: 200 });
  //new_point.line = line;
  //new_point.text = text;

  //new_point.line = line;

  new_point.on('moving', moving_callback);

  return new_point;
}

function join_points(mainloc,samples) {
    var i,j;
    var pointi, pointj;
    var line;
    var lines = [];
    var points = samples.slice(0);
    points.push(mainloc);
    for (i=0; i < points.length; i++) {
        pointi = points[i]
        x1 = pointi.get('left') + 5
        y1 = pointi.get('top') + 5
        for (j=i+1; j < points.length; j++) {
           //connect point i and j
           pointj = points[j]
           x2 = points[j].left + 5
           y2 = points[j].top + 5
           line = makeLine([x1,y1,x2,y2],pointi.is_central || pointj.is_central);
           line.name = '' + i + ':' + j;

           console.log(i,j,x1,y1,x2,y2,pointi.is_central || pointj.is_central);

           pointi.lines.push(line);
           pointi.extremes.push(1);

           pointj.lines.push(line);
           pointj.extremes.push(2);

           lines.push(line);

           canvas.add(line);
        }
    }
    return lines;
}

function compute_distances(points,pointx) {
    var i,j;
    var pointi, pointj;
    var nsamples = points.length;
    var A = new Array(nsamples);
    var b = new Array(nsamples);

    for (i=0; i < nsamples; i++) {
        A[i] = new Array(nsamples);
    }

    for (i=0; i < nsamples; i++) {
        pointi = points[i]
        x1 = pointi.get('left') + 5;
        y1 = pointi.get('top') + 5;
        A[i][i] = 0.0;
        for (j=i+1; j < nsamples; j++) {
           //connect point i and j
           pointj = points[j]
           x2 = pointj.left + 5
           y2 = pointj.top + 5

           A[i][j] = distance(x1,y1,x2,y2);
           A[j][i] = A[i][j];
           console.log(i,j,A[i][j]);

        }
    }

    x2 = pointx.get('left') + 5
    y2 = pointx.get('top') + 5
    for (i=0; i < nsamples; i++) {
      pointi = points[i];
      x1 = pointi.get('left') + 5
      y1 = pointi.get('top') + 5

      b[i] = distance(x1,y1,x2,y2);

    }

    return [A,b];
}

function cova(d) {
  //Spherica model
  hr = d/range;

  if (hr <= 1) {
    ret = sill*(1.0-hr*(1.5-0.5*hr**2));
  } else {
    ret = 0.0;
  }
  return ret;
}

function fill_Ab(dsamples,dx) {
    var i,j;
    var nsamples = dx.length;
    var A = new Array(nsamples+1);
    var b = new Array(nsamples+1);

    for (i=0; i < nsamples+1; i++) {
        A[i] = new Array(nsamples+1);
    }

    //Apply convariance
    for (i=0; i < nsamples; i++) {
        A[i][i] = nugget + sill;
        for (j=i+1; j < nsamples; j++) {
           A[i][j] = cova(dsamples[i][j]);
           A[j][i] = A[i][j];
        }
        b[i] = cova(dx[i]);

        A[nsamples][i] = 1.0;
        A[i][nsamples] = 1.0;
    }
    b[nsamples] = 1.0;

    A[nsamples][nsamples] = 0.0;

    return[A,b];
}
