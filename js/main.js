import $ from '/js/vendor/fourd/jquery.min.js';

import FourD from '/js/vendor/fourd/fourd.js';

console.log($)
console.log(FourD)

var $fourd = new FourD();
$fourd.init('#display', {
  border: '1px solid 0x007bff',
  width: window.innerWidth,
  height: window.innerHeight,
  background: 0xffffff
});

$fourd.graph.add_vertex({
  cube: {size: 10, color: 0x000000},
  label: {size: 12, text: 'Welcome'}
});