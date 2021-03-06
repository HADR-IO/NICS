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
package edu.mit.ll.iweb.message;

public class ResponseMessage {

    private String data; //need to support other types of responses
    private String eventName;
    private String errorMessage;
    private String successMessage;
    private String responseType;
    private String requestId;

    public ResponseMessage(String requestId) {
        this.requestId = requestId;
        if(requestId == null || requestId.isEmpty()) {
            throw new IllegalStateException("You must set the requestId to the incoming RequestMessage's trackingId");
        }
    }

    ;

    public ResponseMessage(String eventName, String data, String requestId) {
        this.setEventName(eventName);
        this.setData(data);
        this.requestId = requestId;
        if(requestId == null || requestId.isEmpty()) {
            throw new IllegalStateException("You must set the requestId to the incoming RequestMessage's trackingId");
        }
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getSuccessMessage() {
        return successMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public void setSuccessMessage(String successMessage) {
        this.successMessage = successMessage;
    }

    public void setResponseType(String responseType) {
        this.responseType = responseType;
    }

    public String getResponseType() {
        if(this.responseType == null) {
            return "json";
        }
        return this.responseType;
    }

    public String getRequestId() {
        return this.requestId;
    }
}
