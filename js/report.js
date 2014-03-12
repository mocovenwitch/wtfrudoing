/**
 * Created by lenehuang on 3/3/14.
 */

$.fn.peity.defaults.pie = {
  delimiter: null,
  diameter: 16,
  fill: [
    "#ff9900",
    "#ffbb00",
    "#ffee00",
    "#fff4dd",
    "#ffff00",
    "#ffd592"],
  height: 300,
  width: 300
}

var MESSAGE = {
  'music': '花了 @@ &&听音乐，你真的可以好好做事吗？骗鬼把。',
  'game': '好吧，你花了 @@ &&打游戏，需要我提醒你，打游戏找不到女朋友吗……',
  'eshop': '逛网店 @@ &&，信用卡透支的滋味，好好尝尝吧。',
  'sns': '社交网络占据了你 @@ &&，真的这么寂寞吗？',
  'video': '总共花了 @@ &&看韩剧、美剧、日剧、中剧，你导演的吗？看得这么有劲。',
  'news': '新闻需要看 @@ &&吗？赶紧做事去吧。',
  'mocoven': '谢谢访问默考文的主页，但是用不着花 @@ &&吧',
  'search': '你在搜索什么？需要花掉 @@ &&',
  'study': '看起来好像花了 @@ &&在学习，不过效果怎么样，谁知道呢',
  'other':'鬼知道你都乱七八糟干了些什么， @@ &&！'
};

var ERROR = {
  ERROR_GET_DATA_FAILED: '数据库好像坏了，没有拿到数据……重新下载应用吧……不好意思'
};

//types: eshop/sns/music/video/game/news/other

var Report = {
  chart: $('span.pie'),
  init: function() {
    this.getData();
  },
  renderToPage: function() {
    var pieParts = '';
    $.each(this.reportData, function(index, item) {
      pieParts += ',' + item.time;
    
      var msg = MESSAGE[item.type].replace('@@', item.time).replace('&&', '分钟');
      $('.descriptions').append('<p class=\"description-' + index + '\">' + msg + '</p>');
    });

    pieParts = pieParts.toString().substring(1, pieParts.length);
    $('.report').find('.pie').text(pieParts);
    this.chart.peity('pie');
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
      var errorMessage = ERROR.ERROR_GET_DATA_FAILED;

      $('.error').text(errorMessage);
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
        if(!!data) {
          Report.reportData = data;
          Report.renderToPage();
        }
      });
    } catch(e) {
      console.log('nodata');
    }
  }

};

$('#clear_history').click(function() {
  chrome.storage.sync.clear();
  alert('数据都清除了，让我们重头开始吧');
});

$(document).ready(function() {
  Report.init();

});
