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
package edu.mit.ll.nics.servlet;

import edu.mit.ll.nics.common.ws.client.BasicRequest;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebServlet("/proxy")
public class WFSProxyServlet extends HttpServlet implements Servlet {

    private static final Logger LOGGER = LoggerFactory.getLogger(WFSProxyServlet.class);

    public WFSProxyServlet() {
    }

    @Override
    public void init() throws ServletException {
    }

    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException, IOException {
        String url = this.updateParameters(request.getParameter("url"), request);
        Map<String, String> headerOptions = new HashMap<>();

        //headerOptions.put("User-Agent", "");

        BasicRequest basicRequest = new BasicRequest();
        String result = (String) basicRequest.getRequest(url, headerOptions);

        if(url.indexOf(".kml") > -1) {
            if(result != null && result.indexOf("<kml") == -1) {
                result = this.appendKMLHeader(result);
            }
            //OL3 does not currently support BalloonStyle
        }

        try {
            ServletOutputStream out = response.getOutputStream();
            response.setContentType("text/plain");

            if(result != null && result != "") {
                out.write(result.getBytes());
            } else {
                out.write("".getBytes());
            }
            out.close();
        } catch(IOException e) {
            e.printStackTrace();
            LOGGER.error("Error writing out response", e);
        } catch(Exception e) {
            e.printStackTrace();
            ;
            LOGGER.error("Unhandled exception writing out response {}", e.getLocalizedMessage(), e);
        }
    }

    private String updateParameters(String url, HttpServletRequest request) {
        StringBuffer urlString = new StringBuffer(url);
        try {
            Map<String, String[]> paramMap = request.getParameterMap();
            for(String param : paramMap.keySet()) {
                if(!param.equalsIgnoreCase("url") &&
                        !param.equalsIgnoreCase("callback") &&
                        !param.equalsIgnoreCase("_")) {
                    urlString.append("&");
                    urlString.append(param);
                    urlString.append("=");
                    urlString.append(URLEncoder.encode(paramMap.get(param)[0], "UTF-8"));
                }
            }
        } catch(Exception e) {
            e.printStackTrace();
        }

        return urlString.toString();
    }

    private String appendKMLHeader(String result) {
        StringBuffer header = new StringBuffer();
        header.append("<kml xmlns=\"http://www.opengis.net/kml/2.2\" ");
        header.append("xmlns:gx=\"http://www.google.com/kml/ext/2.2\" ");
        header.append("xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" ");
        header.append(
                "xsi:schemaLocation=\"http://www.opengis.net/kml/2.2 http://schemas.opengis.net/kml/2.2.0/ogckml22" +
                        ".xsd http://www.google.com/kml/ext/2.2 http://code.google.com/apis/kml/schema/kml22gx.xsd\">");
        header.append(result);
        header.append("</kml>");
        return header.toString();
    }
}
