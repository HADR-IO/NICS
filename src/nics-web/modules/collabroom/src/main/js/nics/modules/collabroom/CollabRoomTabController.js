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
define(["iweb/CoreModule", 'nics/modules/UserProfileModule'],

	function(Core, UserProfile){
	
		return Ext.define('modules.incident.CollabRoomTabController', {
		
			extend : 'Ext.app.ViewController',
			
			alias: 'controller.collabroomtabcontroller',
			
			activeTab: null,
			
			marker: "<b>*</b>",
			
			init: function(){
				this.addTab(null, { collabRoomId: 'myMap', name:  Core.Translate.i18nJSON('Workspace'), featureType: 'user' });
				
				Core.EventManager.addListener("nics.collabroom.open", this.addTab.bind(this));
				Core.EventManager.addListener("nics.incident.close", this.removeAllTabs.bind(this));
				Core.EventManager.addListener("nics.incident.close.tab", this.removeTab.bind(this));
				Core.EventManager.addListener("nics.collabroom.update", this.onNewContent.bind(this));
				Core.EventManager.addListener("nics.collabroom.rename.tab", this.renameTab.bind(this));
			},
		 
			addTab: function(evt, collabRoom){
				var view = this.getView();
				if(!view.hasTab(collabRoom.name)){
					view.setActiveTab(view.addTab(collabRoom));
					if(collabRoom.name == UserProfile.getIncidentMapName() &&
							collabRoom.readOnly){
						if(collabRoom.incidentMapAdmins){
							var admins = "";
							for(var i=0; i<collabRoom.incidentMapAdmins.length; i++){
								admins += collabRoom.incidentMapAdmins[i].firstname + " " + 
								collabRoom.incidentMapAdmins[i].lastname + ": " +
								collabRoom.incidentMapAdmins[i].value + "<br/>";
							}

							Ext.MessageBox.alert( Core.Translate.i18nJSON("Permissions"),  
									Core.Translate.i18nJSON("You are in read-only mode. To modify this map, please contact one of the following NICS Administrators :")+ " <br/>" + admins);
						}
					}
				}else{
					Ext.MessageBox.alert( Core.Translate.i18nJSON("Collaboration Room Error"),   Ext.String.format(Core.Translate.i18nJSON("You are already in the collaboration room {0}. To view this room, select the tab from above."),collabRoom.name));
				}
			},
			
			removeAllTabs: function(evt){
				var tabs = this.getView().items.items;//pretty sure we can do this better
				while(tabs.length > 1){
					//this.getView().remove(tabs[tabs.length-1]);
					tabs[tabs.length-1].close(); //Fire event
				}
			},

			renameTab: function(evt, collabRoomId, collabroomName){
				var tab = this.getView().getTab(collabRoomId);
				if(tab){
					tab.setTitle(collabroomName);
				}
			},

			removeTab: function(evt, collabRoomId){
				var tab = this.getView().getTab(collabRoomId);
				if(tab){
					this.getView().removeTab(tab);
					this.onTabClose(tab);
				}
			},
			
			onTabClose: function(tab){
				Core.EventManager.fireEvent("nics.collabroom.close", tab.collabRoom,
					this.getView().items.length);
			},
			
			onTabChange: function(tabpanel, tab, oldtab, eOpts){
				this.activeTab = tab;
				this.updateTitle(tab, true);
				
				Core.EventManager.fireEvent("nics.collabroom.activate", tab.collabRoom.collabRoomId, 
						(UserProfile.isReadOnly() || tab.collabRoom.readOnly), tab.collabRoom.name, tab.collabRoom);
			},
			
			onNewContent: function(evt, id){
				if(this.activeTab){
					this.updateTitle(this.view.getTab(id), (this.activeTab.collabRoom.collabRoomId == id));
				}
			},
			
			updateTitle: function(tab, active){
				var title = tab.getTitle();
				if(title.indexOf(this.marker) == 0){
					if(active){
						tab.setTitle(title.substring(this.marker.length, title.length));
					}
				}else if(!active){
					tab.setTitle(this.marker.concat(title));
				}
			}
			
		});
});
