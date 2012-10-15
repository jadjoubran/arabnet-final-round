//started at 6:15


$.ajaxSetup({
	dataType: "json",
	error: function(){
		alert("Please check your connection and try again.");
	}
});


var API = {

	"url": "http://api.jamendo.com/get2/",

	"get": function( fields, unit, parameters, callback ){
		$.ajax({
			url: API.url  + fields + "/" + unit + "/json/?" + parameters,
			method: "get",
			success: function( response ){
				callback( response );
			}
		});
	},
	"hack": function( path, callback ){
		$.ajax({
			url: path,
			method: "get",
			success: function( response ){
				callback( response );
			}
		});
	},

}




var PLAYLISTS = {

	"read_all": function(){
		if ( ! localStorage.playlists ){
			return false;
		}
		return JSON.parse(localStorage.playlists);
	},

	"readby_id": function( id ){
		if ( ! id ){
			return false;
		}
		if ( ! localStorage.playlists ){
			return false;
		}
		var data = JSON.parse(localStorage.playlists);
		for ( x in data){
			if ( data[x] && data[x].id == id ){
				return data[x];
			}
		}
	},

	"create": function( name ){
		if ( ! name ){
			return false;
		}
		var biggest_order = 0;
		var last_id = 0;
		if ( ! localStorage.playlists ){
			var data = [];
			data.push({
				id: 1,
				name: name,
				order: 1,
				tracks: []
			});
			localStorage.playlists = JSON.stringify(data);
			return true;
		}else{
			var data = JSON.parse(localStorage.playlists);
			for ( x in data){
				if ( data[x] && data[x].order ){
					if ( data[x].order > biggest_order ){
						biggest_order = data[x].order;
					}
				}
				last_id = data[x].id;
			}
			++last_id;
			++biggest_order;

			data.push({
				id: last_id,
				name: name,
				order: biggest_order,
				tracks: []
			});
			localStorage.playlists = JSON.stringify(data);
			return true;
		}
	},

	delete: function( id ){
		if ( ! id ){
			return false;
		}
		if ( ! localStorage.playlists ){
			return false;
		}
		var data = JSON.parse(localStorage.playlists);
		var new_data = [];
		for ( x in data ){
			if ( data[x] && data[x].id != id ){
				new_data.push( data[x] );
			}
		}
		localStorage.playlists = JSON.stringify(new_data);
		return true;
	},

	order_up: function( id ){
		if ( ! id ){
			return false;
		}
		if ( ! localStorage.playlists ){
			return false;
		}

		var data = JSON.parse(localStorage.playlists);
		var current_order  = 0;
		for ( x in data ){
			if ( data[x] && data[x].id == id){
				current_order = data[x].order;
				data[x].order = 999999;	//quick hack
			}
		}
		if ( current_order <= 1){
			return false;
		}
		var new_order = current_order - 1;
		//search for this order and change it
		for ( x in data ){
			if ( data[x] && data[x].order == new_order ){
				data[x].order = data[x].order + 1;
				break;
			}
		}

		for ( x in data ){
			if ( data[x] && data[x].order == 999999){
				data[x].order = new_order;
			}
		}
		localStorage.playlists = JSON.stringify( data );
		return true;
	},

	order_down: function( id ){
		if ( ! id ){
			return false;
		}
		if ( ! localStorage.playlists ){
			return false;
		}

		var data = JSON.parse(localStorage.playlists);
		var current_order  = 0;
		for ( x in data ){
			if ( data[x] && data[x].id == id){
				current_order = data[x].order;
				data[x].order = 999999;	//quick hack
			}
		}
		if ( current_order <= 1){
			return false;
		}
		var new_order = current_order + 1;
		//search for this order and change it
		for ( x in data ){
			if ( data[x] && data[x].order == new_order ){
				data[x].order = data[x].order - 1;
				break;
			}
		}

		for ( x in data ){
			if ( data[x] && data[x].order == 999999){
				data[x].order = new_order;
			}
		}
		localStorage.playlists = JSON.stringify( data );
		return true;
	},

	update: function( id, new_name ){
		if ( ! id || ! new_name ){
			return false;
		}
		if ( ! localStorage.playlists ){
			return false;
		}
		var data = JSON.parse(localStorage.playlists);
		for ( x in data){
			if ( data[x] && data[x].id == id){
				data[x].name = new_name;
				break;
			}
		}
		localStorage.playlists = JSON.stringify(data);
	},

	add_track: function( track_id, track_name, playlist_id ){
		if ( ! track_id || ! playlist_id ){
			return false;
		}
		if ( ! localStorage.playlists ){
			return false;
		}
		var data = JSON.parse(localStorage.playlists);
		for ( x in data){
			if ( data[x] && data[x].id == playlist_id ){
				data[x].tracks.push({id: track_id, name: track_name});
			}
		}
		//save data
		localStorage.playlists = JSON.stringify(data);
		return true;
	}

};






$(document).ready(function(){

	var playlists = PLAYLISTS.read_all();
	if ( playlists && playlists.length > 0 ){
		var html = '';

		playlists.sort(function(a,b) { return parseFloat(a.order) - parseFloat(b.order) } );

		for ( x in playlists ){
			html += "<div data-id='"+ playlists[x].id +"'>"+
			"<div class='edit_playlist floatLeft pointer'>Edit</div>"+
			"<div class='delete_playlist floatLeft pointer'>Delete</div>"+
			"<div class='playlist_up floatLeft pointer'>up</div>"+
			"<div class='playlist_name floatLeft pointer'>" + playlists[x].name + "</div></div><br style='clear:both' />";
		}
		$("#playlists").html( html );
	}else{
		$("#playlists").html("No playlists yet, create a new playlist below!");
	}

	$("#new_playlist").on('click', function(){
		var name = prompt("Enter new playlist name: ", "");
		if ( ! name){
			return false;
		}
		PLAYLISTS.create( name );
		window.location.reload();
	});

	$(".delete_playlist").on("click", function(event){
		var id = $(event.target).parent().data("id");
		if ( ! id ){
			return false;
		}
		var c = confirm("Are you sure you want to delete this playlist?", "");
		if ( ! c ){
			return false;
		}
		PLAYLISTS.delete( id );
		$(event.target).parent().hide("slow");
	});

	$(".edit_playlist").on("click", function(event){
		var id = $(event.target).parent().data("id");
		if ( ! id ){
			return false;
		}
		var new_name = prompt("Are you sure you want to delete this playlist?", "");
		if ( ! new_name ){
			return false;
		}
		PLAYLISTS.update( id , new_name );
		$(event.target).parent().find(".playlist_name").html( new_name );
	});

	$(".playlist_name").on("click", function(event){

		var id = $(event.target).parent().data("id");
		if ( ! id ){
			return false;
		}
		var playlist = PLAYLISTS.readby_id( id );
		var tracks = playlist.tracks;
		if ( ! tracks || tracks.length == 0 ){
			$("#track_list").html("No tracks in this playlist yet! <div id='add_track' class='pointer' data-playlist-id='"+playlist.id+"'>Click here</div> to add a track");
			init_all();
		}else{
			var html = "";
			for ( x in tracks){
				if ( tracks[x] ){
					html += "<div data-id='"+ tracks[x].id +"' data-playlist-id='"+id+"' class='playlist_name floatLeft pointer play_music'>" + tracks[x].name + "</div><br style='clear:both' />"+
					"<br /><hr /><br />";
				}
			}
			html += "<span id='add_track' class='pointer' data-playlist-id='"+playlist.id+"'>Click here</span> to add a track";
			$("#track_list").html(html);
			init_all();
		}

	});


	$(".playlist_up").on("click", function(event){
		var id = $(event.target).parent().data("id");
		if ( ! id ){
			return false;
		}
		PLAYLISTS.order_up( id );
		window.location.reload();
	});


});


function play_music( event ){
	var id = $(event.target).data("id");
	var playlist_id = $(event.target).data("playlist-id");
	if ( ! id ){
		return false;
	}

	//construct player
	/*var player = '<div style="text-align:center;"><object width="200" height="300" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0" align="middle"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"><param name="movie" value="http://widgets.jamendo.com/en/track/?track_id=' + id +'&amp;playertype=2008&amp;refuid=1011928"><param name="quality" value="high"><param name="bgcolor" value="#FFFFFF"><embed src="http://widgets.jamendo.com/en/track/?' + id + '=386393&amp;playertype=2008&amp;refuid=1011928" quality="high" wmode="transparent" bgcolor="#FFFFFF" width="200" height="300" align="middle" allowscriptaccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer">&nbsp;&nbsp;</object><a href="http://pro.jamendo.com/" style="display:block;font-size:8px !important;">Royalty-free music for professional licensing</a></div>';
	*/

var source = "http://storage-new2.newjamendo.com/tracks/" + id + "_96.mp3";

	var player = '<audio controls="controls"><source src="'+source+'" type="audio/mpeg">Your browser does not support the audio element.</audio>';

	player += "<br /><br /><div id='shuffle' class='pointer' data-track-id='"+id+"' data-playlist-id='"+playlist_id+"'>Shuffle</div>"
	//inject plauer
	$("#player").html( player );

	init_all();

}


function shuffle( event ){
	var track_id = $(event.target).data("track-id");
	var playlist_id = $(event.target).data("playlist-id");
	$("#track_list").eq(1).click();
}


function init_all(){
	$("#add_track").on("click", function(event){
		var playlist_id = $(event.target).data("playlist-id");
		if ( ! playlist_id ){
			return false;
		}
		$("#search").show("medium").html("Loading...");
		API.get('id+name+url+image+artist_name', 'album', 'n=5&order=ratingweek_desc', function(response){
			var html = "<div>Click on a song's name to add it to playlist</div><br /><br />";
			for ( x in response ){
				html += "<div class='box pointer'>";
				html += "<div data-id='"+response[x].id+"' data-track-name='"+response[x].name+"' data-playlist-id='"+ playlist_id +"' class='recommended_add_to_playlist'>Name: " + response[x].name + "</div><br />";
				html += "<img src='" + response[x].image + "' /><br />";
				html += "</div>";
			}
			$("#search").append( html );
			init_all();
		});
		var html = "<br /><br/><input type='text' id='search_for_song' placeholder='Enter a song name to search for' size='30'/>"+
		"<br /><br /><input type='button' id='search_button' value='Search' />";
		html += "<br /><br /><br /><input type='button' id='close_search' value='Click here to close DIALOG' />";
		$("#search").append(html);
		init_all();
	});


$(".recommended_add_to_playlist").on("click", function(event){
	var id = $(event.target).data("id");
	var playlist_id = $(event.target).data("playlist-id");
	var track_name = $(event.target).data("track-name");
	if ( ! id || ! playlist_id || ! track_name){
		return false;
	}
	if ( PLAYLISTS.add_track( id, track_name, playlist_id ) ){
		alert("Track successfully added to playlist!");
	}
});

$("#close_search").on("click", function(){
	$("#search").hide("medium", function(){
		$(this).html('');
	});
});

$(".play_music").on("click", play_music);


$("#shuffle").on('click', shuffle);
}