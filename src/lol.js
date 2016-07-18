window.isMobile = /mobile/i.test(navigator.userAgent);
window.isIpad = /iPad/i.test(navigator.userAgent);
var parallax;


$(document).ready(function(){

    if (
        navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)
    ) {
        var fixViewportHeight = function() {
            document.documentElement.style.height = window.innerHeight + "px";
            if (document.body.scrollTop !== 0) {
                window.scrollTo(0, 0);
            }
        };

        window.addEventListener("scroll", fixViewportHeight, false);

        window.onresize = fixViewportHeight;
        fixViewportHeight();

        document.body.style.webkitTransform = "translate3d(0,0,0)";
    }

    var ie8 = !$('html').hasClass('lt-ie9');


    /* ==========================
     POI Carousel
     ========================== */

    var owl = $('#poi-carousel');

    var carouselOptions = {
        navigation: true,
        navigationText: ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
        items: 5,
        itemsCustom: [[0, 2], [768, 4], [930, 5], [1116, 6], [1252, 7], [1624, 8], [1810, 9], [1996, 10]]
    }

    owl.owlCarousel(carouselOptions);



    $('video').each(function() {
        $(this).data('mediaelement', new MediaElement(this));
    });


    $('.poi_thumb').on('click', function() {
        if($(this).prop('hash') === location.hash) $(window).trigger('hashchange');
    });


    /* ==========================
     Intro page
     ========================== */

    if(ie8){
        /* Parallax */
        var scene = document.getElementById('scene');
        parallax = new Parallax(scene);
    }

    /* Close intro page trigger */
    $('.js-close-intro').on('click', function(e){
        $('.landing').fadeOut(1000, function(){
            $('body').addClass('intro-hidden');

            if(ie8){
                parallax.disable();
            }

        });

        if ($(this).attr('href')=="") e.preventDefault();
    });




    /* ==========================
     Intro Js
     ========================== */

    $('.btn-intro').html(intro_text[Math.floor(intro_text.length * Math.random())]);


    /* ==========================
     Detect Hash
     ========================== */
    if (current_point && $('.landing:visible')) {
        location.hash = '';
        $('.landing').hide();
        current_point.marker.openPopup();
        current_point.marker.fireEvent('popupopen');
    }


    /* ==========================
     Dropdown
     ========================== */

    initDropdown();


    $('.btn-nav').click(function() {

        var $clicked = $(this);

        $clicked.find('i').toggleClass('hidden');
        $('body').toggleClass('dropdown-active');

        $("#poi-carousel").data('owlCarousel').destroy();

        $("#poi-carousel").owlCarousel(carouselOptions);


    });



});
$(window).load(function() {
    map.fireEvent('move');

    /* ==========================
     #Lol styled text
     ========================== */

    if (Modernizr.svgclippaths) {


        function lolText() {

            var $counter = 1; // Used for unique id's

            // Reset the board
            $('.lol-text').show();
            $('.lol-text__svg').remove();

            $('.lol-text').each(function(){
                var $title           = $(this), // Hide the old title
                    $titleWidth      = $title.width() + 2,
                    $titleHeight     = $title.height(),
                    $titleSize       = parseInt($title.css('font-size')),
                    $titleLineHeight = parseInt($title.css('line-height')),
                    $theTitle        = $title.html();

                // console.log($theTitle + ' height: ' + $titleHeight);
                // console.log($theTitle + ' font-size: ' + $titleSize);
                // console.log($theTitle + ' line-height: ' + $titleLineHeight * 0.675);
                // console.log($theTitle + ' font-size: ' + $titleSize);

                // X & Y positioning
                var $titlePosX       = 0,
                    $titlePosY       = $titleHeight - ($titleHeight * .125 ), // BeaufortforLOL sits 12.5% above it's bounding box. This positions offsets it.
                    $titleClasses    = ' '; // Placeholder

                // If the title is centered
                if($title.hasClass('lol-text--centered')) {

                    $titlePosX       = $titleWidth / 2;
                    $titleClasses    += 'lol-text--centered';

                }

                // Create an SVG for use, needs unique ID, Set height, width, viewbox
                $title.after('<svg class="lol-text__svg" id="lol-text-' + $counter + '" width="' + $titleWidth + '" height="' + $titleHeight + '" viewBox="0 0 ' + $titleWidth + ' ' + $titleHeight + '"></svg>');

                // Target the svg we created
                var $paper =         Snap('#lol-text-' + $counter );

                // Create the gradient
                var $textGradient = $paper.gradient("l(0, .3, 0, .8)#cbac62-#66481f");

                // Create the
                var $textMask =      $paper.text( $titlePosX, $titlePosY, $theTitle).addClass('lol-text__mask' + $titleClasses).attr({fill: '#fff'}),
                    $textShadow =    $paper.text( $titlePosX, $titlePosY, $theTitle).addClass('lol-text__shadow' + $titleClasses).attr({fill: '#ad986a'}),
                    $textTitle =     $paper.text( $titlePosX + 1, $titlePosY + 1, $theTitle).addClass('lol-text__text' + $titleClasses).attr({fill: $textGradient});

                // Create group and apply mask
                var theTitle =       $paper.group($textShadow, $textTitle).attr({mask: $textMask});

                // Hide the original text
                $title.hide();

                // Increment the counter
                $counter++;

            });
        }

        // Run on window resize
        window.onresize = lolText;

        // Trigger Resize
        var winResize = window.onresize;
        winResize();

    };


});

var panning = false;
var current_point;
function initDropdown() {


    $(window).on('hashchange', function() {

        var new_id = location.hash.slice(1);

        var point;
        // Check if point is valid
        if(new_id && (point = get_poi(location.hash.slice(1))).type)
        {
            $('.js-close-intro').click();

            $('body.dropdown-active .btn-nav').trigger('click');
            panning = true;

            current_point = point;

            // Decide whether popup is out of view. If so flip it.
            if (point.anchor && point.anchor=="top") {
                point.offset = $.extend({}, poi_defaults.offset);
                point.offset.y+=420;
                current_point.flipped = true;
            } else {
                current_point.flipped = false;
            }

            var pixelPosition = map.project(point.position);
            var new_position  = map.unproject([
                pixelPosition.x + point.offset.x,
                pixelPosition.y + point.offset.y
            ]);

            var distance = map.getCenter().distanceTo(new_position)/5000000;

            map.panTo(new_position, {duration:distance,animate:true});
            if(! $('#map').hasClass('popup-active')) point.openPopup();
        }
        else
        {
            map.closePopup();
            $('#fullscreen-container').removeClass('show');
        }

    }).trigger('hashchange');
}


/* ==========================
 Markers & Popups
 ========================== */

var poi_defaults = {
    options: {
        minWidth: 499,
        maxWidth: 499,
        autoPan: false,
        autoPanPadding: new L.Point(25,25),
        keepInView: false
    },
    openPopup: function() {
        var point = this;
        panning = false;
        if(point.fullscreen)
        {
            var $fullscreen_container = $('#fullscreen-container');

            $fullscreen_container.addClass('show')

            $fullscreen_container.find('.content')
                .html(point.popup_html);

            $fullscreen_container.find('.close-button')
                .one('click', function() {
                    point.marker.fireEvent('popupclose');

                    return false;
                });

            point.marker.fireEvent('popupopen');
        } else {
            point.marker.openPopup();
            //point.marker.fireEvent('popupopen');
        }
    },
    closePopup: function() {
        var point = this;

        point.marker.closePopup();

        if(point.fullscreen)
        {
            point.marker.fireEvent('popupclose');
        }
    },
    offset: {
        x: 0,
        y: -180
    }
};

// Order of POI's for the guided tour.
var poi_order = [
    "the-bases",
    "inhibitor-timers",
    "the-murkwolves",
    "gromp",
    "fail-flashes-be-gone",
    "baron-nashor",
    "four-quadrants",
    "the-raptors",
    "destructible-structures",
    "blue-sentinel",
    "dragon",
    "the-krugs",
    "red-brambleback"
];

function get_poi(id) {
    return poi[id] && $.extend({}, poi_defaults, poi[id]);
}
function set_poi_props(id, props) {
    poi[id] = $.extend(poi[id], props);
}

var markers = {
    'default': L.icon({
        iconUrl: '../../assets/srmapexperience/img/pin_new.png',
        iconSize: [38, 54],
        iconAnchor: [18, 54],
        popupAnchor: [3,4],
        shadowUrl: '../../assets/srmapexperience/img/pin_shadow.png',
        shadowSize: [82 ,28],
        shadowAnchor: [38, 10]
    }),
    video: L.icon({
        iconUrl: '../../assets/srmapexperience/img/pin_video.png',
        iconSize: [38, 54],
        iconAnchor: [18, 54],
        popupAnchor: [3,4],
        shadowUrl: '../../assets/srmapexperience/img/pin_shadow.png',
        shadowSize: [82 ,28],
        shadowAnchor: [38, 10]
    }),
    monster: L.icon({ // Duplicate of video with alt icon
        iconUrl: '../../assets/srmapexperience/img/pin_monster.png',
        iconSize: [38, 54],
        iconAnchor: [18, 54],
        popupAnchor: [3,4],
        shadowUrl: '../../assets/srmapexperience/img/pin_shadow.png',
        shadowSize: [82 ,28],
        shadowAnchor: [38, 10]
    }),
    hidden: L.icon({
        iconUrl: '../../assets/srmapexperience/img/pin_hidden.png',
        iconSize: [38, 54],
        iconAnchor: [18, 54],
        popupAnchor: [3,4],
        shadowUrl: '../../assets/srmapexperience/img/pin_shadow_hidden.png',
        shadowSize: [82 ,28],
        shadowAnchor: [38, 10]
    })
};

/* ==========================
 Map
 ========================== */

var map_asset_url = 'http://promo.na.leagueoflegends.com/sru-map-assets';

var maxBounds = L.latLngBounds(
    L.latLng(-85.0511,-180),
    L.latLng(40,88)
);

var map = L.map('map',{
    zoomControl: false,
    attributionControl: false,
    maxBounds: maxBounds
}).setView(
    (location.hash.slice(1) && get_poi(location.hash.slice(1)).position) || poi["the-bases"].position,
    5,
    {
        crs: L.CRS.Simple
    }
);
var min_zoom = 3
if (isMobile==true && isIpad ==false) min_zoom = 2;
new L.Control.Zoom({ position: 'bottomright', zoomInTitle: '', zoomOutTitle: ''}).addTo(map);
L.tileLayer(map_asset_url+'/{z}/{x}/{y}.png',{
    minZoom: min_zoom,
    maxZoom: 6,
    tms: true,
    noWrap: true,
    animate: true,
    unloadInvisibleTiles: false,
    //errorTileUrl:map_asset_url+'/empty.png',
    bounds: maxBounds
}).addTo(map);

/* ==========================
 Minimap
 ========================== */

// Base size is equal to the size of the visible map at zoom level 0
// It is required to properly convert minimap coordinates to map coordinates
var base_minimap_size = {
    'x': 193,
    'y': 162
};
function minimapCoordsToMapCoords(elem, event) {
    var $elem = $(elem);
    var offset = $elem.offset();
    var height = $elem.height();
    var width = $elem.width();

    // Determines mouse position relative to minimap.
    // "height * .56" is an experimentally determined offset which causes the y
    // coordinate to align correctly.
    return [
        base_minimap_size.x * (event.clientX - offset.left) / width,
        base_minimap_size.y * (event.clientY - offset.top + height * .56) / height
    ];
}
function mapCoordsToMinimapCoords(elem, map_coord) {
    var $elem = $(elem);
    var height = $elem.height();
    var width = $elem.width();

    // Determines mouse position relative to minimap.
    // "height * .56" is an experimentally determined offset which causes the y
    // coordinate to align correctly.
    return [
        width * map_coord.x / base_minimap_size.x,
        height * map_coord.y / base_minimap_size.y - (height * .56)
    ];
}

// Pan update functionality.  Used to update map position smootly
var pan = {
    shouldUpdate: false,
    to: null,
    offset: 0,
    total_requests: 0
};
function updatePan() {
    if(pan.to && pan.total_requests>5) {
        map.panTo(pan.to);
        pan.total_requests=0;
    } else {
        pan.total_requests++;
    }
    pan.to = null;
};

// Minimap control implementation
var Minimap = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    onAdd: function(map) {
        var built_minimap = HTML('div', {'class': 'leaflet-control-minimap'},[
            HTML('img', {'class': 'leaflet-control-minimap-image', 'src': base.href+'../../assets/srmapexperience/img/minimap.jpg'}),
            HTML('div', {'class': 'leaflet-control-minimap-reticule'}, [
                HTML('div', {'class': 'leaflet-control-minimap-reticule-fill'})
            ]),
            HTML('a', {'class': 'leaflet-control-minimap-toggle-display', 'href': 'javascript:void()'})
        ]);

        return built_minimap;
    }
});

map.addControl(new Minimap);

$('.leaflet-control-minimap').on('click', function(event) {
    if(1 === event.which) {
        map.panTo(map.unproject(minimapCoordsToMapCoords(this, event), 0), {animate:true, delay:.5});
    }
    return false;
}).on('dblclick', function(event) {
    return false;
}).on('mousedown', function(event) {
    // Dragging functionality.  Pans user to location when clicking and dragging
    // on map

    if(1 !== event.which) return false;

    var $this = $(this);
    pan.shouldUpdate = true;

    // Prevent "stuck" drag mode by checking if mouseup event is triggered outside
    // minmap container
    $(window).one('mouseup', function() {
        $('.leaflet-control-minimap, .leaflet-tile-container').trigger('mouseup');
    });
    updatePan();
    $this.on('mousemove', function(event) {
        var coords = minimapCoordsToMapCoords(this, event)
        pan.to = map.unproject(coords, 0);
        setMinimapReticule(L.point(coords));
        if(pan.shouldUpdate) updatePan();
    });

    return false;
}).on('mouseup', function() {
    // Release drag and drop functionality
    $(this).off('mousemove');
    pan.shouldUpdate = false;
    return false;
});

function setMinimapReticule(position_override) {
    if(pan.shouldUpdate && !(position_override instanceof L.Point)) return;
    var $minimap = $('.leaflet-control-minimap');
    var minimap_width = $minimap.width();
    var minimap_height = $minimap.height();
    var coords = pan.shouldUpdate ? position_override : map.project(map.getCenter(), 0);
    var center = mapCoordsToMinimapCoords($minimap[0], coords);
    var latBounds = map.getBounds();
    var bounds = {
        'southWest': mapCoordsToMinimapCoords($minimap[0], map.project(latBounds._southWest, 0)),
        'northEast': mapCoordsToMinimapCoords($minimap[0], map.project(latBounds._northEast, 0))
    };
    var width  = Math.abs(bounds.southWest[0] - bounds.northEast[0]);
    var height = Math.abs(bounds.southWest[1] - bounds.northEast[1]);

    var position = {
        'left': center[0] - width  / 2,
        'top':  center[1] - height / 2
    };

    if(position.left < 0) position.left = 0;
    else position.left = Math.min(position.left, minimap_width - width);

    if(position.top < 0) position.top = 0;
    else position.top = Math.min(position.top, minimap_height - height);

    $('.leaflet-control-minimap-reticule').css({
        'left': position.left/minimap_width*100+'%',
        'top':  position.top/minimap_height*100+'%',
        'width':  Math.min(width, minimap_width - position.left)/minimap_width*100+'%',
        'height': Math.min(height, minimap_height - position.top)/minimap_height*100+'%'
    });
};

map.on('move', setMinimapReticule)
    .on('zoomend', setMinimapReticule);

// Map minimization
$('.leaflet-control-minimap-toggle-display').on('click', function() {
    $(this).add('.leaflet-control-minimap-image').toggleClass('minimized');

    return false;
});

// Builders
var popup_partials = {
    guide: function(current_id) {
        var current_index = poi_order.indexOf(current_id);
        if(-1 !== current_index)
        {
            return HTML('div', {'class': 'leaflet-tour'}, [
                HTML('a', {'class': 'leaflet-tour-prev fa fa-chevron-left', href: '#'+(poi_order[current_index - 1] || '')}),
                HTML('a', {'class': 'leaflet-tour-next fa fa-chevron-right', href: '#'+(poi_order[current_index + 1] || '')})
            ]);
        }
        else return HTML('div', {'class': 'leaflet-tour'});
    },
};
var buildPopup = {
    video: function(popup, id) {
        return HTML('div', null, [
            HTML('div', {'class': 'leaflet-title-wrapper'},
                HTML('h4', {'class': 'leaflet-title'}, popup.title)
            ),
            HTML('div', {'class': 'video-container'},
                HTML('iframe', {width: 560, height: 315, src: popup.src, frameborder: 0, allowfullscreen: 'allowfullscreen'})
            ),
            HTML('div', {'class': 'leaflet-content'}, [
                HTML('p', null, popup.description)
            ]),
            popup_partials.guide(id)
        ]);
    },

    monster: function(popup, id) {
        return HTML('div', null, [
            HTML('div', {'class': 'leaflet-title-wrapper'},
                HTML('h4', {'class': 'leaflet-title'}, popup.title)
            ),
            HTML('div', {'class': 'video-container'},
                HTML('iframe', {width: 560, height: 315, src: popup.src, frameborder: 0, allowfullscreen: 'allowfullscreen'})
            ),
            HTML('div', {'class': 'leaflet-content'}, [
                HTML('p', null, popup.description)
            ]),
            popup_partials.guide(id)
        ]);
    },

    'default': function(popup, id) {
        return HTML('div', null, [
            //HTML('div', {'class': 'leaflet-thumb'},
            //	popup.thumb && HTML('img', {src: popup.thumb, alt: popup.title, width: 282, height: 156 })
            //),
            HTML('div', {'class': 'leaflet-content'}, [
                HTML('div', {'class': 'leaflet-title-wrapper'},
                    HTML('h4', {'class': 'leaflet-title'}, popup.title)
                ),
                HTML('p', null, popup.description)
            ]),
            popup_partials.guide(id)
        ]);
    },

    hidden: function(popup, id) {
        return HTML('div', null, [
            HTML('div', {'class': 'leaflet-content'}, [
                HTML('div', {'class': 'leaflet-title-wrapper'},
                    HTML('h4', {'class': 'leaflet-title'}, popup.title)
                ),
                HTML('p', null, popup.description)
            ]),
            popup_partials.guide(id)
        ]);
    }
};


Object.keys(poi).forEach(function(id) {
    var point = get_poi(id);

    set_poi_props(id, {
        marker: L.marker(
            point.position,
            {icon: markers[point.type]}
        ),
        popup_html: buildPopup[point.type](point.popup, id)
    });

    poi[id].marker.on('popupopen', function(event, fullscreen) {
        $('.leaflet-control-minimap .overlay').remove();
        $('body.dropdown-active .btn-nav').click();
        $('#map').addClass('popup-active');

        location.hash = id;
        var point = get_poi(id);

        if(point.anchor=="top") {
            $('.leaflet-popup').addClass('flip');
        } else {
            $('.leaflet-popup').removeClass('flip');
        }

        var $minimap = $('.leaflet-control-minimap');

        $minimap.append(HTML('div', {'class': 'overlay overlay-'+id}));
    }).on('popupclose', function() {
        $('.leaflet-control-minimap .overlay').remove();

        if(location.hash.slice(1) !== id) return;

        if(history && history.pushState) {
            history.pushState(history.state, document.title, location.href.replace(/#.*/, ''))
        } else {
            location.hash = '';
        }
        $('#map').removeClass('popup-active');

        $('#fullscreen-container').removeClass('show');
    }).on('click', function() {
        var point = get_poi(id);
        if(point.fullscreen) point.openPopup();
    }).addTo(map);
});

// Mobile
function on_desktop() {
    Object.keys(poi).forEach(function(id) {
        var point = get_poi(id);

        if(! poi[id].fullscreen)
        {
            poi[id].marker.bindPopup(
                point.popup_html,
                point.options
            );
        }
    });

    poi_defaults.fullscreen = false;
}
function off_desktop() {
    var point = get_poi(location.hash.slice(1));

    if(point) {
        point.closePopup();
    }
    map.closePopup();
}
function on_mobile() {
    poi_defaults.fullscreen = true;

    Object.keys(poi).forEach(function(id) {
        poi[id].marker.unbindPopup();
    });
}
function off_mobile() {
    var point = get_poi(location.hash.slice(1));

    poi_defaults.fullscreen = true;
    if(point) {
        point.closePopup();
    }
    poi_defaults.fullscreen = false;
}
var current_mode;
function ie8_size_check() {
    var new_width = $(window).width();

    if('mobile' !== current_mode && new_width < 768) {
        if(current_mode) off_desktop();
        on_mobile();

        current_mode = 'mobile';
    }
    else if('desktop' !== current_mode) {
        if(current_mode) off_mobile();
        first_run = true;
        on_desktop();

        current_mode = 'desktop';
    }
}
if($('html').hasClass('lt-ie9')) {
    var timeout;
    $(window).resize(function() {
        clearTimeout(timeout);
        timeout = setTimeout(ie8_size_check, 250);
    }).trigger('resize');
}
else {
    enquire.register('screen and (max-width:767px)', {
        match: on_mobile,
        unmatch: off_mobile
    });
    enquire.register('screen and (min-width:768px)', {
        match: on_desktop,
        unmatch: off_desktop
    });
}

$('#fullscreen-container').on('transitionend', function() {
    var $this = $(this);

    if(! $this.hasClass('show')) $this.find('.content').empty();
});

// HTML build helpers
function HTML(tag, attributes, content) {
    var elem = document.createElement(tag);

    if(attributes) {
        Object.keys(attributes).forEach(function(attr) {
            elem.setAttribute(attr, attributes[attr]);
        });
    }

    $(elem).append(content);

    return elem;
}



var animating = false;
map.on('moveend', function(e) {
    var $video = $('video');

    if (panning) {
        current_point.openPopup();
        panning = false;
    }

    // if(map.getBounds().contains(poi["red-brambleback"].position)) {
    // 	if(!isMobile) $video.data('mediaelement').play();
    // } else {
    // 	if ($video.data('mediaelement').currentTime){
    // 		$video.data('mediaelement').pause();
    // 		$video.data('mediaelement').currentTime = 0;
    // 	}
    // }

})


//Display a video layer when zoomed all the way in
// var myIcon = L.divIcon({className: 'flies', html: '<video width="800" autoplay><source src="video/red.webm" type="video/webm"/><source src="video/red.ogv" type="video/ogg"/><source src="video/red.mp4" type="video/mp4"/></video>'});
// L.marker([-73.335, -40.19], {icon: myIcon}).addTo(map);
// map.on('zoomstart', function(e) {
// 		$('.flies').hide();
// });
// map.on('zoomend', function(e) {
// 	scale_videos_to_zoom(e.target._zoom);
// });
// map.fire('zoomend');
// function scale_videos_to_zoom(zoom) {
// 	(zoom<=6) ? $('.flies').fadeIn() : $('.flies').hide();
// 	var $video = $('.flies').find('video');
// 	switch(zoom) {
// 		case 6:
// 			$video.css('width',800);
// 			$video.css('margin',0);
// 		break;
// 		case 5:
// 			$video.css('width',400);
// 			$video.css('margin','3px 0 0 4px');
// 		break;
// 		case 4:
// 			$('.flies').stop().hide();
// 		break;
// 		default:
// 			$('.flies').stop().hide();
// 		break;
// 	}
// }
//
// $('video').click(function(e){
// 	$(this).get(0).play();
// })

