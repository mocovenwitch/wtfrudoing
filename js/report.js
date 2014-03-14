/**
 * Created by lenehuang on 3/3/14.
 */

$.fn.peity.defaults.pie = {
  delimiter: null,
  diameter: 16,
  fill: [
    "#b8f1ed",
    "#f1b8e4",
    "#e27386",
    "#f1ccb8",
    "#cf8888",
    "#b8f1ff"],
  height: 300,
  width: 300
}



//types: eshop/sns/music/video/game/news/other

var Report = {
  chart: $('span.pie'),
  init: function() {
    $(document).attr('title', MESSAGE_COMMON['TITLE']);
    $('#app_description').html(MESSAGE_COMMON['APP_DESCRIPTION']);
    $('.title').text(MESSAGE_COMMON['TITLE']);
    //$('.comments').text(MESSAGE_COMMON['COMMENTS']);
    $('.note').html(MESSAGE_COMMON['NOTE']);
    $('#clear_history').text(MESSAGE_COMMON['RESET_BUTTON']);
    $('.mocoven_website').text(MESSAGE_COMMON['MOCOVEN_WEBSITE']);

    this.getData();
  },
  renderToPage: function() {
    var pieParts = '';

    if(!!this.reportData) {
      $.each(this.reportData, function(index, item) {
        pieParts += ',' + item.time;

        var msg = MESSAGE_DESCRIPTION[item.type].replace('@@', item.time).replace('&&', MESSAGE_COMMON['UNIT']);
        $('.descriptions').append('<p class=\"description-' + index + '\">' + msg + '</p>');
      });

      pieParts = pieParts.toString().substring(1, pieParts.length);
      $('.report').find('.pie').text(pieParts);
      this.chart.peity('pie');

      // animation
      var position = 'center';
      var target = $('.peity');
      var deg = 180;
      var animateNow = function(target, where, deg) {
        target.animate({'margin-left': where}, {duration: 1000,
          step: function(deg) {
            target.css({"transform": "rotate("+deg+"deg)"});
          }});
      };

      target.on('mouseenter', function(){
        //alert('sdf');
        if(position == 'center') {
          animateNow(target, '+=600px', deg);
          position = 'left';
        } else if(position == 'left') {
          animateNow(target, '-=1200px', deg);
          position = 'right';
        } else if(position == 'right') {
          animateNow(target, '+=1200px', deg);
          position = 'left';
        }
      });
    } else {
      $('.report').find('.peity').detach();
      $('.report').find('.pie').detach();
      $('.descriptions').detach().html('<p class=\"description-0\">' + MESSAGE_COMMON['NOTHING'] + '</p>').prependTo('.report');
    }
  },
  reportData: '',
  getData: function() {
    var dataJSON;

    // for test, mock data from JSON
    /*
    $.ajax('/test/data4test/report_data.json', {
    dataType: 'JSON',
    success: function(response) {
      console.log(response);
      Report.reportData = response;
      Report.renderToPage();
    },
    error: function() {
      $('.error').text(ERROR.ERROR_GET_DATA_FAILED);
      $('.report').hide();
    }
    });
    */

    // for test, mock data from IndexDB

    // for release, get data from chrome storage
    var mydata = 'reading_log';
    try{
      chrome.storage.sync.get(mydata, function(item) {
        var data = item[mydata];
        //if(!!data) {
          Report.reportData = data;
          Report.renderToPage();
        //}
      });
    } catch(e) {
      console.log('nodata');
    }
  }

};

$('#clear_history').click(function() {
  chrome.storage.sync.clear();
  alert(MESSAGE_COMMON['RESET']);
  Report.init();
});

$(document).ready(function() {
  Report.init();
});

