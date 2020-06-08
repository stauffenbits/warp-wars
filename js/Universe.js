import FourD from '/js/vendor/fourd/fourd.js';
import Utils from '/js/Utils.js';
import * as astar from '/js/astar.js';

var $fourd = new FourD();
$fourd.init('#display', {
  border: '1px solid 0x007bff',
  width: window.innerWidth,
  height: window.innerHeight,
  background: 'rgba(1,1,1,0.5)'
});

$fourd.camera.position.z = -50;

var Visible = class Visible {
  constructor(){
  }

  get visible(){
    return "Not implemented!";
  }

  draw(){
    throw "Not implemented!";
  }

  expand(){
    throw "Not implemented!";
  }

  collapse(){
    throw "Not implemented!";
  }

  undraw(){
    throw "Not implemented!";
  }
}

var Universe = class Universe extends Visible {
  constructor(numStars, numLanes){
    super();

    this.navi = new astar.Graph();

    this.stars = [...Utils.range(numStars)].map(() => new Star(this));
    this.lanes = [...Utils.range(numLanes)].map(() => this.mkRandomLane());
  }

  mkRandomLane(){
    var source = this.stars[Math.floor(Math.random() * this.stars.length)];
    var target;
    do{
      target = this.stars[Math.floor(Math.random() * this.stars.length)];
    }while(target == source)

    return new Lane(this, source, target)
  }

  draw(){
    this.stars.map(star => star.draw());
    this.lanes.map(lane => lane.draw());
  }

  get visible(){
    return {
      stars: this.stars.map(star => star.visible),
      lanes: this.lanes.map(lane => lane.visible),
      object: this
    }
  }

  undraw(){
    this.lanes.forEach(lane => lane.undraw());
    this.stars.forEach(star => star.undraw());
  }
}

var Star = class Star extends Visible {
  constructor(universe){
    super();
    this.universe = universe;
    this.navi = new astar.Vertex();
    this.universe.navi.add_vertex(this.navi);

    this._vertex = null;

    var numPlanets = Math.floor(Math.random() * 10);
    this.planets = [...Utils.range(numPlanets)].map(() => new Planet(this));
  }

  draw(){
    this._vertex = $fourd.graph.add_vertex({
      cube: {size: 10, texture: 'img/Sun.jpg'},
      label: {size: 10, text: `Star ${this.universe.stars.indexOf(this)}`}
    });

    this._vertex.object = this;
  }

  get visible(){
    return this._vertex;
  }

  expand(){
    this.planets.forEach(planet => planet.draw());
  }

  collapse(){
    this.planets.forEach(planet => planet.undraw());
  }

  undraw(){
    $fourd.graph.remove_vertex(this._vertex);
  }
}

var Planet = class Planet extends Visible {
  constructor(star){
    super();
    this.star = star;
    this._vertex = null;

    this.buildings = [];
  }

  draw(){
    this._vertex = $fourd.graph.add_vertex({
      cube: {size: 10, color: 0x000000},
      label: {size: 10, text: `Planet ${this.star.planets.indexOf(this)}`}
    });

    this._vertex.object = this;

    $fourd.graph.add_edge(this.star.visible, this.visible);
  }

  get visible(){
    return this._vertex;
  }

  expand(){
    this.buildings.map(building => building.draw());
  }

  collapse(){
    this.buildings.map(building => building.undraw());
  }

  undraw(){
    this.buildings.forEach(building => building.undraw());
    $fourd.graph.remove_vertex(this._vertex)
  }
}

var Building = class Building extends Visible {
  constructor(planet){
    super();
    this.planet = planet;
  }

  draw(){
    this._vertex = $fourd.graph.add_vertex({
      cube: {size: 5, texture: 'House.jpg'},
      label: {size: 10, text: `Building ${this.planet.buildings.indexOf(this)}`}
    })

    this._vertex.object = this;

    $fourd.graph.add_edge(this.planet.visible, this.visible)
  }

  get visible(){
    return this._vertex;
  }

  expand(){

  }

  collapse(){

  }

  undraw(){
    $fourd.graph.remove_vertex(this._vertex);
  }
}

var Lane = class Lane extends Visible {
  constructor(universe, source, target){
    super();
    this.universe = universe;

    this.source = source;
    this.target = target;

    this.navi = this.universe.navi.add_edge(source.navi, target.navi);
  }

  draw(){
    this._edge = $fourd.graph.add_edge(
      this.source.visible, 
      this.target.visible
    );
  }

  get visible(){
    return this._edge;
  }

  undraw(){
    $fourd.graph.remove_edge(this._edge);
  }
}

module.exports = {
  Universe,
  Star,
  Planet,
  Building,
  Lane,
  $fourd
}