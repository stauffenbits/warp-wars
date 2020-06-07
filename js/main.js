import $ from '/js/vendor/fourd/jquery.min.js';
import FourD from '/js/vendor/fourd/fourd.js';
import rough from '/js/vendor/rough.cjs.js';
import * as astar from '/js/astar.js';

var $fourd = new FourD();
$fourd.init('#display', {
  border: '1px solid 0x007bff',
  width: window.innerWidth,
  height: window.innerHeight,
  background: 'rgba(1,1,1,0.5)'
});

var PLAYER_COLOR = "cornflowerblue";

var setup_click = function(){
  $fourd.make_resolve_click(clickStar)
}
setup_click();

var makeCube = function(size, {cubeColor, cubeFace}){

  if(cubeColor){

    var c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    var rc = rough.canvas(c);
    var node = rc.circle(c.width/2, c.height/2, c.width, {
      roughness: 1.0,
      stroke: cubeColor,
      fill: "rgba(0, 0, 0, 1.0)",
      fillStyle: 'dots',
      fillWeight: 1,
      zigZagOffset: 0.25
    });
    
    var v = $fourd.graph.add_vertex({
      cube: {size: 10, texture: c.toDataURL('image/png', 1.0)},
      // label: {size: 12, text: i.toString()}
    });
  }else if(cubeFace){
    var v = $fourd.graph.add_vertex({
      cube: {size: 10, texture: cubeFace}
    })
  }


  return v;
}

var vs = []
var vold;

var VS = 50;
var ES = 50;

var navi = new astar.Graph();

for(var i=0; i<VS; i++){
  var v = makeCube(128, {cubeFace: "img/Sun.jpg"});
  v.type = 'sun';

  v.navi = navi.add_vertex(new astar.Vertex());

  if(vold){
    var e = $fourd.graph.add_edge(vold, v, {
      strength: 0.25
    });
    e.navi = navi.add_edge(vold.navi, v.navi);
  }

  vold = v;
  vs.push(v);
}

for(var i=0; i<ES; i++){
  $fourd.graph.add_edge(
    vs[Math.floor(Math.random() * vs.length)],
    vs[Math.floor(Math.random() * vs.length)]
  )
}

var shipIdSpawn;

var trade = function(start){
  if(shipIdSpawn === undefined){
    shipIdSpawn = 0;
  }

  var shipId = shipIdSpawn++;

  var c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  var rc = rough.canvas(c);
  var ship = makeCube(32, {cubeColor: PLAYER_COLOR});

  $fourd.clear_made_resolve_click();
  $fourd.make_resolve_click(function(vertex){
    if(vertex){
      end = vertex;
    }else{
      start = null;
      end = null;
    }

    $fourd.clear_made_resolve_click();
    setup_click();
  });

  ship.dock = $fourd.graph.add_edge(ship, start);
  ship.path = navi.a_star(start.navi, end.navi);

  console.log(ship.path);
}


function clickStar(vertex){
  if(!vertex){
    return;
  }

  if(vertex.opened){
    switch(vertex.type){
      case 'sun':
        closeStar(vertex);
        break;

      case 'planet':
        closePlanet(vertex);
        break;
    }
    $fourd.toggle_controls(vertex);
 
  }else if(!vertex.opened){
    switch(vertex.type){
      case 'sun':
        openStar(vertex);
        break;

      case 'planet':
        trade(vertex);
        break;
    }
    $fourd.toggle_controls(vertex);
  }
}

var OPEN_PLANETS = [];
var LAST_STAR = null;
var openStar = function(vertex){
  var sun = vertex;
  sun.opened = true;
  
  if(LAST_STAR){
    closeStar(LAST_STAR);
  }
  LAST_STAR = sun;

  for(var i=0; i<10; i++){
    var planet = makeCube(64, {cubeFace: "img/Jupiter.png"});

    planet.navi = navi.add_vertex(new astar.Vertex());
    
    $fourd.graph.add_edge(sun, planet, {
      color: 0xffff00
    })

    navi.add_edge(sun.navi, planet.navi);
  
    OPEN_PLANETS.push(planet)
  }

  vertex.opened = true;
}

var closeStar = function(vertex){
  OPEN_PLANETS.map(planet => {
    $fourd.graph.remove_vertex(planet);
  });

  vertex.opened = false;
}

var LAST_PLANET = null;
var openPlanet = function(vertex){
  var planet = vertex;
  vertex.opened = true;

  if(LAST_PLANET){
    closePlanet(LAST_PLANET);
  }
  LAST_PLANET = planet;

  var ship = makeCube(16, {cubeColor: 'rgba(255, 165, 0, 1.0)'})

  $fourd.graph.add_edge(planet, ship, {color: 'black', strength: 0.75})
}

var closePlanet = function(vertex){
  vertex.opened = false;
}