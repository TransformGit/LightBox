;(function($){
	var LightBox = function(config){
		this.config = {
			speed: 100
		};
		$.extend(this.config,config)
		this.rendUI();
		this.bindUI();	
	}
	LightBox.prototype = {
		rendUI: function(){
			this.body = $(document.body);
			this.popupMask = $('<div class="lightbox-mask"></div>');
			this.popup =$('<div class="lightbox-popup"></div>');
			this.popupContent = $('<div class="pic-view">'+
			'<img class="lightbox-img" src="images/1-1.jpg">'+
			'<span class="switch btn-prev"></span>'+
			'<span class="switch btn-next"></span>'+
		'</div>'+
		'<div class="lightbox-caption">'+
			'<p class="lightbox-desc">图片标题</p>'+
			'<p class="lightbox-index">图片索引: 1/4</p>'+
			'<a href="javascript:;" class="btn-close">&times;</a>'+
		'</div>')
			this.popup.html(this.popupContent)
			this.body.prepend(this.popupMask,this.popup)
		},
		bindUI: function(){
			self = this;
			this.groupName = null;
			this.groupData = [];
			this.getGroup = function(){
				var self = this;
				var groupList = $(document.body).find("*[data-group="+this.groupName+"]")
				self.groupData.length = 0;
				groupList.each(function(){
					self.groupData.push({
						src: $(this).attr('data-source'),
						id: $(this).attr('data-id'),
						caption: $(this).attr('data-caption')
					})
				})
				//console.log(self.groupData)
			}
			this.body.delegate('.js-lightbox','click',function(e){
				e.stopPropagation()
				var curGroupName = $(this).attr('data-group');
				if(curGroupName != self.groupName){
					self.groupName = curGroupName;
					self.getGroup()
				}
				//初始化弹窗
				self.initPopup($(this))	
			});
			
			this.picView = this.popup.find('.pic-view');
			this.popupPic = this.popup.find('.lightbox-img')
			this.picCaption = this.popup.find('.lightbox-caption')
			this.nextBtn = this.popup.find('.btn-next')
			this.prevBtn = this.popup.find('.btn-prev')
			this.captionText = this.popup.find('.lightbox-desc');
			this.currentIndex = this.popup.find('.lightbox-index');
			this.closeBtn = this.popup.find('.btn-close');
			
		},
		initPopup: function(Obj){
			var self = this;
				var sourceSrc = Obj.attr('data-source'),
						currentId = Obj.attr('data-id');
				this.showMask = function(sourceSrc,currentId){
					this.popupPic.hide()
					this.picCaption.hide()
					this.popupMask.fadeIn()
					var winWidth = $(window).width(),
							winHeight = $(window).height(),
							viewHeight = winHeight/2 + 10;
					this.picView.css({
						width: winWidth/2,
						height: winHeight/2
					})
					this.popup.css({
						width: winWidth/2 + 10,
						height: viewHeight,
						marginLeft: -(winWidth/2+10)/2,
						top: -viewHeight
					}).animate({
						top: (winHeight-viewHeight)/2
					},this.config.speed,function(){
						self.loadImg(sourceSrc)
					}).show()
					
					this.getIndexOf = function(currentId){
						var index = 0;
						$(this.groupData).each(function(i) {
							index = i;
							if(this.id === currentId){
								return false
							}
						});
						return index;
					}
					this.index = this.getIndexOf(currentId);
					console.log(this.index)
					var groupDataLength = this.groupData.length;
					if(groupDataLength>0){
						if(this.index === 0){
							this.prevBtn.addClass('disabled')
							this.nextBtn.removeClass('disabled')
						}else if(this.index === groupDataLength-1){
							this.prevBtn.removeClass('disabled')
							this.nextBtn.addClass('disabled')
						}else{
							this.prevBtn.removeClass('disabled')
							this.nextBtn.removeClass('disabled')
						}
					}
				}
				this.showMask(sourceSrc,currentId);	
				this.loadImg = function(sourceSrc){
					self.popupPic.css({
						width: 'auto',
						height: 'auto'
					}).hide()
					this.preload(sourceSrc,function(){
						self.popupPic.attr('src',sourceSrc)
						var imgWidth = self.popupPic.width(),
								imgHeight = self.popupPic.height();
						self.changeImg(imgWidth,imgHeight)
					})
				}
				this.preload = function(src,callback){
					var img = new Image();
					img.onload = function(){
						callback()
					}
					img.src = src;	
				}	
				this.changeImg = function(width,height){
					var winWidth = $(window).width(),
							winHeight = $(window).height();
					var scale = Math.min(winWidth/(width+10),winHeight/(height+10),1);
					width = width*scale;
					height = height*scale;
					this.picView.animate({
						width: width+10,
						height: height+10
					},this.config.speed)
					this.popup.animate({
						width: width+10,
						height: height+10,
						marginLeft: -(width/2),
						top: (winHeight-height)/2
					},this.config.speed,function(){
						self.popupPic.css({
							width: width,
							height: height
						}).fadeIn()
						self.picCaption.fadeIn()
						self.flag = true;
						self.clear = true;
					}) 	
					this.captionText.text(this.groupData[this.index].caption)
					this.currentIndex.text("当前索引"+(this.index+1)+"/"+this.groupData.length)
				}
				this.popupMask.on('click',function(){
					self.close()
				})
				this.closeBtn.on('click',function(){
					self.close()
				})
				//向后切换按钮
				this.nextBtn.hover(function(){
					if(!$(this).hasClass('disabled') && self.groupData.length>1){
						$(this).addClass('btn-next-show')
					}
				},function(){
					$(this).removeClass('btn-next-show')
				}).click(function(e){
					if(!$(this).hasClass('disabled') && self.flag){
						self.flag = false
						e.stopPropagation();
						self.goto('next')
					}
				})
				//向前切换按钮
				this.flag = true;
				this.prevBtn.hover(function(){
					if(!$(this).hasClass('disabled') && self.groupData.length>1){
						$(this).addClass('btn-prev-show')
					}
				},function(){
					$(this).removeClass('btn-prev-show')
				}).click(function(e){
					if(!$(this).hasClass('disabled') && self.flag){
						self.flag = false
						e.stopPropagation();
						self.goto('prev')
					}
				})
				//切换图片
				this.goto = function(dir){
					if(dir == 'next'){
						this.index++;
						if(this.index >= this.groupData.length-1){
							this.nextBtn.addClass('disabled')
						}
						if(this.index != 0){
							this.prevBtn.removeClass('disabled')
						}
						var src = this.groupData[this.index].src;
						this.loadImg(src)
					}else if(dir == 'prev'){
						this.index--;
						if(this.index <= 0){
							this.prevBtn.addClass('disabled')
						}
						if(this.index != this.groupData.length-1){
							this.nextBtn.removeClass('disabled')
						}
						var src = this.groupData[this.index].src;
						this.loadImg(src)
					}else{
						return false
					}
				}
				var timer = null;
				this.clear = false;
				$(window).resize(function(){
					if(self.clear){
						clearTimeout(timer)
						timer = setTimeout(function(){
							self.loadImg(self.groupData[self.index].src)
						},500)
					}
				}).keyup(function(e){
					if(self.clear){
						var keyValue = e.which;
						if(keyValue == 37 || keyValue == 38){
							self.prevBtn.click()
						}else if(keyValue == 39 ||keyValue == 40){
							self.nextBtn.click()
						}else if(keyValue == 27){
							self.close()
						}else{
							return false
						}
					}
				})
		},
		close: function(){
			this.popupMask.fadeOut();
			this.popup.fadeOut()
			this.clear = false
		}
	}
	window.LightBox = LightBox;
})(jQuery)