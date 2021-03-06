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
	
	//Custom vtypes for data input fields
	
	
	// custom Vtype for alphanum only fields, plus dash, dot, hyphen and underscore, comma, @, space, and apostrophe

    Ext.apply(Ext.form.field.VTypes, {
        simplealphanum:  function(v) {
            return /[^\<\>"%;\(\)\{\}\&\+\?#\^\[\]\\\$/\|=]*$/i.test(v);
        },
        simplealphanumText: 'This field should only contain letters, numbers, spaces, commas, apostrophes - . @ and _',
        simplealphanumMask: /[^\<\>";:!\(\)\{\}\&\+\?%#\^\[\]\\\$/\|=]/i
    });
    Ext.apply(Ext.form.field.VTypes, {
        numbers:  function(v) {
            return /^[0-9\., -]*$/i.test(v);
        },
        numbersText: 'This field should only contain numbers, spaces, apostrophes - . and _',
        numbersMask: /[0-9\., -]/i
    });
    Ext.apply(Ext.form.field.VTypes, {
        latlon:  function(v) {
            return /^[0-9\.-]*$/i.test(v);
        },
        latlonText: 'This field should only contain decimal latitude and longitude numbers' ,
        latlonMask: /[0-9\.-]/i
    });

    // custom Vtype for alphanum only fields, plus apostrophes, and - .  + , ? _ %
    Ext.apply(Ext.form.field.VTypes, {
        extendedalphanum:  function(v) {
            return /^[^\<\>";:!\(\)\{\}\&]*$/i.test(v);
        },
        extendedalphanumText: 'This field should only contain letters, numbers, apostrophes, and - .  + , ? _ %',
        extendedalphanumMask: /[^\<\>";:!\(\)\{\}\&]/i
    });
     // custom Vtype for alphanum only fields, plus apostrophes, parentheses, and - .  + , ? _ % ()
        Ext.apply(Ext.form.field.VTypes, {
        	extendedalphanumplus:  function(v) {
                return /^[^\<\>";:!\{\}\&]*$/i.test(v);
            },
            extendedalphanumplusText: 'This field should only contain letters, numbers, apostrophes, parentheses, and - .  + , ? _ %',
            extendedalphanumplusMask: /[^\<\>";:!\{\}\&]/i
        });
    // custom Vtype for num only fields, plus dash, underscore, plus, %, F C S (for weather fields, so you can specify temp scale)
    Ext.apply(Ext.form.field.VTypes, {

        extendednum:  function(v) {
            return /^[0-9\.fcdegFCsS, +%-]*$/i.test(v);
        },
        extendednumText: 'This field should only contain numbers, and . , - %',
        extendednumMask: /[0-9\.fcdegFCsS, +%-]/i
        });
    //custom Vtype for a field with a list of emails - this hasn't been internationalized yet
    Ext.apply(Ext.form.field.VTypes, {
        emaillist:  function(v) {
            return /^((([a-zA-Z0-9_\-\.']+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z\s?]{2,5}){1,25})*(\s*?,\s*?)*)*$/.test(v);
        },
        emaillistText: 'This field must contain single or multiple valid email addresses separated by a comma',
        emaillistMask: /[a-zA-Z0-9_\.@\s,'\-]/
    });
		
	 	
		
});