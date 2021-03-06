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
define(['ext', "iweb/CoreModule", "iweb/modules/MapModule"],
    function(Ext, Core, MapModule){
        Ext.define('modules.datalayer.TrackingLocatorWindowController', {
            extend : 'Ext.app.ViewController',

            alias: 'controller.datalayer.trackinglocatorwindowcontroller',

            lastSelected: null,
            
            featuresMap: {},

            /**
             * {layername, [features]}
             */
            activeTrackingLayers: {},


            init: function(){
                this.callParent();
                this.mediator = Core.Mediator.getInstance();

                // listen for layer enabled and disabled events
                Core.EventManager.addListener("nics.datalayer.tracking.click", this.onLayerShow.bind(this));
                Core.EventManager.addListener("nics.datalayer.tracking.unclick", this.onLayerHide.bind(this));
            },

            /**
             * Add features to PLI store.
             * @param features
             */
            processFeatures: function(features, layerName)
            {
                var f;
                var arr = [];
                for (f in features)
                {
                    if (features[f])
                    {
                        var props = features[f].getProperties();

                        props.id = features[f].getId();
                        
                        arr.push(props);
                    }
                }
                this.featuresMap[layerName] = arr;

                this.getView().pliStore.loadData(arr, true);
            },

            /**
             * Removes features from PLI store
             * @param features
             */
            processFeatureRemoval: function(layerName)
            {
                var f;
                var arr = [];

                if(this.featuresMap[layerName]){
                	var features = this.featuresMap[layerName];
                	for (var i=0; i<features.length; i++)
	                {
	                    var rec = this.getView().pliStore.findRecord('id', features[i].id);
	                    if (rec)
	                    {
	                        arr.push(rec);
	                    }
	                }

                }
                this.featuresMap[layerName] = [];
                this.getView().pliStore.remove(arr);
            },

            /**
             * Call this function after layer has been selected
             *
             * @param data Event data received by onLayerShow
             */
            trySelectingSettingsLayer: function(data, count)
            {
                if (data && data.text && data.layer)
                {
                    //Can not automatically select the layer because the features are not loaded
                    var rec = this.getView().settingsStore.findRecord('name', data.text);
                    if (rec)
                    {
                        var gridPanel = this.getView().getSettingsGridPanel();
                        if (gridPanel)
                        {
                            var selModel = gridPanel.getSelectionModel();
                            if (selModel)
                            {
                                selModel.select(rec, true);
                            }
                        }
                    }
                } else
                {
                    // do we want to kep trying to call until we succeed?
                }

            },

            onLayerShow: function(evt, data)
            {
                if (data && data.text && data.layer && data.layerType)
                {
                    if (data.layerType == 'wfs')
                    {
                    	this.getView().settingsStore.loadData([{name: data.text, layer: data.layer}], true);

                        Ext.Function.defer(this.trySelectingSettingsLayer, 500, this, [data, 0]);
                    }
                }
            },

            onLayerHide: function(evt, data)
            {
            	// remove features from stores
                var index = this.getView().settingsStore.find('name', data.text);
                if (index != -1)
                {
                	// remove records
                	var rec = this.getView().settingsStore.getAt(index);
                    if (rec)
                    {
                        this.processFeatureRemoval(rec.data.name);
                        this.getView().settingsStore.remove(rec);
                    }
                }
            },

            tryProcessingFeatures: function(selectedLayer, count)
            {
                var features = selectedLayer.layer.getSource().getFeatures();
                if (features.length == 0)
                {
                    if (count < 10)
                        Ext.Function.defer(this.tryProcessingFeatures, 1000, this, [selectedLayer, count++]);
                } else
                {
                    this.processFeatures(selectedLayer.layer.getSource().getFeatures(), selectedLayer.name);
                }
            },

            onSettingsSelect: function(grid, selected, eOpts)
            {
                // show features
                if (selected.data.layer)
                {
                    Ext.Function.defer(this.tryProcessingFeatures, 1000, this, [selected.data, 0]);
                }
            },

            onSettingsDeselect: function(grid, selected, eOpts)
            {
                //remove features
                if (selected.data.layer)
                {
                   this.processFeatureRemoval(selected.data.name);
                }

            },

            onPliSelectionChange: function(grid, selected, eOpts)
            {
                //Center map on feature
            	if(selected[0]){
                    this.lastSelected = selected[0];
                    if(selected[0].data.location){
	            		var extent = selected[0].data.location.getExtent();
	            		if(extent.length > 0 && isFinite(extent[0])) {
							MapModule.mapController.zoomToExtent(extent);
						}
                    }
            	}
            },

            onChange: function(filterField, newValue, oldValue, eOpts)
            {
                // filter by name
                var filterFn = function(rec, id)
                {
                    if (newValue == undefined || newValue == null || newValue == '') return true;
                    var name = rec.get('name');
                    if (name && name.indexOf(newValue) > -1)
                    {
                        return true;
                    }

                    return false;
                };

                if (this.getView().pliStore)
                {
                    this.getView().pliStore.clearFilter();
                    this.getView().pliStore.filterBy(filterFn, this);
                }
            },

            onClearListClick: function()
            {
                if (this.getView().pliStore)
                {
                    this.getView().pliStore.clearFilter(false);
                }
            },

            filterByPliFilter: function(property, value, rec, id)
            {
                if (rec && rec.data)
                {
                    if (rec.data[property])
                    {
                        if (rec.data[property] == value)
                        {
                            return true;
                        }
                    } else if (rec.data.name && rec.data.name == value)
                    {
                        return true;
                    }
                }

                return false;
            },

            onFilterClick: function()
            {
                var _this = this;
                var filterFn = function(rec, id){
                    if (this.lastSelected && this.lastSelected.data)
                    {
                        if (rec && rec.name)
                        {
                            if (rec.name == this.lastSelected.data.name)
                            {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                this.getView().pliStore.filterBy(filterFn);
            }
        });
    });


