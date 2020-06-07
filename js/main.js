import $ from '/js/vendor/fourd/jquery.min.js';

import FourD from '/js/vendor/fourd/fourd.js';
import rough from '/js/vendor/rough.cjs.js';

console.log($)
console.log(FourD)

var $fourd = new FourD();
$fourd.init('#display', {
  border: '1px solid 0x007bff',
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0xffffff
});

var c = document.createElement('canvas');
c.width = 128;
c.height = 128;
var rc = rough.canvas(c);
var node = rc.circle(c.width/2, c.height/2, c.width, {
  fill: "rgba(0,0,0,1.0)",
  fillStyle: 'dots',
  fillWeight: 0.5
});

var vs = []
var vold;
for(var i=0; i<10; i++){
  var v = $fourd.graph.add_vertex({
    cube: {size: 10, texture: c.toDataURL('image/png', 1.0)},
    label: {size: 12, text: 'Welcome'}
  });

  if(vold){
    $fourd.graph.add_edge(vold, v);
  }

  vold = v;
  vs.push(v);
}

for(var i=0; i<10; i++){
  $fourd.graph.add_edge(
    vs[Math.floor(Math.random() * vs.length)],
    vs[Math.floor(Math.random() * vs.length)]
  )
}