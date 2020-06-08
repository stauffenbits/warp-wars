
import * as Game from '/js/Universe.js';
import $ from '/js/vendor/fourd/jquery.min.js';

$(document).ready(function(){
  var universe = new Game.Universe(50, 50);
  universe.draw();
  
  Game.$fourd.make_resolve_click(function(vertex){
    console.log(vertex.object);
  })
})
