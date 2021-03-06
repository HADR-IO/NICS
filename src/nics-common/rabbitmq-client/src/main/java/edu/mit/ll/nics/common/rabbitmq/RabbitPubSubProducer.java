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
package edu.mit.ll.nics.common.rabbitmq;

import java.io.IOException;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class RabbitPubSubProducer extends RabbitClient {
    private Logger log = LoggerFactory.getLogger(RabbitPubSubProducer.class);
    private String exchangeName;

    public RabbitPubSubProducer(String hostname, String exchangeName)
            throws IOException, TimeoutException {
        super(hostname);
        initialize(hostname, exchangeName);
    }

    public RabbitPubSubProducer(String hostname, String exchangeName,
                                String rabbitUsername, String rabbitUserpwd)
            throws IOException, TimeoutException {
        super(hostname, rabbitUsername, rabbitUserpwd);
        initialize(hostname, exchangeName);
    }

    private void initialize(String hostname, String exchangeName)
            throws IOException {
        declareExchange(exchangeName);
        this.exchangeName = exchangeName;
    }

    public void produce(String routingKey, String message) throws IOException {
        if(message == null) {
            throw new IllegalArgumentException("message is null");
        }
        if(routingKey == null) {
            throw new NullPointerException("routingKey is null");
        }
        getChannel().basicPublish(exchangeName, routingKey, null, message.getBytes());
        log.info(" [x] Sent '" + routingKey + "':'" + message + "'");
    }

    public void destroy() {
        super.destroy();
    }
}
