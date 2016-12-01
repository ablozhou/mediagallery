/*
 * 弹出相册
 */

jQuery(function ($) {
	var G = {
		active: false,
		/*
		 * Calls SimpleModal with appropriate options 
		 */
		init: function () {
			G.images = $('.abloz_image a');
			G.images.click(function () {
				G.current_idx = G.images.index(this);
				$(G.create()).modal({
					closeHTML: '',
					overlayId: 'gallery-overlay',
					containerId: 'gallery-container',
					containerCss: {left:0, width:'100%'},
					opacity: 80,
					position: ['10%', null],
					onOpen: G.open,
					onClose: G.close
				});

				return false;
			});
		},
		/*
		 * Creates the HTML for the viewer 
		 */
		create: function () {
			return $("<div id='gallery'> \
					<div id='gallery-image-container'> \
						<div id='gallery-controls'> \
							<div id='gallery-previous'> \
								<a href='#' id='gallery-previous-link'>  &laquo;  </a> \
							</div> \
							<div id='gallery-next'> \
								<a href='#' id='gallery-next-link'>  &raquo;  </a> \
							</div> \
						</div> \
					</div> \
					<div id='gallery-meta-container'> \
						<div id='gallery-meta'> \
							<div id='gallery-info'><span id='gallery-title'></span><span id='gallery-pages'></span></div> \
							<div id='gallery-close'><a href='#' class='simplemodal-close'>X</a></div> \
						</div> \
					</div> \
				</div>");
		},
		/*
		 * SimpleModal callback to create the 
		 * viewer and open it with animations 
		 */
		open: function (d) {
			G.container = d.container[0];
			G.gallery = $('#gallery', G.container);
			G.image_container = $('#gallery-image-container', G.container);
			G.nav = $('#gallery-controls', G.container);
			G.next = $('#gallery-next-link', G.container);
			G.previous = $('#gallery-previous-link', G.container);
			G.meta_container = $('#gallery-meta-container', G.container);
			G.meta = $('#gallery-meta', G.container);
			G.title = $('#gallery-title', G.container);
			G.pages = $('#gallery-pages', G.container);

			d.overlay.slideDown(300, function () {
				d.container
					.css({height:0})
					.show(function () {
						d.data.slideDown(300, function () {
							// load the first image
							G.display();
						});
					});
			});
		},
		/*
		 * SimpleModal callback to close the 
		 * viewer with animations
		 */
		close: function (d) {
			var self = this;
			G.meta.slideUp(function () {
				G.image_container.fadeOut('fast', function () {
					d.data.slideUp(500, function () {
						d.container.fadeOut(500, function () {
							d.overlay.slideUp(500, function () {
								self.close(); // or $.modal.close();	
							});
						});
					});
					G.unbind();
				});
			});
		},
		
		/*
		 * Display the previous/next image 
		 */
		browse: function (link) {
			G.current_idx = $(link).parent().is('#gallery-next') ? (G.current_idx + 1) : (G.current_idx - 1);
			//G.current_idx = $(link).is('#gallery-next') ? (G.current_idx + 1) : (G.current_idx - 1);
			
			G.display();
		},
		/* display the requested image and animate the height/width of the container */
		display: function () {
			//G.nav.hide();
			G.meta.slideUp(300, function () {
				G.meta_container.hide();
				G.image_container.fadeOut('fast', function () {
					$('#gallery-image', G.container).remove();
					var img=undefined;
					if(G.images.eq(G.current_idx).find('img').attr('src') != undefined) {
						img = new Image();
						img.src = G.images.eq(G.current_idx).find('img').attr('src').replace(/_(s|t|m)\.jpg$/, '.jpg');
						
						img.onload = function () {
												G.load(img);
											};
					} else if (G.images.eq(G.current_idx).find('video').attr('src') != undefined) {
						img = document.createElement("VIDEO"); 
						img.setAttribute("width", "320");
						img.setAttribute("height", "240");
						img.setAttribute("controls", "controls");
						img.setAttribute("src",G.images.eq(G.current_idx).find('video').attr('src'));
						G.load(img);
					}else if (G.images.eq(G.current_idx).find('audio').attr('src') != undefined) {
						img = document.createElement("AUDIO"); 
						img.setAttribute("width", "320");
						img.setAttribute("height", "240");
						img.setAttribute("controls", "controls");
						img.setAttribute("src",G.images.eq(G.current_idx).find('audio').attr('src'));
						G.load(img);
					}
										
				
				});
			});
		},
		load: function (img) {
			var i = $(img);
			i.attr('id', 'gallery-image').hide().appendTo('body');
			var h = i.outerHeight(true),
				w = i.outerWidth(true);

			var imgh = i.innerHeight(),
				imgw = i.innerWidth();
			var spaceh = h-imgh;
			var spacew = w-imgw;
			//zhh set max width or height
			var sch = $(window).height();
			var scw = $(window).width();
			if(sch/scw>=1) { //竖屏

			}
			if( h/w >= sch/scw && h > sch*0.8) { //图片更高窄,且图片高度大于可视区域0.8
				var h1 = Math.round(sch * 0.8);
				w = w*h1/h;
				h = h1;
				imgh = h-spaceh;
				imgw = w-spacew;

			}
			if( h/w < sch/scw && w > scw*0.8) { //图片更长狭,且图片宽度大于可视区域0.8
				var w1 = Math.round(scw * 0.8);
				h = h*w1/w;
				w = w1;
				imgh = h-spaceh;
				imgw = w-spacew;

			}

			i.attr('width',imgw);
			i.attr('height',imgh);



			if (G.gallery.height() !== h || G.gallery.width() !== w) {
				G.gallery.animate(
					{height: h},
					300,
					function () {
						G.gallery.animate(
							{width: w},
							300,
							function () {
								G.show(i);
							}
						);
					}
				);
			}
			else {
				G.show(i);
			}
		},
		/* 
		 * Show the image and then the controls and meta 
		 */
		show: function (img) {
			img.show();
			G.image_container.prepend(img).fadeIn('slow', function () {
				G.showControls();
				G.showMeta();
			});
		},
		/*
		 * Show the image controls; previous and next 
		 */
		showControls: function () {
			G.next.show();
			G.previous.show();
			//G.next.hide().removeClass('disabled');
			//G.previous.hide().removeClass('disabled');
			G.unbind();

			if (G.current_idx === 0) {
				G.previous.addClass('disabled');
				G.previous.hide();
			}
			if (G.current_idx === (G.images.length - 1)) {
				G.next.addClass('disabled');
				G.next.hide()
			}
			G.nav.show();

			$('a', G.nav[0]).bind('click.gallery', function () {
				G.browse(this);
				return false;
			});
			$(document).bind('keydown.gallery', function (e) {
				if (!G.active) {
					if ((e.keyCode === 37 || e.keyCode === 80) && G.current_idx !== 0) {
						G.active = true;
						G.previous.trigger('click.gallery');
					}
					else if ((e.keyCode === 39 || e.keyCode === 78) && G.current_idx !== (G.images.length - 1)) {
						G.active = true;
						G.next.trigger('click.gallery');
					}
				}
			});
			
			
		},
		/*
		 * Show the image meta; title, image x of x and the close X 
		 */
		showMeta: function () {
			var link = G.images.eq(G.current_idx).clone();
			var title="无标题";
			if(link.find('img').attr('title') != undefined) {
				title = link.find('img').attr('title');
			}
			else if(link.find('video').attr('title') != undefined) {
				title = link.find('video').attr('title');
			}
			else if(link.find('audio').attr('title') != undefined) {
				title = link.find('audio').attr('title');
			}

			
			G.title.html(link.attr('title', '内容展示').html(title));
			G.pages.html(' ' + (G.current_idx + 1) + ' / ' + G.images.length);
			G.meta_container.show()
			G.meta.slideDown(function () {
				G.active = false;	
			});
		},
		/*
		 * Unbind gallery control events 
		 */
		unbind: function () {
			$('a', G.nav[0]).unbind('click.gallery');
			$(document).unbind('keydown.gallery');
			$('div', G.nav[0]).unbind('mouseenter mouseleave');
		}
	};

	G.init();
	
});