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
define(['iweb/CoreModule','./ActiveUsersController'], function(Core, ActiveUsersController) {

	return Ext.define('modules.activeusers.ActiveUsersView', {
	 	extend: 'Ext.grid.Panel',

	 	controller: 'activeuserscontroller',
	 	
	 	title:  Core.Translate.i18nJSON('Active Users'),
	 	
        viewConfig: {
            emptyText:  Core.Translate.i18nJSON('There are no active users')
        },
        
        listeners: {
        	selectionchange: 'onSelectionChange'
        },
        
        store: {
        	model: 'modules.activeusers.ActiveUsersModel',
        	sorters: 'fullname'
        },
                
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            layout: {
            	pack: 'start'
            },
            items: [{
            	xtype: 'button',
            	text:  Core.Translate.i18nJSON('Invite to Chat'),
                tooltip:  Core.Translate.i18nJSON('Start a private chat with the selected user(s)'),
                icon: 'images/activeusers/private-chat.png',
                reference: 'chatButton',
                handler: 'onChatButtonClick',
                disabled: true
            }]
        }],
        
	 	
        columns: [{
            text:  Core.Translate.i18nJSON('User'),
            dataIndex: 'fullname',
            flex: 1
        }, {
            text:  Core.Translate.i18nJSON('Logged In'),
            xtype: 'datecolumn',
            format: 'Y-m-d H:i:s',
            dataIndex: 'loggedin',
            width: 120
        }, {
            text:  Core.Translate.i18nJSON('Last Seen'),
            xtype: 'datecolumn',
            format: 'Y-m-d H:i:s',
            dataIndex: 'lastseen',
            width: 120
        }],
        
	 	selModel: {
	          selType: 'checkboxmodel',
	          showHeaderCheckbox: false
	    },
        
        viewConfig: {
            plugins: {
                ptype: 'gridviewdragdrop',
                ddGroup: 'privateChatDDGroup',
                enableDrop: false,
                dragText: Core.Translate.i18nJSON('Dragging') + ' {0} ' + Core.Translate.i18nJSON('item(s)') + '{1}. <br>' + Core.Translate.i18nJSON('Drop on a private chat window to invite participants.')
           }
        }

	 });
});
