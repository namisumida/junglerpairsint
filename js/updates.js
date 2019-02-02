// Scales
var xScale_play;
var updatexScale_play = function(subset) {
  var maxDistance = d3.min([xScale_win(currAvg), (w_dotLine-xScale_win(currAvg))]);
  xScale_play = d3.scaleLinear()
                   .domain([0, d3.max(subset, function(d) { return d.n_games; })])
                   .range([0, maxDistance]);
};
var searchedChampion;
// Search bar functions
function autocomplete(inp, arr) {
/*the autocomplete function takes two arguments,
the text field element and an array of possible autocompleted values:*/
  var currentFocus;
/*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += '<input type="hidden" value="' + arr[i] + '">';
        /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:
            Run update on graphic */
            closeAllLists();
            updateChampion("+ "+inp.value);
            updateData();
            updateGraphic();
            document.getElementById("searchbar").value="";
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        save old variable
        increase the currentFocus variable:*/
        old = currentFocus;
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
        if (old > -1) {
          x[old].style.color = d3.rgb(79,39,79);
          x[old].style.backgroundColor = d3.color("#fff");
        }
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        old = currentFocus;
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
        if (old > -1) {
          x[old].style.color = d3.rgb(79,39,79);
          x[old].style.backgroundColor = d3.color("#fff");
        }
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  }); // end add event listener
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
    x[currentFocus].style.color = "white";
    x[currentFocus].style.backgroundColor = d3.rgb(79,39,79);
  }; // end addActive

  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }; // end removeActive

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }; // end closeAllLists
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
    document.getElementById("searchbar").value="";
  });
}; // end autocomplete

// Update slider - when a new champion is selected
var updateSlider = function() {
  var slider = d3.select(".slider");
  var previousValue = parseInt(slider.node().value); // save previous value
  var subset = dataset.filter(function(d) { return d.champ1 == currChampionName; })
  var subset_max = d3.max(subset, function(d) { return d.n_games; });
  // Update slider to new min and max
  document.getElementById("slider").min = d3.min(subset, function(d) { return d.n_games; });
  document.getElementById("slider").max = subset_max;
  // Update slider text
  var newMin = document.getElementById("slider").min;
  if (previousValue < newMin) { // if previous is smaller than new/current min, change text
    document.getElementById("slider-instructions").innerHTML = "Show pairs with at least " +newMin+ " games played:"
  };
};

// Function to update champion - this only includes stuff when the champion is fixed
var updateChampion = function(champ) {
  currChampionName = champ.replace("+ ", ""); // set champ name
  // Get average
  var avgDataRow = avg_data.filter(function(d) { return d.champ == currChampionName; })[0];
  currAvg = +(avgDataRow.winrate).toFixed(2);
  updateSlider();
  // update champ subset for now
  champ_subset = dataset.filter(function(d) { return d.champ1 == currChampionName; });
  // Update xScales
  updatexScale_play(champ_subset);
}; // end update champion

var updateData = function() {
  // Get subset
  champ_subset = dataset.filter(function(d) { return d.champ1 == currChampionName & d.n_games>=sliderValue; });
  if (sort == "win") {
    champ_subset.sort(function(a,b) { return d3.descending(a.winrate, b.winrate); })
  }
  else if (sort == "alpha") {
    champ_subset.sort(function(a,b) { return d3.ascending(a.champ2, b.champ2); })
  }
  else {
    champ_subset.sort(function(a,b) { return d3.descending(a.n_games, b.n_games); })
  }
  // Update nPairs
  nPairs = champ_subset.length;
}; // end update data

// On click
var updateClick = function() {
  dotGroup.on("mouseover", function(d) {
    var currElement = d3.select(this);
    var currPair = d.champ2;

    currElement.selectAll(".countLabel")
               .style("fill", "black");
    currElement.select(".pairBar")
               .style("fill", dotColor)
               .style("opacity", 0.5);
    currElement.select(".dotDistance")
               .style("opacity", 1);
    d3.selectAll(".pairNameText")
      .filter(function(d) { return d.champ2 == currPair; })
      .style("font-family", "radnika-bold");
  })
  .on("mouseout", function(d) {
    // Remove on click attributes for all (mainly previously clicked element)
    var currElement = d3.select(this);
    currElement.selectAll(".countLabel")
               .style("fill", "none");
    currElement.select(".pairBar")
               .style("fill", light_gray)
               .style("opacity", 0.3);
    currElement.select(".dotDistance")
               .style("opacity", 0.5);
    svg.selectAll(".pairNameText")
       .style("font-family", "radnika-regular");
  }); // end on mouseout

  // When a name is selected
  nameGroup.on("click", function(d) {
    var newChampion = d3.select(this)._groups[0][0].textContent;
    updateChampion(newChampion);
    updateData();
    updateGraphic();
  })
  .on("mouseover", function(d) {
    var currElement = d3.select(this);
    currElement.select(".pairNameText").style("font-family", "radnika-bold");
    var currPair = d.champ2;

    var currDotGroup = svg.selectAll(".dotGroup")
                          .filter(function(d) { return d.champ2 == currPair; });

    currDotGroup.selectAll(".countLabel")
                .style("fill", "black");
    currDotGroup.select(".pairBar")
                .style("fill", dotColor)
                .style("opacity", 0.5);
    currDotGroup.select(".dotDistance")
                .style("opacity", 1);
  })
  .on("mouseout", function(d) {
    var currElement = d3.select(this);
    currElement.select(".pairNameText").style("font-family", "radnika-regular");
    var currPair = d.champ2;

    var currDotGroup = svg.selectAll(".dotGroup")
                          .filter(function(d) { return d.champ2 == currPair; });
    currDotGroup.selectAll(".countLabel")
                .style("fill", "none");
    currDotGroup.select(".pairBar")
                .style("fill", light_gray)
                .style("opacity", 0.3);
    currDotGroup.select(".dotDistance")
                .style("opacity", 0.5);
  })
};

// Resizing
var updateSizing = function() {
  var currentHeight = margin.top + (graphicMargin.h_col + graphicMargin.h_btwn)*(nPairs);
  document.getElementById("graphic-svg").style.height = (currentHeight+30) + "px";
}

// update button
var updateButton = function(button) {
  // Update buttons
  var value = button._groups[0][0].value;

  // change button to selected styles
  button.style("background-color", d3.rgb(79,39,79))
        .style("color", "white");

  // assign other button
  if (value == "win") {
    d3.select("#button-alpha").style("background-color", "white")
                             .style("color", d3.rgb(79,39,79));
    d3.select("#button-play").style("background-color", "white")
                             .style("color", d3.rgb(79,39,79));
  }
  else if (value == "play") {
    d3.select("#button-alpha").style("background-color", "white")
                             .style("color", d3.rgb(79,39,79));
    d3.select("#button-win").style("background-color", "white")
                             .style("color", d3.rgb(79,39,79));
  }
  else if (value == "alpha") {
    d3.select("#button-win").style("background-color", "white")
                             .style("color", d3.rgb(79,39,79));
    d3.select("#button-play").style("background-color", "white")
                             .style("color", d3.rgb(79,39,79));
  }

}; // end update button

// Update when changes are made (like a click)
var updateGraphic = function() {

  // Update name text
  document.getElementById("champion-name").innerHTML = currChampionName;
  // Update icon image
  if (currChampionName.includes("'")) {
    var iconURLname = currChampionName.replace("'", "");
  }
  else { iconURLname = currChampionName; }
  //document.getElementById("champion-icon").src = "";

  // Update groups and exit
  pairGroup = svg.selectAll(".pairGroup")
                 .data(champ_subset);
  dotGroup = pairGroup.select(".dotGroup");
  nameGroup = pairGroup.select(".nameGroup");
  dotGroup.exit().remove();
  nameGroup.exit().remove();
  pairGroup.exit().remove();

  // Enter elements
  pairGroupEnter = pairGroup.enter()
                            .append("g")
                            .attr("class", "pairGroup")
                            .attr("transform", "translate(0," + margin.top + ")");
  dotGroupEnter = pairGroupEnter.append("g").attr("class", "dotGroup");
  nameGroupEnter = pairGroupEnter.append("g").attr("class", "nameGroup");
  dotGroupEnter.append("rect") // to allow clickability between name and rect
           .attr("class", "background")
           .attr("id", "dotBackground")
           .attr("x", graphicMargin.w_names)
           .attr("y", function(d,i) {
            return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
           })
           .attr("width", w_dotLine+graphicMargin.btwn_names+margin.right)
           .attr("height", graphicMargin.h_col);
  dotGroupEnter.append("rect")
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
  nameGroupEnter.append("rect")
           .attr("class", "background")
           .attr("id", "nameBackground")
           .attr("x", 0)
           .attr("y", function(d,i) {
            return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
           })
           .attr("width", graphicMargin.w_names)
           .attr("height", graphicMargin.h_col);
  nameGroupEnter.append("text")
           .attr("class", "pairNameText")
           .text(function(d) {
             return "+ " + d.champ2;
           })
           .attr("x", graphicMargin.w_names)
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +3;
           });
  dotGroupEnter.append("rect")
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
  dotGroupEnter.append("circle") // average dot
           .attr("class", "avgDot")
           .attr("cx", function(d) {
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg);
           })
           .attr("cy", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2;
           })
           .attr("r", 4)
           .style("fill", highlightColor);
  dotGroupEnter.append("circle") // pair dot
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
  dotGroupEnter.append("text")
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
  dotGroupEnter.append("text")
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
  dotGroupEnter.append("text")
           .attr("class", "countLabel")
           .attr("id", "pairCountLabel")
           .attr("x", function(d) {
             var roundedAvg = +(d.winrate).toFixed(2);
             if (roundedAvg > currAvg) {
               return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedAvg) + 8;
             }
             else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedAvg) - 8; };
           })
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
           })
           .text(function(d) {
             if (+d.winrate.toFixed(2)!=currAvg) {
               return d3.format(".0%")(d.winrate);
             }
           })
           .style("text-anchor", function(d) {
             if (+(d.winrate).toFixed(2) > currAvg) {
               return "start";
             }
             else { return "end"; };
           })
           .style("fill", "none");

 // Merge
 dotGroup = dotGroup.merge(dotGroupEnter);
 nameGroup = nameGroup.merge(nameGroupEnter);
 pairGroup = pairGroup.merge(pairGroupEnter);

  // Update
  svg.selectAll(".midline")
      .attr("x1", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg))
      .attr("x2", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg))
      .attr("y2", margin.top + (graphicMargin.h_col + graphicMargin.h_btwn)*(nPairs-1) + graphicMargin.h_col/2);

  dotGroup.select("#dotBackground")
           .attr("y", function(d,i) {
            return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
          });
  dotGroup.select(".pairBar")
            .attr("width", function(d) {
              return xScale_play(d.n_games);
            })
           .attr("x", graphicMargin.w_names + graphicMargin.btwn_names)
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
           })
           .style("fill", light_gray)
           .style("opacity", 0.3);
  nameGroup.select("#nameBackground")
           .attr("y", function(d,i) {
            return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
           })
  nameGroup.select(".pairNameText")
           .text(function(d) {
             return "+ " + d.champ2;
           })
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +3;
           })
           .style("font-family", "radnika-regular");
  dotGroup.select(".dotDistance")
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
            .attr("width", function(d) {
              return Math.abs(xScale_win(+(d.winrate).toFixed(2))-xScale_win(currAvg));
            })
            .style("opacity", 0.5);
  dotGroup.select(".avgDot")
           .attr("cx", function(d) {
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg);
           })
           .attr("cy", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2;
           });
  dotGroup.select(".pairDot")
           .attr("cx", function(d) {
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+(d.winrate).toFixed(2));
           })
           .attr("cy", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2;
           })
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
  dotGroup.select("#gamesCountLabel")
           .attr("x", graphicMargin.w_names + graphicMargin.btwn_names + 5)
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
           })
           .text(function(d) {
             return d3.format(",")(d.n_games);
           })
           .style("text-anchor", "start")
           .style("fill", "none");
  dotGroup.select("#avgCountLabel")
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
  dotGroup.select("#pairCountLabel")
           .attr("x", function(d) {
             var roundedAvg = +(d.winrate).toFixed(2);
             if (roundedAvg > currAvg) {
               return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedAvg) + 8;
             }
             else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedAvg) - 8; };
           })
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
           })
           .text(function(d) {
             if (+d.winrate.toFixed(2)!=currAvg) {
               return d3.format(".0%")(d.winrate);
             }
           })
           .style("text-anchor", function(d) {
             if (+(d.winrate).toFixed(2) > currAvg) {
               return "start";
             }
             else { return "end"; };
           })
           .style("fill", "none");

   // Data labels
   var firstRow = champ_subset[0];
   var firstRowDist = xScale_win(+firstRow.winrate.toFixed(2))-xScale_win(currAvg);
   svg.select("#avgDataLabel")
       .text(currChampionName + "'s win rate")
       .attr("x", function() {
         if (Math.abs(firstRowDist) < 30) {
           if (firstRowDist < 0) { // if average is greater than winrate
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg)+5;
           }
           else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg)-5; }
         }
         else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg); }
       })
       .attr("y", margin.top-25)
       .call(wrapChampion)
       .style("text-anchor", function() {
         if (Math.abs(firstRowDist) < 60) {
           if (firstRowDist < 0) { // if average is greater than winrate
             return "start";
           }
           else { return "end"; }
         }
         else { return "middle"; }
       });
   svg.select("#pairDataLabel")
       .text("Paired win rate")
       .attr("x", function() {
         if (Math.abs(firstRowDist) < 30) {
           if (firstRowDist < 0) { // if average is greater than winrate
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+champ_subset[0].winrate.toFixed(2))-5;
           }
           else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+champ_subset[0].winrate.toFixed(2))+5; }
         }
         else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+champ_subset[0].winrate.toFixed(2)); }
       })
       .attr("y", margin.top-25)
       .call(wrap, 50)
       .style("text-anchor", function() {
         if (Math.abs(firstRowDist) < 60) {
           if (firstRowDist < 0) {
             return "end";
           }
           else { return "start"; }
         }
         else { return "middle"; }
       });

   // Create line breaks
   svg.selectAll("breakline")
      .data(champ_subset.filter(function(d,i) {
        return (i+1)%5==0;
      }))
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
}; // end update graphic

// Function for updating when there are resizing changes
var updateGraphicResizing = function() {
  dotGroup.select("#dotBackground")
           .attr("x", graphicMargin.w_names)
           .attr("y", function(d,i) {
            return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
           })
           .attr("width", w_dotLine+graphicMargin.btwn_names+margin.right)
           .attr("height", graphicMargin.h_col);
  dotGroup.select(".pairBar")
           .attr("width", function(d) {
             return xScale_play(d.n_games);
           })
           .attr("height", graphicMargin.h_col)
           .attr("x", graphicMargin.w_names + graphicMargin.btwn_names)
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
           });
  nameGroup.select("#nameBackground")
           .attr("y", function(d,i) {
            return (graphicMargin.h_col+graphicMargin.h_btwn)*i;
           })
           .attr("width", graphicMargin.w_names)
           .attr("height", graphicMargin.h_col);
  nameGroup.select(".pairNameText")
           .attr("x", graphicMargin.w_names)
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +3;
           });
  dotGroup.select(".dotDistance")
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
          .attr("width", function(d) {
            return Math.abs(xScale_win(+(d.winrate).toFixed(2))-xScale_win(currAvg));
          });
  dotGroup.select(".avgDot")
           .attr("cx", function(d) {
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg);
           })
           .attr("cy", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2;
           });
  dotGroup.select(".pairDot")
           .attr("cx", function(d) {
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+(d.winrate).toFixed(2));
           })
           .attr("cy", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2;
           });
  dotGroup.select("#gamesCountLabel")
           .attr("x", graphicMargin.w_names + graphicMargin.btwn_names + 5)
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
           });
  dotGroup.select("#avgCountLabel")
           .attr("x", function(d) {
             if (+(d.winrate).toFixed(2) > currAvg) {
               return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg) - 8;
             }
             else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg) + 8; };
           })
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
           });
  dotGroup.select("#pairCountLabel")
           .attr("x", function(d) {
             var roundedAvg = +(d.winrate).toFixed(2);
             if (roundedAvg > currAvg) {
               return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedAvg) + 8;
             }
             else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(roundedAvg) - 8; };
           })
           .attr("y", function(d,i) {
             return (graphicMargin.h_col+graphicMargin.h_btwn)*i + graphicMargin.h_col/2 +4;
           });

  // Update
  svg.selectAll(".midline")
      .attr("x1", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg))
      .attr("x2", graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg))
      .attr("y2", margin.top + (graphicMargin.h_col + graphicMargin.h_btwn)*(nPairs-1) + graphicMargin.h_col/2);

   // Data labels
   var firstRow = champ_subset[0];
   var firstRowDist = xScale_win(+firstRow.winrate.toFixed(2))-xScale_win(currAvg);
   svg.select("#avgDataLabel")
       .text(currChampionName + "'s win rate")
       .attr("x", function() {
         if (Math.abs(firstRowDist) < 30) {
           if (firstRowDist < 0) { // if average is greater than winrate
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg)+5;
           }
           else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg)-5; }
         }
         else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(currAvg); }
       })
       .call(wrapChampion)
       .style("text-anchor", function() {
         if (Math.abs(firstRowDist) < 60) {
           if (firstRowDist < 0) { // if average is greater than winrate
             return "start";
           }
           else { return "end"; }
         }
         else { return "middle"; }
       });
   svg.select("#pairDataLabel")
       .text("Paired win rate")
       .attr("x", function() {
         if (Math.abs(firstRowDist) < 30) {
           if (firstRowDist < 0) { // if average is greater than winrate
             return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+champ_subset[0].winrate.toFixed(2))-5;
           }
           else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+champ_subset[0].winrate.toFixed(2))+5; }
         }
         else { return graphicMargin.w_names+graphicMargin.btwn_names+xScale_win(+champ_subset[0].winrate.toFixed(2)); }
       })
       .call(wrap, 50)
       .style("text-anchor", function() {
         if (Math.abs(firstRowDist) < 60) {
           if (firstRowDist < 0) {
             return "end";
           }
           else { return "start"; }
         }
         else { return "middle"; }
       });

   // Create line breaks
   svg.selectAll(".breakline")
      .attr("x2", w_svg)
      .attr("y1", function(d,i) {
        return margin.top + (graphicMargin.h_col+graphicMargin.h_btwn)*(i)*5 - graphicMargin.h_btwn/2;
      })
      .attr("y2", function(d,i) {
        return margin.top + (graphicMargin.h_col+graphicMargin.h_btwn)*(i)*5 - graphicMargin.h_btwn/2;
      });
   updateClick();
}; // end update graphic resizing
