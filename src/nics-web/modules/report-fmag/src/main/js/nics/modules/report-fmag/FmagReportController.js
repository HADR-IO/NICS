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
			'nics/modules/UserProfileModule','./FmagReportView', './FmagFormView'
			],

function(Core, UserProfile, FmagReportView, FmagFormView) {
	
	Ext.define('modules.report-fmag.FmagReportController', {
		extend : 'Ext.app.ViewController',
		alias : 'controller.fmagreportcontroller',
		orgCapName: 'ABC',
		orgIds: [],
		
		init : function(args) {
			
			this.mediator = Core.Mediator.getInstance();
			this.lookupReference('createButton').enable();
			this.lookupReference('viewButton').disable();
			this.lookupReference('updateButton').disable();
			this.lookupReference('finalButton').disable();
			this.lookupReference('printButton').disable();
			
			var topic = "nics.report.reportType";
			
			Core.EventManager.createCallbackHandler(
					topic, this, function(evt, response){
						Ext.Array.each(response.types, function(type){
							if(type.formTypeName === 'ABC'){
								this.formTypeId = type.formTypeId;
								return;
							}
						}, this);
						
						//Continue loading
						this.bindEvents();
			});
			
			this.mediator.sendRequestMessage(Core.Config.getProperty(UserProfile.REST_ENDPOINT) +
					"/reports/types", topic);
			

			this.bindOrgCaps = this.orgCapUpdate.bind(this);
			
		},
		
		bindEvents: function(){
			//Bind UI Elements
			Core.EventManager.addListener("nics.incident.join", this.onJoinIncident.bind(this));
			Core.EventManager.addListener("nics.incident.close", this.onCloseIncident.bind(this));
			Core.EventManager.addListener("LoadFmagReports", this.onLoadReports.bind(this));
			Core.EventManager.addListener("PrintFmagReport", this.onReportReady.bind(this));
			Core.EventManager.addListener("CancelFmagReport", this.onCancel.bind(this));
			Core.EventManager.fireEvent("nics.report.add", {title: "FMAG - ABC", orgCap: 'ABC', component: this.getView()});
			Core.EventManager.addListener("nics.userorg.change", this.onChangeUserOrg.bind(this));
			Core.EventManager.addListener("nics.user.profile.loaded", this.updateOrgCapsListener.bind(this));
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
					"/reports/" + this.incidentId + '/ABC', "LoadFmagReports");
			
			this.newTopic = Ext.String.format(
					"iweb.NICS.incident.{0}.report.{1}.new", this.incidentId,
					'ABC');
			this.mediator.subscribe(this.newTopic);
			
			this.newHandler = this.onReportAdded.bind(this);
			Core.EventManager.addListener(this.newTopic, this.newHandler);

		},
		onCloseIncident: function(e, incidentId) {
			this.mediator.unsubscribe(this.newTopic);
			
			Core.EventManager.removeListener(this.newTopic, this.newHandler);
			Core.EventManager.removeListener("PrintFmagReport", this.onReportReady);
			Core.EventManager.removeListener("CancelFmagReport", this.onReportReady);
			
			var fmagReportContainer = this.view.lookupReference('fmagReport');
			fmagReportContainer.removeAll();
			
			var fmagList = this.lookupReference('fmagList');
			fmagList.clearValue();
			fmagList.getStore().removeAll();
			this.getView().disable();
			
			this.incidentId = null;
			this.incidentName = null;
			this.hasFinalForm = false;

        

		},
		
		onAddFmag: function(e) {
			var fmagReportContainer = this.view.lookupReference('fmagReport');
			var username  = UserProfile.getFirstName() + " " + UserProfile.getLastName();
            var fmagForm = Ext.create('modules.report-fmag.FmagFormView',{
            	incidentId: this.incidentId,
				incidentName: this.incidentName,
				formTypeId: this.formTypeId,
				reportType: 'NEW'
			
			});
			
			fmagReportContainer.removeAll();
			fmagReportContainer.show();
            fmagReportContainer.add(fmagForm);
            
        	var initialData= {incidentId: this.incidentId, 
        			incidentName: this.incidentName, 
        			reportType: 'NEW',
        			requestDate: new Date(),
        			fireDate: new Date(),
        			formTypeId:this.formTypeId};
        			
			fmagForm.viewModel.set(initialData);
			
		},
		
        onUpdateFmag: function(){
        	this.view.lookupReference('fmagReport').removeAll();
        	this.displayCurrentRecord(false, 'UPDATE');
		},
		
		onFinalizeFmag: function(){
			this.displayCurrentRecord(false, 'FINAL');
		},
		
		onReportSelect: function(){
			this.displayCurrentRecord(true, 'select');	
		},
		onViewFmag: function(){
			this.displayCurrentRecord(true, 'select');	
		},
		onCancel: function(){
			var combo  = this.lookupReference('fmagList');
			var currentFormId=combo.getValue();
			if (currentFormId){
				this.hasFinalForm = false;
				this.displayCurrentRecord(true, 'select');
			}
			else{
				var fmagReportContainer = this.view.lookupReference('fmagReport');
				fmagReportContainer.removeAll();
				this.lookupReference('createButton').enable();
			}
			
				
		},
		displayCurrentRecord: function(displayOnly, status){
			var combo  = this.lookupReference('fmagList');
			var currentFormId=combo.getValue();
			
			 var record = combo.findRecordByValue(currentFormId); 
			
			if(record){
		
				var fmagReportContainer = this.view.lookupReference('fmagReport');
				//Clear away any previous report
				fmagReportContainer.removeAll();
				//Add new report
				var fmagForm = Ext.create('modules.report-fmag.FmagFormView',{
					incidentId: this.incidentId,
					incidentName: this.incidentName,
					formTypeId: this.formTypeId
					
				});
				 fmagReportContainer.show();
		         fmagReportContainer.add(fmagForm);				//Pull data from the report, and add in the incidentName and Id
				var formData = (JSON.parse(record.data.message));
			    formData.report.incidentId = record.data.incidentId;
			    formData.report.incidentName = record.data.incidentName;
			    formData.report.formTypeId = this.formTypeId;
				   
			    //Convert date and starttime back to date objects so they will display properly on the forms
			    
				formData.report.requestDate = new Date(formData.report.requestDate);
				formData.report.fireDate = new Date(formData.report.fireDate);
				
				if (displayOnly){
					fmagForm.controller.setFormReadOnly();
					if (this.hasFinalForm){
						this.lookupReference('updateButton').disable();
						this.lookupReference('finalButton').disable();
					}
					else {
						formData.report.preptime = new Date();
						this.lookupReference('updateButton').enable();
						this.lookupReference('finalButton').enable();
					}
				}
				else {
					if(status == 'UPDATE' || status == 'FINAL' )
					//this is an updated or finalized form, change report name to the current status
					 formData.report.reportType = status;
					if(status == 'FINAL' )this.hasFinalForm = true;
					this.lookupReference('viewButton').disable();
					this.lookupReference('finalButton').disable();
                     this.lookupReference('printButton').disable();
					 
				}
				fmagForm.viewModel.set(formData.report);
			}
			
			
		},
		
		onReportAdded: function() {	
			this.lookupReference('createButton').disable();
			this.lookupReference('viewButton').enable();

			if (this.hasFinalForm){
				this.lookupReference('updateButton').disable();
				this.lookupReference('finalButton').disable();
			}
			else {
				this.lookupReference('updateButton').enable();
				this.lookupReference('finalButton').enable();
			}
			this.mediator.sendRequestMessage(Core.Config.getProperty(UserProfile.REST_ENDPOINT) +
					"/reports/" + this.incidentId + '/ABC', "LoadFmagReports");
			
		},
		
		onLoadReports: function(e, response) {
			var newReports = [];
			var isFinal = false;
			var combo = this.lookupReference('fmagList');
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
					//this.displayCurrentRecord(true, 'select');
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
				requestDate: report.requestDate,
				fireDate: report.fireDate
			};
		},
			
		onPrintFmag: function(){
			
			this.displayCurrentRecord(true, 'select');
			var printMsg = null;
			var fmagReportForm = this.view.lookupReference('fmagReportForm');
			var data = fmagReportForm.viewModel.data;
			fmagReportForm.controller.buildReport(data, 'print');
			
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
			     printContent.print();
			
				}
				
		}
	

	});
});
