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
package edu.mit.ll.nics.android.database.entities;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import static edu.mit.ll.nics.android.utils.constants.Database.COLLABROOM_TABLE;

@Entity(tableName = COLLABROOM_TABLE)
public class Collabroom {

    @PrimaryKey(autoGenerate = true)
    private long id;

    @SerializedName("incidentid")
    private long incidentId;

    @SerializedName("collabRoomId")
    private long collabRoomId;

    @SerializedName("usersessionid")
    private long userSessionId;

    @SerializedName("name")
    private String name;

    @SerializedName("created")
    private String created;

    @SerializedName("adminUsers")
    private long[] adminUsers;

    @SerializedName("readWriteUsers")
    private long[] readWriteUsers;

    @SerializedName("readOnlyUsers")
    private long[] readOnlyUsers;

    @Override
    public boolean equals(Object o) {
        if (o == this) return true;
        if (!(o instanceof Collabroom)) return false;

        Collabroom collabroom = (Collabroom) o;

        return new EqualsBuilder()
                .append(getCollabRoomId(), collabroom.getCollabRoomId())
                .append(getName(), collabroom.getName())
                .isEquals();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
                .append(getCollabRoomId())
                .append(getName())
                .toHashCode();
    }

    public boolean doIHaveMarkupPermission(long userId) {
        if (readOnlyUsers != null) {
            for (long readOnlyUser : readOnlyUsers) {
                if (userId == readOnlyUser) {
                    return false;
                }
            }
        }

        return true;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(long incidentId) {
        this.incidentId = incidentId;
    }

    public long getCollabRoomId() {
        return collabRoomId;
    }

    public void setCollabRoomId(long collabRoomId) {
        this.collabRoomId = collabRoomId;
    }

    public long getUserSessionId() {
        return userSessionId;
    }

    public void setUserSessionId(long userSessionId) {
        this.userSessionId = userSessionId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public long[] getAdminUsers() {
        return adminUsers;
    }

    public void setAdminUsers(long[] adminUsers) {
        this.adminUsers = adminUsers;
    }

    public long[] getReadWriteUsers() {
        return readWriteUsers;
    }

    public void setReadWriteUsers(long[] readWriteUsers) {
        this.readWriteUsers = readWriteUsers;
    }

    public long[] getReadOnlyUsers() {
        return readOnlyUsers;
    }

    public void setReadOnlyUsers(long[] readOnlyUsers) {
        this.readOnlyUsers = readOnlyUsers;
    }

    public String toJson() {
        return new Gson().toJson(this);
    }
}
