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

var MESSAGE_DESCRIPTION = {
  'music': '花了 @@ &&听音乐，你真的可以好好做事吗？骗鬼把。',
  'game': '好吧，你花了 @@ &&打游戏，需要我提醒你，打游戏找不到女朋友吗……',
  'eshop': '逛网店 @@ &&，信用卡透支的滋味，好好尝尝吧。',
  'sns': '社交网络占据了你 @@ &&，真的这么寂寞吗？',
  'video': '总共花了 @@ &&看韩剧、美剧、日剧、中剧，你导演的吗？看得这么有劲。',
  'news': '新闻需要看 @@ &&吗？赶紧做事去吧。',
  'mocoven': '谢谢访问默考文的主页，但是用不着花 @@ &&吧',
  'search': '你在搜索什么？需要花掉 @@ &&',
  'study': '看起来好像花了 @@ &&在学习，不过效果怎么样，谁知道呢',
  'other':'你访问了一些乱七八糟的网站，鬼知道干了些什么，只知道你花了 @@ &&！'
};

var MESSAGE_COMMON = {
    'RESET': '数据都清除了，让我们重头开始吧',
    'TITLE': '看看你都干了些什么！',
    'APP_DESCRIPTION': '有一些计划做了好多年了，比如学一种弦乐；有一些决心下了 50 遍了，比如「如果我再把学英文的时间拿去逛淘宝，'
                       + '就！剁！手！」「如果我再把学『解剖学』的时间拿去刷微博，就不准吃三文鱼刺身！」结果呢，5 年过去了，说好的学弦乐呢？信用卡账单也把眼球吓掉了吧？'
                       + '那你的手剁了吗？至于解剖学……你能立刻说出窦房结在哪里以及它的功能吗？<br><br>所以，好好看看，你都干了些什么吧。',
    'UNIT': '分钟',
    'COMMENTS': '送你一句话：亲爱的，滚去学习吧',
    'NOTHING': '你还什么都没有干呢……'
}

var ERROR = {
  ERROR_GET_DATA_FAILED: '数据库好像坏了，没有拿到数据……重新下载应用吧……不好意思'
};

//types: eshop/sns/music/video/game/news/other

var Report = {
  chart: $('span.pie'),
  init: function() {
    $('#app_description').html(MESSAGE_COMMON['APP_DESCRIPTION']);
    $('.title').text(MESSAGE_COMMON['TITLE']);
    $('.comments').text(MESSAGE_COMMON['COMMENTS']);

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
