var $display = $('#display');
var $fourd = new FourD();
$fourd.init($display, {
  border: '1px solid 0x007bff',
  width: $display.width(),
  height: $display.height(),
  background: 0xffffff
});

$fourd.add_vertex({
  cube: {size: 10, texture: '/img/role.png'},
  label: {size: 12, text: 'Welcome'}
});