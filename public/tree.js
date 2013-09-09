// visualize tree using D3, see: http://bl.ocks.org/mbostock/4339083
var drawTree = function(treedata) {
  var margin = {top: 20, right: 20, bottom: 20, left: 70},
      width = 1960 - margin.right - margin.left,
      height = 800 - margin.top - margin.bottom,
      depth = 100;
      
  var i = 0,
      duration = 750,
      root;
  
  var tree = d3.layout.tree()
      .size([height, width]);
  
  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });
  
  // first remove if any
  d3.select("svg").remove();
  var svg = d3.select("#tree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  root = treedata;
  root.x0 = height / 2;
  root.y0 = 0;
  
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  
  //root.children.forEach(collapse);
  update(root);
  
  
  d3.select(self.frameElement).style("height", "800px");
  
  function update(source) {
  
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);
  
    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * depth; });
  
    // Update the nodes
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });
  
    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", click);
  
    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    var rootMoves = [];        
    nodeEnter.append("text")
        .attr("id", function(d) { return d.parent ? 'childnode' + d.id : 'rootnode'; })
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .style("fill-opacity", 1e-6)
        .text(function(d) {
          if (!d.parent && d.name) {
            d.name.split(',').forEach(function(m, idx) {
              var n = Math.floor(idx/2);
              if (!rootMoves[n]) rootMoves[n] = n+1;
              rootMoves[n] += ' ' + m;
            });
            return '';
          }
          return d.name;
        });
    rootMoves.forEach(function(e, idx) {
        var dy = idx == 0 ? -4*(rootMoves.length-1) + '' : '10';
        var x = -10;
        if (!treedata.children) {
          x = -60;
        } else if (idx === rootMoves.length-1 && treedata.name &&
            (treedata.name.split(',').length % 2 === 1)) {
          x = -33;
        }
        d3.select('#rootnode').append('tspan')
            .text(e)
            .style("font-weight", "bold")
            .attr('x', x)
            .attr('dy', dy);
    
    });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
  
    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
  
    nodeUpdate.select("text")
        .style("fill-opacity", 1);
  
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();
  
    nodeExit.select("circle")
        .attr("r", 1e-6);
  
    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
  
    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });
  
    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });
  
    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);
  
    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();
  
    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }
  
  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }
};
