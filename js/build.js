var svg = d3.select("#graphic-svg");
var w_svg = document.getElementById("graphic-svg").getBoundingClientRect().width;
var margin = { left: 5, right: 40, top: 60, bottom: 0 }
var graphicMargin = { w:(w_svg-margin.left-margin.right), w_names:90, btwn_names:15, h_col:13, h_btwn:5 };
var w_dotLine = graphicMargin.w-graphicMargin.w_names-graphicMargin.btwn_names;

// Datasets
var rowConverter = function(d) {
  return {
    champ1: d.champ1,
    champ2: d.champ2,
    winrate: parseFloat(d.winrate),
    n_games: parseInt(d.n_games)
  }
};

// Scale
var xScale_win = d3.scaleLinear()
                   .domain([0,1])
                   .range([80, w_dotLine]);

// Slider
var sliderValue = parseInt(d3.select(".slider").node().value);

// Text wrap function
function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.3, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0, //parseFloat(text.attr("dy")),
        tspan = text.text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
        }
    }
  });
}; // end wrap function

function wrapChampion(text) {
  text.each(function () {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.3, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0, //parseFloat(text.attr("dy")),
        tspan = text.text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
    var champNameLength = tspan.text(currChampionName + "'s").node().getComputedTextLength();
    if (champNameLength < 45) {
      var width = 45;
    }
    else { var width = champNameLength; }
    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
        }
    }
  });
}; // end wrap function

// Colors
var green = "green";
var red = d3.rgb(212,89,84);
var gray = d3.color("#a19da8");
var dark_gray = d3.rgb(100,100,100);
var dotColor = d3.color("#f6bba8");
var highlightColor = d3.rgb(79,39,79);
var light_gray = d3.rgb(200,200,200);

function setup() {
    // Initial setting
    sort = "win";
    updateChampion("Nunu");
    updateData();

   // Create base elements
   svg.append("line")
       .attr("class", "midline")
       .attr("x1", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg))
       .attr("x2", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg))
       .attr("y1", margin.top)
       .attr("y2", margin.top + (graphicMargin.h_col + graphicMargin.h_btwn)*(nPairs-1) + graphicMargin.h_col/2)
       .style("stroke", gray);
   svg.append("text")
      .text("Paired with...")
      .attr("x", graphicMargin.w_names)
      .attr("y", margin.top-25)
      .attr("class", "dataLabel")
      .attr("id", "nameDataLabel")
      .call(wrap, 50)
      .style("text-anchor", "end");
   svg.append("text")
      .text("# of games played")
      .attr("x", graphicMargin.w_names + graphicMargin.btwn_names)
      .attr("y", margin.top-25)
      .attr("class", "dataLabel")
      .attr("id", "nGamesDataLabel")
      .style("text-anchor", "start")
      .call(wrap, 80);
   svg.append("text")
      .text(currChampionName + "'s win rate")
      .attr("x", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg))
      .attr("y", margin.top-25)
      .attr("class", "dataLabel")
      .attr("id", "avgDataLabel")
      .call(wrapChampion);
   svg.append("text")
      .text("Paired win rate")
      .attr("x", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+champ_subset[0].winrate.toFixed(2)))
      .attr("y", margin.top-25)
      .attr("class", "dataLabel")
      .attr("id", "pairDataLabel")
      .call(wrap, 50);
   // Pairs
   pairGroup = svg.selectAll("pairGroup")
                   .data(champ_subset)
                   .enter()
                   .append("g")
                   .attr("class", "pairGroup")
                   .attr("transform", "translate(0," + margin.top + ")");
   dotGroup = pairGroup.append("g")
                       .attr("class", "dotGroup");
   nameGroup = pairGroup.append("g")
                        .attr("class", "nameGroup");
   dotGroup.append("rect") // to allow clickability between name and rect
            .attr("class", "background")
            .attr("id", "dotBackground")
            .attr("x", graphicMargin.w_names)
            .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
            })
            .attr("width", w_dotLine+graphicMargin.btwn_names+margin.right)
            .attr("height", graphicMargin.h_col);
   dotGroup.append("rect")
            .attr("class", "pairBar")
            .attr("width", function(d) {
              return xScale_play(d.n_games);
            })
            .attr("height", graphicMargin.h_col)
            .attr("x", graphicMargin.w_names + graphicMargin.btwn_names)
            .attr("y", function(d,i) {
              return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
            })
            .style("fill", light_gray)
            .style("opacity", 0.3);
   nameGroup.append("rect")
            .attr("class", "background")
            .attr("id", "nameBackground")
            .attr("x", 0)
            .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
            })
            .attr("width", graphicMargin.w_names)
            .attr("height", graphicMargin.h_col);
   nameGroup.append("text")
            .attr("class", "pairNameText")
            .text(function(d) {
              return "+ " + d.champ2;
            })
            .attr("x", graphicMargin.w_names)
            .attr("y", function(d,i) {
              return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +3;
            });
   dotGroup.append("rect")
             .attr("class", "dotDistance")
             .attr("x", function(d) {
               var winRate = +(d.winrate).toFixed(2)
               if (winRate > currAvg) {
                 return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg);
               }
               else {
                 return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+(winRate).toFixed(2));
               }
             })
             .attr("y", function(d,i) {
               return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2-1;
             })
             .attr("height", 2)
             .attr("width", function(d) {
               return Math.abs(xScale_win(+(d.winrate).toFixed(2))-xScale_win(currAvg));
             });
   dotGroup.append("circle") // average dot
            .attr("class", "avgDot")
            .attr("cx", function(d) {
              return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg);
            })
            .attr("cy", function(d,i) {
              return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2;
            })
            .attr("r", 4)
            .style("fill", highlightColor);
   dotGroup.append("circle") // pair dot
            .attr("class", "pairDot")
            .attr("cx", function(d) {
              return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+(d.winrate).toFixed(2));
            })
            .attr("cy", function(d,i) {
              return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2;
            })
            .attr("r", 4)
            .style("fill", function(d) {
              var roundedWin = +(d.winrate).toFixed(2);
              if (roundedWin > currAvg) {
                return green;
              }
              else if (roundedWin < currAvg) {
                return red;
              }
              else {
                return dark_gray;
              }
            });
   dotGroup.append("text")
            .attr("class", "countLabel")
            .attr("id", "gamesCountLabel")
            .attr("x", graphicMargin.w_names + graphicMargin.btwn_names + 5)
            .attr("y", function(d,i) {
              return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
            })
            .text(function(d) {
              return d3.format(",")(d.n_games);
            })
            .style("text-anchor", "start")
            .style("fill", "none");
   dotGroup.append("text")
            .attr("class", "countLabel")
            .attr("id", "avgCountLabel")
            .attr("x", function(d) {
              if (+(d.winrate).toFixed(2) > currAvg) {
                return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg) - 8;
              }
              else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg) + 8; };
            })
            .attr("y", function(d,i) {
              return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
            })
            .text(function(d) {
              return d3.format(".0%")(currAvg);
            })
            .style("text-anchor", function(d) {
              if (+(d.winrate).toFixed(2) > currAvg) {
                return "end";
              }
              else { return "start"; };
            })
            .style("fill", "none");
   dotGroup.append("text")
            .attr("class", "countLabel")
            .attr("id", "pairCountLabel")
            .attr("x", function(d) {
              var roundedWin = +(d.winrate).toFixed(2);
              if (roundedWin > currAvg) {
                return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedWin) + 8;
              }
              else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedWin) - 8; };
            })
            .attr("y", function(d,i) {
              return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
            })
            .text(function(d) {
              return d3.format(".0%")(d.winrate);
            })
            .style("text-anchor", function(d) {
              if (+(d.winrate).toFixed(2) > currAvg) {
                return "start";
              }
              else { return "end"; };
            })
            .style("fill", "none");
    // Create line breaks
    svg.selectAll("breakline")
        .data(champ_subset.filter(function(d,i) {
          return (i+1)%5==0;
        })) // this can be any mode, but should be based on the metric
        .enter()
        .append("line")
        .attr("class", "breakline")
        .attr("x1", 0)
        .attr("x2", w_svg)
        .attr("y1", function(d,i) {
          return margin.top + (graphicMargin.h_col+graphicMargin.h_btwn)*(i)*5 - graphicMargin.h_btwn/2;
        })
        .attr("y2", function(d,i) {
          return margin.top + (graphicMargin.h_col+graphicMargin.h_btwn)*(i)*5 - graphicMargin.h_btwn/2;
        });

    updateClick();
    updateSizing();
}; // end set up function

// Import data
var dataset;
d3.csv('data/jungler_pair_long.csv', rowConverter, function(data) {
   // Data
   dataset = data;

   init();

  // INTERACTIVITY
  // Sorting - buttons
  d3.select("#button-alpha").on("click", function() {
    sort = "alpha";
    updateButton(d3.select(this));
    updateData();
    updateGraphic();
  }); // end sorting changes
  d3.select("#button-win").on("click", function() {
    sort = "win";
    updateButton(d3.select(this));
    updateData();
    updateGraphic();
  }); // end sorting changes
  d3.select("#button-play").on("click", function() {
    sort = "play";
    updateButton(d3.select(this));
    updateData();
    updateGraphic();
  }); // end sorting changes

  // Slider
  d3.select(".slider").on("input", function() {
    // update slider display
    sliderValue = parseInt(d3.select(this).node().value);
    document.getElementById("slider-instructions").innerHTML = "Show pairs with at least " + d3.format(",")(sliderValue) + " games played:";

    updateData();
    updateGraphic();
  }); // end on change slider function

  // Search bar
  // champion names for search bar
  var championNameList = [];
  for (var i=0; i<(avg_data.length); i++) { // get a list of all champions
    championNameList.push(avg_data[i].champ);
  }; // end for loop
  autocomplete(document.getElementById("searchbar"), championNameList); // autocomplete function

}); // end d3.csv function

// psuedocode for basic resize structure
function resize() {
  // Get width and update scales/margins/sizes
  w_svg = document.getElementById("graphic-svg").getBoundingClientRect().width;
  graphicMargin = { w:(w_svg-margin.left-margin.right), w_names:90, btwn_names:15, h_col:13, h_btwn:5 };
  w_dotLine = graphicMargin.w-graphicMargin.w_names-graphicMargin.btwn_names;
  xScale_win = d3.scaleLinear()
                 .domain([0,1])
                 .range([80, w_dotLine]);
  xScale_play = d3.scaleLinear()
                   .domain([0, d3.max(champ_subset, function(d) { return d.n_games; })])
                   .range([0, d3.min([xScale_win(currAvg), (w_dotLine-xScale_win(currAvg))])]);
  updateGraphicResizing();
}; // end resize function

function init() {
  // call setup once on page load
  setup()
  // call resize once on page load
  resize()

  // setup event listener to handle window resize
  window.addEventListener('resize', resize);
}; // end init function
