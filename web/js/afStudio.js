Ext.BLANK_IMAGE_URL = '/appFlowerPlugin/extjs-3/resources/images/default/s.gif';
Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

Ext.ns('afStudio');

var afStudio = function () {

	/**
	 * @property {afStudio.viewport.StudioToolbar} tb
	 * Studio toolbar
	 */
	
	/**
	 * @property {afStudio.viewport.StudioViewport} vp
	 * Studio view port
	 */
	
	return {
		
		initAjaxRedirect : function() {
			Ext.Ajax.on('requestcomplete', function(conn, xhr, opt) {
				var response = Ext.decode(xhr.responseText);				
				if (!Ext.isEmpty(response) && !Ext.isEmpty(response.redirect)) {
					location.href = response.redirect;
				}
			});
		}//eo initAjaxRedirect
	
		,setConsole : function(content) {
			afStudio.cli.CommandLineMgr.setConsole(content);
		}
		
		,updateConsole : function(content) {
			afStudio.cli.CommandLineMgr.updateConsole(content);
		}
 
		,log : function(message, messageType) {
			messageType = messageType || false;
			
			Ext.Ajax.request({
				url: window.afStudioWSUrls.getNotificationsUrl(),
				method: 'POST',
				params: {
					cmd: 'set',
					message: message,
					messageType: messageType
				},
				callback: function(options, success, response) {
					response = Ext.decode(response.responseText);					
					if (!success) {
						Ext.Msg.alert('Failure','Server-side failure with status code: ' + response.status);
					}
				}
			});		
		}//eo log
		
		,getViewport : function() {
			return this.vp;
		}
		
		,getRecentProjects : function() {
			var recentProjects = Ext.decode(Ext.util.Cookies.get('appFlowerStudioRecentProjects')) || [];
			
			recentProject = recentProjects.reverse();
			
			return recentProjects;
		}
		
		,addCurrentProject : function() {
			var recentProjects = Ext.decode(Ext.util.Cookies.get('appFlowerStudioRecentProjects')) || [];
			
			Ext.Ajax.request({
			   url: window.afStudioWSUrls.getConfigureProjectUrl(),
			   success: function(response, opts) {
			      var response = Ext.decode(response.responseText);
			      var project = {};
			      project.text = response.data.name;
			      project.url = response.data.url+'/studio';			      
			      
			      Ext.each(recentProjects, function(recentProject, index) {
				  		if(recentProject.url == project.url)
				  		{
				  			delete recentProjects[index];
				  		}
			      });
			      
			      recentProjects[recentProjects.length] = project;
					
				  var expirationDate=new Date();
				  expirationDate.setDate(expirationDate.getDate()+30);
					
				  Ext.util.Cookies.set('appFlowerStudioRecentProjects',Ext.encode(recentProjects),expirationDate,'/','');
			   }
			});
		}
		
		,showWidgetDesigner : function(widget, action, security) {
  			//FIXME should be used afStudio.vp.mask({region: 'center'}) or afStudio.vp.mask(), read the jsdocs
			var mask = new Ext.LoadMask(afStudio.vp.layout.center.panel.body, {msg: 'Loading, please Wait...', removeMask:true});
			mask.show();
			
			//FIXME should not pass mask in the component just to have ability to remove it in the component
			afStudio.vp.addToPortal({
				title: widget + ' Widget Designer',
				collapsible: false,
				draggable: false,
				layout: 'fit',
				items: [{
					xtype: 'afStudio.wd.designerTabPanel',
					actionPath: action,
					securityPath: security,
	                widgetUri: widget,
					mask: mask
				}]
			}, true);
		}
		
		/**
		 * Instantiates afStudio.
		 * Main method.
		 */
		,init : function () { 
		    Ext.QuickTips.init();
		    Ext.apply(Ext.QuickTips.getQuickTip(), {
			    trackMouse: true
			});
			Ext.form.Field.prototype.msgTarget = 'side';
			
			this.initAjaxRedirect();
			
			//timeout 5 minutes
			Ext.Ajax.timeout = 300000;
			
			this.tb = new afStudio.viewport.StudioToolbar();
			this.vp = new afStudio.viewport.StudioViewport();						  
			
			afStudio.Cli.init();
			
			afApp.urlPrefix = '';
			GLOBAL_JS_VAR = GLOBAL_CSS_VAR = new Array();
			
			/**
			* this will add current project's url to the recent projects cookie
			*/
			this.addCurrentProject();
			
			if (Ext.util.Cookies.get('appFlowerStudioDontShowWelcomePopup') != 'true') {
				new afStudio.Welcome().show();
			}
			
		}//eo init
		
        ,getWidgetsTreePanel: function() {
            var components = this.vp.findByType('afStudio.navigation.widgetItem');
            if (components.length > 0) {
                return components[0];
            }
        }
        
        ,getWidgetInspector : function() {
            var components = this.vp.findByType('afStudio.wd.inspector');
            if (components.length > 0) {
                return components[0];
            }
        }
        //user to create a slug from some content
        ,createSlug : function(slugcontent) {
		    // convert to lowercase (important: since on next step special chars are defined in lowercase only)
		    slugcontent = slugcontent.toLowerCase();
		    // convert special chars
		    var   accents = {a:/\u00e1/g,e:/u00e9/g,i:/\u00ed/g,o:/\u00f3/g,u:/\u00fa/g,n:/\u00f1/g};
		    for (var i in accents) slugcontent = slugcontent.replace(accents[i],i);
		
			var slugcontent_hyphens = slugcontent.replace(/\s/g,'-');
			var finishedslug = slugcontent_hyphens.replace(/[^a-zA-Z0-9\-\_]/g,'');
		    finishedslug = finishedslug.toLowerCase();
		    finishedslug = finishedslug.replace(/-+/g,'-');
			finishedslug = finishedslug.replace(/(^-)|(-$)/g,'');
		    return finishedslug;
        }
	}
}();


/**
 * @class Array
 */
Ext.applyIf(Array.prototype, {
	
	/**
	 * Drags up array's element.
	 * @param {Number} from The beginning position to drag from. 
	 * @param {Number} to The destination element position.
	 */
	dragUp : function(from, to) {
		if (from < to) {
			throw new RangeError('"dragUp": "from" index should be greater than "to"');
		}		
		var draggedEl = this[from];
		for (var i = 0, iterNum = from - to, j = from; i < iterNum; i++, j--) {
			this[j] = this[j-1];
		}
		this[to] = draggedEl;
	}//eo dragUp
	
	/**
	 * Drags down array's element.
	 * @param {Number} from The beginning position to drag from.
	 * @param {Number} to The destination element position.
	 */
	,dragDown : function(from, to) {
		if (from > to) {
			throw new RangeError('"dragDown": "from" index should be less than "to"');
		}		
		var draggedEl = this[from];
		for (var i = 0, iterNum = to - from, j = from; i < iterNum; i++, j++) {
			this[j] = this[j+1];
		}
		this[to] = draggedEl;
	}//eo dragDown
});

