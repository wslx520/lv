/**
 * jQuery tooltip
 *
 * Copyright (c) 2009 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 1.0.0
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
 **/

(function ($) {
    var d = $('<div><div class="hd"></div><div class="bd"></div><div class="ft bb"></div></div>');

    //{position: 'auto', sticky: false, width: 'xxxpx', html: 'xxxx', isFocus: false, isSelect: false}
    var st = {
        position: 'auto', //位置
        cls: 'module g-tl',
        sticky: false //是否需要点击才能隐藏
    },
        bd = $('.bd', d),
        ft = $('.ft', d),
        doc = $(document),
        sd,
        ns = 'tooltip' + (new Date()).getTime(); //定义事件命名空间
    $('body').append(d);
    var tooltipSetTime;
    $.fn.tooltip = function (s) {
        var o = this;
        if (!s.time) {
            s.time = 5000;
        }
        if (o[0] && s.html) {
            s = $.extend({}, st, s);
            var show = function () {
                if (tooltipSetTime) {
                    clearTimeout(tooltipSetTime);
                    tooltipSetTime = null;
                }
                d[0].className = s.cls;
                //是否选中文本
                if (s.isSelect) {
                    o[0].select();
                }
                d.css({ left: 0, top: '-200px', display: 'block' });
                if (s.width) {
                    d.css({ width: s.width });
                }
                bd[0].innerHTML = s.html;
                ft.removeAttr('style');
                if ('left' == s.position || 'right' == s.position) {
                    ft[0].className = 'ft bl';
                }
                if (sd) { //取消事件绑定
                    doc.unbind('.' + ns);
                    sd.unbind('.' + ns);
                }
                sd = $(o[0]);
                var dw = doc.width(),
                    dh = doc.height(),
                    fs,
                    //tohide = 0,
                    pos = sd.offset(),
                    w = bd.outerWidth(),
                    h = bd.outerHeight(),
                    fh = ft.height(),
                    fw = ft.width(),
                    oh = sd.outerHeight(),
                    ow = sd.outerWidth();
                if ('auto' == s.position) {
                    ft[0].className = 'ft bb';
                    if (h + fh > pos.top) {
                        s.position = 'bottom';
                    } else {
                        s.position = 'top';
                    }
                }
                switch (s.position) {
                    case 'top':
                        ft[0].className = 'ft bb';
                        fs = pos.left + w - dw + 5;
                        if (fs > 0) {
                            d.css({ left: pos.left - fs, top: pos.top - h - fh });
                            ft.css({ left: fs + 5 });
                        } else {
                            d.css({ left: pos.left, top: pos.top - h - fh });
                        }
                        break;
                    case 'bottom':
                        ft[0].className = 'ft bt';
                        fs = pos.left + w - dw + 5;
                        if (fs > 0) {
                            d.css({ left: pos.left - fs, top: pos.top + oh + fh });
                            ft.css({ left: fs + 5 });
                        } else {
                            d.css({ left: pos.left, top: pos.top + oh + fh });
                        }
                        break;
                    case 'right':
                        ft[0].className = 'ft bl';
                        fs = pos.top + h - dh + 5;
                        if (fs > 0) {
                            d.css({ left: pos.left + ow + fw, top: pos.top - fs });
                            ft.css({ top: fs + 5 });
                        } else {
                            d.css({ left: pos.left + ow + fw, top: pos.top });
                        }
                        break;
                    case 'left':
                        ft[0].className = 'ft br';
                        fs = pos.top + h - dh + 5;
                        if (fs > 0) {
                            d.css({ left: pos.left - w - fw, top: pos.top - fs });
                            ft.css({ top: fs + 5 });
                        } else {
                            d.css({ left: pos.left - w - fw, top: pos.top });
                        }
                        break;
                    default:
                        d.css({ 'display': 'none' });
                        return;
                }
                if (!s.sticky) {
                    sd.bind('mouseout.' + ns, function (e) {
                        if (this === e.target) {
                            d.css({ 'display': 'none' });
                            sd.unbind('.' + ns);
                        }
                    });
                    /* setTimeout(function(){ //增加延迟
                        tohide = 1;
                    }, 999); */
                    doc.bind('keyup.' + ns, function (e) {
                        var t = e.target.tagName;
                        //if('INPUT' != t && 'BUTTON' != t && 'TEXTAREA' != t && tohide){
                        //d.css({'display':'none'});
                        //}
                        if (13 == e.keyCode) {
                            return;
                        }
                        if ('INPUT' == t || 'BUTTON' == t || 'TEXTAREA' == t) {
                            d.css({ 'display': 'none' });
                        }
                    });
                }
                doc.one('mousedown.' + ns, function () {
                    d.css({ 'display': 'none' });
                });
                $(o[0]).blur(function () {
                    d.css({ 'display': 'none' });
                }).mouseleave(function () {
                    d.css({ 'display': 'none' });
                });
                tooltipSetTime = setTimeout(function () {
                    clearTimeout(tooltipSetTime);
                    tooltipSetTime = null;
                    d.css({ 'display': 'none' });
                }, s.time);
            };
            //是否焦点定位
            if (s.isFocus) {
                o[0].focus();
                show();
            } else {
                show();
            }
        }
        return o;
    };
})(jQuery);
