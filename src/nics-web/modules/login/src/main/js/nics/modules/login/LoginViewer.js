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
define(["iweb/CoreModule", "./LoginController"],

	function(Core){
		Ext.define('modules.login.LoginViewer', {
		
			extend: 'Ext.Window',
			
			requires: [ 'Ext.Panel', 'Ext.Button', 'Ext.form.ComboBox' ],
			
			controller: 'logincontroller',
		
			initComponent: function(){
				this.callParent();
			},
			
			NoOrgsError: "No organizations configured, <br> please contact your system administrator",
			
			config: {
				cls: 'orgs-window',
				title: 'NICS Login',
				closable: false,
				layout: {
					type: 'vbox',
					pack: 'center',
					align: 'middle'
				},
				buttonAlign: 'center',
				constrain: true,
				
				width: 400,
				height: 125,
				
				items: [{
					xtype: 'label',
					text:  Core.Translate.i18nJSON('Select Organization'),
					width: '75%',
					margin: '5 0',
					reference: 'userOrgLabel',
					hidden: true
				},{
					xtype: 'label',
					text:  Core.Translate.i18nJSON('Select a Workspace'),
					width: '75%',
					margin: '5 0',
					reference: 'workspaceLabel'
				},{
					xtype: 'combobox',
					width: '75%',
					fieldStyle: {
						'textAlign':'center'
					},
					listConfig: {
						style: {
							'textAlign':'center'
						}
					},
					store: {
						fields: ['userorgid', 'name', 'orgid', 'systemroleid', 'defaultorg'],
						sorters: ['name']
					},
					forceSelection: true,
					queryMode: 'local',
					displayField: 'name',
					valueField: 'userorgid',
					reference: 'orgDropdown',
					hidden: true
				},{
					xtype: 'combobox',
					width: '75%',
					fieldStyle: {
						'textAlign':'center'
					},
					listConfig: {
						style: {
							'textAlign':'center'
						}
					},
					store: {
						fields: ['workspaceid', 'workspacename'],
						sorters: ['name']
					},
					forceSelection: true,
					queryMode: 'local',
					displayField: 'workspacename',
					valueField: 'workspaceid',
					reference: 'workspaceDropdown'
				}],
				
				buttons: [{
					text: Core.Translate.i18nJSON('OK'),
					listeners: {
						click: 'onOkButtonClick'
					}
				}]
			}
		});
	}
);
