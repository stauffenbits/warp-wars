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

$fourd.camera.position.z = -50;

var PLAYER_COLOR = "cornflowerblue";
var selected = null;

var LAST_STAR = null;
var LAST_PLANET = null;
var OPEN_PLANETS = [];
var OPEN_BUILDINGS = [];

var setup_click = function(){
  $fourd.make_resolve_click(function(vertex){
    if(!vertex) return;
    
    if(vertex.type == "sun"){
      if((LAST_STAR !== null) && (vertex.id === LAST_STAR.id)){
        closeStar(vertex);
        LAST_STAR = null;
        selected = null;
        $fourd.toggle_controls('fly', vertex);
      }else{
        if(LAST_STAR){
          closeStar(LAST_STAR);
        }
        openStar(vertex);
        LAST_STAR = vertex;
        selected = vertex;
        $fourd.toggle_controls('orbit', vertex);
      }
    }else if(vertex.type == "planet"){
      if((LAST_PLANET !== null) && (vertex.id === LAST_PLANET.id)){
        closePlanet(vertex);
        LAST_PLANET = null;
        selected = LAST_STAR;
        $fourd.toggle_controls('orbit', LAST_STAR)
      }else{
        if(LAST_PLANET){
          closePlanet(LAST_PLANET)
        }
        openPlanet(vertex);
        LAST_PLANET = vertex;
        selected = vertex;
        $fourd.toggle_controls('orbit', vertex);
        document.querySelector('.build').classList.remove('hidden');
      }
    }
  })
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



var openStar = function(vertex){
  var sun = vertex;
  sun.opened = true;

  document.querySelector('#selected-star').textContent = sun.id;
  
  if(LAST_STAR){
    closeStar(LAST_STAR);
  }
  LAST_STAR = sun;

  for(var i=0; i<10; i++){
    var planet = makeCube(64, {cubeFace: "img/Jupiter.png"});
    planet.type = 'planet';

    planet.navi = navi.add_vertex(new astar.Vertex());
    
    $fourd.graph.add_edge(sun, planet, {
      color: 0xffff00
    })

    navi.add_edge(sun.navi, planet.navi);
  
    OPEN_PLANETS.push(planet)
  }

  vertex.opened = true;
}

var openPlanet = function(vertex){
  var planet = vertex;
  planet.opened = true;

  document.querySelector('#selected-planet').textContent = planet.id;

  if(LAST_PLANET){
    closePlanet(LAST_PLANET);
  }
  LAST_PLANET = planet;

  if(planet.buildings === undefined){
    planet.buildings = [];
  }

  planet.buildings.map(building => building.draw());

  vertex.opened = true;
  document.querySelector('.build').classList.remove('hidden');
}

var closeStar = function(vertex){
  OPEN_PLANETS.map(closePlanet);
  OPEN_PLANETS = [];

  vertex.opened = false;
}

var closePlanet = function(vertex){
  document.querySelector('#build-generator').classList.add('hidden');

  var planet = vertex;

  OPEN_BUILDINGS.map(building => building.undraw());
  OPEN_BUILDINGS = [];

  vertex.opened = false;
}

var closePlanet = function(vertex){
  vertex.opened = false;
  OPEN_BUILDINGS.map(building => $fourd.graph.remove_vertex(building));
}

var PLAYER = {
  money: 0.25,
  money_cap: 1.0,

  energy: 0.25,
  energy_cap: 1.0,

  population: 1,
  population_cap: 10,

  buildings: []
}

function tick(){
  

  PLAYER.money *= 1.01;
  var cash = document.querySelector('#cash');
  cash.style.width = `${PLAYER.money / PLAYER.money_cap * 100}%`;
  cash.textContent = `$$$: ${PLAYER.money}`;

  /*
  Energy
   */
  PLAYER
    .buildings
    .filter(building => building.type == 'energy-generator')
    .map(building => PLAYER.energy += building.generateEnergy());

  PLAYER
    .buildings
    .map(building => PLAYER.energy -= building.consumeEnergy());

  if(PLAYER.energy > PLAYER.energy_cap){
    PLAYER.energy = PLAYER.energy_cap;
  }

  var energy = document.querySelector('#energy');
  energy.style.width = `${PLAYER.energy / PLAYER.energy_cap * 100}%`;
  energy.textContent = `⚛⚛⚛: ${PLAYER.energy}`;

  /*
  Population
  */
 PLAYER
 .buildings
 .filter(building => building.type == 'population-generator')
 .map(building => PLAYER.population += building.generatePopulation());

 if(PLAYER.population > PLAYER.population_cap){
   PLAYER.population = PLAYER.population_cap;
 }

 var population = document.querySelector('#population');
 population.style.width = `${PLAYER.population / PLAYER.population_cap * 100}%`;
 population.textContent = `ಠ_ಠ ${PLAYER.population}`
}

var MS_PER_TICK = 120;
var ticks = setInterval(tick, MS_PER_TICK);

var drawBuilding = function drawBuilding(){
  var vertex = makeCube(32, {cubeFace: 'img/House.jpg'});
  $fourd.graph.add_edge(LAST_PLANET, vertex, {});
  OPEN_BUILDINGS.push(vertex);

  return vertex;
}

var undrawBuildings = function undrawBuildings(){
  OPEN_BUILDINGS.map(bv => $fourd.graph.remove_vertex(bv));
}

window.buildGenerator = function buildGenerator(){
  console.log("building generator")

  var building = Object.assign({}, {
    cost: 0.25,
    type: 'energy-generator',
    hitpoints: 100.0,
    vertex: null,
    create: function(){
      if(PLAYER.money >= this.cost){
        PLAYER.money -= this.cost;
        return true;
      }else{
        return false;
      }
    },
    draw: function(){
      this.vertex = drawBuilding();
      return this.vertex;
    },
    undraw: function(){
      $fourd.graph.remove_vertex(this.vertex);
      this.vertex = null;
    },
    generateEnergy: function(){
      return 0.1;
    },
    consumeEnergy: function(){
      return 0.01;
    }
  });

  if(building.create()){
    
    PLAYER.buildings.push(building);
    OPEN_BUILDINGS.push(building);
    LAST_PLANET.buildings.push(building);

    building.vertex = building.draw();
    
    console.log('building built')
  }

  clearInterval(ticks);
  ticks = setInterval(tick, MS_PER_TICK)
}

window.buildHousing = function buildHousing(){
  console.log('buidling housing');

  var building = Object.assign({}, {
    type: 'population-generator',
    cost: 0.25,
    hitpoints: 100.0,
    vertex: null,
    create: function(){
      if(PLAYER.money >= this.cost){
        PLAYER.money -= this.cost;
        PLAYER.population_cap + 10;

        return true;
      }else{
        return false;
      }
    },
    draw: function(){
      this.vertex = drawBuilding();
      return this.vertex;
    },
    undraw: function(){
      $fourd.graph.remove_vertex(this.vertex);
      this.vertex = null;
    },
    generatePopulation: function(){
      return 0.10;
    },
    consumeEnergy: function(){
      return 0.02;
    }
  });

  if(building.create()){
 
    PLAYER.buildings.push(building);
    OPEN_BUILDINGS.push(building);

    building.vertex = building.draw();

    console.log('building built')
  }

  clearInterval(ticks);
  ticks = setInterval(tick, MS_PER_TICK)
}