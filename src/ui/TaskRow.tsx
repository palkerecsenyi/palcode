import React, { ReactElement, useCallback } from 'react';
import { Classroom, TaskStatus, TaskType } from '../helpers/types';
import { TableCell } from '@material-ui/core';
import DropdownMenu from './DropdownMenu';
import MenuItem from '@material-ui/core/MenuItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import TableRow from '@material-ui/core/TableRow';
import firebase from 'firebase';
import 'firebase/firestore';
import { useSnackbar } from 'notistack';
import useTask from '../helpers/taskData';
import { Shimmer } from 'react-shimmer';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons/faGraduationCap';
import { Link } from 'react-router-dom';
import moment from 'moment';

interface Props {
    taskId: string;
    classroomId: string;
    setClassroomUpdater: (updater: number) => void;
    classroom: Classroom;
}

export default function TaskRow(
    {
        taskId,
        classroom,
        classroomId,
        setClassroomUpdater,
    }: Props,
): ReactElement {
    const [task] = useTask(taskId);

    const {enqueueSnackbar} = useSnackbar();
    const deleteTask = useCallback(() => {
        firebase
            .firestore()
            .collection('classrooms')
            .doc(classroomId)
            .update(
                {
                    tasks: classroom.tasks.filter(
                        t => t.id !== taskId && t.parentTask !== taskId,
                    ),
                } as Partial<Classroom>,
            )
            .then(() => {
                enqueueSnackbar('Task & submissions removed successfully!', {
                    variant: 'success',
                });
                setClassroomUpdater(Math.random());
            })
            .catch(() => {
                enqueueSnackbar('Something went wrong while attempting to delete that task. Try again.', {
                    variant: 'error',
                });
            });
    }, [classroomId, classroom, taskId]);

    return (
        <TableRow>
            <TableCell>
                {
                    task?.name || (
                        <Shimmer
                            height={12}
                            width={80}
                            className='shimmer'
                        />
                    )
                }
            </TableCell>
            {
                [TaskStatus.Unsubmitted, TaskStatus.Submitted, TaskStatus.HasFeedback].map(status => (
                    <TableCell
                        align='right'
                        key={status}
                    >
                        {
                            classroom.tasks.reduce(
                                (acc, classroomTask) =>
                                    classroomTask.type === TaskType.Submission
                                    && classroomTask.parentTask === taskId
                                    && classroomTask.status === status
                                        ? acc + 1
                                        : acc,
                                0,
                            )
                        }
                    </TableCell>
                ))
            }
            <TableCell align='right'>
                {
                    task ?
                        moment(task.created.toDate()).fromNow()
                        : (
                            <Shimmer
                                height={12}
                                width={120}
                                className='shimmer'
                            />
                        )
                }
            </TableCell>
            <TableCell align='center'>
                <DropdownMenu>
                    {/*TODO: add link in below to grade stuff*/}
                    <Link to='/'>
                        <MenuItem>
                            <FontAwesomeIcon icon={faGraduationCap}/>
                            &nbsp;Review
                        </MenuItem>
                    </Link>
                    <MenuItem onClick={deleteTask}>
                        <FontAwesomeIcon icon={faTrashAlt}/>
                        &nbsp;Delete task
                    </MenuItem>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
