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
define(["ext", "iweb/CoreModule"], function(Ext,Core) {
	return Ext.define(null, {
		extend: 'Ext.Window',
		
		title: Core.Translate.i18nJSON("Share Workspace Application"),
		message: "",
		cls:'share-workspace-window',
		height: 130,
		width: 250,
		
		layout: {type: 'vbox', align: 'stretch'},
		closeAction: 'destroy',
		resizable: false,
		constrain: true,

		items: [{
			xtype: 'box',
			reference: "box",
			flex:1,
			html: Core.Translate.i18nJSON('Share your workspace contents with your collaboration room participants.'),
			
			margin: '10'
		},{
			xtype: 'fieldcontainer',
			fieldLabel: Core.Translate.i18nJSON('Share Workspace'),
			margin: '15',
			
			items: [{
				xtype: 'segmentedbutton',
				reference: "segmentedButton",
				disabled: true,
				
				items: [{
					text: Core.Translate.i18nJSON("Off"),
					tooltip: Core.Translate.i18nJSON("Disable workspace sharing"),
					reference: "inactiveButton", 
					pressed: true
				},{
					text: Core.Translate.i18nJSON("On"),
					reference: "activeButton", 
					tooltip: Core.Translate.i18nJSON("Enable workspace sharing"),
					toggleHandler: "onActiveToggle"
				}]
			}]
		}],
		
		
		listeners: {
			close: "onWindowClose"
		}
		
	});
});
