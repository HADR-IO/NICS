/*
 * Copyright (c) 2008-2021, Massachusetts Institute of Technology (MIT)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
define(["ol",'ext', 'iweb/CoreModule', 'nics/modules/UserProfileModule', './FeatureTopicListener',
				'iweb/core/FormVTypes', 'nics/modules/CollabRoomModule'],
		function(ol, Ext, Core, UserProfile, FeatureTopicListener, FormVTypes, CollabroomModule){
	
	
	
	return Ext.define('features.FeatureDetailRenderer', {
		

		constructor: function() {
			Core.EventManager.addListener('nics.collabroom.activate', this.onActivateRoom.bind(this));
		},
		
		onActivateRoom: function(evt, collabRoomId, readOnly){
			this.readOnly = readOnly;
		},
		
		render: function(container, feature) {
	      if (this.supportsComments(feature)){
              Core.EventManager.fireEvent("nics.feature.display", feature);
			//clone attributes object, fixes feature.set equality check
			var attributes = null;
			var isOverlayFeature = false;
			var attr = feature.get('attributes');
			if (typeof(attr) === 'string') {
				attributes = JSON.parse(attr);
				isOverlayFeature = true;
			} else {
				attributes = Ext.Object.merge({}, feature.get('attributes'));
			}
			var user = feature.get('username');
			var description = feature.get('description');
			if (!description) {
				//The description is either in the feature itself (when it is first created) or in the attributes (when it is an existing feature)
				//get description from the attributes
				if (attributes && attributes.description){
					
						description = new Ext.form.field.Display({
						fieldLabel: Core.Translate.i18nJSON('Description'),
						value: attributes.description
						
					});
					container.add( description);
				
				}
			}

			if (user) {
				user = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('User'),
					value: user
				});
				container.add(user);
			}

			// check for origin layer
			  var layername = feature.get('origin_layer');
			if (layername) {
				var layerField = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('Origin Layer'),
					value: layername
				});
				container.add(layerField);
			}

			var updateDate = feature.get('lastupdate');
			if (updateDate) {
				updateDate = Core.Util.formatDateToString(new Date(updateDate));
				updateDate = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('Last Updated'),
					value: updateDate
				});
				container.add( updateDate );
			
			}
			var importName = feature.get('name');
			
			if(importName){
				importName = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('Name'),
					value: importName
				});
				container.add( importName );
			}	
			
			if (attributes && attributes.length){
				var length = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('Distance'),
					value: attributes.length
				});
				container.add( length );
			}	

			if (attributes && attributes.layerid) {
				var layerid = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('Layer'),
					value: attributes.layerid
				});
				container.add( layerid );
			}

			if (attributes && attributes.area) {
				var area = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('Area'),
					value: attributes.area
				});
				container.add( area );
			}	
		
			//Add sketch info


			//Add Comments
			//if attributes is undefined, define it with empty comments so that it won't throw an error
			if (!attributes) attributes = {comments:""};	
			var commentsText=attributes.comments;
			var	comments = new Ext.form.field.Display({
					fieldLabel: Core.Translate.i18nJSON('Comments'),
					value: commentsText,
					htmlEncode:true,
					reference: 'displayComments',
					labelStyle: 'text-decoration:underline;cursor:pointer'
				});
			container.add( comments );
			
			comments.getEl().on('click', function(){
				this.sidePanel.expand();
				var index = this.sidePanel.items.findIndex("title", Core.Translate.i18nJSON("Feature Comments"));
				if(index > -1){
					this.sidePanel.setActiveTab(index);
				}
			}, Core.View);
			
			var newComments = new Ext.form.field.TextArea({
				fieldLabel: Core.Translate.i18nJSON('Comments'),
				value: commentsText,
				hidden:true,
				vtype:'extendedalphanum',
				reference: 'textAreaComments'
			}); 
			
			
			container.add( newComments );

			if (!this.readOnly && !isOverlayFeature) {
				
				var editState = Core.Translate.i18nJSON("Edit");
				var editButton = new Ext.Button({
					text: editState,
					margin:'0 0 10 10',
					handler: function(btn) {
						switch (this.getText()){
							case Core.Translate.i18nJSON('Edit'):
								comments.hide();
								newComments.show();
								this.setText(Core.Translate.i18nJSON('Update'));
								break;
							case Core.Translate.i18nJSON('Update'):
								if (newComments.isValid()) {
									this.setText(Core.Translate.i18nJSON('Edit'));
									attributes.comments = newComments.getValue();
									feature.set("attributes", attributes);
									newComments.hide();
									comments.setValue(newComments.getValue());			
									comments.show();
									
								}
								else {
									alert(Core.Translate.i18nJSON('Please enter a valid comment'));
									newComments.setValue("");
								}			
								break;
							}
							
						}	
					
				});
				container.add( editButton );
			}
			  return true;
		    }
		  return false;
		},
		supportsComments: function(feature) {
			// lowercase featureid for room overlays
			return (feature.get('featureId') != undefined || feature.get('featureid') != undefined);
		},
		
		
	
	    calculateAcres: function(feature){
	    	var poly = feature.getGeometry();
			var sourceProj = Core.Ext.Map.getMap().getView().getProjection();
			var sqMetersArea = ol.sphere.getLength(poly, { projection: sourceProj });
			return(sqMetersArea  * 0.000247105381);	    	
	    },
		
    	
        formatDate: function(date)
        {
            var str = (date.getMonth() + 1) + "/"
            + date.getDate() + "/"
            + date.getFullYear();
            console.log("my locale date from date "+ date.toLocaleDateString());
            return str;
        },
	    formatDashStyle: function(dashStyle)
        {
    		var str = "";
    		if (dashStyle){
    		  var str = dashStyle.replace(/-/g, " ");
    		  str = str.charAt(0).toUpperCase() + str.slice(1);
    		  
        	}
            return str;
        
        }

		
	});

});
