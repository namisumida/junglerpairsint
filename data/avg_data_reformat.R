# Reformat avg_data 

input <- read.csv(file.choose())
View(input)

js_file <- input
js_file$champ <- paste(paste("{champ: '", js_file$champ, sep=""), "'", sep="")
js_file$winrate <- paste(paste('winrate:', js_file$winrate), "},")

write.csv(js_file, 'jungle_winrates_overall_js.csv', row.names = FALSE)

