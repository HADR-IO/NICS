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


/**
 * CollabroomFeature
 */
public class CollabroomFeature {

    private int collabroomid;
    private CollabRoom collabroom;
    private long featureId;
    private Feature feature;
    private int collabroomfeatureid;

    public CollabroomFeature() {
    }

    public CollabroomFeature(int collabroomid, long featureId) {
        this.collabroomid = collabroomid;
        this.featureId = featureId;
    }

    public int getCollabroomfeatureid() {
        return this.collabroomfeatureid;
    }

    public void setCollabroomfeatureid(int collabroomfeatureid) {
        this.collabroomfeatureid = collabroomfeatureid;
    }

    public int getCollabroomid() {
        return this.collabroomid;
    }

    public void setCollabroomid(int collabroomid) {
        this.collabroomid = collabroomid;
    }

    public CollabRoom getCollabroom() {
        return this.collabroom;
    }

    public void setCollabroom(CollabRoom collabroom) {
        this.collabroom = collabroom;
    }

    public Feature getFeature() {
        return this.feature;
    }

    public void setFeature(Feature feature) {
        this.feature = feature;
    }

    public long getFeatureId() {
        return this.featureId;
    }

    public void setFeatureId(long featureId) {
        this.featureId = featureId;
    }
}