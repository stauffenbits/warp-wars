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

$fourd.camera.position.z = -35;

var Visible = class Visible {
  constructor(){
    this._vertex = {
      game_object: this
    }

    this._edge = {
      game_object: this
    }

    this.expanded = false;
  }

  get visible(){
    return "Not implemented!";
  }

  draw(){
    this.drawn = true;
  }

  expand(){
    this.expanded = true;
  }

  collapse(){
    this.expanded = false;
  }

  undraw(){
    this.drawn = false;
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
    super.draw();
  }

  get visible(){
    return {
      stars: this.stars.map(star => star.visible),
      lanes: this.lanes.map(lane => lane.visible),
      game_object: this
    }
  }

  undraw(){
    this.lanes.forEach(lane => lane.undraw());
    this.stars.forEach(star => star.undraw());
    super.undraw()
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
    if(this.drawn){
      return;
    }

    this._vertex = $fourd.graph.add_vertex({
      cube: {size: 10, texture: 'img/Sun.jpg'},
      label: {size: 10, text: `Star ${this.universe.stars.indexOf(this)}`}
    });

    this._vertex.game_object = this;

    super.draw();
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
    if(!this.drawn){
      return;
    }

    $fourd.graph.remove_vertex(this._vertex);

    super.undraw();
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
    if(this.drawn){
      return;
    }

    this._vertex = $fourd.graph.add_vertex({
      cube: {size: 10, texture: 'img/Jupiter.png'},
      label: {size: 10, text: `Planet ${this.star.planets.indexOf(this)}`}
    });

    this._vertex.game_object = this;

    $fourd.graph.add_edge(this.star.visible, this.visible, {});
    
    super.draw();
  }

  get visible(){
    return this._vertex;
  }

  expand(){
    this.buildings.map(building => building.draw());
    super.expand()
  }

  collapse(){
    this.buildings.map(building => building.undraw());
    super.collapse()
  }

  undraw(){
    if(!this.drawn){
      return;
    }

    this.buildings.forEach(building => building.undraw());
    $fourd.graph.remove_vertex(this._vertex)
    
    super.undraw();
  }
}

var Building = class Building extends Visible {
  constructor(planet){
    super();
    this._vertex = null;
    this.planet = planet;
  }

  draw(){
    if(this.drawn){
      return;
    }

    this._vertex = $fourd.graph.add_vertex({
      cube: {size: 5, texture: 'img/House.jpg'},
      label: {size: 10, text: `Station ${this.planet.buildings.indexOf(this)}`}
    })

    this._vertex.game_object = this;

    $fourd.graph.add_edge(this.planet.visible, this.visible, {})
    super.draw();
  }

  get visible(){
    return this._vertex;
  }

  expand(){
    super.expand();
  }

  collapse(){
    super.collapse();
  }

  undraw(){
    if(!this.drawn){
      return;
    }
    
    $fourd.graph.remove_vertex(this._vertex);
    
    super.undraw();
  }
}

var Lane = class Lane extends Visible {
  constructor(universe, source, target){
    super();
    this.universe = universe;

    this.source = source;
    this.target = target;

    this._edge = null;
    this.drawn = false;

    this.navi = this.universe.navi.add_edge(source.navi, target.navi);
  }

  draw(){
    if(this.drawn){
      return;
    }

    this._edge = $fourd.graph.add_edge(
      this.source.visible, 
      this.target.visible, 
      {}
    );

    super.draw();
  }

  get visible(){
    return this._edge;
  }

  undraw(){
    if(!this.drawn){
      return;
    }
    $fourd.graph.remove_edge(this._edge);

    super.undraw();
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