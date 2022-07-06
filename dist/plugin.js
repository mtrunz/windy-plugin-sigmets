"use strict";

/**
 * This is main plugin loading function
 * Feel free to write your own compiler
 */
W.loadPlugin(
/* Mounting options */
{
  "name": "windy-plugin-examples",
  "version": "0.5.0",
  "author": "Windyty, S.E.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/windycom/windy-plugins"
  },
  "description": "Windy plugin system enables anyone, with basic knowledge of Javascript to enhance Windy with new functionality (default desc).",
  "displayName": "SIGMETs",
  "hook": "menu"
},
/* HTML */
'<div id="tooltip-sigmets"></div>',
/* CSS */
'#tooltip-sigmets{display:none;position:absolute;width:300px;height:auto;background-color:rgba(0,0,0,0.75);font-size:.9em;font-weight:normal;color:#fff;margin:15px;text-align:left;line-height:18px;z-index:99}#tooltip-sigmets .heading,#tooltip-sigmets .body{padding:.5em}#tooltip-sigmets .body div{margin-bottom:.5em}',
/* Constructor */
function () {
  var _W$require = W.require('map'),
      map = _W$require.map;

  var mouseX;
  var mouseY;
  var sigmet_i = 0;
  var sigmet_timer;
  var sigmet_polygons = [];
  var script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js";
  script.type = 'text/javascript';

  script.onload = function () {
    var $ = window.jQuery;
    $(document).ready(function () {
      getSigmets();
      $("#map-container, #map-container div").mousemove(function (e) {
        var rect = e.target.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      });

      function getSigmets() {
        if (sigmet_polygons) {
          for (sigmet_i = 0; sigmet_i < sigmet_polygons.length; sigmet_i++) {
            map.removeLayer(sigmet_polygons[sigmet_i]);
          }
        }

        $.ajax({
          url: 'https://mariotrunz.me/windy/getSigmets.php',
          type: 'GET',
          success: function success(response) {
            $.each(response, function (key, value) {
              var points = [];

              for (var i = 0; i < value.coordinates.length; i++) {
                points.push([value.coordinates[i][0], value.coordinates[i][1]]);
              }

              var sigmet_type = parseSIGMETType(value.type);
              var rgb_color = convertHEXtoRGB(sigmet_type[0].color);
              var polygon_content = '<div>' + '<div style="background-color:rgba(' + rgb_color[0] + ',' + rgb_color[1] + ',' + rgb_color[2] + ',0.6);" class="heading">' + value.qualifier + ' ' + sigmet_type[0].description + ' (' + value.type + ') SIGMET</div>' + '<div class="body">' + value.contentString + '</div>' + '</div>';
              var polygon = L.polygon([points], {
                color: sigmet_type[0].color
              }).addTo(map);
              polygon.on('mouseover', function () {
                $('#tooltip-sigmets').html(polygon_content).css({
                  'left': mouseX,
                  'top': mouseY
                }).show();
              });
              polygon.on('mouseout', function () {
                $('#tooltip-sigmets').hide();
              });
              sigmet_polygons.push(polygon);
            });
          }
        });

        function parseSIGMETType(sigmet_type) {
          var color, description;

          if (sigmet_type == "TS" || sigmet_type == "TSGR" || sigmet_type == "CONVECTIVE") {
            description = "Convective";
            color = "#FF0000";
          } else if (sigmet_type == "TURB") {
            description = "Turbulence";
            color = "#ff6600";
          } else if (sigmet_type == "LLWS") {
            description = "Wind Shear";
            color = "#983636";
          } else if (sigmet_type == "ICE" || sigmet_type == "ICG") {
            description = "Icing";
            color = "#0008ff";
          } else if (sigmet_type == "MTW") {
            description = "Mountain Wave";
            color = "#ff06ff";
          } else if (sigmet_type == "TC") {
            description = "Tropical Cyclone";
            color = "#cb6600";
          } else if (sigmet_type == "VA") {
            description = "Volcanic Ash";
            color = "#afd4cb";
          } else if (sigmet_type == "IFR") {
            description = "IFR";
            color = "#980298";
          } else {
            color = "#000000";
          }

          return [{
            "color": color,
            "description": description
          }];
        }

        function convertHEXtoRGB(hex) {
          hex = hex.replace("#", "");
          var aRgbHex = hex.match(/.{1,2}/g);
          var aRgb = [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16)];
          return aRgb;
        }

        clearTimeout(sigmet_timer);
        sigmet_timer = setTimeout(getSigmets, 600000);
      }
    });
  };

  document.getElementsByTagName("head")[0].appendChild(script);
});