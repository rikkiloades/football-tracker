App = Ember.Application.create({
	matches: [],
	players: [],
	ready: function() {
		this.computePlayerStats();
	},
	computePlayerStats: function() {
		var players = {};

		function getPlayer(name)
		{
			if (players.hasOwnProperty(name)) {
				return players[name];
			}

			var newPlayer = App.Player.create({
				name: name,
				results: [],
				goalsFor: 0,
				goalsAgainst: 0
			});

			players[name] = newPlayer;

			return newPlayer;
		}

		this.get('matches').forEach(function(match) {
			match.goals = match.teams[0].score + match.teams[1].score;
			match.winningGoalDiff = Math.abs(match.teams[0].score - match.teams[1].score);

			match.teams[0].players.forEach(function(playerName) {
				var player = getPlayer(playerName);

				player.incrementProperty('goalsFor', match.teams[0].score);
				player.incrementProperty('goalsAgainst', match.teams[1].score);
				
				if (match.teams[0].score > match.teams[1].score) {
					player.get('results').push('win');
				}
				else if (match.teams[0].score < match.teams[1].score) {
					player.get('results').push('loss');
				}
				else {
					player.get('results').push('draw');
				}

				var lastPlayed = moment(match.date, 'YYYY-MM-DD HH:mm:ss').toDate();
				player.set('lastPlayed', lastPlayed);
			});

			match.teams[1].players.forEach(function(player) {
				var player = getPlayer(player);

				player.incrementProperty('goalsFor', match.teams[1].score);
				player.incrementProperty('goalsAgainst', match.teams[0].score);
				
				if (match.teams[1].score > match.teams[0].score) {
					player.get('results').push('win');
				}
				else if (match.teams[1].score < match.teams[0].score) {
					player.get('results').push('loss');
				}
				else {
					player.get('results').push('draw');
				}

				var lastPlayed = moment(match.date, 'YYYY-MM-DD HH:mm:ss').toDate();
				player.set('lastPlayed', lastPlayed);
			});
		});

		for (var i in players ) {
			this.players.unshift(players[i]);
		}
	}
});

App.Player = Ember.Object.extend({
	urlSlug: function() {
		return this.get('name').toLowerCase().replace(/\s/g, '-').replace(/[^a-z\-]+/ig, '');
	}.property('name'),
	
	lastFiveResults: function() {
		return this.get('results').slice(-5);
	}.property('results'),
	
	matches: function() {
		return this.get('results').length;
	}.property('results'),

	wins: function() {
		var wins = 0;
		this.get('results').forEach(function(result) {
			if (result == 'win') {
				wins++;
			}
		});

		return wins;
	}.property('results'),

	losses: function() {
		var losses = 0;
		this.get('results').forEach(function(result) {
			if (result == 'loss') {
				losses++;
			}
		});

		return losses;
	}.property('results'),
	
	draws: function() {
		var draws = 0;
		this.get('results').forEach(function(result) {
			if (result == 'draw') {
				draws++;
			}
		});

		return draws;
	}.property('results'),
	
	points: function() {
		var points = 0;

		points += this.get('wins') * 3;
		points += this.get('draws') * 1;

		return points;
	}.property('wins', 'draws'),
	goalsDiff: function() {
		return this.get('goalsFor') - this.get('goalsAgainst');
	}.property('goalsFor', 'goalsAgainst')
});

App.Router.map(function() {
 	this.resource('matches', {path: '/'}, function() {
 		this.resource('match', {path: '/matches/:match_id'});
 	});

 	this.resource('players', function() {
 		this.resource('player', {path: '/:player_url_slug'});
 	});

 	this.route('table');

 	this.route('stats');
});

App.MatchesRoute = Ember.Route.extend({
	model: function() {
		return App.matches;
	}
});

App.MatchesController = Ember.ArrayController.extend({
	sortProperties: ['date'],
	sortAscending: false
});

App.MatchesIndexRoute = Ember.Route.extend({
	redirect: function () {
		var latestItem = this.modelFor('matches').get('lastObject');
		this.replaceWith('match', latestItem);
	}
});

App.MatchRoute = Ember.Route.extend({
	model: function(params) {
		var match = Ember.A(App.matches).findBy('id', parseInt(params.match_id));
		return match;
	}
});

App.PlayersRoute = Ember.Route.extend({
	model: function() {
		return App.players;
	}
});

App.PlayersController = Ember.ArrayController.extend({
	sortColumns: {
		matches: false,
		wins: false,
		draws: false,
		losses: false,
		points: true,
		goalsFor: false,
		goalsAgainst: false,
		goalsDiff: false
	},
	sortProperties: ['points'],
	sortAscending: false,
	actions: {
		sort: function(property) {
			for (var col in this.get('sortColumns')) {
				if (col == property) {
					this.set('sortColumns.' + col, true);
					this.set('sortProperties', [col]);
				}
				else {
					this.set('sortColumns.' + col, false);
				}
			}
		}
	}
});

App.PlayerRoute = Ember.Route.extend({
	model: function(params) {
		var match = this.modelFor('players').findBy('urlSlug', params.player_url_slug);
		return match;
	}
});

App.StatsController = Ember.ObjectController.extend({
	goalsOverTime: function() {
		var matchGoals = [];
		
		App.get('matches').forEach(function(match) {
			matchGoals.push({
				x: moment(match.date, 'YYYY-MM-DD HH:mm:ss').toDate(),
				y: match.goals
			});
		});

		return matchGoals;
	}.property('App.matches.@each.goals'),

	goalsDiffOverTime: function() {
		var matchGoals = [];
		
		App.get('matches').forEach(function(match) {
			matchGoals.push({
				x: match.id,
				y: match.winningGoalDiff
			});
		});

		return matchGoals;
	}.property('App.matches.@each.goals'),

	playerCountOverTime: function() {
		var playerCounts = [];
		
		App.get('matches').forEach(function(match) {
			playerCounts.push({
				x: moment(match.date, 'YYYY-MM-DD HH:mm:ss').toDate(),
				y: match.teams[0].players.length + match.teams[1].players.length
			});
		});

		return playerCounts;
	}.property('App.matches')
});

App.BarChartComponent = Ember.Component.extend({
	tagName: 'svg',
	attributeBindings: ['height'],
	height: 300,
	
	didInsertElement: function() {
		var data = [
			{
				values: this.get('data')
			}
		];

		var elementId = this.get('elementId');

		nv.addGraph(function() {
			var chart = nv.models.discreteBarChart()
				.x(function(d) { return d.x })
				.y(function(d) { return d.y })
				.color(['#0099ff'])
				.tooltips(false)
				.showValues(true)
				.valueFormat(d3.format('d'))
				.staggerLabels(true);

			chart.yAxis
				.tickFormat(d3.format('d'));

			chart.xAxis
				.tickFormat(d3.time.format('%e %b'));

			d3.select('#' + elementId)
				.datum(data)
				.transition().duration(500)
				.call(chart);

			nv.utils.windowResize(chart.update);

			return chart;
		});
	}
});

App.LineChartComponent = Ember.Component.extend({
	tagName: 'svg',
	attributeBindings: ['height'],
	height: 300,
	
	didInsertElement: function() {
		var data = [
			{
				values: this.get('data'),
				color: '#0099ff'
			}
		];

		var elementId = this.get('elementId');

		nv.addGraph(function() {
			var chart = nv.models.lineChart();

			chart.yAxis
				.tickFormat(d3.format('d'));

			chart.xAxis
				.tickFormat(function(d) { return ''; });

			d3.select('#' + elementId)
				.datum(data)
				.transition().duration(500).call(chart);

			nv.utils.windowResize(function() {
				chart.update();
			});

			return chart;
		});
		
	}
});

Ember.Handlebars.helper('fxdate', function(value, options) {
	return moment(value, 'YYYY-MM-DD HH:mm:ss').format('Do MMM');
});

Ember.Handlebars.helper('fxtime', function(value, options) {
	return moment(value, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
});

Ember.Handlebars.helper('fxpct', function(value, options) {
	return Math.round(parseFloat(value) * 100) + '%';
});

Ember.Handlebars.helper('fxround', function(value, options) {
	return Math.round(value);
});
