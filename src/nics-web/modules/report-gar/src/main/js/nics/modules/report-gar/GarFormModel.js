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
define(['ext','iweb/CoreModule'], function(Ext, Core) {
		return Ext.define('modules.report-gar.GarFormModel', {	 
		 extend: 'Ext.app.ViewModel',
	 	
		 alias: 'viewmodel.gar', 
	 	
		 data: {
		    	incidentId: this.incidentId,
		    	incidentName: this.incidentName,
		    	formTypeId: this.formTypeId,
		    	seqtime: this.seqtime
				
		 },
		 formulas: {
		    	 report: function(get){
		    		 var report = {
		    				reportType: get('reportType'),
		    				divgroupstaging: get('divgroupstaging'),
			    			physicalLocation: get('physicalLocation'),
		    				requestDate: get('requestDate'),
		    				lat: get('lat'),
		    				lon: get('lon'),
		    				supervision: get('supervision'),
		    				planning: get('planning'),
		    				teamSelect: get('teamSelect'),
		    				teamFit: get('teamFit'),
		    				environment: get('environment'),
		    				eventEvoComplex: get('eventEvoComplex'),
		    				garResult: get('garResult'),
		    				user: get('user'),
		    				userfull: get('userfull')
		    		};
		    		 
		    		return report;
		    }
		 }
	 });
});