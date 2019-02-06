
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
    let t = false;
    Object.entries(criteria).forEach(([c, valeur]) => {
      if ((''+obj[c]).toLowerCase().includes(valeur.toLowerCase())) t = true;
    });
    return t;
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

function stringToDate(_date, _format, _delimiter)
{
  var formatLowerCase=_format.toLowerCase();
  var formatItems=formatLowerCase.split(_delimiter);
  var dateItems=_date.split(_delimiter);
  var monthIndex=formatItems.indexOf("mm");
  var dayIndex=formatItems.indexOf("dd");
  var yearIndex=formatItems.indexOf("yyyy");
  var month=parseInt(dateItems[monthIndex]);
  month -= 1;
  var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
  return formatedDate;
}


function generateList() {
  var filteringInput = $( '#filteringInput' ).val();
  var jsonParsed = JSON.parse($('#json').text());
  var jsonfilteredByTitle = filtering( jsonParsed, {id: filteringInput, title: filteringInput, date: filteringInput});
  var text = $(readJson( jsonfilteredByTitle ));
  $( '#form-liste' ).html("").append( text );


  $('#form-liste > div').each(function() {
    var id = $(this).find('> #id').text();
    var title = $(this).find('> #title').text();
    var title_en = $(this).find('> #title_en').text();
    var date = $(this).find('> #date').text();
    var dateObj = stringToDate(date, 'dd/mm/yyyy', '/');
    //var dateOptions = { year: 'numeric'/*, month: '2-digit', day: '2-digit' */};
    date = dateObj.toLocaleDateString("fr"/*, dateOptions*/);
    //date = dateObj.getFullYear();
    if(films.includes(id)) {
      $(this).html('<div class="form-check liste-check"><input class="form-check-input liste-check-input" type="checkbox" value="" id='+id+' checked><label class="form-check-label" for='+id+'><span class="numero">'+id+'. </span>'+title+'<span class="date"> ('+date+')</span></label></div>');
    } else {
      $(this).html('<div class="form-check liste-check"><input class="form-check-input liste-check-input" type="checkbox" value="" id='+id+'><label class="form-check-label" for='+id+'><span class="numero">'+id+'. </span>'+title+'<span class="date"> ('+date+')</span></label></div>');
    }

  });

  addEventsToList();
}


function addEventsToList() {
  $('.liste-check .liste-check-input').on('change',function(){
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

  if($('#displayNumero:checked').length == 0)
  $('.numero').hide();
  else
  $('.numero').show();

  if($('#displayDate:checked').length == 0)
  $('.date').hide();
  else
  $('.date').show();
}

function addEvents() {
  // Parameters
  $('#displayFilters').on('change',function(){
    if($('#displayFilters:checked').length == 0)
    $('#filterInput').hide();
    else
    $('#filterInput').show();
  });
  if($('#displayFilters:checked').length == 0)
  $('#filterInput').hide();
  else
  $('#filterInput').show();

  $('#displayBar').on('change',function(){
    if($('#displayBar:checked').length == 0)
    $('#progressTooltip').hide();
    else
    $('#progressTooltip').show();
  });
  if($('#displayBar:checked').length == 0)
  $('#progressTooltip').hide();
  else
  $('#progressTooltip').show();

  $('#displayNumero').on('change',function(){
    if($('#displayNumero:checked').length == 0)
    $('.numero').hide();
    else
    $('.numero').show();
  });

  $('#displayDate').on('change',function(){
    if($('#displayDate:checked').length == 0)
    $('.date').hide();
    else
    $('.date').show();
  });

  $('#backgroundPicture').on('change',function(){
    if($('#backgroundPicture:checked').length == 0)
    $('.background').hide();
    else
    $('.background').show();
  });

  // Filtering
  $( '#filteringInput' ).on("change keyup", function() {
    generateList();
  });

  // Navbar
  $( '.nav .nav-item' ).on("click", function() {
    if( ! $( this ).hasClass( "active" ) ) { // if not active
      // Hiding the active tab
      var tabToHide =  $( '.nav .active' ).children("span").attr("href");
      $( '.nav .active' ).removeClass("active");
      $( tabToHide ).hide();

      // Showing the clicked tab
      var tabToShow = $( this ).children("span").attr("href");
      $( this ).addClass("active");
      $( tabToShow ).show();
      
      // Showing or Hiding the Back-to-list button
      if( $( this ).children("span").attr("id") !== "nav-liste" ) {
        $( '#nav-liste' ).show();
      } else {
        $( '#nav-liste' ).hide();
      }
    }
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
  $( '#nav-liste' ).hide();
  $( '#gestion' ).hide();
  $( '#configuration' ).hide();
}

function setInitialParameters() {
  $( '#displayFilters' ).prop('checked', true);
  $( '#displayBar' ).prop('checked', true);
  $( '#displayNumero' ).prop('checked', true);
  $( '#displayDate' ).prop('checked', true);
  $( '#backgroundPicture' ).prop('checked', true);
}

function addBackground() {
  $( '.tab-content' ).after( '<div class="background"></div>' );
  if($('#backgroundPicture:checked').length == 0)
  $('.background').hide();
  else
  $('.background').show();
}


$(document).ready(function() {

  hideInitialContent();
  setInitialParameters();

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
    addBackground();
  });

  addEvents();

});
