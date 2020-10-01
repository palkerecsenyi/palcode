import React, { ReactElement, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import useTask from './helpers/taskData';
import MonacoEditor from 'react-monaco-editor/lib/editor';
import { useTaskFiles } from './helpers/taskContent';
import Files from './task-components/Files';
import FileEditor from './task-components/FileEditor';

interface Params {
    taskId: string;
}

export default function Task(): ReactElement {
    const { taskId } = useParams<Params>();
    const [task, taskLoading] = useTask(taskId);

    const [currentTab, setCurrentTab] = useState('index.py');
    const [files, filesLoading] = useTaskFiles(taskId, currentTab);

    const selectTab = useCallback((fileName) => {
        setCurrentTab(fileName);
    }, []);

    return (
        <div className='task'>
            <Files
                files={files}
                onTabSelect={selectTab}
            />

            <FileEditor
                taskId={taskId}
                fileName={currentTab}
            />
        </div>
    )
}