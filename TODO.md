# TODO feature list:

Below is a collection of improvements to the app which are being considered.

# General improvements

- iPhone layout
- Link to GitHub readme or embedded instructions on adding own data

# Matches

- Way of visually grouping games together by month (GroupableMixin)
- Support for upcoming match fixtures (don't count towards stats but are displayed in match listing with no score and kick off time, pitch)

# Players

- Ability to filter who can be considered in the table (perhaps even use cross filter):
   - Player name
   - Last played
   - Players who have played x amount of games
   - Only matches in a given period
- People who havent played recently drop off the list
- Player statistics details page containing some graphs and charts about their recent games
- Add statistics confidence to each player which would simply be based on how many games they have played against who has played the most. Somebody with one win might have been a fluke. Somebody with 18 on hte other hand is not as likely a fluke.

# Statistics

- Plays per month per player, graphed (github punchcard)
- Home vs away scores graphed (bar or line)
- Played together the most (text)
- Player counts per match over time (bar graph)
- Correlation between goals and wins (scatter graph)
- Look at switching to an ember charts libary

# Backend

- Investigate using Ember Data and the Fixture Adapter to manage items
- Refactor the models in the system
    - Separate into following models: Match, Player and MatchPlayed models:
    - "Unwind" the matches played by each player into a denormalised table of data. This would make reporting easier as you can essentially run SQL-like group by queries with aggregations.

# Team builder

- You tell it who is playing.
- It then uses the winPct to try make two balanced teams.
- Can manually adjust the teams and it will tell you what the win percentage for each team is.
- Give you a prediction of what the score will be based on te aggregated goal stats for each team.
- Give you who is likely to win.