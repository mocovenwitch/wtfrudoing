/**
 * Created by lenehuang on 3/3/14.
 */

$.fn.peity.defaults.pie = {
  delimiter: null,
  diameter: 16,
  fill: ["#ff9900", "#fff4dd", "#ffd592"],
  height: 300,
  width: 300
}

var ERROR = {
    ERROR_GET_DATA_FAILED: '数据库好像坏了，没有拿到数据……重新下载应用吧……不好意思'
};

//types: eshop/sns/music/video/game/news/other

var Report = {
    chart: $('span.pie'),
    init: function() {
        this.getData();
    },
    load: function() {
        this.chart.peity('pie');

        // load data from database
        //var reportData = ReportData.getData();

        // render page
        this.renderToPage();
    },
    renderToPage: function() {
        $.each(this.reportData, function(index, item) {
            //$('.report').find('.description-' + index).html('你有毛病吧');
            $('.descriptions').append('<p class=\"description-' + index + '\">' + '你有毛病吧' + '</p>');
        });
    },
    reportData: '',
    getData: function() {
        var dataJSON;

        // for test, mock data from JSON
        $.ajax('/test/data4test/report_data.json', {
            dataType: 'JSON',
            success: function(response) {
                console.log(response);
                Report.reportData = response;
                Report.load();
            },
            error: function() {
                var errorMessage = ERROR.ERROR_GET_DATA_FAILED;

                $('.error').text(errorMessage);
                $('.report').hide();
            }
        });

        // for test, mock data from IndexDB

        // for release
    }

};

$(document).ready(function() {
    Report.init();

});
