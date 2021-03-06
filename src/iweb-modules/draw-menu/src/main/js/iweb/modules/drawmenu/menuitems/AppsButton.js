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
define(["iweb/CoreModule"], function(Core) { //Add shape options

	return Ext.define(null, {
		extend: 'Ext.SplitButton',
		
		cls: 'apps-btn',
		scale: 'medium',
		arrowAlign: 'right',
		menuAlign: 't-b?',
		icon: "images/drawmenu/apps-icon.png",
		
		
		listeners: {
			toggle: "onToggle"
		},
		
		menu: {
			cls: 'apps-menu',
			minWidth: 0,
			plain: true,

			referenceHolder: true,
			
			layout: {type: 'vbox', align: 'stretch'},
			
			defaults: {
				xtype: 'button',
				scale: 'medium',
				margin: 0
			},
			items: [{
				text: "Census",
				text:  Core.Translate.i18nJSON("Census"),
				tooltip: Core.Translate.i18nJSON("Census Application"),
				handler: "onCensusClick"
			},{
				text: "Weather",
				text:  Core.Translate.i18nJSON("Weather"),
				tooltip:Core.Translate.i18nJSON("Weather Application"),
				handler: "onWeatherClick"
			}]
		}
	
	});
});
