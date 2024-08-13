import React from 'react';
import { InfoCard, LinkButton } from '@backstage/core-components';
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  makeStyles,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Application } from '../../api/api';

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingLeft: theme.spacing(2), // Adds padding to align text if needed
    paddingRight: theme.spacing(2), // Ensure right padding for better alignment
  },
  listItemText: {
    overflowWrap: 'break-word', // Ensures text wraps and doesn't overflow
  },
  chip: {
    margin: theme.spacing(1), // Standardizes spacing around chips
  },
}));

const ApplicationDetails = () => {
  const classes = useStyles();
  const entity = useEntity();
  const application = entity?.entity?.metadata
    .application as unknown as Application;
  const annotations = entity?.entity?.metadata?.annotations || {};
  const viewUrl = annotations['issues-url'] || '';
  const appUrl = application?.repository?.url || 'No URL provided';

  if (!application) {
    return null;
  }

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      style={{ marginTop: '2vh', minHeight: '100vh' }}
    >
      <Grid item xs={12} md={6}>
        <InfoCard title={`Application: ${application.name}`}>
          <List dense>
            <ListItem className={classes.listItem}>
              <ListItemText primary="Issues" className={classes.listItemText} />
              <ListItemSecondaryAction>
                <LinkButton to={viewUrl} target="_blank">
                  View Issues
                </LinkButton>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem className={classes.listItem}>
              <ListItemText primary="Tags" className={classes.listItemText} />
            </ListItem>
            <Grid item xs={12}>
              {application.tags && application.tags.length > 0 ? (
                application.tags.map(tag => (
                  <Chip
                    key={tag.name}
                    label={`Source: ${tag.source || 'Unknown'}, Name: ${
                      tag.name
                    }`}
                    className={classes.chip}
                  />
                ))
              ) : (
                <Typography variant="body2">No Tags</Typography>
              )}
            </Grid>
            <ListItem className={classes.listItem}>
              <ListItemText
                primary="Risk Level"
                secondary={application.risk || 'None'}
                className={classes.listItemText}
              />
            </ListItem>
            <ListItem className={classes.listItem}>
              <ListItemText
                primary="Effort"
                secondary={
                  application.effort === 0
                    ? 'No effort calculated'
                    : application.effort
                }
                className={classes.listItemText}
              />
            </ListItem>
            {application.description && (
              <ListItem className={classes.listItem}>
                <ListItemText
                  primary="Description"
                  secondary={application.description}
                  className={classes.listItemText}
                />
              </ListItem>
            )}
            {application.comments && (
              <ListItem className={classes.listItem}>
                <ListItemText
                  primary="Comments"
                  secondary={application.comments}
                  className={classes.listItemText}
                />
              </ListItem>
            )}
            {application.bucket && application.bucket.id && (
              <ListItem className={classes.listItem}>
                <ListItemText
                  primary="Bucket ID"
                  secondary={application.bucket.id}
                  className={classes.listItemText}
                />
              </ListItem>
            )}
            <ListItem className={classes.listItem}>
              <ListItemText
                primary="Binary"
                secondary={application.binary}
                className={classes.listItemText}
              />
            </ListItem>
          </List>
        </InfoCard>
      </Grid>
    </Grid>
  );
};

export default ApplicationDetails;
