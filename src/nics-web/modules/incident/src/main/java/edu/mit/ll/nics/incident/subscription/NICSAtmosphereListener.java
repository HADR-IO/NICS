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
package edu.mit.ll.nics.incident.subscription;


import edu.mit.ll.iweb.websocket.Mediator;
import org.atmosphere.config.service.AtmosphereFrameworkListenerService;
import org.atmosphere.cpr.AtmosphereFramework;
import org.atmosphere.cpr.AtmosphereFrameworkListener;

@AtmosphereFrameworkListenerService
public class NICSAtmosphereListener implements AtmosphereFrameworkListener {

    /**
     * Invoked after {@link AtmosphereFramework#init()} gets invoked
     *
     * @param f an {@link org.atmosphere.cpr.AtmosphereFramework}
     */
    public void onPostInit(AtmosphereFramework f) {
        //Add Listeners for each module here
        Mediator m = (Mediator) f.getAtmosphereHandlers().get(Mediator.HANDLER_PATH).atmosphereHandler;
        m.addSubscriptionValidator(new IncidentSubscriptionListener());
    }

    /**
     * Invoked before {@link AtmosphereFramework#init()} gets invoked
     *
     * @param f an {@link org.atmosphere.cpr.AtmosphereFramework}
     */
    public void onPreInit(AtmosphereFramework f) {
    }

    /**
     * Invoked before {@link AtmosphereFramework#destroy()} gets invoked
     *
     * @param f an {@link org.atmosphere.cpr.AtmosphereFramework}
     */
    public void onPreDestroy(AtmosphereFramework f) {
    }

    /**
     * Invoked after {@link AtmosphereFramework#destroy()} gets invoked
     *
     * @param f an {@link org.atmosphere.cpr.AtmosphereFramework}
     */
    public void onPostDestroy(AtmosphereFramework f) {
    }
}