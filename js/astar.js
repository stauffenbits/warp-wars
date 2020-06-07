

"use strict";

var vertex_id = 0;
class Vertex{
    constructor(){
        this.id = vertex_id++;
        this.neighbors = new Set();
        this.edges = new Set();
    }

    release(){
        for(var v of this.neighbors){
            v.neighbors.delete(this);
        }
        delete this.id;
    }
}

var edge_id = 0;
class Edge{
    constructor(src, tgt){
        this.id = edge_id++;
        this.src = src;
        this.tgt = tgt;
        
        src.neighbors.add(tgt);
        tgt.neighbors.add(src);

        src.edges.add(this);
        tgt.edges.add(this);
    }
    
    release(){
        this.src.release();
        this.src.edges.delete(this);
        delete this.src;

        this.tgt.release();
        this.tgt.edges.delete(this);
        delete this.tgt;
    }
}

var graph_id = 0;
class Graph {
    constructor(){
        this.id = graph_id++;
        this.V = new Map();
        this.E = new Map();
    }
    
    add_vertex(vertex){
        this.V.set(vertex.id, vertex);
        return vertex;
    }
    
    remove_vertex(id){
        this.V.delete(id);
    }
    
    add_edge(src_vertex, tgt_vertex){
        var edge = new Edge(src_vertex, tgt_vertex);
        this.E.set(edge.id, edge);
        return edge;
    }
    
    remove_edge(id){
        this.E.delete(id);
    }
    
    /*
      Lists a random vertex.
    */
    random_vertex(){
        var items = Array.from(this.V.values());
        return items[Math.round(Math.random() * items.length)];
    }
    
    /*
      Creates an edge between two random vertices. 
    */
    random_edge(){
        
        var v1 
        while((v1 = this.random_vertex()) == undefined);

        var v2;
        while((v2 = this.random_vertex()) == v1 || (v2 == undefined));
        
        return this.add_edge(v1, v2);
    }
    
    clear(){
        this.E.clear();
        this.V.clear();
    }

    connected(){
        var source = this.random_vertex();
        for(var goal of this.V){
            var path = this.a_star(source, goal);
            if(path.length >= 2){
                return true;
            }else{
                return false; 
            }
        }
    }
}


Graph.prototype.a_star = function(start, goal){
    // The set of nodes already evaluated. 
    var closed_set = new Set();
    
    // The set of currently discovered nodes that are not evaluated yet.
    // Initially, only the start node is known. 
    var open_set = new Set([start]);
    
    // For each node, which node it can most efficiently be reached from. 
    // If a node can be reached from manny nodes, came_from will eventually
    // contain the most efficient step. 
    var came_from = new Map();
    
    // For each node, the cost of getting from the start node to that node.
    var g_score = new Map()
    this.V.forEach(function(vertex){
        g_score.set(vertex, Infinity);
    });
    
    // For the first node, that value is completely heuristic. 
    g_score.set(start, 0.0);
    
    // For each node, the total cost of getting from the start node to the 
    // goal by passing by that node. That value is partly known, partly
    // heuristic. 
    var f_score = new Map();
    this.V.forEach(function(vertex){
        f_score.set(vertex, Infinity);
    });
    
    // For the first node, that value is completely heuristic. 
    f_score.set(start, heuristic_cost_estimate(start, goal));
    
    while(open_set.size){
        var entries_it = open_set.entries();
        var entries = [];
        for(var entry of entries_it){
            entries.push(entry[0]);
        }
        entries.sort((a, b) => f_score.get(a) - f_score.get(b));
        var current = entries[0];
        // why keep it in a set if we're just gonna sort it anyway? 
        
        if(current === goal){
            return reconstruct_path(came_from, current);
        }
        
        open_set.delete(current);
        closed_set.add(current);
        
        var neighbors = current.neighbors.values();
        for(var neighbor of neighbors){
            if(closed_set.has(neighbor)){
                continue;
            }
            
            if(!open_set.has(neighbor)){
                open_set.add(neighbor);
            }
            
            var tentative_g_score = g_score.get(current) + 1.0;
            if(tentative_g_score >= g_score.get(neighbor)){
                continue;
            }
            
            came_from.set(neighbor, current);
            g_score.set(neighbor, tentative_g_score);
            f_score.set(neighbor, g_score.get(neighbor) + heuristic_cost_estimate(neighbor, goal));
        }
    }
    
    return [];
}

function reconstruct_path(came_from, current){
    var total_path = [current];
    while(came_from.has(current)){
        current = came_from.get(current);
        total_path.push(current);
    }
    
    return total_path.reverse();
}

function heuristic_cost_estimate(start, goal){
    return 1.0 - (1.0/start.neighbors.size > 0 ? start.neighbors.size : 1);
}

function dist_between(start, goal){
    return 1.0;
}

module.exports = {
  "Graph": Graph,
  "Vertex": Vertex,
  "Edge": Edge
};