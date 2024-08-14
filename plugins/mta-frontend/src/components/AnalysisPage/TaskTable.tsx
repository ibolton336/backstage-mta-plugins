import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Link,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import ErrorIcon from '@material-ui/icons/Error';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import { Application, TaskDashboard } from '../../api/api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

const getIconForState = state => {
  switch (state) {
    case 'Succeeded':
      return <CheckCircleIcon style={{ color: 'green' }} />;
    case 'Failed':
      return <CancelIcon style={{ color: 'red' }} />;
    case 'Running':
      return <HourglassEmptyIcon style={{ color: 'blue' }} />;
    case 'Canceled':
      return <PauseCircleFilledIcon style={{ color: 'orange' }} />;
    case 'SucceededWithErrors':
      return <ErrorIcon style={{ color: 'yellow' }} />;
    // Add more cases for other states...
    default:
      return <ErrorIcon style={{ color: 'gray' }} />;
  }
};
interface ITaskTableProps {
  tasks: TaskDashboard[];
  isFetching: boolean;
}

const TaskTable = ({ tasks, isFetching }: ITaskTableProps) => {
  const config = useApi(configApiRef);

  const entity = useEntity();
  const application = entity?.entity?.metadata
    .application as unknown as Application;
  const annotations = entity?.entity?.metadata?.annotations || {};
  const mtaUrl = annotations['mta-url'] || '';

  if (isFetching && !tasks) {
    return <div>Loading...</div>;
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>State</TableCell>
            <TableCell>Started</TableCell>
            <TableCell>Terminated</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks?.map(task => (
            <TableRow key={task.id}>
              <TableCell>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ marginRight: 8 }}>
                    {getIconForState(task.state)}
                  </div>
                  <Typography>{task.state}</Typography>
                </div>
              </TableCell>
              <TableCell>{new Date(task.started).toLocaleString()}</TableCell>
              <TableCell>
                {new Date(task.terminated).toLocaleString()}
              </TableCell>
              <TableCell>
                <Link href={`${mtaUrl}/tasks/${task.id}`} target="_blank_">
                  Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
