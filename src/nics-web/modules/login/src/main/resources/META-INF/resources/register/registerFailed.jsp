<%--

    Copyright (c) 2008-2021, Massachusetts Institute of Technology (MIT)
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

    2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

    3. Neither the name of the copyright holder nor the names of its contributors
    may be used to endorse or promote products derived from this software without
    specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
    FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
    DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
    SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
    CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
    OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

--%>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!doctype html>
<html>
<c:set var="bundle" value="${requestScope.activeBundle}" />
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>${requestScope.activeBundle.getString('registerError')}</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="stylesheet" href="register/styles/register.css">
    </head>
    <body>
    
        <div class="wrapper">       
            
            <div class="content">
                <div class="content-wrapper">
                    <!-- <img src="register/images/nics-logo.jpg" height="290px" width="423px"></img> -->
                    <br>
                    <h2>${requestScope.activeBundle.getString('errorMessageKey')}</h2>
                    <center>
                    <div style="width:60%">
                    	<p><%= request.getAttribute("REASON") %></p>
                    	
	                    <c:url var="register_url" value="/register"/>
	                    <p class="message">
	                    	${requestScope.activeBundle.getString('errorDescriptionKey')}
	                    </p>
                    </div>
                    </center>
                    
            	</div>
            </div>
            
           
            <div class="footer">

              <span class="footer-right nav">
                     <span>
                        <a href="about.html">${requestScope.activeBundle.getString('about')}</a>
                    </span>
                    <span>
                        <a href="terms.html">${requestScope.activeBundle.getString('terms')}</a>
                    </span>
                    <span>
                        <a href="settings.html">${requestScope.activeBundle.getString('settings')}</a>
                    </span>
                    <span>
                        <a href="<c:out value="${requestScope.helpsite}" />" target="_blank">${requestScope.activeBundle.getString('help')}</a>
                    </span>
                </span>
            </div>
        
        </div>
    </body>
</html>
