
import * as Game from '/js/Universe.js';
import * as $ from 'jquery';

var universe = new Game.Universe(20, 50);
universe.draw();

var CURRENT_STAR = null;
var CURRENT_PLANET = null;
var CURRENT_BUILDING = null;

Game.$fourd.make_resolve_click(function(vertex){
  if(!vertex){
    return;
  }

  if(vertex.game_object instanceof Game.Star){
    starClick(vertex);
  }else if(vertex.game_object instanceof Game.Planet){
    planetClick(vertex);
  }

  updateHUD();
})

var starClick = function(vertex){
  if(CURRENT_STAR !== null){
    CURRENT_STAR.collapse();
  }

  if(vertex.game_object == CURRENT_STAR){
    if(CURRENT_PLANET !== null){
      CURRENT_PLANET.collapse();
      CURRENT_PLANET = null;
    }

    CURRENT_STAR = null;
    return;
  }

  CURRENT_STAR = vertex.game_object;
  Game.$fourd.toggle_controls('orbit', vertex);
  CURRENT_STAR.expand();
}

var planetClick = function(vertex){
  if(CURRENT_PLANET !== null){
    CURRENT_PLANET.collapse();
  }

  if(vertex.game_object == CURRENT_PLANET){
    CURRENT_PLANET = null;
    return;
  }

  CURRENT_PLANET = vertex.game_object;
  Game.$fourd.toggle_controls('orbit', vertex);
  CURRENT_PLANET.expand();
}

var updateHUD = function(){
  document.querySelector('#selected-star').textContent = 
    CURRENT_STAR ? CURRENT_STAR.universe.stars.indexOf(CURRENT_STAR) : "None";

  document.querySelector('#selected-planet').textContent = 
    CURRENT_PLANET ? CURRENT_PLANET.star.planets.indexOf(CURRENT_PLANET) : "None";
  
  updateBuildMenu();
}

var updateBuildMenu = function(){
  CURRENT_PLANET ? showBuildMenu() : hideBuildMenu();
}

var showBuildMenu = function(){
  document.querySelector('.build').classList.remove('hidden');
}

var hideBuildMenu = function(){
  document.querySelector('.build').classList.add('hidden');
}

window.buildHousing = function(){
  var building = new Game.Building(CURRENT_PLANET);
  CURRENT_PLANET.buildings.push(building)
  building.draw();
}

window.buildGenerator = function(){
  var building = new Game.Building(CURRENT_PLANET);
  CURRENT_PLANET.buildings.push(building)
  building.draw();
}