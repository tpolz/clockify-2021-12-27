import {HttpWrapperService} from "./http-wrapper-service";
import {LocalStorageService} from "./localStorage-service";

const addToken = true;
const localStorageService = new LocalStorageService();

export class TimeEntryService extends HttpWrapperService {
    constructor(){
        super();
    }

    getTimeEntries(page) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const userId = localStorageService.get('userId');
        const baseUrl = localStorageService.get('baseUrl');

        const allTimeEntriesEndpoint =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/user/${userId}/full?page=${page}&limit=50`;

        return super.get(allTimeEntriesEndpoint, addToken);
    }

    changeStart(start, timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const changeStartUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/start`;

        const body = {
            start: start
        };

        return super.put(changeStartUrl, body, addToken);
    }

    changeEnd(end, timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const changeEndUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/end`;

        const body = {
            end: end
        };

        return super.put(changeEndUrl, body, addToken);
    }

    editTimeInterval(entryId, timeInterval) {
        if (!entryId) {
            return;
        }
        const baseUrl = localStorageService.get('baseUrl');
        const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
        const editIntervalUrl = `${baseUrl}/workspaces/` +
                                    `${activeWorkspaceId}/timeEntries/${entryId}/timeInterval`;
        const body = {
            start: timeInterval.start,
            end: timeInterval.end
        };

        return super.put(editIntervalUrl, body, addToken);
    }

    getEntryInProgress() {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const userId = localStorageService.get('userId');
        const baseUrl = localStorageService.get('baseUrl');
        const entryInProgressUrl =
            `${baseUrl}/v1/workspaces/${activeWorkspaceId}/user/${userId}/time-entries?in-progress=true&hydrated=true`;

        return super.get(entryInProgressUrl, addToken);
    }

    healthCheck() {
        const baseUrl = localStorageService.get('baseUrl');
        const url = `${baseUrl}/health`;
        return super.get(url, addToken);
    }

    startNewEntry(projectId, description, billable, start, taskId=null) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const startEntryUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/full`;

        const body = {
            projectId,
            taskId,
            description,
            start,
            billable
        };

        return super.post(startEntryUrl, body, addToken);
    }

    stopEntryInProgress(end) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const stopEntryUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/endStarted`;
        const body = {
            end: end
        };

        return super.put(stopEntryUrl, body, addToken);
    }

    setDescription(timeEntryId, description) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const descriptionUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/description`;

        const body = {
            description: description
        };

        return super.put(descriptionUrl, body, addToken);
    }

    removeProject(timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const removeProjectUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/project/remove`;

        return super.delete(removeProjectUrl, addToken);
    }

    updateProject(projectId, timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const updateProjectUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/project`;

        const body = {
            projectId: projectId
        };

        return super.put(updateProjectUrl, body, addToken);
    }

    updateTask(taskId, projectId, timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const updateTaskAndProjectUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/projectAndTask`;

        const body = {
            projectId: projectId,
            taskId: taskId
        };
        
        return super.put(updateTaskAndProjectUrl, body, addToken);
    }

    removeTask(timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const removeTaskUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/task/remove`;

        return super.delete(removeTaskUrl, addToken);
    }

    updateTags(tagList, timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const updateTagList =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/tags`;

        const body = {
            tagIds: tagList
        };

        return super.put(updateTagList, body, addToken);
    }

    updateBillable(billable, timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const billableUrl = `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}/billable`;
        const body = {
            billable: billable
        };

        return super.put(billableUrl, body, addToken);
    }

    deleteTimeEntry(timeEntryId) {
        const activeWorkspaceId = localStorageService.get('activeWorkspaceId');
        const baseUrl = localStorageService.get('baseUrl');
        const deleteUrl =
            `${baseUrl}/workspaces/${activeWorkspaceId}/timeEntries/${timeEntryId}`;

        return super.delete(deleteUrl, addToken);

    }

    createEntry(
        workspaceId,
        description,
        start,
        end,
        projectId,
        taskId,
        tagIds,
        billable,
        customFields
    ) {
        const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
        const wsId = workspaceId ? workspaceId : activeWorkspaceId;

        let baseUrl = localStorageService.get('baseUrl');
        /*
        if (baseUrl.includes('.api.')) {
            // https://global.api.clockify.me
            // https://global.clockify.me/api
            baseUrl = baseUrl.replace('.api', '') + '/api';
        }
        */
        const timeEntryUrl = `${baseUrl}/workspaces/${wsId}/timeEntries/`;

        const body = {
            description,
            start,
            end,
            projectId,
            taskId,
            tagIds,
            billable,
        };

        if (customFields)
            body.customFields = customFields;

        return super.post(timeEntryUrl, body, addToken);
    }
}