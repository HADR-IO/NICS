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
define(["iweb/CoreModule", './TrackingLocatorWindowController', './TrackingLocatorModel',
            './TrackingLocatorSettingsModel'],
        function(Core, TrackingLocatorWindowController, TrackingLocatorModel,
            TrackingLocatorSettingsModel) {
    return Ext.define('modules.datalayer.TrackingLocatorWindow', {

        extend: 'Ext.Window',

        controller: 'datalayer.trackinglocatorwindowcontroller',

        requires: [ 'Ext.Panel', 'Ext.Button', 'Ext.form.field.TextArea',
            'Ext.form.Label', 'Ext.Container', 'Ext.TabPanel'],
            
        initComponent: function()
        {
            this.callParent();
            
            this.draggable = true;
            
            this.tabPanel = this.lookupReference('pliLocatorTabPanel');
            if (this.tabPanel)
            {
                this.createPliTab();
                this.createSettingsTab();
            }
        },

        createPliTab: function()
        {
            this.pliStore = Ext.create('Ext.data.Store', {
                model: 'modules.datalayer.TrackingLocatorModel',
                sorters: 'group'
            });

            this.filterField = Ext.create('Ext.form.field.Text', {
                id: 'pliLocatorFilterField',
                enableKeyEvents: true,
                width: '100%',
                emptyText: Core.Translate.i18nJSON('Enter text here to filter PLI'),
                autoHeight: true,
                listeners: {
                    change: 'onChange'
                },
                reference: 'pliLocatorFilterField'
            });

            var gpanel = Ext.create('Ext.grid.Panel', {
                id: 'pliLocatorGridPanel',
                height: 300,
                width: '100%',
                viewConfig: {
                    emptyText: Core.Translate.i18nJSON('There are no active vehicles')
                },
                listeners: {
                    selectionchange: 'onPliSelectionChange'
                },
                store: this.pliStore,
                columns: [{
                    text: Core.Translate.i18nJSON('Name'),
                    dataIndex: 'name',
                    cellWrap: true,
                    flex: 1
                }, {
                    text: Core.Translate.i18nJSON('Username'),
                    dataIndex: 'username',
                    hidden: true,
                    flex: 1
                }, {
                    text: Core.Translate.i18nJSON('Device'),
                    dataIndex: 'deviceid',
                    hidden: true,
                    flex: 1
                }, {
                    text: Core.Translate.i18nJSON('Description'),
                    dataIndex: 'description',
                    hidden: true,
                    flex: 1
                }, {
                    text: Core.Translate.i18nJSON('Course'),
                    dataIndex: 'course',
                    hidden: true,
                    flex: 1
                }, {
                    text: Core.Translate.i18nJSON('Speed'),
                    dataIndex: 'speed',
                    hidden: true,
                    flex: 1
                }, {
                    text: Core.Translate.i18nJSON('Accuracy'),
                    dataIndex: 'accuracy',
                    hidden: true,
                    flex: 1
                }, {
                    text: Core.Translate.i18nJSON('Timestamp'),
                    dataIndex: 'timestamp',
                    flex: 1
                }]
            });

            var panel = Ext.create('Ext.panel.Panel', {
                id: 'pliLocatorPanel',
                title: Core.Translate.i18nJSON('PLI'),
                layout: {
                    type: 'vbox',
                    pack: 'center',
                    align: 'middle'
                },
                padding: '1',
                items: [this.filterField, gpanel]
            });

            this.tabPanel.add(panel);
        },

        getSettingsGridPanel: function()
        {
            return this.lookupReference('pliLocatorSettingsPanel');
        },

        createSettingsTab: function()
        {
            this.settingsStore = Ext.create('Ext.data.Store', {
               model: 'modules.datalayer.TrackingLocatorSettingsModel'
            });

            var panel = Ext.create('Ext.grid.Panel', {
                id: 'pliLocatorSettingsPanel',
                reference: 'pliLocatorSettingsPanel',
                title: Core.Translate.i18nJSON('Settings'),
                listeners: {
                    select: 'onSettingsSelect',
                    deselect: 'onSettingsDeselect'
                },
                store: this.settingsStore,
                columns: [{
                    text: Core.Translate.i18nJSON('Layer'),
                    dataIndex: 'name'
                }],
                selModel: {
                    selType: 'checkboxmodel',
                    showHeaderCheckbox: false
                }
            });

            this.tabPanel.add(panel);
        },

        config: {
            closeAction: 'hide',
            resizable: true,
            closable: true,
            shadow: false,
            draggable:true,
            layout: 'fit',
            autoScroll: true,
            button: null,
            minButtonWidth: 0,
            width: 275,
            height: 375,
            title: Core.Translate.i18nJSON('Locate PLI')
        },

        items: [{
            xtype: 'tabpanel',
            reference: 'pliLocatorTabPanel',
            border: false,
            autoHeight: true,
            autoWidth: true,
            items: []
        }]
    });
});
