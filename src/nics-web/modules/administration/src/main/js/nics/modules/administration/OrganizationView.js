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
define(['./OrganizationController','./OrganizationModel','./UserView',
			 './OrganizationForm', './ArchiveView',  './IncidentTypeView', './OrganizationCapabilitiesView','iweb/CoreModule'],
		function(OrganizationController, OrganizationModel, UserView, 
			OrganizationForm, ArchiveView, IncidentTypeView, OrganizationCapabilitiesView, Core) {

	return Ext.define('modules.administration.OrganizationView', {
	 	extend: 'Ext.Panel',

	 	controller: 'organizationcontroller',
	 	
	 	closable: false,
        
	 	closeAction: 'hide',
        
        autoScroll: true,
        
        reference: 'orgView',
        
        config: {
	 		autoWidth: true,
	 		autoHeight: true,
	 		layout: {
	            type: 'vbox',
	            align: 'stretch'
	        },
	        title:  Core.Translate.i18nJSON('Organizations')
	 	},
	 	
	 	initComponent: function(){
			this.callParent();
			
			//Grid
			this.add({
	            xtype: 'grid',
	            reference: 'orgGrid',
	            region: 'north',
	            height: this.gridHeight,
	            store: {
		        	model: 'modules.administrator.OrganizationModel',
		        	sorters: 'name'
		        },
		        
		        listeners: {
		        	selectionchange: 'onSelectionChange'
		        },
		        columns: [{
		            text:  Core.Translate.i18nJSON('Name'),
		            dataIndex: 'name',
		            flex: 1
		        }, {
		            text:  Core.Translate.i18nJSON('Prefix'),
		            dataIndex: 'prefix'
		        }]
	        });
			
			//Form
			this.add(new OrganizationForm());
			
			//Users
			this.add(new UserView());
            //Incidents
            this.add(new ArchiveView());

			//Incidents
			this.add(new IncidentTypeView());
			
			//Organization Capabilities
			this.add(new OrganizationCapabilitiesView());
	 	}
    });
});
