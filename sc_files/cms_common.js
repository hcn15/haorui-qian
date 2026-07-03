/**
 * jQuery MD5 hash algorithm function
 */
(function ($) {
  var rotateLeft = function (lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  };
  var addUnsigned = function (lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  };
  var F = function (x, y, z) {
    return (x & y) | (~x & z);
  };

  var G = function (x, y, z) {
    return (x & z) | (y & ~z);
  };

  var H = function (x, y, z) {
    return x ^ y ^ z;
  };

  var I = function (x, y, z) {
    return y ^ (x | ~z);
  };

  var FF = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var GG = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var HH = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var II = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var convertToWordArray = function (string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWordsTempOne = lMessageLength + 8;
    var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
    var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  var wordToHex = function (lValue) {
    var WordToHexValue = '',
      WordToHexValueTemp = '',
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
    }
    return WordToHexValue;
  };

  var uTF8Encode = function (string) {
    string = string.replace(/\x0d\x0a/g, '\x0a');
    var output = '';
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        output += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        output += String.fromCharCode((c >> 6) | 192);
        output += String.fromCharCode((c & 63) | 128);
      } else {
        output += String.fromCharCode((c >> 12) | 224);
        output += String.fromCharCode(((c >> 6) & 63) | 128);
        output += String.fromCharCode((c & 63) | 128);
      }
    }
    return output;
  };

  $.extend({
    md5: function (string) {
      var x = Array();
      var k, AA, BB, CC, DD, a, b, c, d;
      var S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22;
      var S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20;
      var S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23;
      var S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;
      string = uTF8Encode(string);
      x = convertToWordArray(string);
      a = 0x67452301;
      b = 0xefcdab89;
      c = 0x98badcfe;
      d = 0x10325476;
      for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
        b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
        a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
        c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
        c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
        a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
        a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
        a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
        a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
        c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
        c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
        b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
        c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
        d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
        c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
        a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
        d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
        b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
      }
      var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
      return tempValue.toLowerCase();
    },
  });
})(jQuery);
var cms_common = {
  cmsCommonOs: function () {
    var ua = navigator.userAgent,
      isWindowsPhone = /(?:Windows Phone)/.test(ua),
      isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
      isAndroid = /(?:Android)/.test(ua),
      isFireFox = /(?:Firefox)/.test(ua),
      isChrome = /(?:Chrome|CriOS)/.test(ua),
      isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
      isPhone = /(?:iPhone)/.test(ua) && !isTablet,
      isPc = !isPhone && !isAndroid && !isSymbian,
      isLenovoAPP = /lenovomallapp/i.test(navigator.userAgent),
      isMiniprogramp = /miniprogram/i.test(navigator.userAgent),
      isLenovoOfficialApp = /lenovoofficialapp/i.test(navigator.userAgent);
    return {
      isPhone: isPhone,
      isAndroid: isAndroid,
      isPc: isPc,
      isApp: isLenovoAPP || isLenovoOfficialApp,
      isMiniprogramp: isMiniprogramp,
    };
  },

  cmsCommonGetTerminal: function () {
    if (cms_common.cmsCommonOs().isPc) {
      return 1;
    } else if (cms_common.cmsCommonOs().isApp) {
      return 3;
    } else if (cms_common.cmsCommonOs().isMiniprogramp) {
      return 5;
    } else if (cms_common.cmsCommonOs().isWxBrowser) {
      return 4;
    } else {
      return 2;
    }
  },
  // 获取url参数，用来判断装修页中的终端
  getUrlParam: function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return decodeURIComponent(r[2]);
    }
    return null;
  },

  /*
   * 初始化登录窗口
   * @param type 头类型  lenovo  think
   */
  poplogin: function (type) {
    function navTopDown() {
      $('.top_title').bind('mouseenter', function () {
        $(this).siblings('ul').stop(true, true).slideDown(300);
        $(this).find('a').removeClass('.top_down').addClass('top_up');
      });
      $('.top_link').bind('mouseleave', function () {
        $(this).find('ul').stop(true, true).slideUp(300);
        $(this).find('.top_title').find('a').removeClass('top_up').addClass('top_down');
      });
      $('.top_phone_title').bind('mouseenter', function () {
        $(this).siblings('ul').stop(true, true).slideDown(300);
        $(this).find('a').removeClass('.top_downs').addClass('top_ups');
      });
      $('.top_phone').bind('mouseleave', function () {
        $(this).find('ul').stop(true, true).slideUp(300);
        $(this).find('.top_phone_title').find('a').removeClass('top_ups').addClass('top_downs');
      });
    }

    try {
      var ticket = '';
      //初始化登录
      switch (type) {
        case 'lenovo':
          if ($('body').find('.add_nav').length == 0) {
            ticket = 'e40e7004-4c8a-4963-8564-31271a8337d8';
            var drawUserInfo = function () {
              $('.top_loginbtn').hide();
              $('.top_regist').hide();
              $('.top_usercenter').show();
              $('.top_phone_title')
                .html(passport.cookie.loginName + '<a href="#" class=" top_usepng top_downs"></a>')
                .parent()
                .show();
            };
            if (window.passport && passport.isLogin()) {
              drawUserInfo();
            }
            passport.init({
              ticket: ticket,
              drawUserInfo: drawUserInfo,
              logout: function () {
                $('.top_loginbtn').show();
                $('.top_regist').show();
                $('.top_usercenter').hide();
                $('.top_username').hide();
                $('.top_phone').hide();
              },
            });
            navTopDown();
            $('body')
              .delegate('.login', 'click', function () {
                passport.show();
              })
              .delegate('.logout', 'click', function () {
                passport.doLogout();
              });
            var reg = $('.regist');
            reg.attr('href', reg.attr('href') + window.location.href);
          } else {
            function getuserimg() {
              if (passport.isLogin()) {
                var lenovoid = passport.cookie.lenovoId;
                for (var i = passport.cookie.lenovoId.length; i < 20; i++) {
                  lenovoid = '0' + lenovoid;
                }
                var url =
                  'https://i.app.lefile.cn/uc_server/data/avatar' +
                  '/' +
                  lenovoid.substring(0, 5) +
                  '/' +
                  lenovoid.substring(5, 10) +
                  '/' +
                  lenovoid.substring(10, 15) +
                  '/' +
                  lenovoid.substring(15, lenovoid.length) +
                  '_profilehead.w50' +
                  '.jpg';
                $('.top_login_ing').css({
                  background: 'url(' + url + ') no-repeat',
                  backgroundSize: '35px',
                });
              }
            }

            ticket = 'e40e7004-4c8a-4963-8564-31271a8337d8';
            passport.init({
              ticket: ticket,
              drawUserInfo: function () {
                $('.top_loginbtn').hide();
                $('.top_phone').show();
                $('.top_phone ul').hide();
                $('.top_phone_title').html('<span>' + passport.cookie.loginName + '</span>');
                getuserimg();
              },
              login: function () {
                window.location.replace(document.URL);
              },
              logout: function () {
                $('.top_loginbtn').show();
                $('.top_phone').hide();
                window.location.replace(document.URL);
              },
            });
            $('body')
              .delegate('.login', 'click', function () {
                passport.show();
              })
              .delegate('.logout', 'click', function () {
                passport.doLogout();
              })
              .delegate('.regist', 'click', function () {
                passport.hide();
                regist.init(ticket);
              })
              .delegate('.forgetPwd', 'click', function () {
                passport.hide();
                recover.init(ticket);
              })
              .delegate('.gotomycenter', 'click', function () {
                location.href = '//i.lenovo.com.cn/info/center.jhtml?sts=e40e7004-4c8a-4963-8564-31271a8337d8';
              });
          }
          break;
        case 'think':
          ticket = 'bd123acd-42c5-4747-a6d6-09874ecaae6a';
          var drawUserInfo = function () {
            $('.ellipsis').html(passport.cookie.loginName);
            $('.think_login').hide();
            $('.think_register').show();
          };
          if (window.passport && passport.isLogin()) {
            drawUserInfo();
          }
          passport.init({
            ticket: ticket,
            drawUserInfo: drawUserInfo,
            logout: function () {
              ($('.think_login').show(), $('.think_register').hide());
            },
          });
          $('body')
            .delegate('.login', 'click', function () {
              passport.show();
            })
            .delegate('.logout', 'click', function () {
              passport.doLogout();
            });
          var reg = $('.regist');
          reg.attr('href', reg.attr('href') + window.location.href);
          break;
      }
    } catch (e) {
      console && console.log('login is fail' + e.message);
    }
  },
  hasheader: function () {
    var type = $('div[header]');
    if (type.length > 0) this.poplogin(type.attr('header'));
  },
  /**
   * 判断当前元素是否在浏览器的可视窗口
   */
  // isCurEleVisible: function (elem) {
  //   var $win = $(window)
  //   var $elem = $(elem)
  //   return (
  //     $win.height() + $win.scrollTop() > $elem.offset().top &&
  //     $win.scrollTop() < $elem.offset().top + $elem.height()
  //   )
  // },
  //判断一个元素是否在可视区域内
  isCurEleVisible: function (elem) {
    if (!elem || !elem.getBoundingClientRect) return false;

    var rect = elem.getBoundingClientRect();

    if (rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0) {
      return true;
    } else {
      return false;
    }
  },
  /**
   * 数组去重
   */
  unique: function (arr) {
    var res = [];
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
      if (!obj[arr[i]]) {
        obj[arr[i]] = 1;
        res.push(arr[i]);
      }
    }
    return res;
  },
  sliceArr: function (arr, split_len) {
    var temArr = [];
    for (var i = 0; i < arr.length; i += split_len) {
      var chunk = arr.slice(i, i + split_len);
      temArr.push(chunk);
    }
    return temArr;
  },
  /**
   * 页面中是否有gcode查商品价格, 解决页面刷新后显示多楼层
   */
  moreFloorHasgcode: function () {
    var arr = [],
      codeObject = {};
    var _index = 0;
    var _this = this;
    var _layoutuuid = '';
    // 判断是否装修页面
    // var isDecorationPage = window.location.host.indexOf('admin') > -1
    // if (isDecorationPage) {
    // $('[gcode]').each(function (index, ele) {
    //   var _t = $(ele)
    //   var index = index.toString()
    //   var gcode = _t.attr('gcode').toString()
    //   if (!/^(undefined|\s*|null)$/gi.test(gcode) && gcode != '') {
    //     arr.push(gcode)
    //     codeObject[gcode + _index.toString()] = _t
    //     _index++
    //   }
    // })
    // } else {
    $('[layoutid]').each(function (key, val) {
      var ismark = $(val).attr('ismark') === undefined;
      if ($(val).find('[layoutid]').length > 0) {
        return;
      }
      if (_this.isCurEleVisible(val) && ismark) {
        $(val)
          .find('[gcode]')
          .each(function (index, ele) {
            var _t = $(ele);
            var index = index.toString();
            var gcode = _t.attr('gcode').toString();
            if (!/^(undefined|\s*|null)$/gi.test(gcode) && gcode != '') {
              arr.push(gcode);
              codeObject[gcode + _index.toString()] = _t;
              _index++;
            }
          });
        $(val).attr('isMark', true);
        _layoutuuid = $(val).attr('layoutuuid');
      }
    });
    // }

    if (arr.length > 0) {
      if (arr.length > 15) {
        // 当一次请求商品code数量大于15，拆分请求
        var chunkArr = _this.sliceArr(arr, 15);
        for (var i = 0; i < chunkArr.length; i++) {
          _this.getprice(_this.unique(chunkArr[i]), codeObject, _layoutuuid, i);
        }
      } else {
        _this.getprice(_this.unique(arr), codeObject, _layoutuuid);
      }
    }
    //门店带参数
    if (window.location.href.indexOf('?') > -1) {
      $('a').each(function () {
        if ($(this).attr('href')) {
          if ($(this).attr('href').indexOf('nav.gotoMiniPro') > 0) {
            var str = $(this).attr('href').substring($(this).attr('href').indexOf('https'), $(this).attr('href').indexOf("')"));
            $(this).attr('href', "javascript:nav.gotoMiniPro('" + str + '?' + window.location.href.split('?')[1] + "')");
          } else if ($(this).attr('href').indexOf('.html') > 0 && $(this).attr('href').indexOf('?') == -1) {
            var str = window.location.href.substring(window.location.href.indexOf('?'), window.location.href.length);
            $(this).attr('href', $(this).attr('href') + str.replace('virtual_currency_area=1', 'temp=0'));
          }
        }
      });
    }
  },

  /**
   * 获取价格
   * arr page contain gcode
   * codeObject
   */
  getprice: function (arr, codeObject, layoutuuid, random) {
    var host = window.location.host,
      url;
    var parameter = window.location.search.substr(1);
    if (parameter.indexOf('terminal') != -1 && host.indexOf('admin') != -1) {
      if (host.indexOf('lenovouat') != -1) {
        url = host.indexOf('activity.lenovovip') != -1 ? '//papi.vip.lenovouat.com/open/goods/detail/mget' : '//f.lenovouat.com/goods/price/mget/B00001';
      } else {
        url = host.indexOf('activity.lenovovip') != -1 ? '//papi.lenovovip.com.cn/open/goods/detail/mget?isDetail=false' : '//f.lenovo.com.cn/goods/price/mget/B00001';
      }
    } else {
      //prd env invoke
      if (host.indexOf('lenovouat') != -1) {
        // uat环境
        if (host.indexOf('www.vip.lenovouat') != -1 || host.indexOf('m.vip.lenovouat') != -1) {
          // epp首页
          url = '//papi.vip.lenovouat.com/open/goods/price/mget/B00001';
        } else {
          //papi.vip.lenovouat.com/open/goods/detail/mget
          url = host.indexOf('activity.vip.lenovouat') != -1 ? '//papi.vip.lenovouat.com/open/goods/price/mget/B00001' : '//f.lenovouat.com/goods/price/mget/B00001';
        }
      } else {
        if (host.indexOf('www.lenovovip') != -1 || host.indexOf('m.lenovovip') != -1) {
          // epp首页
          url = '//papi.lenovovip.com.cn/open/goods/price/mget/B00001';
        } else {
          //papi.lenovovip.com.cn/open/goods/detail/mget?isDetail=false
          url = host.indexOf('activity.lenovovip') != -1 ? '//papi.lenovovip.com.cn/open/goods/price/mget/B00001' : '//f.lenovo.com.cn/goods/price/mget/B00001';
        }
      }
    }

    var arr = arr,
      codeObject = codeObject;
    try {
      $.ajax({
        url: 'https://papi.lenovo.com.cn/cache/time',
        type: 'get',
        dataType: 'json',
        success: function (time) {
          $.ajax({
            type: 'get',
            async: false,
            url: url,
            data: {
              code: arr.join(','),
              terminal: cms_common.cmsCommonGetTerminal(),
              pointType: 2,
            },
            xhrFields: {
              withCredentials: true,
            },
            dataType: 'jsonp',
            jsonpCallback: layoutuuid ? 'jQueryJSONP_batch_get' + layoutuuid.substr(0, 8) + '_' + (random ? random : 'normal') : 'callback' + Math.ceil(Math.random() * 1000),
            jsonp: 'jsonpCallback',
            success: function (json) {
              if (json.status == 0) {
                //成功
                var data = json.result;
                // var ids = ''
                for (var gcode in data) {
                  // ids += gcode + ','
                  var target = $('[gcode=' + gcode + ']');
                  // 商品组件添加媒体价格 2 秒杀 3预约抢购  4 秒杀倒计时 5 预约
                  var currentTime = time.curTime * 1000;
                  var isSecKill =
                    data[gcode]['P_C'] != undefined &&
                    data[gcode]['Activity'] != undefined &&
                    data[gcode]['Activity']['activityType'] === 2 &&
                    data[gcode]['Activity']['activiyStartTime'] <= currentTime
                      ? true
                      : false;
                  if (data[gcode] && data[gcode]['Activity'] && data[gcode]['Activity']['activityType'] == 5) {
                    isSecKill = false;
                  }

                  if (isSecKill) {
                    var secKillPrice = Number(data[gcode]['Activity']['discount']) + Number(data[gcode].P_C.C_2.P_0.DV.V);
                  }
                  try {
                    // 移动端
                    if (host.indexOf('mactivity') != -1 || host.indexOf('vip') != -1 || cms_common.getUrlParam('terminal') == 2 || host.indexOf('wap.lecoo') != -1) {
                      //epp
                      if (host.indexOf('vip') != -1) {
                        // if(data[gcode].price.Purchase && host.indexOf("vip")!= -1){
                        if (data[gcode].Purchase) {
                          if (data[gcode].P_C.C_2.P_0.DV.V - data[gcode].Purchase < 0 || data[gcode].P_C.C_2.P_0.DV.V - data[gcode].Purchase == 0) {
                            target.html('暂无报价');
                          } else {
                            // 价格均返回，展示最终价格，不可转化展示接口返回价格
                            if (Number(data[gcode].P_C.C_2.P_0.DV.V) && Number(data[gcode].Purchase)) {
                              var tempNum = data[gcode].P_C.C_2.P_0.DV.V - data[gcode].Purchase;
                              if (Number.isInteger(tempNum)) {
                                target.html(tempNum);
                              } else {
                                target.html(tempNum.toFixed(2));
                              }
                            } else {
                              target.html(data[gcode].P_C.C_2.P_0.DV.V);
                            }
                          }
                        } else {
                          if (data[gcode].P_C.C_2.P_0.DV.V < 0 || data[gcode].P_C.C_2.P_0.DV.V == 0) {
                            target.html('暂无报价');
                          } else {
                            target.html(data[gcode].P_C.C_2.P_0.DV.V);
                          }
                        }
                      } else {
                        // 商城
                        //虚拟品99乐豆购
                        if (String(gcode.substr(0, 2)) == '99' && data[gcode].isVirtuallyGoods == 1 && data[gcode].V_C) {
                          // 如果乐豆为空，展示暂无报价
                          if (data[gcode].V_C.C_2.V_1.DV.V == 0) {
                            target.parents('.goodsPrice').html('暂无报价');
                          } else {
                            // 价格
                            target.html(data[gcode].V_C.C_2.P_0.DV.V);
                            // 乐豆
                            target.siblings('[vcode=' + gcode + ']').html(data[gcode].V_C.C_2.V_1.DV.V);
                          }
                        } else {
                          if (!data[gcode].P_C) {
                            target.prev('.price_box_sign').css('display', 'inline-block');
                            target.html('待公布');
                          } else if (data[gcode].P_C && (data[gcode].P_C.C_2.P_0.DV.V < 0 || data[gcode].P_C.C_2.P_0.DV.V == 0)) {
                            target.html('暂无报价');
                          } else {
                            //渲染组件上的价格，增加国补价展示，优先于到手价
                            if (data[gcode] && data[gcode]?.deliveryPrice?.subsidyLabelDesc) {
                              // 修改价格
                              target.html(data[gcode].deliveryPrice.subsidyLabelDesc.price);

                              if (data[gcode].deliveryPrice.crossedPrice && data[gcode].deliveryPrice.crossedPrice.price) {
                                // 添加划线价
                                target.siblings('.old-price').html('￥' + data[gcode].deliveryPrice.crossedPrice.price);
                              }
                              if (data[gcode].deliveryPrice.subsidyLabelDesc && data[gcode].deliveryPrice.subsidyLabelDesc.desc) {
                                // 价格名称
                                target.siblings('.price-name').html(data[gcode].deliveryPrice.subsidyLabelDesc.desc);
                              }
                            } else {
                              if (data[gcode] && data[gcode].deliveryPrice) {
                                // 修改价格
                                target.html(
                                  data[gcode].deliveryPrice.deliverPrice.price != '' ? data[gcode].deliveryPrice.deliverPrice.price : data[gcode].deliveryPrice.crossedPrice.price
                                );

                                if (data[gcode].deliveryPrice.crossedPrice && data[gcode].deliveryPrice.crossedPrice.price) {
                                  // 添加划线价
                                  target.siblings('.old-price').html('￥' + data[gcode].deliveryPrice.crossedPrice.price);
                                }
                                if (data[gcode].deliveryPrice.deliverPrice && data[gcode].deliveryPrice.deliverPrice.desc) {
                                  // 价格名称
                                  target.siblings('.price-name').html(data[gcode].deliveryPrice.deliverPrice.desc);
                                }
                              } else {
                                target.html(data[gcode].P_C.C_2.P_0.DV.V);
                                if (isSecKill) {
                                  target.parents('.price').find('.activity-icon').show();
                                  target.parents('.price').find('.media-price-del').show().find('.deled-price-num').html(secKillPrice);
                                }
                              }
                            }
                          }

                          // 增加标签
                          if (data['tag'] && data['tag'][gcode]) {
                            // 标题增加活动标签
                            if (data['tag'][gcode]['wapLabelDetails'].length > 0) {
                              let pcActivityTagObj = data['tag'][gcode]['wapLabelDetails'][0];
                              target
                                .parents('.product-name-tag-box')
                                .find('.product-name-tag')
                                .html(
                                  `<img class="activity-tag" activityimg="${pcActivityTagObj.labelPic ? pcActivityTagObj.labelPic : ''}" src="${pcActivityTagObj.labelIcon}"/>`
                                );
                            }
                            // 国补标签subsidyLabelDetails，需要插入到所有标签的第二位
                            var guobuStr = '';
                            if (data['tag'][gcode].subsidyLabelDetails && data['tag'][gcode].subsidyLabelDetails.length > 0) {
                              var guobu = data['tag'][gcode].subsidyLabelDetails[0].split('-')[1];
                              guobuStr = `<div class="Promotions" style="border: 0.5px solid #009036;color: #009036;">${guobu}</div>`;
                            }

                            // 有活动标签salesDetails
                            if (data['tag'][gcode].salesDetails && data['tag'][gcode].salesDetails.length > 0) {
                              var activityName = data['tag'][gcode].salesDetails[0].split('-')[1];
                              var str = `<div class="Promotions activity">${activityName}</div>
                              ${data['tag'][gcode].PromotionDetails.map(function (item, index) {
                                var itemType = item.split('-')[0];
                                var itemName = item.split('-')[1];
                                if (itemType == 'zhekouquan' || itemType == 'jinequan' || itemType == 'manjianquan' || itemType == 'mianxiquan') {
                                  var type = `<div class="Promotions">${itemName}<span class="coupon-text">券</span></div>`;
                                } else {
                                  var type = `<div class="Promotions">${itemName}</div>`;
                                }
                                if (index === 1 && guobuStr) {
                                  type = guobuStr + type;
                                }
                                return type;
                              })}`;
                            } else {
                              // 只有PromotionDetails标签
                              var str = `${data['tag'][gcode].PromotionDetails.map(function (item, index) {
                                // 获取标签信息，来判断是否为优惠券
                                var itemType = item.split('-')[0];
                                var itemName = item.split('-')[1];

                                if (itemType == 'zhekouquan' || itemType == 'jinequan' || itemType == 'manjianquan' || itemType == 'mianxiquan') {
                                  var type = ` <div class="Promotions ${index ? '' : 'first'}">${itemName}<span class="coupon-text ${index ? '' : 'coupon'}">券</span></div>`;
                                } else {
                                  var type = ` <div class="Promotions ${index ? '' : 'first'}">${itemName}</div>`;
                                }
                                if (index === 1 && guobuStr) {
                                  type = guobuStr + type;
                                }
                                return type;
                              })}`;
                            }

                            target.parents('.product-box').siblings('.tags').html(str);
                          }
                        }
                      }
                    } else if (host.indexOf('lenovo') != -1 || cms_common.getUrlParam('terminal') == 1 || host.indexOf('activity.lecoo') != -1) {
                      if (host.indexOf('vip') != -1) {
                        // epp
                        if (data[gcode].Purchase) {
                          if (data[gcode].P_C.C_1.P_0.DV.V - data[gcode].Purchase < 0 || data[gcode].P_C.C_1.P_0.DV.V - data[gcode].Purchase == 0) {
                            target.html('暂无报价');
                          } else {
                            target.html(data[gcode].P_C.C_1.P_0.DV.V - data[gcode].Purchase);
                          }
                        } else {
                          if (data[gcode].P_C.C_2.P_0.DV.V < 0 || data[gcode].P_C.C_2.P_0.DV.V == 0) {
                            target.html('暂无报价');
                          } else {
                            target.html(data[gcode].P_C.C_2.P_0.DV.V);
                          }
                        }
                      } else {
                        //虚拟商品（乐豆）
                        if (String(gcode.substr(0, 2)) == '99' && data[gcode].isVirtuallyGoods == 1 && data[gcode].V_C) {
                          // 如果乐豆为空，展示暂无报价
                          if (data[gcode].V_C.C_1.V_1.DV.V == 0) {
                            target.parents('.goodsPrice').html('暂无报价');
                          } else {
                            // 价格
                            target.html(data[gcode].V_C.C_1.P_0.DV.V);
                            // 乐豆
                            target.siblings('[vcode=' + gcode + ']').html(data[gcode].V_C.C_1.V_1.DV.V);
                          }
                        } else {
                          // 非虚拟品
                          if (!data[gcode].P_C) {
                            target.prev('.price_box_sign').css('display', 'inline-block');
                            target.html('待公布');
                          } else if (data[gcode].P_C && (data[gcode].P_C.C_1.P_0.DV.V < 0 || data[gcode].P_C.C_1.P_0.DV.V == 0)) {
                            target.html('暂无报价');
                          } else {
                            //渲染组件上的价格, 增加国补价展示，优先于到手价
                            if (data[gcode] && data[gcode]?.deliveryPrice?.subsidyLabelDesc) {
                              target.html(data[gcode].deliveryPrice.subsidyLabelDesc.price);

                              if (data[gcode].deliveryPrice.crossedPrice && data[gcode].deliveryPrice.crossedPrice.price) {
                                // 添加划线价
                                target.siblings('.old-price').html('￥' + data[gcode].deliveryPrice.crossedPrice.price);
                              }

                              if (data[gcode].deliveryPrice.subsidyLabelDesc && data[gcode].deliveryPrice.subsidyLabelDesc.desc) {
                                // 价格名称
                                target.siblings('.price-name').html(data[gcode].deliveryPrice.subsidyLabelDesc.desc);
                              }
                            } else {
                              if (data[gcode] && data[gcode].deliveryPrice) {
                                // 修改价格
                                target.html(
                                  data[gcode].deliveryPrice.deliverPrice.price != '' ? data[gcode].deliveryPrice.deliverPrice.price : data[gcode].deliveryPrice.crossedPrice.price
                                );

                                if (data[gcode].deliveryPrice.crossedPrice && data[gcode].deliveryPrice.crossedPrice.price) {
                                  // 添加划线价
                                  target.siblings('.old-price').html('￥' + data[gcode].deliveryPrice.crossedPrice.price);
                                }

                                if (data[gcode].deliveryPrice.deliverPrice && data[gcode].deliveryPrice.deliverPrice.desc) {
                                  // 价格名称
                                  target.siblings('.price-name').html(data[gcode].deliveryPrice.deliverPrice.desc);
                                }
                              } else {
                                target.html(data[gcode].P_C.C_1.P_0.DV.V);
                                // 展示秒杀标签，做过到手价的商品直接删除
                                if (isSecKill) {
                                  target.parents('.price').find('.activity-icon').show();
                                  target.parents('.price').find('.media-price-del').show().find('.deled-price-num').html(secKillPrice);
                                }
                              }
                            }
                          }

                          // 增加标签
                          if (data['tag'] && data['tag'][gcode]) {
                            // 标题增加活动标签
                            if (data['tag'][gcode]['pcLabelDetails'].length > 0) {
                              let pcActivityTagObj = data['tag'][gcode]['pcLabelDetails'][0];
                              target
                                .parents('.product-name-tag-box')
                                .find('.product-name-tag')
                                .html(
                                  `<img class="activity-tag" activityimg="${pcActivityTagObj.labelPic ? pcActivityTagObj.labelPic : ''}" src="${pcActivityTagObj.labelIcon}"/>`
                                );
                            }

                            // 国补标签subsidyLabelDetails，需要插入到所有标签的第二位
                            var guobuStr = '';
                            if (data['tag'][gcode].subsidyLabelDetails && data['tag'][gcode].subsidyLabelDetails.length > 0) {
                              var guobu = data['tag'][gcode].subsidyLabelDetails[0].split('-')[1];
                              guobuStr = `<div class="Promotions" style="border: 0.5px solid #009036;color: #009036;">${guobu}</div>`;
                            }

                            // 有活动标签salesDetails
                            if (data['tag'][gcode].salesDetails && data['tag'][gcode].salesDetails.length > 0) {
                              var activityName = data['tag'][gcode].salesDetails[0].split('-')[1];
                              var str = `<div class="Promotions activity">${activityName}</div>

                                ${data['tag'][gcode].PromotionDetails.map(function (item) {
                                  var itemType = item.split('-')[0];
                                  var itemName = item.split('-')[1];
                                  if (itemType == 'zhekouquan' || itemType == 'jinequan' || itemType == 'manjianquan' || itemType == 'mianxiquan') {
                                    var type = `<div class="Promotions">${itemName}<span class="coupon-text">券</span></div>`;
                                  } else {
                                    var type = `<div class="Promotions">${itemName}</div>`;
                                  }
                                  if (index === 1 && guobuStr) {
                                    type = guobuStr + type;
                                  }
                                  return type;
                                })}`;
                            } else {
                              // 只有PromotionDetails标签
                              var str = `${data['tag'][gcode].PromotionDetails.map(function (item, index) {
                                // 获取标签信息，来判断是否为优惠券
                                var itemType = item.split('-')[0];
                                var itemName = item.split('-')[1];
                                if (itemType == 'zhekouquan' || itemType == 'jinequan' || itemType == 'manjianquan' || itemType == 'mianxiquan') {
                                  var type = `<div class="Promotions ${index ? '' : 'first'}">${itemName}<span class="coupon-text ${index ? '' : 'coupon'}">券</span></div>`;
                                } else {
                                  var type = `<div class="Promotions ${index ? '' : 'first'}">${itemName}</div>`;
                                }
                                if (index === 1 && guobuStr) {
                                  type = guobuStr + type;
                                }
                                return type;
                              })}`;
                            }
                            if (data['tag'][gcode].subsidyLabelDetails && data['tag'][gcode].subsidyLabelDetails.length > 0) {
                              var guobu = data['tag'][gcode].subsidyLabelDetails[0].split('-')[1];
                              str += `<div class="Promotions" style="border: 0.5px solid #009036;color: #009036;">${guobu}</div>`;
                            }
                            target.parents('.product-box').siblings('.tags').html(str);
                          }
                        }
                      }
                    }
                  } catch (e) {}
                }
                //获取对应图片 gimage
                var URl = '';
                if (window.location.host.indexOf('lenovouat') != -1) {
                  URl = 'https://f.lenovouat.com';
                } else {
                  URl = 'https://f.lenovo.com.cn';
                }
                $.ajax({
                  url: URl + '/goods/detail/mget/list/B00001',
                  type: 'get',
                  dataType: 'jsonp',
                  jsonpCallback: layoutuuid ? 'flightHandler' + layoutuuid.substr(0, 8) + '_' + (random ? random : 'normal') : 'callback' + Math.ceil(Math.random() * 1000),
                  jsonp: 'jsonpCallback',
                  async: false,
                  data: {
                    code: arr.join(','),
                    // terminal: cms_common.cmsCommonGetTerminal(),
                  },
                  success: function (json) {
                    var data = json.result;
                    // var idsArr = ids.slice(',', arr.length - 1).split(',')
                    for (var i = 0; i < arr.length; i++) {
                      for (var gimage in data) {
                        var address = data[gimage].adPicture ? data[gimage].adPicture : data[gimage].thumbnail.path;
                        if (arr[i] == gimage) {
                          var used = $('[gimage=' + gimage + ']').attr('src');
                          if (used == address) {
                            $('[gimage=' + gimage + ']').attr('src', used);
                          } else {
                            $('[gimage=' + gimage + ']').attr('src', address);
                          }
                        }
                        // 商品卡片动态更新商品名称和简介
                        var goodsTitle = data[gimage].name ? data[gimage].name : '';
                        var goodsBrief = data[gimage].brief ? data[gimage].brief : '';
                        if (arr[i] == gimage) {
                          if (goodsTitle != '') {
                            $('[gtitle=' + gimage + ']').text(goodsTitle);
                          }
                          if (goodsBrief != '') {
                            $('[gbrief=' + gimage + ']').text(goodsBrief);
                          }
                        }
                      }
                    }
                  },
                  error: function () {
                    console.log('ajax error');
                  },
                });
              }
            },
            error: function (error) {
              console.log(error);
            },
          });
          var stockCode = [];
          for (var i = 0; i < arr.length; i++) {
            var code = arr[i];
            stockCode.push({
              activityType: 0,
              productCode: code,
            });
          }
        },
      });
    } catch (e) {}
  },

  /**
   * 获取优惠券
   * couponId  优惠券id  business support lenovo_cms_common.getCoupon('asdfsdf1232');
   */
  getCoupon: function (couponId) {
    function getMd5Code() {
      var shopId = '1';
      var lenovoId = passport.cookie.lenovoId;
      var salt = 'cms1';
      var memberCode = passport.cookie.loginName;
      var _str = couponId + shopId + lenovoId + memberCode + salt;
      return $.md5(_str);
    }

    var damoURl = '';
    if (window.location.href.indexOf('lenovouat') != -1) {
      damoURl = 'https://buy.lenovouat.com';
    } else {
      damoURl = 'https://buy.lenovo.com.cn';
    }
    if (!passport.isLogin()) {
      if (window.location.href.indexOf('admin.lenovo') != -1) {
        if (window.location.search.split('&')[1].indexOf('terminal') != -1 && window.location.search.split('&')[1].split('=')[1] == 2) {
          var loginUrl = 'https://reg.lenovo.com.cn/auth/v1/login?ticket=b044d754-bda2-4f56-9fea-dcf3aecfe782&iswap=0&ru=';
          window.location.href = loginUrl + window.location.href;
        } else if (window.location.search.split('&')[1].indexOf('terminal') != -1 && window.location.search.split('&')[1].split('=')[1] == 1) {
          passport.show();
        }
      } else if (window.location.href.indexOf('mactivity.lenovo') != -1) {
        var loginUrl = 'https://reg.lenovo.com.cn/auth/v1/login?ticket=b044d754-bda2-4f56-9fea-dcf3aecfe782&iswap=0&ru=';
        window.location.href = loginUrl + window.location.href;
      } else {
        passport.show();
      }
    } else {
      try {
        var lenovoid = window.passport.cookie.lenovoId;
        var loginName = window.passport.cookie.loginName;
        if (couponId) {
          $.ajax({
            dataType: 'jsonp',
            jsonp: 'callbackparam',
            url: `${damoURl}/couponnew/api/coupon/neoBind.jhtm`,
            data: {
              license: 'CMS_V1',
              salesCouponId: couponId,
              getTerminal: cms_common.cmsCommonGetTerminal(),
              shopId: 1,
              lenovoId: lenovoid,
              memberCode: loginName,
              webSiteId: window.websiteCode,
              pageUrl: window.location.href,
              pageName: document.title,
              token: getMd5Code(),
            },
            success: function (db) {
              if (db.success || db.code == '00') {
                alert('领取成功');
              } else {
                if (db.resultMsg !== undefined) alert(db.resultMsg || '领取失败');
              }
            },
            error: function (db) {
              if (db.resultMsg !== undefined) alert(db.resultMsg || '系统繁忙请重试');
            },
          });
        }
      } catch (e) {}
    }
  },
  getEppCoupon: function (couponId) {
    function getMd5Code() {
      var shopId = '3';
      var lenovoId = passport.cookie.lenovoId;
      var salt = 'cms1';
      var memberCode = passport.cookie.loginName;
      var _str = couponId + shopId + lenovoId + memberCode + salt;
      return $.md5(_str);
    }

    var damoURl = '';
    if (window.location.href.indexOf('lenovouat') != -1) {
      damoURl = 'https://buy.lenovouat.com';
    } else {
      damoURl = 'https://buy.lenovovip.com.cn';
    }
    if (!passport.isLogin()) {
      if (window.location.href.indexOf('admin.lenovo') != -1) {
        if (window.location.search.split('&')[1].indexOf('terminal') != -1 && window.location.search.split('&')[1].split('=')[1] == 2) {
          var loginUrl = 'https://reg.lenovo.com.cn/auth/v1/login?ticket=b044d754-bda2-4f56-9fea-dcf3aecfe782&iswap=0&ru=';
          window.location.href = loginUrl + window.location.href;
        } else if (window.location.search.split('&')[1].indexOf('terminal') != -1 && window.location.search.split('&')[1].split('=')[1] == 1) {
          passport.show();
        }
      } else if (window.location.href.indexOf('mactivity.lenovo') != -1 || window.location.href.indexOf('bm.lenovo') != -1) {
        var loginUrl = 'https://reg.lenovo.com.cn/auth/v1/login?ticket=b044d754-bda2-4f56-9fea-dcf3aecfe782&iswap=0&ru=';
        window.location.href = loginUrl + window.location.href;
      } else {
        passport.show();
      }
    } else {
      try {
        var lenovoid = window.passport.cookie.lenovoId;
        var loginName = window.passport.cookie.loginName;
        if (couponId) {
          $.ajax({
            dataType: 'jsonp',
            jsonp: 'callbackparam',
            url: `${damoURl}/couponnew/api/coupon/neoBind.jhtm`,
            data: {
              license: 'CMS_V1',
              salesCouponId: couponId,
              getTerminal: cms_common.cmsCommonGetTerminal(),
              shopId: 3,
              lenovoId: lenovoid,
              memberCode: loginName,
              webSiteId: window.websiteCode,
              pageUrl: window.location.href,
              pageName: document.title,
              token: getMd5Code(),
            },
            success: function (db) {
              if (db.success || db.code == '00') {
                alert('领取成功');
              } else {
                if (db.resultMsg !== undefined) alert(db.resultMsg || '领取失败');
              }
            },
            error: function (db) {
              if (db.resultMsg !== undefined) alert(db.resultMsg || '系统繁忙请重试');
            },
          });
        }
      } catch (e) {}
    }
  },
  $pd: {
    curCode: 0,
  },
  /**
   * 立即预约函数 按钮上 lenovo_cms_common.makeAppointment('1000243')
   * @param {*} code 商品code
   */
  makeAppointment: function (code) {
    if (!code) {
      alert('系统繁忙，请稍后再试！');
      return;
    }
    var $pd = lenovo_cms_common.$pd;
    $pd['curCode'] = code;
    var cartDoman, pDoman, plat;
    var isLenovoAPP = /lenovomallapp/i.test(navigator.userAgent);
    var isLenovoOfficialApp = /lenovoofficialapp/i.test(navigator.userAgent);
    var isApp = isLenovoAPP || isLenovoOfficialApp;
    if (document.domain.indexOf('mactivity') == -1) {
      plat = 2;
    } else {
      plat = 1;
    }
    if (isApp) {
      plat = 3;
    }
    if (document.domain.indexOf('lenovouat') == -1) {
      loginUrl = 'https://reg.lenovo.com.cn/auth/v1/login?ticket=b044d754-bda2-4f56-9fea-dcf3aecfe782&iswap=0&ru=';
      cartDoman = '//buy.lenovo.com.cn/';
      pDoman = '//promotion.lenovo.com.cn/api/getSeckillActivityReservationUserNum.jhtm';
    } else {
      loginUrl = '//reg.lenovouat.com/auth/v1/login?ticket=b044d754-bda2-4f56-9fea-dcf3aecfe782&iswap=0&ru=';
      cartDoman = '//buy1.lenovouat.com/';
      pDoman = '//promotion.lenovouat.com/api/getSeckillActivityReservationUserNum.jhtm';
    }
    if (!$pd[code]) {
      $pd[code] = {
        isyybtnClick: false,
      };
    }
    if (window.passport && window.passport.isLogin()) {
      if ($pd[code] && $pd[code].isyybtnClick) {
        return;
      }
      jsonpShangouYuyue2(
        //进行预约
        function (data) {
          $pd[code].isyybtnClick = !$pd[code].isyybtnClick;
          if (data.rc == '0') {
            $pd[code].reservationId = data.reservationId; // 获取预约id
            $('#fix_mask, #window_shangouyy').fadeIn(500);
            try {
              var phoneNum = $('div.epp_layer_success');
              phoneNum.each(function (i, ele) {
                if (!$(this).is(':hidden')) {
                  loginname = passport.cookie.loginName;
                  var reg = /^1(3|4|5|7|8|9)[0-9]{9}$/g;
                  $(this).find('p').eq(0).empty();
                  if (reg.test(loginname)) {
                    $(this).find('input').eq(0).val(loginname);
                    $(this).find('p').eq(0).text('请确认/校正此手机号，用于接收活动开始提醒');
                  } else {
                    $(this).find('p').eq(0).text('请输入手机号，用于接收活动开始提醒');
                  }
                }
              });
            } catch (error) {}
          } else {
            alert(data.msg || '系统正忙, 请稍后再试!');
          }
        },
        function () {
          $pd[code].isyybtnClick = !$pd[code].isyybtnClick;
          alert('系统正忙, 请稍后再试!');
        }
      );
    } else {
      if (document.domain.indexOf('m.lenovo') == -1 || window.location.href.indexOf('mactivity.lenovo') != -1) {
        window.passport.show();
        passport.loginRedirect = window.location.href;
      } else {
        if (confirm('需要登录才能预约，您是否需要登录？')) {
          window.location.href = loginUrl + window.location.href;
        }
      }
    }

    function jsonpShangouYuyue2(success, error) {
      //进行预约
      var code = $pd.curCode || 0;
      $pd[code].isyybtnClick = !$pd[code].isyybtnClick;
      $.ajax({
        type: 'GET',
        url: cartDoman + 'addReservation.jhtml',
        data: {
          plat: plat,
          gcode: code,
        },
        dataType: 'jsonp',
        jsonp: 'callbackparam',
        success: success,
        error: function () {
          if (error && typeof error == 'function') {
            error();
          }
        },
        timeout: 5000,
      });
    }
  },
  getNewGuyVisibleFloor: function () {
    function showHidenFloor() {
      $('[data-newguy]').each(function (key, value) {
        if ($(value).attr('data-newguy') == 'new_person_visible') {
          $(value).show();
        }
      });
    }
    if (window.passport && !window.passport.isLogin()) {
      showHidenFloor();
      return;
    }
    var isProduction = window.location.hostname.indexOf('lenovo.com') > 0 || window.location.hostname.indexOf('lenovovip.com') > 0;
    $.ajax({
      type: 'get',
      url: isProduction ? 'https://buy.lenovo.com.cn/orderv2/order/queryFirstOrder.jhtm' : 'https://buy.lenovouat.com/orderv2/order/queryFirstOrder.jhtm',
      dataType: 'jsonp',
      jsonp: 'callback',
      error: function (err, status) {},
      success: function (data) {
        // t = 0 无首单购买 1 有首单购买
        if (data.t == 0) {
          showHidenFloor();
        }
      },
    });
  },
};

// 商品名称活动标签点击和关闭事件
$('.product-name-tag').on('click', '.activity-tag', function () {
  let activityimg = $(this).attr('activityimg');
  if (activityimg != '') {
    if (cms_common.cmsCommonGetTerminal() == 1) {
      // 如果存在弹窗元素，修改图图片路径直接展示（应该不会出现此情况）
      if ($('.activity-tags-bg').length > 0) {
        $('.activity-tags-bg .tags-img').attr('src', activityimg);
      } else {
        $('body').prepend(`<div class="activity-tags-bg"
        style="position: fixed; left: 0; top: 0; z-index:9999;width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: none; align-items: center; justify-content: center">
        <img class="tags-img" style="width: 338px; height: 442px" src="${activityimg}" alt="" />
      </div>`);
      }
      $('.activity-tags-bg').css('display', 'flex');
    } else {
      // 如果存在弹窗元素，修改图图片路径直接展示（应该不会出现此情况）
      if ($('.activity-tags-bg').length > 0) {
        $('.activity-tags-bg .tags-img').attr('src', activityimg);
      } else {
        $('body').prepend(`<div class="activity-tags-bg"
        style="position: fixed; left: 0; top: 0; z-index:999;width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: none; align-items: center; justify-content: center">
        <img class="tags-img" style="width: 2.8rem; height: 3.66rem" src="${activityimg}" alt="" />
      </div>`);
      }
      $('.activity-tags-bg').css('display', 'flex');
    }
    return false;
  }
  return false;
});

$(document).on('click', '.activity-tags-bg,.tags-img', function () {
  $('.activity-tags-bg').remove();
});

// 判断屏幕宽度，当屏幕宽度小于1200时，页面缩放80%
var device = navigator.userAgent.toLowerCase();
if (/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(device)) {
  //移动端
} else {
  //pc端
  // if (window.outerWidth < 1700) {
  //   $('html').css('zoom', '78%')
  // }
}

function getAllCoupon(activityType) {
  if (window.location.href.indexOf('uat') != -1) {
    $.getScript('https://m1.lenovouat.com/lenovo_cms/js/gift/getAllCoupon.js?t=' + new Date().getTime(), function () {
      getAllCouponSrc(activityType);
    });
  } else {
    $.getScript('https://m1.lefile.cn/lenovo_cms/js/gift/getAllCoupon.js?t=' + new Date().getTime(), function () {
      getAllCouponSrc(activityType);
    });
  }
}

//一件领取优惠券大礼包
function getDoubling(activityType) {
  if (window.location.href.indexOf('uat') != -1) {
    $.getScript('https://m1.lenovouat.com/lenovo_cms/js/gift/getDoubling.js?t=' + new Date().getTime(), function () {
      getDoublingSrc(activityType);
    });
  } else {
    $.getScript('https://m1.lefile.cn/lenovo_cms/js/gift/getDoubling.js?t=' + new Date().getTime(), function () {
      getDoublingSrc(activityType);
    });
  }
}

//优惠券大转盘
function setGift(getCode) {
  if (window.location.href.indexOf('uat') != -1) {
    $.getScript('https://m1.lenovouat.com/lenovo_cms/js/gift/setGift.js?t=' + new Date().getTime(), function () {
      setGiftSrc(getCode);
    });
  } else {
    $.getScript('https://m1.lefile.cn/lenovo_cms/js/gift/setGift.js?t=' + new Date().getTime(), function () {
      setGiftSrc(getCode);
    });
  }
}

if (!window.lenovo_cms_common) {
  window.lenovo_cms_common = cms_common;
} else {
  for (var k in cms_common) window.lenovo_cms_common[k] = cms_common[k];
}
$(function () {
  lenovo_cms_common.hasheader();
  lenovo_cms_common.moreFloorHasgcode();

  var isDecorationPage = window.location.host.indexOf('admin') > -1;

  if (isDecorationPage) {
    // 装修页
    $('#ui-content').scroll(function () {
      lenovo_cms_common.moreFloorHasgcode();
    });

    // 预览
    $(document).scroll(function () {
      lenovo_cms_common.moreFloorHasgcode();
    });
  } else {
    //获取不到window.scroll事件问题
    setInterval(function () {
      lenovo_cms_common.moreFloorHasgcode();
    }, 2000);

    // 发布后页面
    $(document).scroll(function () {
      lenovo_cms_common.moreFloorHasgcode();
    });
  }

  // 装修页面显示被隐藏楼层
  lenovo_cms_common.getNewGuyVisibleFloor();
});
