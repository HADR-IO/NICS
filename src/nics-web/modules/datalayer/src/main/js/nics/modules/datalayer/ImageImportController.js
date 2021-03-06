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
define(['ext', 'ol', "iweb/CoreModule", "iweb/modules/MapModule",
		"nics/modules/UserProfileModule", "./ImageLayerDetailRenderer"],
	function(Ext, ol, Core, MapModule, UserProfile, ImageLayerDetailRenderer){
	
		return Ext.define('modules.datalayer.ImageImportController', {
			extend : 'Ext.app.ViewController',
			
			alias: 'controller.datalayer.imageimportcontroller',
			
			init: function() {
				this.workspaceId = this.getView().workspaceId;
				this.url = this.getView().url;
				
				this.mediator = Core.Mediator.getInstance();
				
				var dataview = this.lookupReference('dataview');
				dataview.store.on('remove', this.onStoreRemove, this);
				dataview.store.on('clear', this.onStoreClear, this);
				
				MapModule.getClickListener().addRenderer(new ImageLayerDetailRenderer());
//				MapModule.getHoverListener().addRenderer(new ImageLayerDetailRenderer());

				Core.EventManager.addListener("nics.folders.load", this.onLoadFolders.bind(this));
				Core.EventManager.addListener("nics.folders.remove", this.onRemoveFolder.bind(this));
				Core.EventManager.addListener("nics.folders.update", this.onUpdateFolder.bind(this));
			},

			onRemoveFolder: function(e, folderids){
				var folderCombo = this.getView().lookupReference('folderCombo');
				Ext.Array.forEach(folderids, function(folderId) {
					var index = folderCombo.store.find("folderid", folderId);
					if (index != -1) {
						folderCombo.store.removeAt(index);
					}
				});
			},

			onLoadFolders: function(e, folders){
				var folderCombo = this.getView().lookupReference('folderCombo');
				if(folderCombo.store.getCount() == 0) {
					folderCombo.store.insert(0, {folderid: 'none', name: '&nbsp;'});
				}
				folderCombo.store.loadData(folders, true);
				folderCombo.store.autoSync = false;
			},

			onUpdateFolder: function(e, folderId, foldername){
				var folderCombo = this.getView().lookupReference('folderCombo');
				var record = folderCombo.getStore().findRecord("folderid",folderId);
				if(record){
					if(record.get("foldername") != foldername) {
						record.set("foldername", foldername);
					}
				}
			},
			
			configureFileInput: function(fileField) {
				fileField.fileInputEl.set({
					accept: 'image/*',
					multiple: 'multiple'
				});
			},
			
			onFileRender: function(cmp){
				this.configureFileInput(cmp);
			},
			
			onNameChange: function(input) {
				this.checkEnableUpload();
			},
			
			onFileChange: function(fileinput) {
				var fileData = this.buildImageModels(fileinput.fileInputEl.dom.files);
				if (fileData && fileData.length) {
					this.addFileModels(fileData);
				}
				this.checkEnableUpload();
			},
			
			checkEnableUpload: function() {
				var dataview = this.lookupReference('dataview'),
						displayname = this.lookupReference('displayname'),
						uploadbutton = this.lookupReference('uploadbutton');
				
				var disabled = true;
				if (dataview.store.getCount() > 0 && displayname.isValid()) {
					disabled = false;
				}
				uploadbutton.setDisabled(disabled);
			},
			
			buildImageModels: function(files) {
				var fileType = 'image/';
				return Array.prototype.filter.call(files, function(file){
					return file.type.substr(0, fileType.length) === fileType;
				}).map(function(file){
					return {
						filename: file.name,
						src: URL.createObjectURL(file),
						file: file,
						progress: 0
					};
				});
			},
			
			addFileModels: function(fileData) {
				var dataview = this.lookupReference('dataview');
				dataview.store.loadData(fileData, true);
			},
			
			cleanupRecords: function(records) {
				//cleanup object urls
				records.forEach(function(file){
					URL.revokeObjectURL(file.data.src);
				});
			},
			
			resetForm: function() {
				var dataView = this.lookupReference('dataview'),
						form = this.lookupReference('formPanel'),
						file = this.lookupReference('fileName'),
						uploadbutton = this.lookupReference('uploadbutton'),
						store = dataView.store;
						
				store.removeAll();
				form.reset();
				uploadbutton.setDisabled(true);
				
				//reconfigure the file input after form reset
				this.configureFileInput(file);
			},
			
			onStoreRemove: function(store, records) {
				this.cleanupRecords(records);
			},
			
			onStoreClear: function(store, records) {
				this.cleanupRecords(records);
			},
			
			onUpload: function() {
				//ensure our UID always starts with a character, not number
				this.batchId = "B" + Core.Util.generateUUID();
				this.considerUpload();
			},
			
			onCancel: function() {
				this.resetForm();
				this.busy = false;
				
				if (this.activeUploadXHR) {
					this.activeUploadXHR.abort();
					this.activeUploadXHR = null;
				}
				
				if (this.batchId) { 
					this.uploadFinish(true, this.batchId)
						.then(function(response, opts) {
							Ext.Msg.show({
								title: Core.Translate.i18nJSON('Image Import'),
								message: Core.Translate.i18nJSON('Image upload canceled.'),
								buttons: Ext.Msg.OK
							});
						}, function(response, opts) {
							Ext.Msg.show({
								title: Core.Translate.i18nJSON('Image Import'),
								message: Core.Translate.i18nJSON('Failed to cancel upload.'),
								buttons: Ext.Msg.OK
							});
						});
					this.batchId = null;
				}
			},
			
			batchComplete: function() {
				var title = this.lookupReference('displayname').getValue();
				var folderId = this.lookupReference('folderCombo').getValue();
				
				var me = this;
				this.uploadFinish(false, this.batchId, title, folderId)
					.then(function(response, opts) {
						me.resetForm();
						
						Ext.Msg.show({
							title: Core.Translate.i18nJSON('Image Import'),
							message: Core.Translate.i18nJSON('Image(s) uploaded successfully.'),
							buttons: Ext.Msg.OK
						});
					}, function(response, opts) {
						me.resetForm();
						
						Ext.Msg.show({
							title: Core.Translate.i18nJSON('Image Import'),
							message: Core.Translate.i18nJSON('Failed to complete upload.'),
							buttons: Ext.Msg.OK
						});
					});
				this.batchId = null;
			},
			
			considerUpload: function() {
				var dataView = this.lookupReference('dataview'),
						store = dataView.store;
						
				var fileModel = store.findRecord('progress', 0);
				if (fileModel) {
					this.uploadImage(fileModel);
				} else {
					this.batchComplete();
				}
			},
			
			uploadFinish: function(canceled, id, title, folderId) {
				var url = Ext.String.format("{0}/datalayer/{1}/image/finish?{2}",
							Core.Config.getProperty(UserProfile.REST_ENDPOINT),
							UserProfile.getWorkspaceId(),
							Ext.Object.toQueryString({
								cancel: canceled,
								id: id,
								title: title,
								usersessionid: UserProfile.getUserSessionId(),
								folderId: folderId
							}));
				
				return Ext.Ajax.request({
					method: 'POST',
					url: url
				});
							
			},
			
			busy: false,
			uploadImage: function(fileModel) {
				if (!this.busy) {
					this.busy = true;
					
					var me = this,
							url = Ext.String.format("{0}/datalayer/{1}/image",
										Core.Config.getProperty(UserProfile.REST_ENDPOINT),
										this.workspaceId);
					
					var req = this.activeUploadXHR = new XMLHttpRequest();
					
					req.onload = function(event) {
						if (event.target.status >= 200 &&  event.target.status < 300) {
							fileModel.set('progress', 100);
							me.busy = false;
							me.activeUploadXHR = null;
							me.considerUpload();
						} else {
							fileModel.set('progress', -1);
							var noLocationMessage = 'Image(s) lacked Location metadata, not importing.';
							var errorMessage = 'Error saving image. If uploading multiple images, try one at a time.';
							var message;
							// TODO: handle additional errors/response codes
							if(event.target.status === 412) {
								message = noLocationMessage;
							} else {
								message = errorMessage;
							}
							Ext.Msg.show({
								title: Core.Translate.i18nJSON('Image Import'),
								message: Core.Translate.i18nJSON(message),
								buttons: Ext.Msg.OK
							});
							me.busy = false;
							me.activeUploadXHR = null;
							me.resetForm();
						}
					};
					
					req.onerror = function(event) {
						fileModel.set('progress', -1);
						
						me.busy = false;
						me.activeUploadXHR = null;
						me.considerUpload();
					};
					
					req.onprogress = function(pe) {
						// TODO: on test files, length hasn't ever been computable.. not sure why
						if(pe.lengthComputable) {
							var percent = (pe.loaded / pe.total) * 100;
							//fileModel.set('progress', 100);
							fileModel.set('progress', percent);
						}
					};

					req.open("POST", url);
					req.setRequestHeader("Content-type", "multipart/form-data");

					var formData = new FormData();
					formData.append('file', fileModel.get('file'));
					formData.append('id', this.batchId);
					
					req.send(formData);
				}
			}
		});
});
