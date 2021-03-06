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
define(["iweb/CoreModule"], function(Core) {
	return Ext.define(null, {
	       extend: 'Ext.Window',
			
			cls:'label-window',
			layout: {type: 'vbox', align: 'right'},
			plain: true,
			title: Core.Translate.i18nJSON('Label'),
			closeAction: 'hide',
			renderTo: Ext.getBody(),
			resizable: false,
			
			bodyPadding: '5px',
			
			items: [{
				    xtype: 'label',
				    text: Core.Translate.i18nJSON('Enter label text:'),
				    width: 250,
				    style: {
			       		marginTop: '5px',
			       		marginLeft: '1px'
			    	}
				},{
					itemId: 'textField',
					xtype: 'textfield',
				    width: 250,
				    style: {
				    	marginTop: '5px'
				    },
				    enableKeyEvents: true
				},{
					itemId: 'textSize',
					xtype: 'segmentedbutton',

					defaults: {
						xtype: 'button',
						scale: 'medium',
						icon: 'images/drawmenu/nics-sprites.png'
					},
					
					items: [{
	                    iconCls: "sprite-sm-a",
	                    value: 14
					},{
	                    iconCls: "sprite-med-a",
	                    value: 22
					},{
	                    iconCls: "sprite-big-a",
	                    value: 30,
	                    pressed: true
					}]
				}
			],
			buttonAlign: 'center',
			buttons: [
				{  
					text: Core.Translate.i18nJSON("OK"),
					handler: function(b,e){
						
						var window = this.up("window");
						var label = window.getComponent('textField').getValue();
						var labelSize = window.getComponent('textSize').getValue();
						
						window.fireEvent('label-set', window, label, labelSize);
						window.hide();
					}
				},
				{
					text: Core.Translate.i18nJSON("Cancel"),
					handler: function(b,e){
						var window = this.up("window");
						window.hide();
					}
				}
			]
	       
	    });
});
