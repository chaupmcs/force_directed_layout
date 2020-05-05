// get the data
let r_node_factor = 40;
let edge_factor = 3;
let force, links, paths, node_;
let nodes = {};

d3.csv("network_titanic.csv", function (error, data) {

    links = data;

// get all nodes from the data.
    links.forEach(function (link) {
        link.source = nodes[link.source] ||
            (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] ||
            (nodes[link.target] = {name: link.target});
        link.value = +link.value;
    });


    var width = window.innerWidth,
        height = window.innerHeight;

    force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(500)
        .charge(-300)
        .on("tick", tick)
        .start();

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

// build the arrow.
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

// add the links and the arrows
    paths = svg.append("g");
    var path = paths.selectAll("path")
        .data(force.links(), d => d.source.name + d.target.name)
        .enter().append("path")
        //    .attr("class", function(d) { return "link " + d.type; })
        .attr("class", "link")
        .attr("marker-end", "url(#end)");

// define the nodes
    node_ = svg.selectAll(".node");
    let node = node_.data(force.nodes(), d => {
            console.log("d", d);
            return d.name
        })
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

// add the nodes
    node.append("circle")
        .attr("r", function (d) {
            let name = d.name;
            let pps_list = links.filter(x => x.source.name == name && x.target.name != name).map(x => x.value);
            let sum_of_pps = pps_list.reduce(function (a, b) {
                return a + b;
            }, 0);
            return Math.sqrt(sum_of_pps * r_node_factor);
            // return 5;

        });

// add the text
    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name;
        });

// add the curvy lines
    function tick() {
        path
            .style("stroke-width", function (d) {
                return (d.value) * edge_factor;
            })
            .attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" +
                    d.source.x + "," +
                    d.source.y + "A" +
                    dr + "," + dr + " 0 0,1 " +
                    d.target.x + "," +
                    d.target.y;
            });

        node
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

});

$(document).on('input', '#slider', function () {
    let thres = $(this).val() / 10;
    $('#slider_value').html(thres);
    applyFilter(thres);
});


function applyFilter(thres) {
    // force.nodes(nodes.filter(nodeHavingEdges));
    force.links(links.filter(x => x.value > thres));


    update();
    force.alpha(0.6);


}

function update() {

    // update the data for the lines:
    var path = paths.selectAll("path")
        .data(force.links(), d => d.source.name + d.target.name);


    // enter new lines:
    path.enter().append("path")
        .attr('class', 'link')
        .attr("marker-end", "url(#end)")
        .style("stroke-width", function (d) {
            return (d.value) * edge_factor;
        })
        .attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

    // exit unneeded lines:
    path.exit().transition().style("opacity", 0).remove();


    let node_cirlce = node_.data(force.nodes(), d => {
        console.log("d__", d.name);
        return d.name
    });
    let node= node_cirlce
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .call(force.drag);

// add the nodes
    node.append("circle")
        .attr("r", function (d) {
            let name = d.name;
            let pps_list = links.filter(x => x.source.name == name && x.target.name != name).map(x => x.value);
            let sum_of_pps = pps_list.reduce(function (a, b) {
                return a + b;
            }, 0);
            return Math.sqrt(sum_of_pps * r_node_factor);
            // return 5;

        });

// add the text
    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name;
        });

    node_cirlce.exit().transition().style("opacity", 0).remove();


}