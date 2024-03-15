<div class="plugin__mobile-header">
    { title }
</div>
<section class="plugin__content">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={ () => bcast.emit('rqstOpen', 'menu') }
    >
    { title }
    </div>
    Hover over anyof the Polygons for additional information.
</section>
<script lang="js">
    import { map } from '@windy/map';
    import bcast from "@windy/broadcast";
    import { onDestroy, onMount } from 'svelte';

    import config from './pluginConfig';

    const { title } = config;


     var mouseX; 
    var mouseY;
    var sigmet_i = 0;
    var sigmet_timer;
    var sigmet_polygons = [];
    var recent_sigmets_timer;
    var recent_sigmets = [];
    var recent_sigmets_properties = [];
    var recent_sigmets_state = "";

    var script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js";
    script.type = 'text/javascript';
    script.onload = function() {
        var $ = window.jQuery;
        $( document ).ready(function() {
            $('#map-container').append('<style> #tooltip-sigmets { display: none; position:absolute; width: 300px; height: auto; background-color: rgba(0,0,0,0.75); font-size:0.9em; font-weight:normal; color:#fff; margin: 15px; text-align:left; line-height: 18px; z-index:99; } #tooltip-sigmets .heading, #tooltip-sigmets .body{ padding:0.5em; } #tooltip-sigmets .body div{ margin-bottom:0.5em; }</style><div id="tooltip-sigmets"></div>').ready(function () {
               getSigmets();     
            });

            $("#map-container, #map-container div").mousemove(function(e){
                var rect = e.target.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
                mouseY = e.clientY - rect.top;
            });

            function getSigmets(){
                if(sigmet_polygons){
                    for( sigmet_i = 0; sigmet_i < sigmet_polygons.length; sigmet_i++ ) {
                        map.removeLayer(sigmet_polygons[sigmet_i]);
                    }
                    sigmet_polygons = [];
                }
                if(recent_sigmets){
                    for( sigmet_i = 0; sigmet_i < recent_sigmets.length; sigmet_i++ ) {
                        map.removeLayer(recent_sigmets[sigmet_i]);
                    }
                    recent_sigmets = [];
                    recent_sigmets_properties = [];
                }
                $.ajax({ 
                    url: 'https://digital-aviation.studio/windy/getSigmets.php',
                    type: 'GET',
                    success: function(response)
                    {
                        $.each(response, function(key,value) {

                            var points = [];

                            for (var i = 0; i < value.coordinates.length; i++) {
                                points.push([value.coordinates[i][0], value.coordinates[i][1]]);
                            }

                            var sigmet_type = parseSIGMETType(value.type);
                            var rgb_color = convertHEXtoRGB(sigmet_type[0].color);

                            var polygon_content = '<div>' + 
                                            '<div style="background-color:rgba('+rgb_color[0]+','+rgb_color[1]+','+rgb_color[2]+',0.6);" class="heading">' + value.qualifier + ' ' + sigmet_type[0].description + ' (' + value.type + ') SIGMET</div>' + 
                                            '<div class="body">' + value.contentString + '</div>' +
                                        '</div>';

                            var polygon = L.polygon([points], {color: sigmet_type[0].color}).addTo(map);

                            polygon.on('mouseover', function () {
                                $('#tooltip-sigmets').html(polygon_content).css({
                                    'left': mouseX,
                                    'top': mouseY
                                }).show();
                            });

                            polygon.on('mouseout', function () {
                                $('#tooltip-sigmets').hide();
                            });

                            if(value.recent == "true"){
                                recent_sigmets.push(polygon);
                                recent_sigmets_properties.push(sigmet_type[0].color);
                            }

                            sigmet_polygons.push(polygon);

                        });

                        if(recent_sigmets.length > 0){
                            recent_sigmets_state = "";
                            animateRecentSIGMETS();
                        }
                    }
                });

                function animateRecentSIGMETS(){
                    var color = "";
                    if(recent_sigmets_state == ""){
                        color = '#000000';
                        recent_sigmets_state = "black";
                    } else {
                        recent_sigmets_state = "";
                    }

                    for( sigmet_i = 0; sigmet_i < recent_sigmets.length; sigmet_i++ ) {
                        if(color != ""){
                            recent_sigmets[sigmet_i].setStyle({color: '#000000'});
                        } else {
                            var sigmet_color = recent_sigmets_properties[sigmet_i];
                            recent_sigmets[sigmet_i].setStyle({color: sigmet_color});
                        }
                    }

                    clearTimeout(recent_sigmets_timer);
                    recent_sigmets_timer = setTimeout(animateRecentSIGMETS, 1000);
                }

                function parseSIGMETType(sigmet_type){
                    var color, description;

                    if(sigmet_type == "TS" || sigmet_type == "TSGR" || sigmet_type == "CONVECTIVE"){
                        description = "Convective";
                        color = "#FF0000";
                    } else if(sigmet_type == "TURB"){
                        description = "Turbulence";
                        color = "#ff6600";
                    } else if(sigmet_type == "LLWS"){
                        description = "Wind Shear";
                        color = "#983636";
                    } else if(sigmet_type == "ICE" || sigmet_type == "ICG"){
                        description = "Icing";
                        color = "#0008ff";
                    } else if(sigmet_type == "MTW"){
                        description = "Mountain Wave";
                        color = "#ff06ff";
                    } else if(sigmet_type == "TC"){
                        description = "Tropical Cyclone";
                        color = "#cb6600";
                    } else if(sigmet_type == "VA"){
                        description = "Volcanic Ash";
                        color = "#afd4cb";
                    } else if(sigmet_type == "IFR"){
                        description = "IFR";
                        color = "#980298";
                    } else {
                        color = "#000000";
                    }

                    return [{"color": color, "description": description}];
                }

                function convertHEXtoRGB(hex) {
                    hex = hex.replace("#","");
                    var aRgbHex = hex.match(/.{1,2}/g);
                    var aRgb = [
                        parseInt(aRgbHex[0], 16),
                        parseInt(aRgbHex[1], 16),
                        parseInt(aRgbHex[2], 16)
                    ];
                    return aRgb;
                }
                
                clearTimeout(sigmet_timer);
                sigmet_timer = setTimeout(getSigmets, 600000);
            }
       

        });
    };
    document.getElementsByTagName("head")[0].appendChild(script);
</script>

