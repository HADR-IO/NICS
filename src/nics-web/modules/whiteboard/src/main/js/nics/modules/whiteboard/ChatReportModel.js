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
define(['ext'], function(Ext) {
	//{"needtypes":"List of needtypes will go here when LORELEI is enabled","endDate":"2018-09-22T04:00:00.000Z","leadName":"TEST Lead Name","eventDescription":"tester 123 test 123 abc xyz","translation":"LORELEI translation goes here when we have THOR capability","location":"Location 123 testeroo","startDate":"2017-09-21T19:41:19.891Z","others":"Other1, Other2, Others for days"}

	return Ext.define('modules.whiteboard.ChatReportModel', {	 
	 	extend: 'Ext.data.Model',
	 	
	 	idProperty: 'chatId',
	 	
		fields : [
			 {
				name : 'Collab Room Id',
				mapping : 'collabRoomId'
			},{
		    	name: 'Id',
		    	mapping: 'chatId'
		    },{
				name : 'Room Name',
				mapping : 'collabRoomName'
			}, {
				name : 'Need Type',
				mapping : 'needtypes',
			},{
				name : 'Message',
				mapping : 'text',
			},{
				name : 'Translated Text',
				mapping : 'translatedText',
			},{
	            name: 'Confidence',
	            mapping: 'Confidence'
	        },{
	        	name:'Place Mentioned',
	        	mapping: 'PlaceMentioned'
	        },{
	        	name: 'Lat',
	        	mapping: 'lat'
	        },{
	        	name: 'Lon',
	        	mapping: 'lon'
	        },{
	        	name: 'geohash',
	        	mapping: 'goehash'
	        }
		]

	 });
});