var rowConverter = function(d) {
  return {
    champ: d.champ,
    winrate: parseFloat(d.winrate)
  };
};

var avg_data;

d3.csv('data/jungle_winrates_overall.csv', rowConverter, function(data) {

  avg_data = data;

});
