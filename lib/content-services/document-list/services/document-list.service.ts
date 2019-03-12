/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    AlfrescoApiService, ContentService, LogService, PaginationModel
} from '@alfresco/adf-core';

import { Injectable } from '@angular/core';
import { NodeEntry, NodePaging } from '@alfresco/js-api';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentListLoader } from '../interfaces/document-list-loader.interface';
import { CustomResourcesService } from './custom-resources.service';

@Injectable({
    providedIn: 'root'
})
export class DocumentListService implements DocumentListLoader {

    static ROOT_ID = '-root-';

    constructor(private contentService: ContentService,
                private apiService: AlfrescoApiService,
                private logService: LogService,
                private customResourcesService: CustomResourcesService) {
    }

    /**
     * Deletes a node.
     * @param nodeId ID of the node to delete
     * @returns Empty response when the operation is complete
     */
    deleteNode(nodeId: string): Observable<any> {
        return from(this.apiService.getInstance().nodes.deleteNode(nodeId));
    }

    /**
     * Copy a node to destination node
     *
     * @param nodeId The id of the node to be copied
     * @param targetParentId The id of the folder where the node will be copied
     * @returns NodeEntry for the copied node
     */
    copyNode(nodeId: string, targetParentId: string) {
        return from(this.apiService.getInstance().nodes.copyNode(nodeId, { targetParentId })).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * Moves a node to destination node.
     *
     * @param nodeId The id of the node to be moved
     * @param targetParentId The id of the folder where the node will be moved
     * @returns NodeEntry for the moved node
     */
    moveNode(nodeId: string, targetParentId: string) {
        return from(this.apiService.getInstance().nodes.moveNode(nodeId, { targetParentId })).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * Gets the folder node with the specified relative name path below the root node.
     * @param folder Path to folder.
     * @param opts Options.
     * @param includeFields Extra information to include (available options are "aspectNames", "isLink" and "association")
     * @returns Details of the folder
     */
    getFolder(folder: string, opts?: any, includeFields: string[] = []): Observable<NodePaging> {
        let rootNodeId = DocumentListService.ROOT_ID;
        if (opts && opts.rootFolderId) {
            rootNodeId = opts.rootFolderId;
        }

        let includeFieldsRequest = ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames', ...includeFields]
            .filter((element, index, array) => index === array.indexOf(element));

        let params: any = {
            includeSource: true,
            include: includeFieldsRequest
        };

        if (folder) {
            params.relativePath = folder;
        }

        if (opts) {
            if (opts.maxItems) {
                params.maxItems = opts.maxItems;
            }
            if (opts.skipCount) {
                params.skipCount = opts.skipCount;
            }
            if (opts.where) {
                params.where = opts.where;
            }
        }

        return from(this.apiService.getInstance().nodes.getNodeChildren(rootNodeId, params)).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    /**
     * Gets a node via its node ID.
     * @param nodeId ID of the target node
     * @param includeFields Extra information to include (available options are "aspectNames", "isLink" and "association")
     * @returns Details of the folder
     */
    getNode(nodeId: string, includeFields: string[] = []): Observable<NodeEntry> {

        let includeFieldsRequest = ['path', 'properties', 'allowableOperations', 'permissions', ...includeFields]
            .filter((element, index, array) => index === array.indexOf(element));

        let opts: any = {
            includeSource: true,
            include: includeFieldsRequest
        };

        return this.contentService.getNode(nodeId, opts);
    }

    /**
     * Gets a folder node via its node ID.
     * @param nodeId ID of the folder node
     * @param includeFields Extra information to include (available options are "aspectNames", "isLink" and "association")
     * @returns Details of the folder
     */
    getFolderNode(nodeId: string, includeFields: string[] = []): Observable<NodeEntry> {

        let includeFieldsRequest = ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames', ...includeFields]
            .filter((element, index, array) => index === array.indexOf(element));

        let opts: any = {
            includeSource: true,
            include: includeFieldsRequest
        };

        return from(this.apiService.getInstance().nodes.getNode(nodeId, opts)).pipe(
            catchError((err) => this.handleError(err))
        );
    }

    loadFolderByNodeId(nodeId: string, pagination: PaginationModel, includeFields: string[], where?: string): Observable<any> {
        if (this.customResourcesService.isCustomSource(nodeId)) {
            // this.updateCustomSourceData(nodeId);
            return this.customResourcesService.loadFolderByNodeId(nodeId, pagination, includeFields);
        } else {
            return this.getFolder(null, {
                maxItems: pagination.maxItems,
                skipCount: pagination.skipCount,
                rootFolderId: nodeId,
                where: where
            },  includeFields);
        }
    }

    private handleError(error: any) {
        this.logService.error(error);
        return throwError(error || 'Server error');
    }
}
