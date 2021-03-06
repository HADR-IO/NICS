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
define(['iweb/CoreModule', './report/ReportViewer', 'nics/modules/GeneralReportModule', 'nics/modules/ChatReportModule',
		'nics/modules/DamageReportModule', 'nics/modules/RocReportModule', 'nics/modules/FmagReportModule', 'nics/modules/I215ReportModule', 'iweb/modules/MapModule',
		'./report/common/ReportFeatureRenderer' ,'nics/modules/OppReportModule', 'nics/modules/GarReportModule', 'nics/modules/ExplosivesReportModule',
		'nics/modules/CbrneReportModule','nics/modules/MkFloodReportModule', 'nics/modules/MkMediaReportModule', 'nics/modules/LandslideReportModule',
		'nics/modules/EODReportModule'],

function(Core, ReportViewer, GeneralReportModule, ChatReportModule, DamageReportModule,
		RocReportModule, FmagReportModule, I215ReportModule,  MapModule, ReportFeatureRenderer,OppReportModule,
		GarReportModule, ExplosivesReportModule, CbrneReportModule, MkFloodReportModule, MkMediaReportModule,
		LandslideReportModule, EODReportModule) {

	var ReportModule = function() {};

	ReportModule.prototype.load = function() {
		var reportViewer = Ext.create('modules.report.ReportViewer');
		
		reportViewer.setDisabled(true); // Enables when user joins an incident
		Core.View.addToSidePanel(reportViewer);
		
		this.loadReports();

		var clickListener = MapModule.getClickListener();
		clickListener.addRenderer(new ReportFeatureRenderer());

//		var hoverListener = MapModule.getHoverListener();
//		hoverListener.addRenderer(new ReportFeatureRenderer());
	};
	
	ReportModule.prototype.loadReports = function(){
		GeneralReportModule.load();
		ExplosivesReportModule.load();
		DamageReportModule.load();
		RocReportModule.load();
		I215ReportModule.load();
		FmagReportModule.load();
		OppReportModule.load();
		GarReportModule.load();
		ChatReportModule.load();
		CbrneReportModule.load();
		MkFloodReportModule.load();
		MkMediaReportModule.load();
		LandslideReportModule.load();
		EODReportModule.load();
	};

	return new ReportModule();
});
