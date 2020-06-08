
import * as Game from '/js/Universe.js';
import * as $ from 'jquery';

var universe = new Game.Universe(50, 50);
universe.draw();

Game.$fourd.make_resolve_click(function(vertex){
  vertex.game_object.expand();
})
