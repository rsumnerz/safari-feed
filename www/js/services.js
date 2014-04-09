var safariFeedServices = angular.module('safariFeedServices',[]);

safariFeedServices.

service('mapService', function() {

	var map, updateMarkers = [];

	this.loadMap = function() {
		map = L.map('map');

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
	};

	this.getMapReady = function(zooCenter, zooBounds) {

		map.setView(zooCenter.split(','), 15);

		//Draw rectangle around zoo
		L.rectangle(
			[
				[zooBounds.latMin, zooBounds.longMin],
				[zooBounds.latMax, zooBounds.longMax]
			],
			{
				color: '#f06060',
				stroke: 3,
				fill: false
			}).addTo(map);
	};

	this.addHeatMap = function(updates) {

		var heatmapLayer = new L.TileLayer.HeatCanvas({},{
			'step': 0.5,
	        'degree': HeatCanvas.LINEAR,
	        'opacity': 0.7
	    });

		_.each(updates, function(value, key){	
			
			var currentHour = new moment().hour();
			var updateHour = new moment(value.time).hour();

			if (updateHour === currentHour) {
				if (typeof value.loc.latitude !== 'undefined' &&
					typeof value.loc.longitude !== 'undefined') {
					heatmapLayer.pushData(
						value.loc.latitude,
						value.loc.longitude,
						15
					);
				}
			}
		});

		L.control.layers(null, {'Historic Activity': heatmapLayer}, {collapsed: false}).addTo(map);
	};

	this.addUpdate = function(update) {

		//We only want updates from the last hour
		var testTime = new Date();
		testTime.setMinutes(testTime.getMinutes() - 60);

		if (update.time >= testTime.valueOf()) {

			if (typeof update.loc.latitude !== 'undefined' &&
				typeof update.loc.longitude !== 'undefined') {

				var iconMarker = L.AwesomeMarkers.icon({
					icon: 'smiley',
					markerColor: 'green'
				});

				if (update.sentiment === 'neg') {
					iconMarker = L.AwesomeMarkers.icon({
						icon: 'sad',
						markerColor: 'darkred'
					});
				}

				var marker = L.marker([update.loc.latitude, update.loc.longitude], {icon: iconMarker})
					.bindPopup('<strong>' + update.comment + '</strong><br /><i>' + moment(update.time).format("M/D/YY, h:mm a") + '</i>')
				console.log();
				updateMarkers.push(marker);
				
				updateMarkers[updateMarkers.length - 1].addTo(map);
			}
		}
	};

});