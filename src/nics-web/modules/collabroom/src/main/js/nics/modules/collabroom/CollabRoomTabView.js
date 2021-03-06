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
define(['iweb/CoreModule', './CollabRoomTabController', 'iweb/CoreModule'], function(Core) {

	return Ext.define('modules.collabroom.CollabRoomTabView', {
	 
		extend: 'Ext.TabPanel',
	 	
	 	controller: 'collabroomtabcontroller',
		
		initComponent: function(){
	 		this.callParent();
	 		this.setWidth(Ext.getCmp("cButtonBar").getWidth() * .9);//TODO: Add accessor to the Core View
	 	},
	 	
	 	config: {
			border: false,
			flex: 1
	 	},
		
		listeners: {
			tabchange: 'onTabChange'
		},
	 	
	 	addTab: function(collabRoom){
	 		if(collabRoom && collabRoom.name){
		 		var collabRoomName = collabRoom.name.substring(
						collabRoom.name.indexOf('-') + 1, collabRoom.name.length);
		 		
				return this.add({
					title: Ext.String.htmlEncode(collabRoomName),
					closable: (collabRoom.featureType == 'collabroom'),
					collabRoom: collabRoom,
					height: 0,
					listeners: {
						close: "onTabClose"
					},
					class: 'alert'
				});
	 		}
		},
		
		removeTab: function(tab){
			this.remove(tab);
		},
		
		hasTab: function(name){
			for(var i=0; i<this.items.length; i++){
				if(this.items.get(i).title === name){
					return true;
				}
			}
			return false;
		},
		
		getTab: function(collabRoomId){
			for(var i=0; i<this.items.length; i++){
				if(this.items.get(i).collabRoom.collabRoomId == collabRoomId){
					return this.items.get(i);
				}
			}
			return null;
		}
	 });
});
