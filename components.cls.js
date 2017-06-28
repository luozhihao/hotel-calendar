/************
 *  日历组件 ver 0.1.1
 *  author: yam
 *  date: 2016年4月27日
 *  parameters:
 *		mdate     需要渲染的月份 支持 xxxx-xx 或 xx格式，xx格式为当年月份
 *  	options
 *			{
 *				offset: 0,           //当模式是 auto:true 时组件会自动根据父节点宽度计算每个天节点的宽度
 *  	                               offset 可以在计算的宽度基础上 + offset 的值（可为负数及减少宽度）
 *				head: "cal-header",  //星期样式
 *				cell: "cal-cell",    //普通工作日样式
 *				weekend: "cal-weekend",  //周末样式
 *				normal: "no-cell",   //为让日期与星期对齐填充节点样式
 *				sunday: true,        //讲星期日放在第一位 true|false  true时在第一位
 *				active: "cal-active",//激活日期样式 暂无用处
 *				today: "cal-today",  //系统时间当天样式
 *              adddatecls: false,   //是否添加日期class    @+added: 2016年5月3日
 *				auto: true           //是否自动计算各个日期节点宽度 true|false 默认true
 *			};
 *  	cellfn 渲染到每个日期节点时的回调函数 函数体的上下文为日期节点本身
 *   	       追加一个calendar属性 通过 this.calendar 调用
 *   	       {type: "cell", year: 年, month: 月, date: 日, week: 星期(0-6)}
 *  	headfn 渲染到每个星期节点时的回调函数 上下文为节点本身
 *   	       追加一个calendar属性 通过 this.calendar 调用
 *   	       {type: "header", value: 星期(0-6)}
 *  others:
 *   	在节点执行该函数后，该函数会给节点追加一个 calendar 参数，内容：
 *   	.calendar.date {year: 年, month: 月}
 *   	.calendar.original 及为节点本身
 *  usage:
 *   	$(...).fenCal("2016-12", {...});	指定月
 *   	$(...).fenCal({....});				当前月
 *   	$(...).fenCal(cellfn);				当前月并设置日期节点回调
 *   	$(...).fenCal(cellfn, headfn);      ........................和星期头节点回调
 *   	$(...).fenCal("13", {...}, cellfn, headfn);
 *************/

$.fn.fenCal = function(mdate, options, cellfn, headfn) {
    /*var ___m = {January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12};*/
    var v = this;
    if (v.hasClass("has-calendar-render-end")) {
        return v
    };
    var z = {
        now: new Date()
    };
    var week = ["日", "一", "二", "三", "四", "五", "六"]; //星期
    var lenDay = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; //每月天数
    var o = {
        offset: 0,
        head: "cal-header",
        cell: "cal-cell",
        weekend: "cal-weekend",
        normal: "no-cell",
        sunday: true,
        active: "cal-active",
        today: "cal-today",
        adddatecls: false,
        auto: true
    };
    var t = {
        archeck: function() {
            switch (typeof(mdate)) {
                case "object":
                    options = mdate;
                    mdate = undefined;
                    break;
                case "function":
                    cellfn = mdate;
                    mdate = undefined;
                    break;
            }
            switch (typeof(options)) {
                case "function":
                    headfn = options;
                    options = {};
                    break;
                case "string":
                    mdate = options;
                    options = {};
                    break;
            }
        },
        isleap: function(year) {
            return 0 === year % 4 && 0 !== year % 100 || 0 === year % 400;
        },
        err: function(e) {
            throw new Error(e);
        },
        analyse: function(a) {
            var n = null,
                b = {};
            if (a == undefined)
                n = new Date();
            else {
                if (a.indexOf("-") > -1) {
                    var d = a.split("-");
                    n = new Date(d[0], d[1] - 1, 1);
                } else
                    n = new Date(z.now.getFullYear(), a - 1, 1);
            }
            b.year = n.getFullYear(); //年份
            b.month = n.getMonth() + 1; //月份
            //月天数
            if (b.month == 2) {
                b.dayCount = t.isleap(b.year) ? 29 : 28;
            } else {
                b.dayCount = lenDay[b.month - 1];
            }
            b.startWeek = (new Date(b.year, b.month - 1, 1)).getDay(); //1号星期几
            //需要渲染的月份时候包含当前日期 包含为日期 不包含为-1
            b.today = (n.getFullYear() == z.now.getFullYear() && n.getMonth() == z.now.getMonth()) ? z.now.getDate() : -1;
            $.extend(z, b);
        },
        cellwidth: function() {
            return Math.floor(v.width() / 7) + o.offset;
        },
        nocount: function() { //获取日历需要填充的数量
            return o.sunday ? z.startWeek : z.startWeek - 1;
        },
        digit: function(n) {
            return n < 10 ? '0' + (n | 0) : n;
        },
        cell: function(text, width, fn, parent, attr) {
            var _t = $("<div/>").text(text);
            if (attr.type == "header") { _t.addClass(o.head) }
            if (attr.type == "cell") {
                _t.addClass(o.cell);
                if (o.adddatecls) {
                    _t.addClass("cal-date-" + [attr.year, this.digit(attr.month), this.digit(text)].join(""));
                }
                if (attr.date == z.today) {
                    _t.addClass(o.today)
                }
            }
            _t[0].calendar = attr;
            if (o.auto) { _t.css({ width: width }); }
            if (fn && typeof(fn) == "function") {
                _t[0].calFn = fn;
                _t[0].calFn.call(_t[0]);
            }
            _t.appendTo(parent);
            return _t;
        }
    };
    t.archeck(); //参数检查
    if (mdate == undefined) { //没有指定日期
    } else {
        if (!/^(20\d{2}\-)?([1-9]|(0[1-9])|1[0,1,2])$/.test(mdate)) { //指定渲染日期
            t.err("需要渲染的日期格式不正确，正确格式为年份-月份(2016-10)或者只输入月份(12)");
        }
    }
    //.call(作用域,arg1,arg2,arg3...)  //可将方法绑定到另一个指定对象上运行 更改上下文
    //.apply(作用域,[arg1,arg2,arg3...])
    var JRender = function() {
        $.extend(o, options);
        t.analyse(mdate); //日期分析
        var w = t.cellwidth(); //计算单元格宽度
        if (o.sunday == false) {
            week.splice(0, 1);
            week.push("日");
        }
        //渲染星期
        for (var i = 0; i < 7; i++) {
            t.cell(week[i], w, headfn, v, { type: "header", value: i });
        }
        //渲染1号之前的天保证星期对齐
        var nocount = t.nocount(),
            nohtml = "";
        for (var i = 0; i < nocount; i++) {
            nohtml = nohtml + '<div class="' + o.normal + '"' + (o.auto ? (' style="width: ' + w + 'px"') : '') + '>&nbsp;</div>';
        }
        $(nohtml).appendTo(v);
        //渲染月份中的每一天
        var wk = -1;
        for (var i = 1; i < z.dayCount + 1; i++) {
            if (wk == -1) {
                wk = z.startWeek;
            } else {
                wk++;
            }
            if (wk == 7) wk = 0;
            t.cell(i, w, cellfn, v, { type: "cell", year: z.year, month: z.month, date: i, week: wk, datestr: z.year + '-' + z.month + '-' + i });
        }
        //渲染月末之后的天，保证星期对齐
        var endnocount = o.sunday ? 6 - wk : 7 - wk;
        nohtml = "";
        for (var i = 0; i < endnocount; i++) {
            nohtml += '<div class="' + o.normal + '"' + (o.auto ? (' style="width: ' + w + 'px"') : '') + '>&nbsp;</div>';
        }
        $(nohtml).appendTo(v);
        v.addClass("has-calendar-render-end");
        this.date = { year: z.year, month: z.month };
        this.original = v;
        v[0].calendar = this;
    }
    $.fn.fenCal.haha = z; //@+added: 添加定量参数主要就是为了获取当前日期，不需要再创建新date对象 yam 2016年7月7日 ;-p
    return new JRender();
};