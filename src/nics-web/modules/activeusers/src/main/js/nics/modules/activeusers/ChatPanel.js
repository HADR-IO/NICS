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
define(['ext','iweb/CoreModule', './ChatPanelController'], function(Ext, Core, ChatPanelController) {

	return Ext.define('modules.activeusers.ChatPanel', {
	 
	 	extend: 'Ext.panel.Panel',

	 	controller: 'chatpanelcontroller',
	 	
	 	listeners: {
	 		'afterrender' : 'onRender',
	 		'beforeclose' : 'onChatPanelClose'
	 	},
	 	
	 	config: {
	 		layout: 'border',
	 		closable: true
	 	},
	 	
	 	dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            layout: {
            	pack: 'end'
            },
            reference: 'toolbar',
            items: [{
 				xtype: 'button',
 				text: Core.Translate.i18nJSON('Notifications'),
 	 			icon: 'images/activeusers/private-chat.png',
 				reference: 'notifyButton',
 	 			toggleHandler: 'onNotificationToggle',
 				enableToggle: true,
 				hidden: true
 			}]
        }],
	 	
	    items: [{
	        xtype: 'box',
	        region: 'center',
	        reference: 'chatLog',
	        
	        style: {
	            overflow: 'auto',
	            backgroundColor: 'white'
	        }
	    },{
	        region: 'south',
	        xtype: 'form',
	        layout: {
	            type: 'hbox',
	            align: 'stretch'
	        },
	        
	        items: [{
	            xtype     : 'textareafield',
	            emptyText : Core.Translate.i18nJSON('Send a message'),
	            height: 25,
	            flex: 1,
	            grow: false,
		        reference: 'chatBox',
		        
		        stripCharsRe: /[\<\>";:!\(\)\{\}\&]/,
		        fieldStyle: {
		            minHeight: 'initial'
		        },

		        enterIsSpecial: true,
		        listeners: {
		        	'specialkey': 'onChatBoxSpecialKey'
		        }
	        },
	        {
	            xtype     : 'button',
	            text      : Core.Translate.i18nJSON('Send'),
		        reference: 'sendBtn',
		        handler: 'onSendButtonClick'
	        }]
	    }]
	 });
});
