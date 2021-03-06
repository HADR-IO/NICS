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
define([  'iweb/CoreModule', 'nics/modules/UserProfileModule',
			'../AbstractReportController','./I205ReportView', './I205FormView','./I205InstructionsView'
			],

function(Core, UserProfile, AbstractReportController, I205ReportView, I205FormView,I205InstructionsView) {
	
	Ext.define('modules.report-opp.I205ReportController', {
		extend : 'modules.report-opp.AbstractReportController',
		alias : 'controller.i205reportcontroller',
		orgCapName: '205',
		orgIds: [],
		
		init : function(args) {
			this.mediator = Core.Mediator.getInstance();
			this.enableButton('create205');
			this.disableButton('view205');
			this.disableButton('update205');
			this.disableButton('final205');
			this.disableButton('print205');
			this.formTypeName = '205';
			 
			 var oppInstructions = this.view.lookupReference('oppInstructions205');
			
			//Add new report
			var oppistr = new I205InstructionsView();
			oppInstructions.add(oppistr);		
			 
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
			Core.EventManager.addListener("LoadReports205", this.onLoadReports.bind(this));
			Core.EventManager.addListener("PrintReport205", this.onReportReady.bind(this));
			Core.EventManager.addListener("CancelReport205", this.onCancel.bind(this));
			Core.EventManager.fireEvent("nics.report.add", {title: "205", orgCap: this.formTypeName,component: this.getView()});
			Core.EventManager.addListener("nics.userorg.change", this.onChangeUserOrg.bind(this));
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
                Core.EventManager.removeListener("iweb.nics.orgcaps." + this.currentOrg  + "." + this.orgCapName, this.bindOrgCaps);
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
			this.mediator.sendRequestMessage(endpoint +
					"/reports/" + this.incidentId + '/205', "LoadReports205");
			//Subscribe to New 205 report message on the bus
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
			Core.EventManager.removeListener("LoadReports205", this.onLoadReports);
			Core.EventManager.removeListener("PrintReport205", this.onReportReady);
			Core.EventManager.removeListener("CancelReport205", this.onCancel);
			
			var oppReportContainer = this.view.lookupReference('oppReport205');
			if(oppReportContainer)oppReportContainer.removeAll();
			
			var oppList = this.lookupReference('oppList205' );
			if (oppList)oppList.clearValue();
			if (oppList)oppList.getStore().removeAll();
			this.getView().disable();
			
			this.incidentId = null;
			this.incidentName = null;
			this.hasFinalForm = false;
		},
		
	onAdd: function(e) {
			var oppReportContainer = this.view.lookupReference('oppReport205');
			var username  = UserProfile.getFirstName() + " " + UserProfile.getLastName();
	           
			 var i205Form = new I205FormView({
            	incidentId: this.incidentId,
				incidentName: this.incidentName,
				formTypeId: this.formTypeId,
				
			});
            oppReportContainer.removeAll();
            oppReportContainer.add(i205Form);
        	var initialData= {incidentId: this.incidentId, 
        			incidentName: this.incidentName, 
        			reportType: 'NEW',
        			date: new Date(),
        			starttime: new Date(),
        			prepdate: new Date(),
        			preptime: new Date(),
        			formTypeId:this.formTypeId,
        			reportBy:  username,
    				seqnum: 1,
    				
    				
    				
        	};
			i205Form.viewModel.set(initialData);	
        	this.disableButton('create205');
			
		},
		
       
		
			
		
		displayCurrentRecord: function(displayOnly, status){

			var combo  = this.lookupReference('oppList205');
			var currentFormId=combo.getValue();
			
			 var record = combo.findRecordByValue(currentFormId); 
			
			
			if(record){
				this.disableButton('create205');
				
				var oppReportContainer = this.view.lookupReference('oppReport205');
				//Clear away any previous report
				oppReportContainer.removeAll();
				//Add new report
				var i205Form = new I205FormView({
					incidentId: this.incidentId,
					incidentName: this.incidentName,
					formTypeId: this.formTypeId
				
					
					
				});
				 ;
		        oppReportContainer.add(i205Form);
		           
		         //Pull data from the report, and add in the incidentName and Id
				var formData = (JSON.parse(record.data.message));
			    formData.report.incidentId = record.data.incidentId;
			    formData.report.incidentName = record.data.incidentName;
			    formData.report.formTypeId = this.formTypeId;
				   
			    //Convert date and starttime back to date objects so they will display properly on the forms
			    formData.report.date = new Date(formData.report.date);
				formData.report.starttime = new Date(formData.report.starttime);

				formData.report.enddate = new Date(formData.report.enddate);
				formData.report.endtime = new Date(formData.report.endtime);
				formData.report.prepdate = new Date(formData.report.prepdate);
				formData.report.preptime = new Date(formData.report.preptime);

				if (formData.report.pscReviewdate) formData.report.pscReviewdate = new Date(formData.report.pscReviewdate);
				if (formData.report.pscReviewtime)formData.report.pscReviewtime = new Date(formData.report.pscReviewtime);
				if (formData.report.opscReviewdate) formData.report.opscReviewdate = new Date(formData.report.opscReviewdate);
				if (formData.report.opscReviewtime)formData.report.opscReviewtime = new Date(formData.report.opscReviewtime);
			
					
				
				
				if (displayOnly){
					if (this.hasFinalForm){

						this.disableButton('update205');
						this.disableButton('final205');
					}
					else {
						this.enableButton('update205');
						this.enableButton('final205');
					}
					//Add the dynamic fields in based on the report data
					if (formData.report.channelsCount >10) i205Form.controller.addFieldContainer('205','channels', 11, (formData.report.channelsCount - 10));
					if (formData.report.commlistCount > 5) i205Form.controller.addFieldContainer('205','commlist', 6, (formData.report.commlistCount - 5));
					i205Form.controller.setFormReadOnly();
					
					
				}
				else {
					if(status == 'UPDATE' || status == 'FINAL' )
					//this is an updated or finalized form, change report name to the current status
					 formData.report.reportType =status;
					
					
					//increase the sequence number and set seqtime
					++formData.report.seqnum; 
					if(status == 'FINAL' )this.hasFinalForm = true;
					this.disableButton('view205');
					this.disableButton('final205');
					this.disableButton('print205');
					
					
					//Add the dynamic fields in based on the report data. Include one extra blank one
					if (formData.report.channelsCount >9) i205Form.controller.addFieldContainer('205','channels', 11, (formData.report.channelsCount - 9));
					if (formData.report.commlistCount >4)i205Form.controller.addFieldContainer('205','commlist', 6, (formData.report.commlistCount -4));
					
					
				}
				if (i205Form.viewModel) i205Form.viewModel.set(formData.report);
				
			}
			
			
		},
		
		onLoadReports: function(e, response) {
			var newReports = [];
			var combo = this.lookupReference('oppList205');
			if(response) {
				if(response.reports && 
					response.reports.length > 0){
					//Add each report
					this.disableButton('create205');
					this.enableButton('print205');
					this.enableButton('view205');
					
					
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
						this.disableButton('update205');
						this.disableButton('final205');
					}
					else {
						 this.enableButton('update205');
						 this.enableButton('final205');
					}
					
					
				}
				else {
					 this.enableButton('create205');
					 this.disableButton('view205');
					this.disableButton('update205');
					this.disableButton('final205');
					this.disableButton('print205');
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
				datecreated: report.datecreated
				
			};
		},
		
		onReportAdded: function() {	
			this.disableButton('create205');
			 this.enableButton('view205');
			this.enableButton('update205');
			this.enableButton('final205');
			this.enableButton('print205');
			
			this.mediator.sendRequestMessage(Core.Config.getProperty(UserProfile.REST_ENDPOINT) +
					"/reports/" + this.incidentId + '/205', "LoadReports205");
			
		},
		
	
		
		onPrint: function(){
			 //Need to actually get the form from the dropdown
			this.displayCurrentRecord(true, 'select');	
			 var printMsg = null;
			var i205ReportForm = this.view.lookupReference('i205ReportForm');
			var data = i205ReportForm.viewModel.data;
			i205ReportForm.controller.buildReport(data, false, 'print');
	}
	
	});
});
