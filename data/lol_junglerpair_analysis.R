# LoL
# Jungler pairs 

df <- read.csv(file.choose())
df$champ1 <- as.character(df$champ1)
df$champ2 <- as.character(df$champ2)
df$winrate <- as.numeric(df$winrate)
df$n_games <- as.numeric(df$n_games)
summary(df)

# Are champions mentioned in champ1 and champ2 columns?
champ1_list <- unique(df$champ1)
champ2_list <- unique(df$champ2)
champ1_list == champ2_list

# Make datset longer - every champion should be listed in champ1
df_long <- df[1,]
df_long <- rbind(df_long, c(df[1,]$champ2, df[1,]$champ1, df[1,]$winrate, df[1,]$n_games))
for (i in 2:nrow(df)) {
  currentRow <- df[i,]
  newRow <- c(currentRow$champ2, currentRow$champ1, currentRow$winrate, currentRow$n_games)
  df_long <- rbind(df_long, currentRow, newRow)
}
df_long <- df_long[order(df_long$champ1, df_long$champ2) , ] # sort
View(df_long)
df_long$winrate <- as.numeric(df_long$winrate)
df_long$n_games <- as.numeric(df_long$n_games)

# What's the spread of each champion's average wins? 
champ_df <- as.data.frame(df_long %>% group_by(champ1) %>% 
                            summarise(n_distinctPairs=n(), avg_win=mean(winrate), min_win=min(winrate), max_win=max(winrate), ngames=sum(n_games), ngames_above50=sum(n_games>=50)))
summary(champ_df)
View(champ_df)
sample <- subset(df_long, df_long$champ1==11)
View(sample)

# Write long df 
write.csv(df_long, 'jungler_pair_long.csv')
