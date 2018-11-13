
var cookieDays = 365;
var films = [];
var nombre_de_films = 0;


/* Generic reader */
function readJson( data ) {
	var text = "";
	$.each( data, function( key, val ) {
		if (typeof val == 'object') {
			text += "<div class='" + key + "'>" + readJson(val) + "</div>";
		} else {
			if ( val !== null && val != "" )
				text += "<span id='" + key + "'>" + val + "</span>";
		}
	});
	return text;
}

/* Generic filtering */
function filtering(data, criteria){
  data = data.filter(function(obj) {
    return Object.keys(criteria).every(function(c) {
      return obj[c].toLowerCase().includes(criteria[c].toLowerCase());
    });
  });
	return data;
}

function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (cookieDays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function generateList() {
  var filterInputTitle = $( '#filterInputTitle' ).val();
  var jsonParsed = JSON.parse($('#json').text());
  var jsonfilteredByTitle = filterInputTitle!= "" ? filtering( jsonParsed, {title: filterInputTitle}) : jsonParsed;
  var text = $(readJson( jsonfilteredByTitle ));
  $( '#form-liste' ).html("").append( text );



  $('#form-liste > div').each(function() {
    var id = $(this).find('> #id').text();
    var title = $(this).find('> #title').text();
    var title_en = $(this).find('> #title_en').text();
    var date = $(this).find('> #date').text();
    if(films.includes(id)) {
      $(this).html('<div class="form-check"><input class="form-check-input" type="checkbox" value="" id='+id+' checked><label class="form-check-label" for='+id+'>'+title+'</label></div>');
    } else {
      $(this).html('<div class="form-check"><input class="form-check-input" type="checkbox" value="" id='+id+'><label class="form-check-label" for='+id+'>'+title+'</label></div>');
    }

  });

  addEvents();
}


function addEvents() {
  $('.form-check .form-check-input').on('change',function(){
    var _val = $(this).is(':checked') ? true : false;
    var id = $(this)[0].id;
    if(_val && !films.includes(id)) {
      films.push(id);
      films.sort();
      setCookie("films", films);
    }
    if(!_val && films.includes(id)) {
      var i = films.indexOf(id);
      films.splice(i, 1);
      setCookie("films", films);
    }

    updateProgressBar();
  });
}

function updateProgressBar() {
  var percent = Math.round( films.length / nombre_de_films * 100. );
  $('#progressbar').attr({
    "aria-valuenow" : "" + percent,
    "style" : "width: " + percent + "%"
  });
}

// Hide the inactive tabs when document is ready
// TODO Get the #anchor from the url
function hideInitialContent() {
  $( '#question' ).hide();
  $( '#info' ).hide();
}


$(document).ready(function() {
	
  hideInitialContent();

  $.getJSON('disney_movies_list.json', function( data ) {
		var text = $(readJson( data.movies ));
    $( '#json' ).hide().html("").append( JSON.stringify(data.movies) );
		$( '#form-liste' ).html("").append( text );

    var cookie = getCookie("films");
    if ( cookie != "" )
      films = cookie.split(",");

    nombre_de_films = data.movies.length;

    generateList();
    updateProgressBar();
  });

  $( '#filterInputTitle' ).on("change keyup", function() {
    generateList();
  });

  $( '.nav .nav-item' ).on("click", function() {
    if( ! $( this ).hasClass( "active" ) ) { // if not active
      // Hiding the active tab
      var tabToHide =  $( '.nav .active' ).children("a").attr("href");
      $( '.nav .active' ).removeClass("active");
      $( tabToHide ).hide();
      
      // Showing the clicked tab
      var tabToShow = $( this ).children("a").attr("href");
      $( this ).addClass("active");
      $( tabToShow ).show();
    }
  });
});
