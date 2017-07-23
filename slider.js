(function(root, factory){
  "use strict";
  // 忽略判断执行环境是否为NODE，直接默认是浏览器window
  if(typeof module === 'object' && typeof module.exports === 'object'){
    module.exports = factory(root, true);
  }else{
    factory(root);
  }
}(window, function(window, noGlobal){
  
  // START==================================================================== //

  /***********/
  var EventUtil = {
    addHandler: function(el, type, handler){
      if(el.addEventListener){
        el.addEventListener(type, handler, false);
      }else if(el.attachEvent){
        el.attachEvent('on' + type, handler);
      }else{
        el['on' + type] = handler;
      }
    },
    removeHandler: function(el, type, handler){
      if(el.removeEventListener){
        el.removeEventListener(type, handler, false);
      }else if(el.detachEvent){
        el.detachEvent('on' + type, handler);
      }else{
        el['on' + type] = null;
      }
    },
    getEvent: function(event){
      return event ? event : window.event;
    },
    getTarget: function(event){
      return event.target || event.srcElement;
    },
    preventDefault: function(event){
      if(event.preventDefault){
        event.preventDefault();
      }else{
        event.returnValue = false;
      }
    },
    stopPropagation: function(event){
      if(event.stopPropagation){
        event.stopPropagation();
      }else{
        event.cancelBubble = true;
      }
    }
  };

  function _extend(target, source){
    for(var i in source){
      target[i] = source[i];
    }
    return target;
  }

  /***********/
  function slider(el, opt){
    /*********Default Config***********/
    this.currentIndex = 0;
    this.percent = 0.5;
    this.delay = 2000;
    this.auto = true;
    this.timer = null;

    /*********Render***********/
    var _BOX = document.querySelector(el), _wrap = _BOX.querySelector('.wrap'), _items = _wrap.querySelectorAll('.slider-item');
    this.screenWidth = _BOX.clientWidth;
    this.screenHeight = _BOX.clientHeight;
    this.length = _items.length;
    this.width = this.length * _BOX.clientWidth;
    this.maxL = parseInt(this.screenWidth / 2);
    this.minL = -(this.width - parseInt(this.screenWidth / 2));

    _wrap.style.width = this.length * _BOX.clientWidth + 'px';
    _items.forEach(function(item, index){
      item.style.width = _BOX.clientWidth + 'px';
      item.style.height = _BOX.clientHeight + 'px';
    });

    /*********EVENT***********/
    var _touch = {};
    //start
    EventUtil.addHandler(_BOX, 'touchstart', function(e){
      e = EventUtil.getEvent(e);
      var _start = e.targetTouches[0];
      _touch.startX = parseInt(_start.pageX);
      var _posX = _wrap.style.transform.replace(/[^0-9\-,]/g,'').split(',')[0].slice(1);
      _posX ? _posX = parseInt(_posX) : _posX = 0;
      _touch.posX = _posX;
      _wrap.style.transition = null;
      e.stopPropagation();
    }.bind(this));
    //move
    EventUtil.addHandler(_BOX, 'touchmove', function(e){
      e = EventUtil.getEvent(e);
      var _move = parseInt(e.targetTouches[0].pageX) - _touch.startX + _touch.posX;
      if(this.timer){
        clearTimeout(this.timer);
      }
      //console.log(typeof(_move))
      if(_move < this.minL){
        _move = this.minL;
      }else if(_move > this.maxL){
        _move = this.maxL;
      }
      _wrap.style.transform = 'translate3d(' + _move + 'px, 0, 0)';
      e.stopPropagation();
    }.bind(this));
    //end
    EventUtil.addHandler(_BOX, 'touchend', function(e){
      e = EventUtil.getEvent(e);
      var _endX = _wrap.style.transform.replace(/[^0-9\-,]/g,'').split(',')[0].slice(1), _index;
      console.log( _wrap.style.transform.replace(/[^0-9\-,]/g,'').split(',')[0])
      console.log(_endX)
      
      if(_endX >= 0){
        _index = 0;
      }else{
        var _num = Math.abs(_endX) / this.screenWidth;
        _index = Math.floor(_num);
        console.log(_num)
        console.log(_index)

        if(_num - _index > this.percent){
          _index++;
        }
      }
      this.go(_index);
      e.stopPropagation();
    }.bind(this));
    //transitionend
    EventUtil.addHandler(_wrap, 'transitionend', function(){
      var _this = this;
      if(_this.auto){
        _this.timer = setTimeout(function(){
          _this.go();
        }, _this.delay);
      }
    }.bind(this));

    /*********API***********/
    this.go = function(index){
      var _this = this, _go = 0;
      if(index >= _this.length-1){
        _this.currentIndex = _this.length - 1;
      }else{
        _this.currentIndex = index;
      }
      _go = -_this.currentIndex * _this.screenWidth;
      clearTimeout(_this.timer);
      _wrap.style.transform = 'translate3d(' + _go + 'px, 0, 0)';
      _wrap.style.transition = 'all .4s ease';
    };
    

    /*********Init***********/
    if(this.auto){
      this.timer = setTimeout(function(){
        this.go();
      }.bind(this), this.delay);
    }
  }

  // END==================================================================== //
  if(typeof define === 'function' && define.cmd){
    define('', [], function(){
      return slider;
    });
  }
  // 正常src引入
  if(!noGlobal){
    window.slider = slider;
  }

  return slider;
}));