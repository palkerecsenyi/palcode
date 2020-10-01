import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Classroom, User } from './helpers/types';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { TableCell } from '@material-ui/core';
import firebase from 'firebase';
import 'firebase/firestore';
import TableBody from '@material-ui/core/TableBody';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { faKeyboard } from '@fortawesome/free-solid-svg-icons/faKeyboard';
import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import { Link } from 'react-router-dom';
import moment from 'moment';

interface Props {
    user: User
}

export default function TeacherDashboard(
    {
        user,
    }: Props,
): ReactElement {
    const [classroomData, setClassroomData] = useState<Classroom[]>([]);
    const [classroomDataLoading, setClassroomDataLoading] = useState(true);

    useEffect(() => {
        async function loadClassroomData() {
            const data = await firebase
                .firestore()
                .collection('classrooms')
                .where('owner', '==', user.uid)
                .get()
                .then(data => data.docs);

            setClassroomData(
                data.map((doc) => ({
                    ...doc.data() as Classroom,
                    id: doc.id,
                })),
            );
            setClassroomDataLoading(false);
        }

        loadClassroomData();
    }, []);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    return (
        <div className='teacher dashboard'>
            <div className='dashboard-card'>
                <div className='card-heading'>
                    My classrooms
                </div>
                <div className='card-body'>
                    <div className='card-table'>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Class name</TableCell>
                                        <TableCell align='right'>Students</TableCell>
                                        <TableCell align='right'>Tasks</TableCell>
                                        <TableCell align='right'>Created</TableCell>
                                        <TableCell align='center'>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        classroomData.map(classroom => (
                                            <TableRow key={classroom.id}>
                                                <TableCell>{classroom.name}</TableCell>
                                                <TableCell align='right'>{classroom.members.length}</TableCell>
                                                <TableCell align='right'>{classroom.tasks.length}</TableCell>
                                                <TableCell align='right'>
                                                    {
                                                        moment(classroom.created.toDate()).fromNow()
                                                    }
                                                </TableCell>
                                                <TableCell align='center'>
                                                    <button
                                                        className='more-dropdown'
                                                        onClick={openMenu}
                                                    >
                                                        <FontAwesomeIcon icon={faEllipsisV}/>
                                                    </button>

                                                    <Menu
                                                        id='table-menu'
                                                        anchorEl={anchorEl}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'right',
                                                        }}
                                                        keepMounted
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'right',
                                                        }}
                                                        open={!!anchorEl}
                                                        onClose={handleClose}
                                                    >
                                                        <Link to={`/classroom/${classroom.id}/view_code`}>
                                                            <MenuItem>
                                                                <FontAwesomeIcon icon={faKeyboard}/>
                                                                &nbsp;View code page
                                                            </MenuItem>
                                                        </Link>
                                                        <MenuItem onClick={handleClose}>
                                                            <FontAwesomeIcon icon={faEdit}/>
                                                            &nbsp;Manage classroom
                                                        </MenuItem>
                                                        <MenuItem onClick={handleClose}>
                                                            <FontAwesomeIcon icon={faTrashAlt}/>
                                                            &nbsp;Delete
                                                        </MenuItem>
                                                    </Menu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
