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
define(['ext', 'iweb/CoreModule', 'nics/modules/UserProfileModule'],
         function(Ext, Core, UserProfile){
	
	return Ext.define('modules.administration.UserLookupController', {
		extend : 'Ext.app.ViewController',

		alias: 'controller.userlookupcontroller',
		
		lookupTopic: 'nics.admin.user.lookup',
		
		orgTopic: 'nics.admin.user.lookup.org',

		init: function(){
			this.mediator = Core.Mediator.getInstance();
			this.lookupReference('lookupGrid').store.removeAll();
			
			Core.EventManager.addListener(this.lookupTopic, this.loadUsers.bind(this));
			Core.EventManager.addListener(this.orgTopic, this.onLoadOrgs.bind(this));
			
			this.loadOrgs();
		},
		
		loadOrgs: function(){
			var url = Ext.String.format('{0}/orgs/{1}/all', 
					Core.Config.getProperty(UserProfile.REST_ENDPOINT), 
					UserProfile.getWorkspaceId());
			
			this.mediator.sendRequestMessage(url, this.orgTopic);
		},
		
		onLoadOrgs: function(evt, response){
			if(response && response.organizations){
				this.lookupReference("orgs").getStore().loadData(response.organizations);
			}
		},
		
		findUsers: function(evt){
			var firstNameField = this.lookupReference('firstName');
			var lastNameField = this.lookupReference('lastName');
			var orgCombo = this.lookupReference('orgs');
			
			var firstName = firstNameField.getValue();
			var lastName =lastNameField.getValue();
			
			var url;
			
			if((!firstNameField.disabled && !lastNameField.disabled) && 
					(!Ext.isEmpty(firstName) || !Ext.isEmpty(lastName))){
				var url = Ext.String.format('{0}/users/{1}/find?exact={2}', 
						Core.Config.getProperty(UserProfile.REST_ENDPOINT), 
						UserProfile.getWorkspaceId(), this.lookupReference('exact').getValue());
				
				if(!Ext.isEmpty(firstName)){
					url = Ext.String.urlAppend(url, Ext.String.format("firstName={0}", firstName));
				}
				if(!Ext.isEmpty(lastName)){
					url = Ext.String.urlAppend(url, Ext.String.format("lastName={0}", lastName));
				}
			}else if(this.lookupReference("orgCheckbox").checked &&
				orgCombo.getSelection()){
				
				url = Ext.String.format('{0}/users/{1}/org/{2}', 
					Core.Config.getProperty(UserProfile.REST_ENDPOINT), 
					UserProfile.getWorkspaceId(), orgCombo.getSelection().data.orgId);
			}
			
			if(url){
				this.mediator.sendRequestMessage(url, this.lookupTopic);
			}
		},
		
		loadUsers: function(evt, response){
			if(response.users.length == 0){
				Ext.MessageBox.alert( Core.Translate.i18nJSON("Search Results"),  Core.Translate.i18nJSON("No users where found that match the given criteria."));
				return;
			}
			
			var grid = this.lookupReference('lookupGrid');
			var data = [];
			for(var i=0; i<response.users.length; i++){
				var user = response.users[i];
				data.push([user.username, user.firstname, user.lastname, user.userId]);
			}
			grid.getStore().loadData(data, true);
		},
		
		addSelectedUsers: function(){
			var grid = this.lookupReference('lookupGrid');
			var selected = grid.getSelectionModel().getSelection();
		    if(this.view.callback && this.view.callback.fnc){
		    	this.view.callback.fnc.apply(this.view.callback.scope, [selected]);
		    }
		    this.view.close();
		},
		
		clearGrid: function(){
			this.lookupReference('lookupGrid').store.removeAll();
			this.lookupReference('lookupGrid').view.refresh();
		},
		
		onOrgLookup: function(){
			var checkbox = this.lookupReference('orgCheckbox');
			this.lookupReference('firstName').setDisabled(checkbox.checked);
			this.lookupReference('lastName').setDisabled(checkbox.checked);
			this.lookupReference('searchTypes').setDisabled(checkbox.checked);
			this.lookupReference('orgs').setDisabled(!checkbox.checked);
		}
	
	});
});
