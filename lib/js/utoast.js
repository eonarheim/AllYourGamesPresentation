/**
uToast.js (MicroToast) - v0.1
https://github.com/eonarheim/uToast
Author: Erik Onarheim (@ErikOnarheim)
License: 3-Clause BSD
**/

if(!window.requestAnimationFrame){
   window.requestAnimationFrame = 
   window.webkitRequestAnimationFrame ||
   window.mozRequestAnimationFrame ||
   window.msRequestAnimationFrame ||
   window.oRequestAnimationFrame ||
   function(callback){window.setTimeout(callback, 1000/60)};
}

var uToast = function(){
   if(!uToast.instance){
      uToast.instance = this;
      this.toasts = [];
      var container = document.getElementById('toast-container');
      if(!container){
         container = document.createElement('div');
         container.id = 'toast-container';
         document.body.appendChild(container);
      }
      this.container = container;
   }

   return uToast.instance;
};

uToast.instance = null;
uToast.getInstance = function(){
   return new uToast();
};

uToast.info = function(){
   uToast.getInstance().info.apply(uToast.instance, arguments);
}

uToast.warn = function(){
   uToast.getInstance().warn.apply(uToast.instance, arguments);
}

uToast.error = function(){
   uToast.getInstance().error.apply(uToast.instance, arguments);
}


uToast.prototype = (function(){
   var fadeOut = function(el, time){
      //var el = document.getElementById(id);
      var rate = el.style.opacity/time;
      var now = Date.now();
      var lastTime = Date.now();
      var delta;
      window.requestAnimationFrame(function fade(){
         if(!el || !el.parentElement) return;

         now = Date.now();
         delta = now - lastTime;
         if(el.style.opacity >= 0){
            window.requestAnimationFrame(fade);    
            el.style.opacity -= rate*delta;
            lastTime = now;
         }else{
            el.parentElement.removeChild(el);
         }
           
      });
   };

   var message = function(level, msgs){      
      var message = msgs.join(' ');
      var toast = document.createElement('div');
      toast.className = 'toast '+ level;
      toast.style.opacity = .7;
      toast.innerText = message;
      this.toasts.push(toast);

      var firstEl = this.container.firstChild;
      this.container.insertBefore(toast, firstEl);
      setTimeout(function(){
         fadeOut(toast, 3000);
      },1000);
   }

   var info = function(){
      message.call(this, 'info', Array.prototype.slice.call(arguments));
   }
   var warn = function(){
      message.call(this, 'warn', Array.prototype.slice.call(arguments));
   }
   var error = function(){
      message.call(this, 'error', Array.prototype.slice.call(arguments));
   }              

   var clear = function(){
      var that = this;
      this.toasts.forEach(function(t){
         that.container.removeChild(t);
      });
      this.toasts.length = 0;
   }

   return {
      info : info,
      warn : warn,
      error : error,
      clear: clear
   }
})();