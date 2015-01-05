/*

References:

Adapting from web to command line:
http://www.pyktech.com/blog/150/

But instead of US map, use world map:
http://bl.ocks.org/mbostock/4180634

Plotting points on a map with D3
http://stackoverflow.com/questions/20987535/plotting-points-on-a-map-with-d3

List of cities:
http://techslides.com/list-of-countries-and-capitals/

*/


//require modules
var d3 = require("d3");
require("d3-geo-projection")(d3);
var fs = require("fs");
var vm = require('vm');

//import topojson.js client side API
var includeInThisContext = function(path) {
 var code = fs.readFileSync(path);
 vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext("topojson.js");

//SVG dimensions
var width = 960,
 height = 500;

//scale for county-population-based fill
var fill = d3.scale.log()
 .domain([10, 500])
 .range(["brown", "steelblue"]);

var path = d3.geo.path();

var svg = d3.select("body")
	.append("svg")
 	.attr('xmlns', 'http://www.w3.org/2000/svg')
 	.attr("width", width)
 	.attr("height", height);

var projection = d3.geo.kavrayskiy7()
    .scale(170)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

//the svg file seems to be ok even without these defs and uses
svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

//parse map and other data JSON files
//var us = JSON.parse(fs.readFileSync("us.json", 'utf8'));
var world = JSON.parse(fs.readFileSync("world-50m.json", 'utf8')),
	//places = JSON.parse(fs.readFileSync("country-capitals.json", 'utf8'));
		places = JSON.parse(fs.readFileSync("2014.json", 'utf8'));

var countries = topojson.feature(world, world.objects.countries).features,
	neighbors = topojson.neighbors(world.objects.countries.geometries);

var color = d3.scale.category10();

// draw world map using data from world-50m.json
svg.append("g")
 .attr("class", "country")
 .selectAll("path")
 .data(topojson.feature(world, world.objects.countries).features)
 .enter().append("path")
 .attr("d", path)
//fill based on area
// .style("fill", function(d) { return fill(path.area(d)); });
//fill with different colors, but doesn't work now..
  .style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); });


/*
//enter the counties
svg.append("g")
 .attr("class", "counties")
 .selectAll("path")
 .data(topojson.feature(us, us.objects.counties).features)
 .enter().append("path")
 .attr("d", path)
 .style("fill", function(d) { return fill(path.area(d)); });

//outline the states
svg.append("path")
 .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a.id !== b.id; }))
 .attr("class", "states")
 .attr("d", path);
*/

//Plot long,lat
//Not used now, as data is read from file
/*
var places = [
  {
    name: "Wollongong, Australia",
    location: {
      latitude: -34.42507,
      longitude: 150.89315
    }
  },
  {
    name: "Newcastle, Australia",
    location: {
      latitude: -32.92669,
      longitude: 151.77892
    }
  }
]
*/

// then draw cities as circles (points)
svg.selectAll(".pin")
  .data(places)
  .enter().append("circle", ".pin")
  .attr("r", 0.5)
  .style("fill", "red")
  .attr("transform", function(d) {
    return "translate(" + projection([
/*      d.location.longitude,
      d.location.latitude
*/
	d.CapitalLongitude, d.CapitalLatitude
    ]) + ")"
  });

svg.selectAll(".pin")
  .data(places)
  .enter()
  .append("svg:text")
  .style("font-size", "2")
  .style("font-family", "Helvetica, Arial, sans-serif")
  .style("fill", "white")
  .style("stroke-width ", "0.5")
  .style("stroke", "#000000")
    .text(function(d){
        return d.Order;
    })
  .attr("transform", function(d) {
    return "translate(" + projection([
	d.CapitalLongitude, d.CapitalLatitude
    ]) + ")"
  });

//Append text to map
// but text positioning is still wrong.. so commented out.
/*
svg.selectAll("path")
  .data(places)
    .enter()
    .append("path")
    .attr("d", path)

svg.selectAll("text")
  .data(places)
    .enter()
    .append("svg:text")
    .text(function(d){
        return d.CapitalName;
    })
    .attr("x", function(d){
        return path.centroid(d)[0];
    })
    .attr("y", function(d){
        return  path.centroid(d)[1];
    })
    .attr("text-anchor","middle")
    .attr('font-size','100pt');
*/

//add css stylesheet
var svg_style = svg.append("defs")
 .append('style')
 .attr('type','text/css');

//text of the CSS stylesheet below -- note the multi-line JS requires 
//escape characters "\" at the end of each line

var css_text = "<![CDATA[ \
      .states { \
          fill: none; \
          stroke: #fff; \
          stroke-linejoin: round; \
      } \
  ]]> ";

svg_style.text(css_text);

//print to stdout
console.log(d3.select('body').html());