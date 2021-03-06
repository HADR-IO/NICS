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
package edu.mit.ll.nics.common.entity;

public class ReportLatest {
	
	private String username;
	
	private Integer formId;
	
	private Integer formTypeId;
	
	private Integer incidentId;
	
	private Integer userSessionId;
	
	private Long seqTime;
	
	private Long seqNum;
	
	private String message;
	
	private String incidentName;






	public Integer getFormId() {
		return formId;
	}

	public Integer getFormTypeId() {
		return formTypeId;
	}

	public Integer getIncidentId() {
		return incidentId;
	}

	public Integer getUserSessionId() {
		return userSessionId;
	}

	public Long getSeqTime() {
		return seqTime;
	}

	public Long getSeqNum() {
		return seqNum;
	}

	public String getMessage() {
		return message;
	}

	public String getIncidentName() {
		return incidentName;
	}

	public void setFormId(Integer formId) {
		this.formId = formId;
	}

	public void setFormTypeId(Integer formTypeId) {
		this.formTypeId = formTypeId;
	}

	public void setIncidentId(Integer incidentId) {
		this.incidentId = incidentId;
	}

	public void setUserSessionId(Integer userSessionId) {
		this.userSessionId = userSessionId;
	}

	public void setSeqTime(Long seqTime) {
		this.seqTime = seqTime;
	}

	public void setSeqNum(Long seqNum) {
		this.seqNum = seqNum;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public void setIncidentName(String incidentName) {
		this.incidentName = incidentName;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
}

