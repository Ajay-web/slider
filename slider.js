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
  function Slider(el){
    this.init(el);
  }
  Slider.prototype = {
    currentIndex: 0,
    config: {
      auto: true,
      delay: 2000,
      percent: 0.5
    },
    init: function(el){
      var self = this;
      self.render(el);
      self.event();

      if(self.config.auto){
        self.timer = setTimeout(function(){
          this.go();
        }.bind(self), self.config.delay);
      }
    },
    render: function(el){
      var self = this;
      var _BOX = self._BOX = document.querySelector(el),
          _wrap = self._wrap = _BOX.querySelector('.wrap'),
          _items = _wrap.querySelectorAll('.slider-item');
          
      self.screenWidth = _BOX.clientWidth;
      self.screenHeight = _BOX.clientHeight;
      self.length = _items.length;
      self.width = self.length * _BOX.clientWidth;
      self.maxL = parseInt( self.screenWidth / 2 );
      self.minL = -( self.width - parseInt( self.screenWidth / 2 ));

      _wrap.style.width = self.length * _BOX.clientWidth + 'px';
      _items.forEach(function(item, index){
        item.style.width = _BOX.clientWidth + 'px';
        item.style.height = _BOX.clientHeight + 'px';
      });
    },
    event: function(){
      var self = this;
      self._touch = {};
      //start
      EventUtil.addHandler(self._BOX, 'touchstart', function(e){
        e = EventUtil.getEvent(e);
        var _start = e.targetTouches[0];
        this._touch.startX = parseInt(_start.pageX);
        var _posX = this._wrap.style.transform.replace(/[^0-9\-,]/g,'').split(',')[0].slice(1);
        _posX ? _posX = parseInt(_posX) : _posX = 0;
        this._touch.posX = _posX;
        this._wrap.style.transition = null;
        e.stopPropagation();
      }.bind(self));
      //move
      EventUtil.addHandler(self._BOX, 'touchmove', function(e){
        e = EventUtil.getEvent(e);
        var _move = parseInt(e.targetTouches[0].pageX) - this._touch.startX + this._touch.posX;
        if(this.timer){
          clearTimeout(this.timer);
        }
        //console.log(typeof(_move))
        if(_move < this.minL){
          _move = this.minL;
        }else if(_move > this.maxL){
          _move = this.maxL;
        }
        this._wrap.style.transform = 'translate3d(' + _move + 'px, 0, 0)';
        e.stopPropagation();
      }.bind(self));
      //end
      EventUtil.addHandler(self._BOX, 'touchend', function(e){
        e = EventUtil.getEvent(e);
        var _endX = this._wrap.style.transform.replace(/[^0-9\-,]/g,'').split(',')[0].slice(1), _index;
        /*
        console.log(_endX)*/
        /*if(e.currentTarget === this._BOX){
          console.log('----')
          console.log(e.currentTarget)
        }
        console.log(e)
        console.log(e.eventPhase)
*/        
        if(_endX >= 0){
          _index = 0;
        }else{
          var _num = Math.abs(_endX) / this.screenWidth;
          _index = Math.floor(_num);
          if(_num - _index >= this.config.percent){
            _index++;
          }
        }
        this.go(_index);
        e.stopPropagation();
        e.preventDefault();
      }.bind(self));
      //transitionend
      EventUtil.addHandler(self._wrap, 'transitionend', function(){
        var _this = this;
        if(_this.config.auto){
          _this.timer = setTimeout(function(){
            _this.go();
          }, _this.config.delay);
        }
      }.bind(self));
    },
    go: function(index){
      var self = this, _go = 0;
      if(index){
        self.currentIndex = index;
      }else{
        self.currentIndex++;
      }
      if(self.currentIndex > self.length-1){
        self.currentIndex = 0
      }
      _go = -self.currentIndex * self.screenWidth;
      clearTimeout(self.timer);
      self._wrap.style.transition = 'all .4s ease';
      self._wrap.style.transform = 'translate3d(' + _go + 'px, 0, 0)';
    }
  };
  

  // END==================================================================== //
  if(typeof define === 'function' && define.cmd){
    define('', [], function(){
      return Slider;
    });
  }
  // 正常src引入
  if(!noGlobal){
    window.Slider = Slider;
  }

  return Slider;
}));