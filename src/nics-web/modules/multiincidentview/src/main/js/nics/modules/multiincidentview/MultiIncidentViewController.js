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
define(['ext', 'iweb/CoreModule', 'ol', './MultiIncidentViewModel', 'nics/modules/UserProfileModule', 'iweb/modules/MapModule'],
		function(Ext, Core, ol, MultiIncidentModel, UserProfile, MapModule){
	
	return Ext.define('modules.multiincidentview.MultiIncidentViewController', {
		extend : 'Ext.app.ViewController',

		alias: 'controller.multiincidentviewcontroller',

		incidentColor : 'rgb(0,0,0)',
		
		viewEnabled: false,
		
		orgCapName: 'MIV',

		incIdOwnerNameMap: null,
		
		init: function(){
			this.incIdOwnerNameMap = new Map();
			this.mediator = Core.Mediator.getInstance();

			this.incidentListeners = {};
			
			var source = new ol.source.Vector();
			this.vectorLayer = new ol.layer.Vector({
				source : source,
				style : Core.Ext.Map.getStyle
			});
			
			this.vectorLayer.setVisible(false);
			
			Core.Ext.Map.addLayer(this.vectorLayer);
			
			Core.EventManager.addListener("nics.user.profile.loaded", this.updateOrgCapsListener.bind(this));
			Core.EventManager.addListener("nics.miv.onloadallincidents", this.onLoadAllIncidents.bind(this));
			Core.EventManager.addListener("nics.incident.update.callback", this.onUpdateIncident.bind(this));
			Core.EventManager.addListener("nics.userorg.change", this.loadAllIncidents.bind(this));

			this.bindOrgCap = this.orgCapUpdate.bind(this);

			Core.EventManager.addListener("nics.miv.add.mivpanel", this.onAddIncOrg.bind(this));
			Core.EventManager.addListener("nics.miv.remove.mivpanel", this.onRemoveIncOrg.bind(this));
			Core.EventManager.addListener("nics.miv.refresh.mivpanel", this._refreshOrgsList.bind(this));

			this.loadAllIncidents();
		},

		onAddIncOrg: function(evt, data) {
			if(data != null) {
				this.addNewRow(data, 0);

				//I don't think we need to refresh the orgs list
				//If the row is new then it's not selected
				//this.refreshOrgsList(data.incidentid);
			}
		},

		onRemoveIncOrg: function(evt, incidentId) {
			var grid = this.lookupReference('multiincidentsgrid');
			var index = grid.getStore().find("incidentid", incidentId);
			if(index !== -1){
				grid.getStore().remove(grid.getStore().getAt(index));
				if( this.isSelected(incidentId) ){
					this.lookupReference('multiincidentform').reset();
					this.lookupReference('orglistgrid').getStore().removeAll();
				}
			}

			this.removeIncidentListener(incidentId);
		},
		
		updateOrgCapsListener: function(evt, data){
			
			if(this.currentOrg){
				this.mediator.unsubscribe("iweb.nics.orgcaps." + this.currentOrg + "." + this.orgCapName);
				Core.EventManager.removeListener("iweb.nics.orgcaps." + this.currentOrg + "." + this.orgCapName, this.bindOrgCap);
			}
			else {
				Core.EventManager.addListener("iweb.nics.orgcaps." + UserProfile.getOrgId() + "." + this.orgCapName, this.bindOrgCap);
			}
			
			this.currentOrg = UserProfile.getOrgId();
			
			this.mediator.subscribe("iweb.nics.orgcaps." + this.currentOrg + "." + this.orgCapName);
			
		},
		
		orgCapUpdate: function(evt, orgcap){

			if(orgcap.activeWeb){
				this.getView().enable();
				this.loadAllIncidents();
			}
			else{
				this.getView().disable();
			}
			
			UserProfile.setOrgCap(orgcap.cap.name,orgcap.activeWeb);
			
		},
		
		loadAllIncidents: function() {
			var grid = this.lookupReference('multiincidentsgrid');
			
			if(UserProfile.isAdminUser() || UserProfile.isSuperUser()){
				this.lookupReference('miveditbutton').show();
				this.lookupReference('miveditbutton').show();
			}
			else {
				this.lookupReference('mivescalatebutton').hide();
				this.lookupReference('mivescalatebutton').hide();
			}
			
			if(grid.getSelectionModel().getSelection()){
				grid.getSelectionModel().clearSelections();
				this.resetFormPanel();
			}
			
			//TODO: Update instead of reload everytime a change occurs
			var topic = Ext.String.format("iweb.NICS.ws.{0}.newIncident", UserProfile.getWorkspaceId());
			Core.EventManager.addListener(topic, this.onAddIncOrg.bind(this));
			
			var removeTopic = Ext.String.format("iweb.NICS.ws.{0}.removeIncident", UserProfile.getWorkspaceId());
			Core.EventManager.addListener(removeTopic, this.onRemoveIncOrg.bind(this));
			
			this.getAllIncidents();
			
		},
		
		getAllIncidents: function(){
		
			var url = Ext.String.format("{0}/incidents/{1}/getincidenttree?accessibleByUserId={2}", 
					Core.Config.getProperty(UserProfile.REST_ENDPOINT),
					UserProfile.getWorkspaceId(),
					UserProfile.getUserId());
				
			this.mediator.sendRequestMessage(url, "nics.miv.onloadallincidents");
		
		},
		
		disableEditButton: function(disabled){
			this.lookupReference('miveditbutton').setDisabled(disabled);
			this.lookupReference('mivescalatebutton').setDisabled(disabled);
		},
		
		onUpdateIncident: function(e, response, incident) {
			if (response.message !== "OK") {
				Ext.MessageBox.alert("Status", response.message);
			} else {
				Ext.MessageBox.alert("Status", "Incident successfully updated.");
			}
		},
		
		onLoadAllIncidents: function(e,response) {
		
			if(response != null && response.incidents != null){
				
				if(this.lookupReference('multiincidentsgrid').getSelectionModel().getSelection()){
					this.lookupReference('multiincidentsgrid').getSelectionModel().clearSelections();
				}
				
				this.lookupReference('multiincidentsgrid').getRootNode().removeAll();
				
				response.incidents.forEach(function(incident){
					
					this.addNewRow(incident);
					
					
				}, this);
				
				this.addMIVLayer(response.incidents);
			
			}
			
			//Request the org ownership if the user is an admin or a super user
			if(UserProfile.getSystemRoleId() === 4){
				this.loadIncidentOrgs();
			}
		},

		addNewRow: function(incident, index){
			var grid = this.lookupReference('multiincidentsgrid');

			if(grid.getStore().find("incidentid", incident.incidentid) === -1) {

				var root = grid.getRootNode();

				this.addIncidentListener(incident);

				if (index !== -1) {
					root.insertChild(index, this.createTree(incident));
				} else {
					root.appendChild(this.createTree(incident));
				}
			}
		},

		onIncidentUpdate: function(evt, incident){
			var grid = this.lookupReference('multiincidentsgrid');
			var store = grid.getStore();
			var index = store.find("incidentid", incident.incidentid);
			if(index > -1) {
				var record = store.getAt(index);
				record.set(this.createTree(incident));
				if(this.isSelected(incident.incidentId)){
					this.onSelectionChange(grid, [record]);
					this.refreshOrgsList(incident.incidentid);
				}
				Core.EventManager.fireEvent("iweb.NICS.incident.update", incident);
			}
		},

		isSelected: function(incidentid){
			var grid = this.lookupReference('multiincidentsgrid');
			return (grid.getSelectionModel().getSelection().length === 1 &&
				grid.getSelectionModel().getSelection()[0] &&
				grid.getSelectionModel().getSelection()[0].data.incidentid === incidentid);
		},

		addIncidentListener: function(incident) {
			var topic = Ext.String.format("iweb.NICS.incident.{0}.update", incident.incidentid);
			if (!this.incidentListeners[incident.incidentid]) {
				this.incidentListeners[incident.incidentid] =
					this.onIncidentUpdate.bind(this);
				Core.EventManager.addListener(topic,
					this.incidentListeners[incident.incidentid]);
				this.mediator.subscribe(topic);
			}
		},

		removeIncidentListener: function(incidentId) {
			var topic = Ext.String.format("iweb.NICS.incident.{0}.update", incidentId);
			if (this.incidentListeners[incidentId]) {
				Core.EventManager.removeListener(topic,
					this.incidentListeners[incidentId]);
				this.mediator.unsubscribe(topic);
				this.incidentListeners[incidentId] = null;
			}
		},
		
		loadIncidentOrgs: function(){
			var topic = Core.Util.generateUUID();

			var orgId = UserProfile.getOrgId();
			//populate the user grids
			Core.EventManager.createCallbackHandler(topic, this, 
					function(orgId, evt, response){
						this.incidentOrgs = [];
						if (response && response.data && response.data.length) {
							for(var i=0; i<response.data.length; i++){
								if(response.data[i].orgid === orgId){
									this.incidentOrgs.push(response.data[i].incidentid);
								}
							}
						}
					},
					[orgId]
			);
			
			var url = Ext.String.format('{0}/incidents/{1}/incidentorgs', 
					Core.Config.getProperty(UserProfile.REST_ENDPOINT),
					UserProfile.getWorkspaceId());
			
			this.mediator.sendRequestMessage(url, topic);
		},
		
		createTree: function(incident){
			
			if(!incident.lastUpdate){
				incident.lastUpdate = incident.created;
			}
			
			incident.lastUpdate = new Date(incident.lastUpdate);

			incident.incidenttypes = "";

			for(var i = 0; i < incident.incidentIncidenttypes.length; i++){
		
				incident.incidenttypes += incident.incidentIncidenttypes[i].incidentType.incidentTypeName;
				
				if(i !== incident.incidentIncidenttypes.length - 1){
					incident.incidenttypes += ", ";
				}
		
			}
			
			if(!incident.leaf){
				incident.children.forEach(function(incident){
					var childIncident = this.createTree(incident);
					incident.lastUpdate = childIncident.lastUpdate;
					incident.incidenttypesstring = childIncident.incidenttypesstring;
				}, this);
			}
			
			
			return incident;
		
		},
		
		addMIVLayer: function(incidents){
			
			for(var i = 0; i < incidents.length; i++){
				
				var feature = new ol.Feature({
					geometry : new ol.geom.Point(ol.proj.transform([ incidents[i].lon, incidents[i].lat ],
							'EPSG:4326', 'EPSG:3857'))	
				});
				
				feature.set('type', 'incident');
				feature.set('fillColor', this.incidentColor);
				feature.set('strokeColor',this.incidentColor);
				feature.set('incidentname',incidents[i].incidentname);
				feature.set('description',incidents[i].description);
					
				this.vectorLayer.getSource().addFeature(feature);
				
				if(incidents[i].children != null){
					this.addMIVLayer(incidents[i].children);
				}
			}
			
		},
		
		resetFormPanel: function(){
		
			var form = this.lookupReference('multiincidentform');
			
			form.collapse();
			form.getForm().findField('incidentname').setValue('');
			form.getForm().findField('created').setValue('');
			form.getForm().findField('description').setValue('');
			form.getForm().findField('timesincecreated').setValue('');
			
		},
		
		editIncident: function(e){
		
			var selected = this.lookupReference('multiincidentsgrid').getSelectionModel().getSelection()[0];
			if(selected == null){
				Ext.MessageBox.alert(Core.Translate.i18nJSON("Multi-Incident View Error"),
					Core.Translate.i18nJSON("Select an incident to update."));
			}
			else{
				Core.EventManager.fireEvent('nics.incident.window.update',selected);
			}
		
		},

		escalateIncident: function(e){

			var selected = this.lookupReference('multiincidentsgrid').getSelectionModel().getSelection()[0];
			if(selected == null){
				Ext.MessageBox.alert(Core.Translate.i18nJSON("Multi-Incident View Error"),
					Core.Translate.i18nJSON("Select an incident to escalate."));
			}else{
				if(selected.data){
					var incident = {
						incidentid: selected.data.incidentid,
						workspaceid: selected.data.workspaceid,
						usersessionid: selected.data.usersessionid
					};

					this.mediator.publishMessage(Ext.String.format('iweb.NICS.ws.{0}.incidentEscalation',
						UserProfile.getWorkspaceId()), incident);
					Ext.MessageBox.alert(Core.Translate.i18nJSON("Multi-Incident View"),
						Core.Translate.i18nJSON("The incident has been escalated."));
				}else{
					Ext.MessageBox.alert(Core.Translate.i18nJSON("Multi-Incident View Error"),
						Core.Translate.i18nJSON("There was an error escalating the incident."));
				}
			}
		},
		
		enableIncidentView: function(e){
		
			if(this.viewEnabled){
				this.vectorLayer.setVisible(false);
				this.viewEnabled = false;
				this.lookupReference('mivviewbutton').setText('Enable All Views');
			}
			else{
				this.vectorLayer.setVisible(true);
				this.viewEnabled = true;
				this.lookupReference('mivviewbutton').setText('Disable All Views');
			}
			
		},
		
		onItemDblClick: function(dv, incident, item, index, e){
    		var latAndLonValues = [incident.data.lon,incident.data.lat];
    		var center = ol.proj.transform(latAndLonValues,'EPSG:4326','EPSG:3857');
    		MapModule.getMap().getView().setCenter(center);
    		
    		if(!this.viewEnabled){
    			this.lookupReference('mivviewbutton').el.dom.click();
    		}
		},
		
		onSelectionChange: function(grid, selected, eOpts) {
			if(!selected || selected.length === 0){
				return;
			}

			var incident = selected[0].data;
			var form = this.lookupReference('multiincidentform');
			var date = new Date(incident.created);
			
			var dateFormat = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
			var diff = date.getTime() - Date.now();
			var hours = Math.abs(Math.round((((diff/1000)/60)/60)));
			var days = Math.abs(Math.round(hours / 24));
			
			form.getForm().findField('incidentname').setValue(incident.incidentname);
			form.getForm().findField('created').setValue(dateFormat);

			this.refreshOrgsList(incident.incidentid);

			var _this = this;
			if(this.incIdOwnerNameMap.has(incident.incidentid) === false) {
				form.getForm().findField('owningorg').setValue(Core.Translate.i18nJSON("Pending..."));
				var url = Ext.String.format('{0}/incidents/{1}/owner/{2}',
					Core.Config.getProperty(UserProfile.REST_ENDPOINT),
					UserProfile.getWorkspaceId(),
					incident.incidentid);
				Ext.Ajax.request({
					url: url,
					method: 'GET',
					success: function(response) {
						if (response && response.status === 200) {
							var json = JSON.parse(response.responseText);
							var owningOrg = json.owningOrg;

							_this.incIdOwnerNameMap.set(incident.incidentid,
								{orgId: owningOrg.orgId, orgName: owningOrg.name});

							form.getForm().findField('owningorg').setValue(owningOrg.name);

							_this.checkAndToggleEditButton(owningOrg.orgId);

						} else {
							form.getForm().findField('owningorg').setValue( Ext.String.format("({0})", Core.Translate.i18nJSON("Failed to get Owner")));
						}
					},
					failure: function(fp, o) {
						form.getForm().findField('owningorg').setValue(Ext.String.format("({0})", Core.Translate.i18nJSON("Failed to get Owner")));
					}
				}, this);

			} else {
				form.getForm().findField('owningorg').setValue(this.incIdOwnerNameMap.get(incident.incidentid).orgName);
				this.checkAndToggleEditButton(this.incIdOwnerNameMap.get(incident.incidentid).orgId);
			}
			
			if(incident.description === ""){
				form.getForm().findField('description').setValue(Core.Translate.i18nJSON("No description available"));
			}
			else{
				form.getForm().findField('description').setValue(incident.description);
			}
			
			if(days === 0){
				form.getForm().findField('timesincecreated').setValue(hours + " hours");
			}
			else{
				
				form.getForm().findField('timesincecreated').setValue(days + " days, " + hours + " hours");
			}
			
			form.expand();
			
		},

		checkAndToggleEditButton: function(owningOrgId) {
			var systemRoleId = UserProfile.getSystemRoleId();
			var usersOrgId = UserProfile.getOrgId();

			if(systemRoleId === 5) {
				this.disableEditButton(false);
			} else if(systemRoleId === 4 && usersOrgId === owningOrgId) {
				this.disableEditButton(false);
			} else if(systemRoleId === 4 && UserProfile.hasChildOrg(owningOrgId)) {

				// TODO: is this enough? Or do we need to check if user is admin in any other org? That's how
				// calls for incidents work... if you're in ANY org that has access, you get access, but
				// checking role is another thing....

				this.disableEditButton(false);
			} else {
				this.disableEditButton(true);
			}
		},

		//Just refresh the orgs list
		_refreshOrgsList: function(e, incidentid){
			this.refreshOrgsList(incidentid);
		},

		refreshOrgsList: function(incidentid) {
			var orgGrid = this.lookupReference('orglistgrid');
			
			var url = Ext.String.format('{0}/incidents/{1}/orgs/{2}',
						Core.Config.getProperty(UserProfile.REST_ENDPOINT),
						UserProfile.getWorkspaceId(),
						incidentid);

			Ext.Ajax.request({
				url: url,
				method: 'GET',

				success: function(response) {
					var enabledOrgs = JSON.parse(response.responseText).incidentOrgs;

					url = Ext.String.format('{0}/orgs/{1}/all', 
						Core.Config.getProperty(UserProfile.REST_ENDPOINT), 
						UserProfile.getWorkspaceId());

					Ext.Ajax.request({
						url: url,
						method: 'GET',

						success: function(response2) {
							var orgList = [];

							var orgs = JSON.parse(response2.responseText).organizations;
							for (var i = 0; i < enabledOrgs.length; ++i) {
								for (var j = 0; j < orgs.length; ++j) {
									if (enabledOrgs[i].orgid === orgs[j].orgId) {
										orgList.push(orgs[j]);
									}
								}
							}

							orgGrid.store.loadRawData(orgList);
						},

						failure: function(fp, o) {
							console.log(fp, o);
						}
					});

					
				},

				failure: function(fp, o) {
					console.log(fp, o);
				}
			});
		}
		
	});
});
