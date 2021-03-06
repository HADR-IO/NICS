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
define(['iweb/CoreModule','./I203ReportController'], 

		function(Core, I203ReportController) {

	
	return Ext.define('modules.report-opp.I203ReportView', {
		extend: 'Ext.panel.Panel',
		header: false,

		comboRef:'oppList203',
		createRef:'create203',
		viewRef:'view203',
		updateRef:'update203',
		finalRef:'final203',
		printRef:'print203',
		oppReportRef: 'oppReport203',
		controller: 'i203reportcontroller',
	    header: false,
	    autoScroll: true,
        referenceHolder: true,
	 	bodypadding: 30,
	 	referenceHolder: true,
	 	listeners: {
        	selectionchange: 'onSelectionChange',
        	afterrender: 'onReportRendered',
        	
	 	 },

	    dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            reference:'203Dock',
            layout: {
            	pack: 'end'
            },
              items: [
                    {
            	xtype: 'combobox',
            	 reference:'oppList203',
            	 displayField: 'name',
            	 valueField:'formId',
            	 forceButtonSelection:true,
            	 editable:false,
            	 queryMode: 'local',
            	 allowBLank:false,
            	 emptyText:'Select a report...',
            	 trackRemoved:false,
            	 store: {fields:['formId', 'name'], sorters:[{property:'formId', direction:'DESC'}]},
                listeners: {
					select: 'onReportSelect',
					
	            },
	           
                
            },{
                xtype: 'tbfill'
            }, {
            	xtype: 'button',
            	text: 'Import ICS 201',
            	tooltip: 'Import ICS 201 Report',
            	id:'create203',
            	disabled:false,
            	reference: 'create203',
                listeners: {
					click: 'onImport'
	            }
                
            },
            {
            	xtype: 'button',
            	text: 'View',
            	tooltip: 'View Report',
            	id:'view203',
            	reference: 'view203',
            	disabled:true,
            	listeners: {
					click: 'onView'
	            }
                
            },
			{
				xtype: 'button',
				text: 'Update',
				tooltip: 'Update',
				id:'update203',
				reference: 'update203',
				disabled: true,
				listeners: {
					click: 'onUpdate'
	            }
				
			},
           /* {
	           	xtype: 'button',
	           	text: 'Final', 
	           	id:'finalize203',
	           	text: 'Final', 
	           	enableToggle: true,
	            tooltip: 'Finalize Report',
	            reference: 'final203',
	            enableToggle:false,
	            disabled: true,
	            listeners: {
					click: 'onFinalize'
	            }
	        },*/
			{
				xtype: 'button',
				text: 'Print',
				id:'print203',
		        tooltip: 'Print',
				reference: 'print203',
				disabled: true,
				listeners: {
					click: 'onPrint'
	            }
				
			}
            ]

 	}],
        
	 	items:[
	 	       {
	 	    	   	xtype: 'container',
	 	    	    reference: 'oppReport203'
	 	    	   
	 	    	    
	 	       },
	 	      {
	 	    	   	xtype: 'container',
	 	    	    reference: 'oppInstructions203',

	 	       }
	 	       ]
        
	 	
 	
	 	
	});
});
