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
define(['ext', 'iweb/CoreModule','nics/modules/UserProfileModule'],
         function(Ext, Core, UserProfile){
	
	return Ext.define('modules.administration.RoomManagementController', {
		extend : 'Ext.app.ViewController',

		alias: 'controller.roommanagementcontroller',
		
		adminRooms: [],
		
		collabRoomId: "myMap",
		
		incidentId: null,
		
		userId: null,
		
		readOnly: false,

		init: function(){
			this.mediator = Core.Mediator.getInstance();
			Core.EventManager.addListener('nics.administration.collabroom.permission', this.setAdminRooms.bind(this));
			Core.EventManager.addListener('nics.administration.collabroom.admin', this.addAdminRoom.bind(this));
			Core.EventManager.addListener('nics.administration.collabroom.admin.remove', this.removeAdminRoom.bind(this));
			Core.EventManager.addListener('nics.collabroom.activate', this.onActivateRoom.bind(this));
			Core.EventManager.addListener("nics.incident.join", this.onJoinIncident.bind(this));
			Core.EventManager.addListener("nics.collabroom.rename.tab", this.onRenameCollabroom.bind(this));
		},
		
		showGrids: function(){
			var secureController = this.view.lookupReference('managePermissions').controller;
			var checkbox = this.view.lookupReference('secureRoomCB');
			
			//Don't allow users to unsecure the incident map
			checkbox.setVisible(this.collabRoomName != UserProfile.getIncidentMapName());
			this.resetGrids();
			secureController.loadUnsecureUsers(this.incidentId, this.collabRoomId);
			secureController.loadSecureUsers(this.incidentId, this.collabRoomId);
			this.view.show();
		},
		
		load: function(){
			
			if(this.view.isManager){//User is an admin for this secured room
				this.showGrids();
			}else if((UserProfile.getSystemRoleId() === 4 || UserProfile.isSuperUser()) //user is a system admin or super user
					&& this.collabRoomName !=  UserProfile.getIncidentMapName() && !this.readOnly){ 
				if(this.collabRoomId != "myMap"){
					this.showGrids();
				}else{
					Ext.MessageBox.alert(Core.Translate.i18nJSON("Room Error"), Core.Translate.i18nJSON("Please join a collaboration room."));
				}
			}else{
				Ext.MessageBox.alert(Core.Translate.i18nJSON("Permissions Error"), Core.Translate.i18nJSON("You do not have permissions to modify this room."));
			}
		},
		
		resetGrids: function(){
			var secureController = this.view.lookupReference('managePermissions').controller;
			secureController.clearAdminUsers();
			secureController.clearReadWriteUsers();
			secureController.loadUnsecureUsers(this.incidentId);
		},
		
		updateCollabRoom: function(){
			var checkbox = this.view.lookupReference('secureRoomCB');
			if(checkbox.checked){
				this.unsecureRoom(checkbox);
				return;
				
			}
			
			var secureRoomController = this.view.lookupReference('managePermissions').controller;
			var response = { data: [{
				admin: secureRoomController.getAdminUsers(),
				readWrite: secureRoomController.getReadWriteUsers(),
				readOnly: secureRoomController.getReadOnlyUsers()
			}]};
			
			var topic = Core.Util.generateUUID();
			Core.EventManager.createCallbackHandler(topic, this, 
					function(evt, response){
						var failed = false;
						var failureNotice = Core.Translate.i18nJSON("The following users were not successfully added : ");
						if(response.failedReadWrite 
								&& response.failedReadWrite.length > 0){
							failed = true;
							var readWriteGrid = this.view.lookupReference('managePermissions').getThirdGrid();
							for(var i=0; i<response.failedReadWrite.length; i++){
								failureNotice += readWriteGrid.store.getAt(readWriteGrid.store.find("userid", 
										response.failedReadWrite[i])).data.username + " ";
							}
						}
						if(response.failedAdmin 
								&& response.failedAdmin.length > 0){
							failed = true;
							var adminGrid = this.view.lookupReference('managePermissions').getFourthGrid();
							for(var i=0; i<response.failedAdmin.length; i++){
								failureNotice += adminGrid.store.getAt(adminGrid.store.find("userid", 
										response.failedAdmin[i])).data.username + " ";
							}
						}
						if(response.failedReadOnly
								&& response.failedReadOnly.length > 0){
							failed = true;
							var readOnlyGrid = this.view.lookupReference('managePermissions').getSecondGrid();
							for(var i=0; i<response.failedReadOnly.length; i++){
								failureNotice += readOnlyGrid.store.getAt(readOnlyGrid.store.find("userid", 
										response.failedReadOnly[i])).data.username + " ";
							}
						}
						if(failed){
							Ext.MessageBox.alert(Core.Translate.i18nJSON("Permissions Error"), Core.Translate.i18nJSON(failureNotice));
						}else{
							Ext.MessageBox.alert(Core.Translate.i18nJSON("Permissions Update"), Core.Translate.i18nJSON("All permissions were successfully updated."));
							this.view.close();
						}
			});
			
			var url = Ext.String.format("{0}/collabroom/{1}/secure/{2}?userId={3}&orgId={4}&workspaceId={5}",
					Core.Config.getProperty(UserProfile.REST_ENDPOINT),
					this.incidentId, this.collabRoomId, UserProfile.getUserId(),
					UserProfile.getOrgId(), UserProfile.getWorkspaceId());
			
			this.mediator.sendPostMessage(url, topic, response);
		},
		
		closeManager: function(){
			this.view.close();
		},

		setAdminRooms: function(evt, rooms){
			this.adminRooms = rooms;
		},
		
		addAdminRoom: function(evt, collabRoomId){
			if($.inArray(collabRoomId, this.adminRooms) === -1){
				this.adminRooms.push(collabRoomId);
				//Currently in the room and now have permission to alter perms
				if(this.collabRoomId === collabRoomId){
					this.getView().showManager();
				}
			}
		},
		
		removeAdminRoom: function(evt, collabRoomId){
			var index = $.inArray(collabRoomId, this.adminRooms);
			if(index > -1){
				this.adminRooms.splice(index, 1);
			}
		},
		
		onActivateRoom: function(evt, collabRoomId, readOnly, name){
			if(!readOnly){
				this.readOnly = false;
			}
			
			if(this.view && this.view.isVisible()){
				this.closeManager();
			}
			
			this.collabRoomId = collabRoomId;
			this.collabRoomName = name;
			if($.inArray(collabRoomId, this.adminRooms) != -1){
				this.getView().showManager();
			}else{
				this.getView().hideManager();
			}
		},

		onRenameCollabroom: function(evt, collabRoomId, collabRoomName){
			if(this.collabRoomId === collabRoomId){
				this.collabRoomName = collabRoomName;
			}
		},
		
		onJoinIncident: function(evt, incident){
			this.incidentId = incident.id;
		},
		
		unsecureRoom: function(checkbox) {
			//Remove the session from the database
			var topic = Core.Util.generateUUID();
			
			Core.EventManager.createCallbackHandler(topic, this, 
					function(evt, response){
						if(response.message != Core.Translate.i18nJSON("OK")){
							Ext.MessageBox.alert(Core.Translate.i18nJSON("Collaboration Room Error"), Core.Translate.i18nJSON(response.message));
						}else{
							var pos = $.inArray(this.collabRoomId, this.adminRooms);
							this.adminRooms.splice(pos, 1);
							this.resetGrids();
							checkbox.setValue(false);
							checkbox.disable();
						}
			});
			
			var url = Ext.String.format("{0}/collabroom/{1}/unsecure/{2}?userId={3}",
					Core.Config.getProperty(UserProfile.REST_ENDPOINT),
					this.incidentId, this.collabRoomId, UserProfile.getUserId());
			
			this.mediator.sendDeleteMessage(url, topic);
		}
	});
});
