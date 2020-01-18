// Define SVG attributes
var width = parseInt(d3.select('#scatter')
    .style("width"));

var height = width * 2/3;
var margin = 10;
var labelArea = 110;
var padding = 45;

// Create SVG object 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Labels for axes
// Add first g - tag for x axis text 
svg.append("g")
    .attr("class", "xText");

var xText = d3.select(".xText");

// Transform to adjust for Text
var TextX =  (width - labelArea)/2 + labelArea;
var TextY = height - margin - padding;
xText.attr("transform",
    `translate(${TextX}, ${TextY})`
    );

// x-axis Text
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

// y-axis text
svg.append("g")
    .attr("class", "yText");

    var yText = d3.select(".yText");

// Transform to adjust for yText
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",
    `translate(${leftTextX}, ${leftTextY})rotate(-90)`
    );

// Build yText details (css class)
yText .append("text")
    .attr("y", -22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Lacks Healthcare (%)");

yText .append("text")
    .attr("y", 22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Obese (%)");

yText .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");


    
// Define Circles
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

// Read in data 
d3.csv("assets/data/data.csv").then(function(data) {
    //console.log(data[0])
    visuals(data);
});

function visuals (myData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   // Current X & Y default selections
   var currentX = "poverty";
   var currentY = "healthcare";

  // Update upon axis option clicked
    function  labelUpdate(axis, clickText) {
        // Switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        // switch the text just clicked to active
        clickText.classed("inactive", false).classed("active", true);
        }

    // Find the data max & min values for scaling
    function xMinMax() {
      xMin = d3.min(myData, function(d) {
        return parseFloat(d[currentX]) * 0.85;
      });
      xMax = d3.max(myData, function(d) {
        return parseFloat(d[currentX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(myData, function(d) {
        return parseFloat(d[currentY]) * 0.85;
      });
      yMax = d3.max(myData, function(d) {
        return parseFloat(d[currentY]) * 1.15;
      }); 
    }

    // Scatter plot X & Y axis computation
    xMinMax();
    yMinMax();

    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    // Create scaled X and Y axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);


    // append axis to the svg as group elements
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    // Append the circles for each row of data
    var allCircles = svg.selectAll("g allCircles").data(myData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
       
        // Apply state text on circles 
        allCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              // Push text to center 
              return yScale(d[currentY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })


          // Dynamic graph on click
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              // Select inactive
              if (self.classed("inactive")) {
                // Obtain name and axis (label)
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  currentX = name;

                  // Update min and max of domain (x)
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  
                  // Update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[currentX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return xScale(d[currentX])                          
                        });
                  });          
                  // Update
                  labelUpdate(axis, self);
                }

                 // Update for Y axis selection 
                else {
                  currentY = name;

                  // Update min and max of range (y)
                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);

                  // Update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return yScale(d[currentY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {
                           // Center text
                            return yScale(d[currentY]) + cRadius/3;                          
                        });
                  });

                  // change the classes of to active and the clicked label
                  labelUpdate(axis, self);
                }
              }
          });
}