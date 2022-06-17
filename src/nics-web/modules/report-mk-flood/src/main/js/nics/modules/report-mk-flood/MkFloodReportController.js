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
define([  'iweb/CoreModule', 
			'nics/modules/UserProfileModule','./MkFloodReportView', './MkFloodFormView'
			],

function(Core, UserProfile, MkFloodReportView, MkFloodFormView) {
	
	Ext.define('modules.report-mk-flood.MkFloodReportController', {
		extend : 'Ext.app.ViewController',
		alias : 'controller.mkfloodreportcontroller',
		orgCapName: 'MKFLOOD',
		orgIds: [],
		
		init : function(args) {
		
			this.mediator = Core.Mediator.getInstance();
			this.lookupReference('createButton').enable();
			this.lookupReference('viewButton').disable();
			this.lookupReference('updateButton').disable();
			this.lookupReference('finalButton').disable();
			this.lookupReference('printButton').disable();
			this.formTypeName = 'MKFLOOD';
			
			var topic = "nics.report.reportType";
			Core.EventManager.createCallbackHandler(
					topic, this, function(evt, response){
						Ext.Array.each(response.types, function(type){
							if(type.formTypeName === this.formTypeName){
								this.formTypeId = type.formTypeId;
								return;
							}
						}, this);
						
						//Continue loading
						this.bindEvents();
						
			});
			this.mediator.sendRequestMessage(Core.Config.getProperty(UserProfile.REST_ENDPOINT) +
					"/reports/types", topic);
		},
		
		bindEvents: function(){
			//Bind UI Elements
			Core.EventManager.addListener("nics.incident.join", this.onJoinIncident.bind(this));
			Core.EventManager.addListener("nics.incident.close", this.onCloseIncident.bind(this));
			Core.EventManager.addListener("LoadMKFLOODReports", this.onLoadReports.bind(this));
			Core.EventManager.addListener("PrintMKFLOODReport", this.onReportReady.bind(this));
			Core.EventManager.addListener("CancelMKFLOODReport", this.onCancel.bind(this));
			
			Core.EventManager.fireEvent("nics.report.add", {title: "FLOOD", orgCap: this.formTypeName, component: this.getView()});

			Core.EventManager.addListener("nics.userorg.change", this.onChangeUserOrg.bind(this));
			Core.EventManager.addListener("LoadOrgAdminList", this.loadOrgAdminList.bind(this));
			Core.EventManager.addListener("LoadOrgDistList", this.loadOrgDistList.bind(this));
			Core.EventManager.addListener("nics.user.profile.loaded", this.updateOrgCapsListener.bind(this));
			
			this.bindOrgCaps = this.orgCapUpdate.bind(this);
		},
		
		onChangeUserOrg: function(evt){
			Core.EventManager.fireEvent("nics.report.remove", {
				component : this.getView()
			});
		},
		
		updateOrgCapsListener: function(evt, data){
		
			if(this.currentOrg){
				this.mediator.unsubscribe("iweb.nics.orgcaps." + this.currentOrg + "." + this.orgCapName);
				Core.EventManager.removeListener("iweb.nics.orgcaps." + this.currentOrg + "." + this.orgCapName, this.bindOrgCaps);
			}
			
			this.currentOrg = UserProfile.getOrgId();
			
			if(this.orgIds.indexOf(UserProfile.getOrgId()) == -1){
				Core.EventManager.addListener("iweb.nics.orgcaps." + this.currentOrg + "." + this.orgCapName, this.bindOrgCaps);
				this.orgIds.push(this.currentOrg);
			}

			this.mediator.subscribe("iweb.nics.orgcaps." + this.currentOrg + "." + this.orgCapName);
			
		},
	
		orgCapUpdate: function(evt, orgcap){

			if(orgcap.activeWeb){
				this.getView().enable();
			}
			else{
				this.getView().disable();
			}
		
			UserProfile.setOrgCap(orgcap.cap.name,orgcap.activeWeb);
		
		},
	
		onJoinIncident: function(e, incident) {
			this.incidentName = incident.name;
			this.incidentId = incident.id;
			this.emailList ="";

			if(UserProfile.isOrgCapEnabled(this.orgCapName)){
				this.getView().enable();
			}
			else{
				this.getView().disable();
			}
			
			var endpoint = Core.Config.getProperty(UserProfile.REST_ENDPOINT);
			this.hasFinalForm = false;
			//Load reports
			this.hasFinalForm = false;
			this.mediator.sendRequestMessage(endpoint +
					"/reports/" + this.incidentId + '/MKFLOOD', "LoadMKFLOODReports");
			//Load list of admins, and distribution list for this incident
			var url = Ext.String.format("{0}/orgs/{1}/adminlist/{2}",endpoint, UserProfile.getWorkspaceId(), UserProfile.getOrgId());
			this.mediator.sendRequestMessage(url, "LoadOrgAdminList");
			var url = Ext.String.format("{0}/orgs/{1}/org/{2}",endpoint, UserProfile.getWorkspaceId(), UserProfile.getOrgName());
			
			this.mediator.sendRequestMessage(url, "LoadOrgDistList");
			
			//Subscribe to New MKFLOOD report message on the bus
			this.newTopic = Ext.String.format(
					"iweb.NICS.incident.{0}.report.{1}.new", this.incidentId,
					this.formTypeName);
			this.mediator.subscribe(this.newTopic);
			
			this.newHandler = this.onReportAdded.bind(this);
			Core.EventManager.addListener(this.newTopic, this.newHandler);
			
			
		},
		onCloseIncident: function(e, incidentId) {
			this.mediator.unsubscribe(this.newTopic);
			
			Core.EventManager.removeListener(this.newTopic, this.newHandler);
			Core.EventManager.removeListener("LoadOrgAdminList", this.loadOrgAdminList);
			Core.EventManager.removeListener("LoadOrgDistList", this.loadOrgDistList);
			Core.EventManager.removeListener("PrintMKFLOODReport", this.onReportReady);
			Core.EventManager.removeListener("CancelMKFLOODReport", this.onCancel);
			
			
			
			var mkfloodReportContainer = this.view.lookupReference('mkfloodReport');
			mkfloodReportContainer.removeAll();
			
			var mkfloodList = this.lookupReference('mkfloodList');
			mkfloodList.clearValue();
			mkfloodList.getStore().removeAll();
			this.getView().disable();
			
			this.incidentId = null;
			this.incidentName = null;
			this.emailList = null;
			this.hasFinalForm = false;
			
			
		},
		
	onAddMKFLOOD: function(e) {
			var mkfloodReportContainer = this.view.lookupReference('mkfloodReport');
			var username  = UserProfile.getFirstName() + " " + UserProfile.getLastName();
            var mkfloodForm = Ext.create('modules.report-mk-flood.MkFloodFormView',{
            	incidentId: this.incidentId,
				incidentName: this.incidentName,
				formTypeId: this.formTypeId,
				email: this.emailList,
				simplifiedEmail: true
				
			
			});
            mkfloodReportContainer.removeAll();
            mkfloodReportContainer.add(mkfloodForm);
        	var initialData= {incidentId: this.incidentId, 
        			incidentName: this.incidentName, //incidentType is not coming back.  Need to figure out how to get it
        			reportType: 'NEW',
        			date: new Date(),
        			starttime: new Date(),
        			formTypeId:this.formTypeId,
        			reportBy:  username,
        			email:this.emailList};
			mkfloodForm.viewModel.set(initialData);
			this.lookupReference('createButton').disable();
			
		},
		
        onUpdateMkFlood: function(){
        	this.displayCurrentRecord(false, 'UPDATE');
		},
		
		onFinalizeMKFLOOD: function(){
			this.displayCurrentRecord(false, 'FINAL');
		},
		
		onReportSelect: function(){
			this.displayCurrentRecord(true, 'select');	
		},
		onViewMKFLOOD: function(){
			this.displayCurrentRecord(true, 'select');	
		},
		onCancel: function(){
			var combo  = this.lookupReference('mkfloodList');
			var currentFormId=combo.getValue();
			if (currentFormId){
				this.hasFinalForm = false;
				this.displayCurrentRecord(true, 'select');
			}
			else{
				var mkfloodReportContainer = this.view.lookupReference('mkfloodReport');
				mkfloodReportContainer.removeAll();
				this.lookupReference('createButton').enable();
				
			}
			
				
		},
		displayCurrentRecord: function(displayOnly, status){
			var combo  = this.lookupReference('mkfloodList');
			var currentFormId=combo.getValue();
			
			 var record = combo.findRecordByValue(currentFormId); 
			
			
			if(record){
		
				var mkfloodReportContainer = this.view.lookupReference('mkfloodReport');
				//Clear away any previous report
				mkfloodReportContainer.removeAll();
				//Add new report
				var mkfloodForm = Ext.create('modules.report-mk-flood.MkFloodFormView',{
					incidentId: this.incidentId,
					incidentName: this.incidentName,
					formTypeId: this.formTypeId
				
					
					
				});
				  mkfloodReportContainer.add(mkfloodForm);
		        
		         //Pull data from the report, and add in the incidentName and Id
				var formData = (JSON.parse(record.data.message));
			    formData.report.incidentId = record.data.incidentId;
			    formData.report.incidentName = record.data.incidentName;
			    formData.report.formTypeId = this.formTypeId;
				   
			    //Convert date and starttime back to date objects so they will display properly on the forms
				formData.report.date = new Date(formData.report.date);
				formData.report.starttime = new Date(formData.report.starttime);
				
				
				if (displayOnly){
					mkfloodForm.controller.setFormReadOnly();
					if (this.hasFinalForm){
						this.lookupReference('updateButton').disable();
						this.lookupReference('finalButton').disable();
					}
					else {
						this.lookupReference('updateButton').enable();
						this.lookupReference('finalButton').enable();
					}
				}
				else {
					if(status == 'UPDATE' || status == 'FINAL' )
					//this is an updated or finalized form, change report name to the current status
					 formData.report.reportType =status;
					if(status == 'FINAL' )this.hasFinalForm = true;
					this.lookupReference('viewButton').disable();
					this.lookupReference('finalButton').disable();
					this.lookupReference('printButton').disable();
				}
				if (mkfloodForm.viewModel) mkfloodForm.viewModel.set(formData.report);
			}
			
			
		},
		

		
		onReportAdded: function() {	
			this.lookupReference('createButton').disable();
			this.lookupReference('updateButton').enable();
			this.lookupReference('viewButton').enable();
			this.lookupReference('finalButton').enable();
			this.lookupReference('printButton').enable();
			this.mediator.sendRequestMessage(Core.Config.getProperty(UserProfile.REST_ENDPOINT) +
					"/reports/" + this.incidentId + '/MKFLOOD', "LoadMKFLOODReports");
			
		},
		
		onLoadReports: function(e, response) {
			var newReports = [];
			var isFinal = false;
			var combo = this.lookupReference('mkfloodList');
			if(response) {
				if(response.reports && 
					response.reports.length > 0){
					//Add each report
					this.lookupReference('createButton').disable();
					this.lookupReference('printButton').enable();
					this.lookupReference('viewButton').enable();
					
					for(var i=0; i<response.reports.length; i++){
						var report = response.reports[i];
					
						var newReport  = this.buildReportData(report);
						newReports.push(newReport);
						if (newReport.status == 'FINAL') {
							this.hasFinalForm = true; 	

						}						
					}
					combo.getStore().removeAll();
					combo.getStore().loadRawData(newReports, true);
					var latestForm = combo.getStore().getAt(0).data.formId;
					combo.setValue(latestForm);
					this.displayCurrentRecord(true, 'select');	
				if (this.hasFinalForm){
						this.lookupReference('updateButton').disable();
						this.lookupReference('finalButton').disable();
					}
					else {
						this.lookupReference('updateButton').enable();
						this.lookupReference('finalButton').enable();
					}
					
					
				}
				else {
					this.lookupReference('createButton').enable();
					this.lookupReference('viewButton').disable();
					this.lookupReference('updateButton').disable();
					this.lookupReference('finalButton').disable();
					this.lookupReference('printButton').disable();
				}
			}
		},
		
		buildReportData: function(report){
			var message = JSON.parse(report.message);
			var reportTitle  = message.datecreated;
			var reportType = message.report.reportType;
		
			
			
			return {
				formId: report.formId,
				incidentId: this.incidentId,
				incidentName: this.incidentName,
				name: reportTitle,
				message: report.message,
				status: reportType,
				datecreated: report.datecreated,
				dateupdated: report.dateupdated
			};
		},
		
		loadOrgAdminList:  function(e, response) {
			var adminList = [];
			if (response && response.orgAdminList.length > 0){
					var adminList  = response.orgAdminList;
				}
			
			if (typeof(adminList) != "undefined" && adminList.length > 0){
				var adminListString = adminList.toString();
			
				if (this.emailList != ""){
					this.emailList += ",";
				}
				this.emailList +=  adminListString;
			}
		},
		
	   loadOrgDistList:  function(e, response) {		
			var distributionList;
			if (response) {
				if (response.organizations && response.organizations[0].distribution){
					distributionList  = response.organizations[0].distribution;
				}
			}
			if (typeof(distributionList ) != "undefined" && distributionList  != ""){
				if (this.emailList != ""){
					this.emailList += ",";
				}
				this.emailList +=  distributionList;
			}
			
		},
		onPrintMKFLOOD: function(){
			 //Need to actually get the from from the dropdown
			this.displayCurrentRecord(true, 'select');	
			 var printMsg = null;
			var mkfloodReportForm = this.view.lookupReference('mkfloodReportForm');
			var data = mkfloodReportForm.viewModel.data;
			Ext.MessageBox.show({
				   title:'Print Format',
				   form: this,
				   msg: 'Would you like to print a simplified format? Choosing NO will print the entire form.',
				   buttons: Ext.Msg.YESNOCANCEL,
				   fn: function(btn) {
				        if (btn === 'yes') {
				         // printMsg = mkfloodReportForm.controller.buildEmailReport(data, true);
				        	mkfloodReportForm.controller.buildReport(data, true, 'print');
				             } else if (btn === 'no') {
				           // 	 printMsg = mkfloodReportForm.controller.buildEmailReport(data, false);
				            	 mkfloodReportForm.controller.buildReport(data, false, 'print');
				             } else {
				            //do nothing
				        } 
				    },
				   icon: Ext.MessageBox.QUESTION
				});
			
			
	},

	onReportReady: function(e, response) {
		if (response){
			 var iFrameId = "printerFrame";
			 var printFrame = Ext.get(iFrameId);
			 if (printFrame == null) {
		     printFrame = Ext.getBody().appendChild({
		                id: iFrameId,
		                tag: 'iframe',
		                cls: 'x-hidden',  style: {
		                    display: "none"
		                }
		            });
		        }
		     var printContent = printFrame.dom.contentWindow;
			  // output to the iframe
		     printContent.document.open();
		     printContent.document.write(response);
		     printContent.document.close();
		  // print the iframe
		     printContent.print();
		
			}
			
	}
	});
});
