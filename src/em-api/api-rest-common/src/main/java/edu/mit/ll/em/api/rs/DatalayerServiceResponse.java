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
package edu.mit.ll.em.api.rs;

import java.util.ArrayList;
import java.util.Collection;

import edu.mit.ll.nics.common.entity.datalayer.Datalayer;
import edu.mit.ll.nics.common.entity.datalayer.DatalayerOrg;
import edu.mit.ll.nics.common.entity.datalayer.Datalayerfolder;
import edu.mit.ll.nics.common.entity.datalayer.Datasource;

public class DatalayerServiceResponse {

    private String message;

    private Collection<Datalayerfolder> datalayerfolders = new ArrayList<Datalayerfolder>();
    private Collection<Datalayer> datalayers = new ArrayList<Datalayer>();
    private Collection<Datasource> datasources = new ArrayList<Datasource>();
    private Collection<DatalayerOrg> datalayerOrgs = new ArrayList<>();

    private int count;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Collection<Datalayerfolder> getDatalayerfolders() {
        return datalayerfolders;
    }

    public void setDatalayerfolders(Collection<Datalayerfolder> datalayerfolders) {
        this.datalayerfolders = datalayerfolders;
    }

    public Collection<Datalayer> getDatalayers() {
        return datalayers;
    }

    public void setDatalayers(Collection<Datalayer> datalayers) {
        this.datalayers = datalayers;
    }

    public Collection<Datasource> getDatasources() {
        return datasources;
    }

    public void setDatasources(Collection<Datasource> datasources) {
        this.datasources = datasources;
    }

    public Collection<DatalayerOrg> getDatalayerOrgs() {
        return datalayerOrgs;
    }

    public void setDatalayerOrgs(Collection<DatalayerOrg> datalayerOrgs) {
        this.datalayerOrgs = datalayerOrgs;
    }

    public String toString() {
        return "DatalayerServiceResponse [datalayers=" + datalayerfolders + ", "
                + "message=" + message + "]";
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}

