var LV = (function (window) {
    var ieVersion = /msie (\d{1,2})/i.test(navigator.userAgent) && RegExp.$1 - 0;
    var lteIE8 = ieVersion ? ieVersion < 9 : false;
    function replace(str, loaners) {
        for(var i = 0; i < loaners.length; i++) {
            str = str.replace('{'+i+'}', loaners[i]);
        }
        console.log(str, loaners)
        return str;
    }
    function isString(str) {
        return 'string' === typeof str;
    }
    function isFn(fn) {
        return 'function' === typeof fn;
    }
    function isArray(arr) {
        return !!arr.splice;
    }
    var lang = {
        number: '只允许数字',
        names: '错误的名称格式',
        email: '错误的E-mail格式',
        pattern: '必须匹配 `{0}`',
        range_equal: '必须等于 {0}',
        range_scope: '必须大于 {0} 且小于 {1}',
        range_greater: '必须大于 {0}',
        range_less: '必须小于 {0}',
        range_no_number: '必须是数字',
        error_param: '错误的参数',
        length_equal: '长度必须等于 {0}',
        length_scope: '长度必须大于等于 {0} 且小于等于 {1}',
        length_greater: '长度必须大于等于 {0}',
        length_less: '长度必须小于等于 {0}',
        password: '密码格式不合规范',
        positive_int: '必须是正整数',
        required: '必填'
    };
    var Regexps = {
        number: /^-?\d+(\.{1}\d+)?$/,
        names: /^(\w+[\-']?\w+\s?)+$/i,
        email: /^[\w\+\-]+(\.[\w\+\-]+)*@[a-z\d\-]+(\.[a-z\d\-]+)*\.([a-z]{2,4})$/i,
        url: /^https?:\/\/([a-z0-9-]+\.)+[a-z]{2,}\/?.*/
    };
    var Rules = {
        number: function(val) {
            //正负数整数或小数
            return Regexps.number.test(val) || lang.number;
        },
        email: function(val) {
            //邮箱格式
            return Regexps.email.test(val) || lang.email;
        },
        url: function (val) {
            return Regexps.url.test(val) || lang.email;
        },
        required: function (val) {
            return val && val.trim().length > 0 || lang.required;
        },
        min: function (val, elem, limit) {
            console.log(val , limit);
            return val-0 >= limit-0 || replace(lang.range_greater, [limit]);
        },
        max: function (val, elem, limit) {
            console.log(val , limit, val <= limit);
            return val-0 <= limit-0 || replace(lang.range_less, [limit]);
        },
        minlength: function (val, elem, len) {
            return (val + '').length >= len || replace(lang.length_greater, [len]);
        },
        maxlength: function (val, elem, len) {
            return (val + '').length <= len || replace(lang.length_less, [len]);
        },
        pattern: function (val, elem, reg) {
            return RegExp(reg).test(val) || replace(lang.pattern, [reg]);
        },
        positiveInt: function (val) {
            return /^\d+$/.test(val) || lang.positive_int;
        },
        range: function(val, elem, params) {
            var a = params[0], b = params[1];
            val = val * 1;
            //数值范围
            //range(a,b) 大于a小于b
            //range(a,) 大于a
            //range(,b) 小于b
            //range(a) 等于a
            var numberRegExp = Regexps.number;
            if(numberRegExp.test(val)) {
                if((!a || numberRegExp.test(a)) || (!b || numberRegExp.test(b))) {
                    if(params.length === 1) {
                        return val == a || replace(lang.range_equal, [a]);
                    }else if(params.length === 2) {
                        if(a && b) {
                            return (val > a && val < b) || replace(lang.range_scope, [a,b]);
                        }else if(a) {
                            return (val > a) || replace(lang.range_greater, [a]);
                        }else if(b) {
                            return (val < b) || replace(lang.range_less, [b]);
                        }else {
                            return lang.error_param;
                        }
                    }
                }else {
                    return lang.error_param;
                }
            }else {
                return lang.range_no_number;
            }
        },
        length: function(val, elem, params) {
            //判断字符串长度范围，格式与range一致
            var a = params[0], b = params[1];
            var n = val && val.length;
            if(params.length === 1) {
                return n == a || replace(lang.length_equal, [a]);
            }else if(params.length === 2){
                if(a && b) {
                    return (n >= a && n <= b) || replace(lang.length_scope, [a,b]);
                }else if(a) {
                    return (n >= a) || replace(lang.length_greater, [a]);
                }else if(b) {
                    return (n <= b) || replace(lang.length_less, [b]);
                }else {
                    return lang.error_param;
                }
            }
        }
    };
    var defaults = {
        onFail: function (field, err) {
            // $(field).closest('td').find('valid-error').addClass('show').text('err');
            $(field).addClass('invalid');
            console.log(field, err);
        },
        onPass: function (field) {
            $(field).removeClass('invalid');
            console.log(field, 'passed!');
        },
        // 短路验证, 即有一个验证未通过, 则立即抛错, 不再验证后续规则
        short: true,
        // 输入时即验证
        testOnInput: true,
        // change 事件时验证
        testOnChange: true
    }
    // 多个参数会组成数组；一个参数则不会
    var getParams = function (att) {
        if (!att || att.indexOf(',') === -1) {
            return att;
        }
        return att.split(',');
    };
    function disposeErrString(vali, errString) {
        if (vali !== true) {
            errString.push(vali);
        }
    }
    function getRequired(field) {
        return typeof field.required === 'boolean' ? field.required : field.required != null;
    }
    function executeVali(fn, val, field, params) {
        return fn(val, field, params);
    }
    function doFieldRule(ruleF, rules) {
        if (isString(ruleF)) {
            doStringRules(ruleF, rules);
        } else if (isFn(ruleF)) {
            rules.push(ruleF);
        } else if (isArray(ruleF)) {
            rules = rules.concat(ruleF);
        } else if (Object.prototype.toString.call(ruleF) == "[object Object]") {
            if (ruleF.rule) {doFieldRule(ruleF.rule, rules)}
        }
    }
    function doAction(action, val, field, executed, rulesInConf) {
        if (isString(action)) {
            if (executed[action]) return true;
            executed[action] = true;
            var fn = rulesInConf && rulesInConf[action] || Rules[action];
            if (fn) {
                return fn(val, field);
            }
        } else if (isFn(action)) {
            return action(val, field);
        } else if (isArray(action)) {
            var a0 = action[0];
            if (executed[a0]) return true;
            executed[a0] = true;
            var fn = rulesInConf && rulesInConf[a0] || Rules[a0];
            return fn(val, field, action[1]);
        }
    }
    function doStringRules(str, rules) {
        str = str.split('|');
        for (var r = 0; r< str.length; r++) {
            var arule = str[r];
            var paramIndex = arule.indexOf('(');
            var params = '';
            if (~paramIndex) {
                // var arule = arule.substring(0, paramIndex);
                var ruleName = arule.substring(0, paramIndex);
                params = arule.slice(paramIndex + 1, -1);
                // console.log(arule, paramIndex, params);
                if (params) {
                    params = getParams(params);
                }
                arule = ruleName;
            }
            rules.push([arule, params]);
        }
    }
    function valis(field, short, rulesInConf, rulesInFields, onPass, onFail) {
        var _this = field, $this = $(_this);
        var name = _this.name;
        var val = _this.value;
        if (!_this._rules_) {
            var rules = _this._rules_ = [];
            var required = getRequired(_this);
            if (required) {
                rules.push('required');
            }
            var type = _this.type;
            if (Rules[type]) {
                rules.push(type);
            }
            for(var j in Rules) {
                var att = $this.attr(j);
                if (att != null) {
                    rules.push([j, getParams(att)]);
                }
            }
            // 最先验证 html 中写的规则
            var rulesInHtml = $this.attr('data-rules');
            if (rulesInHtml) {
                doStringRules(rulesInHtml, rules);
            }
            if (rulesInFields && rulesInFields[name]) {
                doFieldRule(rulesInFields[name], rules);
            }
        }
        var rules = _this._rules_;
        var executed = {};
        var errString = [];
        for (var r = 0; r< rules.length; r++) {
            var action = rules[r];
            var err = doAction(action, val, _this, executed, rulesInConf);
            if (err != true) {
                errString.push(err);
            }
            if (errString.length && short) {
                break;
            }
        }
        console.log(errString)
        if (errString.length) {
            onFail && onFail(_this, errString);
            return false;
        } else {
            onPass && onPass(_this);
            return true;
        }
    }
    var LV = function (form, conf) {
        if (typeof form === 'string') {
            form = $(form)[0];
        }
        conf = conf || {};
        var onFail = conf.onFail || defaults.onFail;
        var onPass = conf.onPass || defaults.onPass;
        var rulesInConf = conf.rules || {};
        var rulesInFields = conf.fields || {};
        var short = conf.short == null ? defaults.short : conf.short;

        // oninput 时的验证加入定时器延迟
        var inputTimer = null;

        if (!form.__watched__) {
            var eventTypes = [];
            var toi = conf.testOnInput == null ? defaults.testOnInput : conf.testOnInput;
            if (toi) {
                eventTypes.push('input');
                if (lteIE8) {
                    eventTypes.push('propertychange');
                }
            }
            var toc = conf.testOnChange == null ? defaults.testOnChange : conf.testOnChange;
            if (toc) {
                eventTypes.push('change');
            }
            // console.log(eventTypes);
            var $form = $(form);
            if (eventTypes.length) {
                // onpropertychange 事件不支持冒泡，所以在form上加上对应监听也没用
                $form.on(eventTypes.join(' '), 'input, select, textarea', function (e) {
                    // console.log(lteIE8, e, e.type, e.originalEvent.propertyName );
                    if (lteIE8 && e.type == 'propertychange' && e.propertyName != 'value') {
                        return;
                    }
                    clearTimeout(inputTimer);
                    var _this = this;
                    inputTimer = setTimeout(function () {
                        // validate(_this);
                        valis(_this, short, rulesInConf, rulesInFields, onPass, onFail);
                    },100);
                    
                })
            }
            $form.on('submit', function (e) {
                var _this = this;
                var elements = _this.elements;
                var vali, allVali = true;
                $.each(elements, function (i, field) {
                    if (field.name) {
                        vali = validate(field);
                        if (vali != true) {
                            allVali = false;
                            if (short) {
                                return false;
                            }
                        }
                    }
                });
                if (conf.onSubmit) {
                    conf.onSubmit(allVali, _this);
                }
                return false;
            });
            form.__watched__ = true;
        }
        // form._validate = validate;
        form._validate = function (field) {
            return valis(field, short, rulesInConf, rulesInFields, onPass, onFail);
        };
        // console.log(form, form._validate);
    };
    LV.setDefaults = function (obj) {
        $.extend(defaults, obj);
        if (obj.rules) {
            $.extend(Rules, obj.rules);
        }
    };
    LV.addRule = function (ruleName, fn) {
        Rules[ruleName] = fn;
    };
    // 直接验证某个字段
    LV.vali = function (field, callback) {

        if (field.tagName === 'FORM') {
            if (field.vali) {
                var vali = field.vali(field);
                if (callback) callback(vali, field);
            }
        } else {
            var form = field.form;
            // console.log(field, form,form._validate);
            if (form && form._validate) {
                var vali = form._validate(field);
                if (callback) callback(vali, field);
            } else {
                // var vali = defaultVali(field, true, callback);
                var vali = valis(field, false, null, null, LV.getDefaults().onPass, LV.getDefaults().onFail);
                if (callback) callback(vali, field);
            }
        }
    };
    LV.optional = function (field) {
        return field.required == null && field.value == '';
    };
    LV.unwatch = function (form) {
        
    };
    // 确保外部不能直接使用 lv.defaults = {}来覆盖 defaults
    LV.getDefaults = function () {
        return defaults;
    }
    return LV;
})(this);

(function (LV) {
    var defaultonFail = LV.getDefaults().onFail;
    LV.setDefaults({
        onFail: function (field, errString) {
            if (!errString.length) {
                return;
            }
            defaultonFail(field, errString);
            try {
                $(field).tooltip({ html: errString.join(';'), isFocus: true, sticky: true });
            } catch (e) {
                console.log(e.stack);
            }
        }
    });
})(LV);
